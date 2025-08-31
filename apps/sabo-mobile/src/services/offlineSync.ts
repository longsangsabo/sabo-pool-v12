/**
 * Background sync and offline mode service
 * Handles data synchronization and conflict resolution
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

interface SyncableData {
  id: string;
  type: 'tournament' | 'user' | 'payment' | 'ranking';
  data: any;
  timestamp: number;
  action: 'create' | 'update' | 'delete';
  synced: boolean;
  retryCount: number;
}

interface SyncConflict {
  localData: SyncableData;
  serverData: any;
  resolution: 'server_wins' | 'local_wins' | 'merge' | 'manual';
}

const BACKGROUND_SYNC_TASK = 'background-sync-task';

export class OfflineSyncService {
  private static instance: OfflineSyncService;
  private syncQueue: SyncableData[] = [];
  private isOnline = true;
  private syncInProgress = false;
  private maxRetries = 3;

  static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  constructor() {
    this.initializeNetworkMonitoring();
    this.loadSyncQueue();
    this.registerBackgroundTask();
  }

  // Initialize network monitoring
  private initializeNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected || false;
      
      console.log('[OfflineSync] Network status:', this.isOnline ? 'online' : 'offline');
      
      // Trigger sync when coming back online
      if (wasOffline && this.isOnline) {
        console.log('[OfflineSync] Back online - triggering sync');
        this.startSync();
      }
    });
  }

  // Load sync queue from storage
  private async loadSyncQueue() {
    try {
      const stored = await AsyncStorage.getItem('sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
        console.log(`[OfflineSync] Loaded ${this.syncQueue.length} items from queue`);
      }
    } catch (error) {
      console.warn('[OfflineSync] Error loading sync queue:', error);
    }
  }

  // Save sync queue to storage
  private async saveSyncQueue() {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.warn('[OfflineSync] Error saving sync queue:', error);
    }
  }

  // Register background sync task
  private async registerBackgroundTask() {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
      
      console.log('[OfflineSync] Background task registered');
    } catch (error) {
      console.warn('[OfflineSync] Error registering background task:', error);
    }
  }

  // Add data to sync queue
  async queueForSync(data: Omit<SyncableData, 'timestamp' | 'synced' | 'retryCount'>) {
    const syncItem: SyncableData = {
      ...data,
      timestamp: Date.now(),
      synced: false,
      retryCount: 0,
    };

    this.syncQueue.push(syncItem);
    await this.saveSyncQueue();

    console.log(`[OfflineSync] Queued ${data.type} ${data.action}:`, data.id);

    // Try immediate sync if online
    if (this.isOnline && !this.syncInProgress) {
      this.startSync();
    }
  }

  // Start synchronization process
  async startSync(): Promise<boolean> {
    if (this.syncInProgress || !this.isOnline) {
      return false;
    }

    this.syncInProgress = true;
    console.log(`[OfflineSync] Starting sync for ${this.syncQueue.length} items`);

    try {
      const unsyncedItems = this.syncQueue.filter(item => !item.synced);
      
      for (const item of unsyncedItems) {
        try {
          await this.syncItem(item);
          item.synced = true;
          item.retryCount = 0;
        } catch (error) {
          console.warn(`[OfflineSync] Failed to sync item ${item.id}:`, error);
          item.retryCount++;
          
          // Remove items that have exceeded max retries
          if (item.retryCount >= this.maxRetries) {
            console.error(`[OfflineSync] Max retries exceeded for ${item.id}, removing from queue`);
            this.syncQueue = this.syncQueue.filter(queueItem => queueItem.id !== item.id);
          }
        }
      }

      // Remove successfully synced items
      this.syncQueue = this.syncQueue.filter(item => !item.synced);
      await this.saveSyncQueue();

      console.log('[OfflineSync] Sync completed');
      return true;
    } catch (error) {
      console.error('[OfflineSync] Sync failed:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync individual item
  private async syncItem(item: SyncableData): Promise<void> {
    const endpoint = this.getEndpointForType(item.type);
    const url = `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`;

    let method: string;
    let body: string | undefined;

    switch (item.action) {
      case 'create':
        method = 'POST';
        body = JSON.stringify(item.data);
        break;
      case 'update':
        method = 'PUT';
        body = JSON.stringify(item.data);
        break;
      case 'delete':
        method = 'DELETE';
        break;
      default:
        throw new Error(`Unknown action: ${item.action}`);
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
      body,
    });

    if (!response.ok) {
      // Handle conflicts (409)
      if (response.status === 409) {
        const serverData = await response.json();
        await this.handleConflict(item, serverData);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
  }

  // Get API endpoint for data type
  private getEndpointForType(type: string): string {
    switch (type) {
      case 'tournament':
        return '/tournaments';
      case 'user':
        return '/users';
      case 'payment':
        return '/payments';
      case 'ranking':
        return '/rankings';
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }

  // Handle sync conflicts
  private async handleConflict(localItem: SyncableData, serverData: any): Promise<void> {
    const conflict: SyncConflict = {
      localData: localItem,
      serverData,
      resolution: 'server_wins', // Default resolution
    };

    // Apply conflict resolution strategy
    switch (conflict.resolution) {
      case 'server_wins':
        // Update local data with server data
        await this.updateLocalData(localItem.type, localItem.id, serverData);
        break;
      case 'local_wins':
        // Force update server with local data
        await this.forceUpdateServer(localItem);
        break;
      case 'merge':
        // Merge local and server data
        const mergedData = this.mergeData(localItem.data, serverData);
        await this.updateLocalData(localItem.type, localItem.id, mergedData);
        break;
      case 'manual':
        // Store conflict for manual resolution
        await this.storeConflict(conflict);
        break;
    }
  }

  // Update local data storage
  private async updateLocalData(type: string, id: string, data: any): Promise<void> {
    const storageKey = `${type}_${id}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
  }

  // Force update server data
  private async forceUpdateServer(item: SyncableData): Promise<void> {
    const endpoint = this.getEndpointForType(item.type);
    const url = `${process.env.EXPO_PUBLIC_API_URL}${endpoint}/${item.id}`;

    await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`,
        'X-Force-Update': 'true',
      },
      body: JSON.stringify(item.data),
    });
  }

  // Merge local and server data
  private mergeData(localData: any, serverData: any): any {
    // Simple merge strategy - prefer newer timestamps
    if (localData.updated_at && serverData.updated_at) {
      return new Date(localData.updated_at) > new Date(serverData.updated_at) 
        ? localData 
        : serverData;
    }
    
    // Fallback to server data
    return serverData;
  }

  // Store conflict for manual resolution
  private async storeConflict(conflict: SyncConflict): Promise<void> {
    const conflicts = await this.getStoredConflicts();
    conflicts.push(conflict);
    await AsyncStorage.setItem('sync_conflicts', JSON.stringify(conflicts));
  }

  // Get stored conflicts
  async getStoredConflicts(): Promise<SyncConflict[]> {
    try {
      const stored = await AsyncStorage.getItem('sync_conflicts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('[OfflineSync] Error loading conflicts:', error);
      return [];
    }
  }

  // Resolve stored conflict
  async resolveConflict(conflictIndex: number, resolution: SyncConflict['resolution']): Promise<void> {
    const conflicts = await this.getStoredConflicts();
    const conflict = conflicts[conflictIndex];
    
    if (conflict) {
      conflict.resolution = resolution;
      await this.handleConflict(conflict.localData, conflict.serverData);
      
      // Remove resolved conflict
      conflicts.splice(conflictIndex, 1);
      await AsyncStorage.setItem('sync_conflicts', JSON.stringify(conflicts));
    }
  }

  // Get auth token
  private async getAuthToken(): Promise<string | null> {
    try {
      const authData = await AsyncStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.token || null;
      }
    } catch (error) {
      console.warn('[OfflineSync] Error getting auth token:', error);
    }
    return null;
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      queueLength: this.syncQueue.length,
      unsyncedItems: this.syncQueue.filter(item => !item.synced).length,
    };
  }

  // Manual sync trigger
  async forcSync(): Promise<boolean> {
    if (this.isOnline) {
      return this.startSync();
    }
    return false;
  }

  // Clear sync queue
  async clearSyncQueue(): Promise<void> {
    this.syncQueue = [];
    await this.saveSyncQueue();
  }
}

// Background task definition
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    console.log('[BackgroundSync] Running background sync task');
    const syncService = OfflineSyncService.getInstance();
    const result = await syncService.startSync();
    
    return result ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundSync] Background task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const offlineSync = OfflineSyncService.getInstance();

// React hook for offline sync
export const useOfflineSync = () => {
  const syncService = OfflineSyncService.getInstance();

  return {
    queueForSync: syncService.queueForSync.bind(syncService),
    startSync: syncService.startSync.bind(syncService),
    getSyncStatus: syncService.getSyncStatus.bind(syncService),
    getStoredConflicts: syncService.getStoredConflicts.bind(syncService),
    resolveConflict: syncService.resolveConflict.bind(syncService),
    forceSync: syncService.forcSync.bind(syncService),
    clearSyncQueue: syncService.clearSyncQueue.bind(syncService),
  };
};
