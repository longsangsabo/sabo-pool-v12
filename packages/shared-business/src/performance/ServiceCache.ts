/**
 * Service Cache System for SABO Pool V12
 * High-performance caching layer for business logic services
 * Features: TTL, LRU eviction, memory optimization, cache statistics
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  enableStats?: boolean; // Track cache hit/miss statistics
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * LRU Cache with TTL support for service optimization
 * Designed for tournament, ranking, and payment service caching
 */
export class ServiceCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Map<string, number>(); // For LRU tracking
  private stats = { hits: 0, misses: 0 };
  private accessCounter = 0;

  constructor(private options: CacheOptions = {}) {
    this.options = {
      ttl: 5 * 60 * 1000, // 5 minutes default TTL
      maxSize: 1000, // Default max entries
      enableStats: true,
      ...options
    };

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Get value from cache with LRU update
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.options.enableStats) this.stats.misses++;
      return undefined;
    }

    // Check TTL expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      if (this.options.enableStats) this.stats.misses++;
      return undefined;
    }

    // Update LRU access
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    this.accessOrder.set(key, ++this.accessCounter);
    
    if (this.options.enableStats) this.stats.hits++;
    return entry.value;
  }

  /**
   * Set value in cache with TTL and LRU management
   */
  set(key: string, value: T, customTtl?: number): void {
    const ttl = customTtl || this.options.ttl!;
    const now = Date.now();

    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccessed: now
    };

    // Check if we need to evict entries
    if (this.cache.size >= this.options.maxSize! && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.accessOrder.set(key, ++this.accessCounter);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    this.accessOrder.delete(key);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.stats = { hits: 0, misses: 0 };
    this.accessCounter = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.cache.size,
      maxSize: this.options.maxSize!
    };
  }

  /**
   * Get or set with function execution (memoization pattern)
   */
  async getOrSet<K extends T>(
    key: string,
    producer: () => Promise<K>,
    customTtl?: number
  ): Promise<K> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached as K;
    }

    const value = await producer();
    this.set(key, value, customTtl);
    return value;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestAccess = Infinity;

    for (const [key, accessTime] of this.accessOrder) {
      if (accessTime < oldestAccess) {
        oldestAccess = accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    }
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * Specialized cache configurations for different service types
 */
export class ServiceCacheManager {
  // Tournament data cache - longer TTL due to less frequent changes
  public static readonly tournamentCache = new ServiceCache({
    ttl: 15 * 60 * 1000, // 15 minutes
    maxSize: 500,
    enableStats: true
  });

  // ELO rating cache - medium TTL for balance between accuracy and performance
  public static readonly eloCache = new ServiceCache({
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 2000, // More entries for player ratings
    enableStats: true
  });

  // SPA Points cache - shorter TTL due to frequent updates
  public static readonly pointsCache = new ServiceCache({
    ttl: 2 * 60 * 1000, // 2 minutes
    maxSize: 1000,
    enableStats: true
  });

  // Payment cache - very short TTL for security
  public static readonly paymentCache = new ServiceCache({
    ttl: 30 * 1000, // 30 seconds
    maxSize: 200,
    enableStats: true
  });

  // Rank tier cache - very long TTL as tiers rarely change
  public static readonly rankCache = new ServiceCache({
    ttl: 60 * 60 * 1000, // 1 hour
    maxSize: 100,
    enableStats: true
  });

  /**
   * Get all cache statistics
   */
  public static getAllStats(): Record<string, CacheStats> {
    return {
      tournament: this.tournamentCache.getStats(),
      elo: this.eloCache.getStats(),
      points: this.pointsCache.getStats(),
      payment: this.paymentCache.getStats(),
      rank: this.rankCache.getStats()
    };
  }

  /**
   * Clear all caches
   */
  public static clearAll(): void {
    this.tournamentCache.clear();
    this.eloCache.clear();
    this.pointsCache.clear();
    this.paymentCache.clear();
    this.rankCache.clear();
  }

  /**
   * Generate cache key from parameters
   */
  public static generateKey(prefix: string, ...params: (string | number)[]): string {
    return `${prefix}:${params.join(':')}`;
  }
}

/**
 * Cache invalidation patterns for business logic updates
 */
export class CacheInvalidationManager {
  /**
   * Invalidate tournament-related caches when tournament data changes
   */
  public static invalidateTournamentData(tournamentId: string, userId?: string): void {
    const patterns = [
      `tournament:${tournamentId}`,
      `tournament:list`,
      `tournament:user:${userId}`,
      `tournament:brackets:${tournamentId}`,
      `tournament:participants:${tournamentId}`
    ];

    patterns.forEach(pattern => {
      ServiceCacheManager.tournamentCache.delete(pattern);
      if (userId) {
        ServiceCacheManager.pointsCache.delete(`points:user:${userId}`);
      }
    });
  }

  /**
   * Invalidate ELO-related caches when ratings change
   */
  public static invalidateELOData(userId: string, opponentId?: string): void {
    const patterns = [
      `elo:user:${userId}`,
      `elo:rank:${userId}`,
      `ranking:leaderboard`,
      `ranking:tier:stats`
    ];

    if (opponentId) {
      patterns.push(`elo:user:${opponentId}`, `elo:rank:${opponentId}`);
    }

    patterns.forEach(pattern => {
      ServiceCacheManager.eloCache.delete(pattern);
      ServiceCacheManager.pointsCache.delete(pattern);
    });
  }

  /**
   * Invalidate payment-related caches when payment is processed
   */
  public static invalidatePaymentData(userId: string, orderId: string): void {
    const patterns = [
      `payment:user:${userId}`,
      `payment:order:${orderId}`,
      `points:user:${userId}`,
      `tournament:user:${userId}`
    ];

    patterns.forEach(pattern => {
      ServiceCacheManager.paymentCache.delete(pattern);
      ServiceCacheManager.pointsCache.delete(pattern);
      ServiceCacheManager.tournamentCache.delete(pattern);
    });
  }
}

export default ServiceCache;
