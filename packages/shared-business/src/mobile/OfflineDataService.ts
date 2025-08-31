/**
 * OFFLINE DATA SERVICE
 * 
 * Mobile-Optimized Offline Data Management
 * Handles local storage, sync, and conflict resolution
 * 
 * Core Features:
 * - Local data persistence
 * - Offline-first data access
 * - Automatic sync when online
 * - Conflict resolution
 * - Data compression for mobile
 */

// Types
export interface OfflineDataEntry {
  id: string;
  collection: string;
  data: any;
  operation: 'create' | 'update' | 'delete';
  timestamp: number;
  version: number;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
  conflict_resolution?: 'server_wins' | 'client_wins' | 'manual';
  retry_count: number;
  last_sync_attempt?: number;
}

export interface SyncResult {
  total_entries: number;
  synced: number;
  failed: number;
  conflicts: number;
  bytes_transferred: number;
  duration_ms: number;
}

export interface DataCollection {
  name: string;
  schema_version: number;
  sync_enabled: boolean;
  conflict_resolution: 'server_wins' | 'client_wins' | 'manual';
  max_offline_entries: number;
  compression_enabled: boolean;
}

export interface OfflineConfig {
  max_storage_mb: number;
  auto_sync_enabled: boolean;
  sync_interval_minutes: number;
  compression_threshold_kb: number;
  retry_attempts: number;
  batch_size: number;
}

/**
 * OFFLINE DATA SERVICE
 * 
 * Provides offline-first data access for mobile applications
 * Automatically syncs with server when connection is available
 */
export class OfflineDataService {
  private storage: any; // Would be AsyncStorage or similar
  private config: OfflineConfig;
  private collections: Map<string, DataCollection> = new Map();
  private syncCallbacks: ((result: SyncResult) => void)[] = [];
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  constructor(storage: any, config: OfflineConfig) {
    this.storage = storage;
    this.config = config;
    this.initializeCollections();
    this.setupNetworkListener();
    this.setupAutoSync();
  }

  // ===== DATA OPERATIONS =====

  /**
   * Store data offline
   * Mobile-optimized with compression
   */
  async store(collection: string, id: string, data: any, operation: 'create' | 'update' | 'delete' = 'create'): Promise<void> {
    try {
      const entry: OfflineDataEntry = {
        id: `${collection}_${id}_${Date.now()}`,
        collection,
        data: await this.compressData(data),
        operation,
        timestamp: Date.now(),
        version: 1,
        sync_status: 'pending',
        retry_count: 0
      };

      // Store in offline queue
      await this.addToOfflineQueue(entry);

      // Store current state for immediate access
      await this.storeCurrentState(collection, id, data);

      // Trigger sync if online
      if (this.isOnline && this.config.auto_sync_enabled) {
        this.triggerSync();
      }
    } catch (error) {
      throw new Error(`Failed to store offline data: ${error.message}`);
    }
  }

  /**
   * Retrieve data with offline fallback
   * Mobile-optimized caching
   */
  async retrieve(collection: string, id?: string): Promise<any> {
    try {
      // Try to get from current state first (fastest)
      const currentData = await this.getCurrentState(collection, id);
      if (currentData) {
        return currentData;
      }

      // Fall back to server if online
      if (this.isOnline) {
        try {
          const serverData = await this.fetchFromServer(collection, id);
          // Cache for offline access
          if (id) {
            await this.storeCurrentState(collection, id, serverData);
          }
          return serverData;
        } catch (error) {
          console.warn('Server fetch failed, using offline data:', error);
        }
      }

      // Return empty if no offline data
      return id ? null : [];
    } catch (error) {
      throw new Error(`Failed to retrieve data: ${error.message}`);
    }
  }

  /**
   * Delete data with offline support
   */
  async delete(collection: string, id: string): Promise<void> {
    try {
      // Mark for deletion
      await this.store(collection, id, { deleted: true }, 'delete');

      // Remove from current state
      await this.removeFromCurrentState(collection, id);
    } catch (error) {
      throw new Error(`Failed to delete data: ${error.message}`);
    }
  }

  // ===== SYNC OPERATIONS =====

  /**
   * Manual sync trigger
   * Mobile-friendly progress tracking
   */
  async sync(collections?: string[]): Promise<SyncResult> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    this.syncInProgress = true;
    const startTime = Date.now();

    try {
      // Get pending entries
      const pendingEntries = await this.getPendingEntries(collections);
      
      if (pendingEntries.length === 0) {
        return {
          total_entries: 0,
          synced: 0,
          failed: 0,
          conflicts: 0,
          bytes_transferred: 0,
          duration_ms: Date.now() - startTime
        };
      }

      let synced = 0;
      let failed = 0;
      let conflicts = 0;
      let bytesTransferred = 0;

      // Process in batches for mobile efficiency
      const batches = this.chunkArray(pendingEntries, this.config.batch_size);

      for (const batch of batches) {
        const batchResult = await this.syncBatch(batch);
        synced += batchResult.synced;
        failed += batchResult.failed;
        conflicts += batchResult.conflicts;
        bytesTransferred += batchResult.bytes_transferred;
      }

      const result: SyncResult = {
        total_entries: pendingEntries.length,
        synced,
        failed,
        conflicts,
        bytes_transferred: bytesTransferred,
        duration_ms: Date.now() - startTime
      };

      // Notify callbacks
      this.notifySyncCallbacks(result);

      return result;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Check sync status
   * Mobile-friendly status monitoring
   */
  async getSyncStatus(): Promise<{
    pending_entries: number;
    last_sync: Date | null;
    is_syncing: boolean;
    next_auto_sync: Date | null;
  }> {
    try {
      const pendingCount = await this.getPendingEntriesCount();
      const lastSync = await this.getLastSyncTime();
      const nextAutoSync = this.getNextAutoSyncTime();

      return {
        pending_entries: pendingCount,
        last_sync: lastSync,
        is_syncing: this.syncInProgress,
        next_auto_sync: nextAutoSync
      };
    } catch (error) {
      throw new Error(`Failed to get sync status: ${error.message}`);
    }
  }

  /**
   * Subscribe to sync events
   * Mobile-ready event handling
   */
  onSync(callback: (result: SyncResult) => void): () => void {
    this.syncCallbacks.push(callback);
    
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  // ===== CONFLICT RESOLUTION =====

  /**
   * Resolve data conflicts
   * Mobile-optimized conflict handling
   */
  async resolveConflict(
    entryId: string, 
    resolution: 'server_wins' | 'client_wins' | 'merge'
  ): Promise<void> {
    try {
      const entry = await this.getOfflineEntry(entryId);
      if (!entry) {
        throw new Error('Entry not found');
      }

      switch (resolution) {
        case 'server_wins':
          await this.acceptServerVersion(entry);
          break;
        case 'client_wins':
          await this.acceptClientVersion(entry);
          break;
        case 'merge':
          await this.mergeVersions(entry);
          break;
      }

      // Update entry status
      await this.updateEntryStatus(entryId, 'synced');
    } catch (error) {
      throw new Error(`Failed to resolve conflict: ${error.message}`);
    }
  }

  /**
   * Get pending conflicts
   * Mobile-friendly conflict list
   */
  async getPendingConflicts(): Promise<OfflineDataEntry[]> {
    try {
      return await this.getEntriesByStatus('failed');
    } catch (error) {
      throw new Error(`Failed to get pending conflicts: ${error.message}`);
    }
  }

  // ===== STORAGE MANAGEMENT =====

  /**
   * Clean up old data
   * Mobile storage optimization
   */
  async cleanup(): Promise<{
    entries_removed: number;
    space_freed_mb: number;
  }> {
    try {
      let entriesRemoved = 0;
      let spaceFreed = 0;

      // Remove synced entries older than 30 days
      const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const oldEntries = await this.getOldSyncedEntries(cutoffTime);

      for (const entry of oldEntries) {
        const entrySize = await this.getEntrySize(entry.id);
        await this.removeOfflineEntry(entry.id);
        entriesRemoved++;
        spaceFreed += entrySize;
      }

      // Compress large collections
      await this.compressCollections();

      return {
        entries_removed: entriesRemoved,
        space_freed_mb: spaceFreed / (1024 * 1024)
      };
    } catch (error) {
      throw new Error(`Failed to cleanup storage: ${error.message}`);
    }
  }

  /**
   * Get storage stats
   * Mobile storage monitoring
   */
  async getStorageStats(): Promise<{
    total_size_mb: number;
    entries_count: number;
    pending_count: number;
    compression_ratio: number;
  }> {
    try {
      const totalSize = await this.getTotalStorageSize();
      const entriesCount = await this.getTotalEntriesCount();
      const pendingCount = await this.getPendingEntriesCount();
      const compressionRatio = await this.getCompressionRatio();

      return {
        total_size_mb: totalSize / (1024 * 1024),
        entries_count: entriesCount,
        pending_count: pendingCount,
        compression_ratio: compressionRatio
      };
    } catch (error) {
      throw new Error(`Failed to get storage stats: ${error.message}`);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private initializeCollections(): void {
    // Initialize default collections for mobile app
    this.collections.set('tournaments', {
      name: 'tournaments',
      schema_version: 1,
      sync_enabled: true,
      conflict_resolution: 'server_wins',
      max_offline_entries: 100,
      compression_enabled: true
    });

    this.collections.set('users', {
      name: 'users',
      schema_version: 1,
      sync_enabled: true,
      conflict_resolution: 'client_wins',
      max_offline_entries: 50,
      compression_enabled: true
    });

    this.collections.set('matches', {
      name: 'matches',
      schema_version: 1,
      sync_enabled: true,
      conflict_resolution: 'server_wins',
      max_offline_entries: 200,
      compression_enabled: true
    });
  }

  private setupNetworkListener(): void {
    // Would implement network status monitoring
    // For now, assume online
    this.isOnline = true;
  }

  private setupAutoSync(): void {
    if (this.config.auto_sync_enabled) {
      setInterval(() => {
        if (this.isOnline && !this.syncInProgress) {
          this.triggerSync();
        }
      }, this.config.sync_interval_minutes * 60 * 1000);
    }
  }

  private async triggerSync(): Promise<void> {
    try {
      await this.sync();
    } catch (error) {
      console.error('Auto sync failed:', error);
    }
  }

  private async compressData(data: any): Promise<any> {
    const dataString = JSON.stringify(data);
    
    if (dataString.length > this.config.compression_threshold_kb * 1024) {
      // Would implement compression (e.g., gzip)
      return { compressed: true, data: dataString };
    }
    
    return data;
  }

  private async decompressData(data: any): Promise<any> {
    if (data.compressed) {
      // Would implement decompression
      return JSON.parse(data.data);
    }
    
    return data;
  }

  private async addToOfflineQueue(entry: OfflineDataEntry): Promise<void> {
    const key = `offline_queue_${entry.id}`;
    await this.storage.setItem(key, JSON.stringify(entry));
  }

  private async storeCurrentState(collection: string, id: string, data: any): Promise<void> {
    const key = `current_${collection}_${id}`;
    await this.storage.setItem(key, JSON.stringify(data));
  }

  private async getCurrentState(collection: string, id?: string): Promise<any> {
    if (id) {
      const key = `current_${collection}_${id}`;
      const data = await this.storage.getItem(key);
      return data ? JSON.parse(data) : null;
    } else {
      // Get all items in collection
      const keys = await this.storage.getAllKeys();
      const collectionKeys = keys.filter(key => key.startsWith(`current_${collection}_`));
      const items = [];
      
      for (const key of collectionKeys) {
        const data = await this.storage.getItem(key);
        if (data) {
          items.push(JSON.parse(data));
        }
      }
      
      return items;
    }
  }

  private async removeFromCurrentState(collection: string, id: string): Promise<void> {
    const key = `current_${collection}_${id}`;
    await this.storage.removeItem(key);
  }

  private async getPendingEntries(collections?: string[]): Promise<OfflineDataEntry[]> {
    const keys = await this.storage.getAllKeys();
    const queueKeys = keys.filter(key => key.startsWith('offline_queue_'));
    const entries = [];

    for (const key of queueKeys) {
      const data = await this.storage.getItem(key);
      if (data) {
        const entry = JSON.parse(data);
        if (entry.sync_status === 'pending' || entry.sync_status === 'failed') {
          if (!collections || collections.includes(entry.collection)) {
            entries.push(entry);
          }
        }
      }
    }

    return entries.sort((a, b) => a.timestamp - b.timestamp);
  }

  private async getPendingEntriesCount(): Promise<number> {
    const pendingEntries = await this.getPendingEntries();
    return pendingEntries.length;
  }

  private async syncBatch(entries: OfflineDataEntry[]): Promise<{
    synced: number;
    failed: number;
    conflicts: number;
    bytes_transferred: number;
  }> {
    let synced = 0;
    let failed = 0;
    let conflicts = 0;
    let bytesTransferred = 0;

    for (const entry of entries) {
      try {
        // Update entry status
        await this.updateEntryStatus(entry.id, 'syncing');

        // Sync with server
        const result = await this.syncEntry(entry);
        
        if (result.success) {
          await this.updateEntryStatus(entry.id, 'synced');
          synced++;
        } else if (result.conflict) {
          conflicts++;
        } else {
          failed++;
          await this.incrementRetryCount(entry.id);
        }

        bytesTransferred += result.bytes_transferred || 0;
      } catch (error) {
        failed++;
        await this.incrementRetryCount(entry.id);
        console.error('Failed to sync entry:', error);
      }
    }

    return { synced, failed, conflicts, bytes_transferred: bytesTransferred };
  }

  private async syncEntry(entry: OfflineDataEntry): Promise<{
    success: boolean;
    conflict?: boolean;
    bytes_transferred?: number;
  }> {
    // Implementation would sync with actual server
    // For now, return mock success
    return {
      success: true,
      bytes_transferred: JSON.stringify(entry.data).length
    };
  }

  private async updateEntryStatus(entryId: string, status: OfflineDataEntry['sync_status']): Promise<void> {
    const key = `offline_queue_${entryId}`;
    const data = await this.storage.getItem(key);
    
    if (data) {
      const entry = JSON.parse(data);
      entry.sync_status = status;
      entry.last_sync_attempt = Date.now();
      await this.storage.setItem(key, JSON.stringify(entry));
    }
  }

  private async incrementRetryCount(entryId: string): Promise<void> {
    const key = `offline_queue_${entryId}`;
    const data = await this.storage.getItem(key);
    
    if (data) {
      const entry = JSON.parse(data);
      entry.retry_count++;
      
      if (entry.retry_count >= this.config.retry_attempts) {
        entry.sync_status = 'failed';
      }
      
      await this.storage.setItem(key, JSON.stringify(entry));
    }
  }

  private chunkArray(array: any[], size: number): any[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private notifySyncCallbacks(result: SyncResult): void {
    this.syncCallbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }

  // Additional helper methods would be implemented here...
  private async fetchFromServer(collection: string, id?: string): Promise<any> {
    // Implementation would fetch from actual server
    return null;
  }

  private async getLastSyncTime(): Promise<Date | null> {
    const lastSync = await this.storage.getItem('last_sync_time');
    return lastSync ? new Date(lastSync) : null;
  }

  private getNextAutoSyncTime(): Date | null {
    if (!this.config.auto_sync_enabled) return null;
    
    const next = new Date();
    next.setMinutes(next.getMinutes() + this.config.sync_interval_minutes);
    return next;
  }

  private async getOfflineEntry(entryId: string): Promise<OfflineDataEntry | null> {
    const key = `offline_queue_${entryId}`;
    const data = await this.storage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  private async getEntriesByStatus(status: OfflineDataEntry['sync_status']): Promise<OfflineDataEntry[]> {
    const keys = await this.storage.getAllKeys();
    const queueKeys = keys.filter(key => key.startsWith('offline_queue_'));
    const entries = [];

    for (const key of queueKeys) {
      const data = await this.storage.getItem(key);
      if (data) {
        const entry = JSON.parse(data);
        if (entry.sync_status === status) {
          entries.push(entry);
        }
      }
    }

    return entries;
  }

  private async acceptServerVersion(entry: OfflineDataEntry): Promise<void> {
    // Implementation would accept server version
  }

  private async acceptClientVersion(entry: OfflineDataEntry): Promise<void> {
    // Implementation would push client version to server
  }

  private async mergeVersions(entry: OfflineDataEntry): Promise<void> {
    // Implementation would merge client and server versions
  }

  private async getOldSyncedEntries(cutoffTime: number): Promise<OfflineDataEntry[]> {
    const entries = await this.getEntriesByStatus('synced');
    return entries.filter(entry => entry.timestamp < cutoffTime);
  }

  private async removeOfflineEntry(entryId: string): Promise<void> {
    const key = `offline_queue_${entryId}`;
    await this.storage.removeItem(key);
  }

  private async getEntrySize(entryId: string): Promise<number> {
    const key = `offline_queue_${entryId}`;
    const data = await this.storage.getItem(key);
    return data ? data.length : 0;
  }

  private async compressCollections(): Promise<void> {
    // Implementation would compress large collections
  }

  private async getTotalStorageSize(): Promise<number> {
    const keys = await this.storage.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      const data = await this.storage.getItem(key);
      if (data) {
        totalSize += data.length;
      }
    }

    return totalSize;
  }

  private async getTotalEntriesCount(): Promise<number> {
    const keys = await this.storage.getAllKeys();
    return keys.filter(key => key.startsWith('offline_queue_')).length;
  }

  private async getCompressionRatio(): Promise<number> {
    // Calculate compression ratio
    return 0.7; // Mock 70% compression
  }
}

// Export for mobile app consumption
export default OfflineDataService;
