import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'analytics_business_intelligence_service.g.dart';

/// User behavior event
class UserBehaviorEvent {
  final String eventId;
  final String userId;
  final String eventType;
  final String screen;
  final Map<String, dynamic> properties;
  final DateTime timestamp;
  final String sessionId;
  final Map<String, dynamic> context;
  
  const UserBehaviorEvent({
    required this.eventId,
    required this.userId,
    required this.eventType,
    required this.screen,
    required this.properties,
    required this.timestamp,
    required this.sessionId,
    required this.context,
  });
  
  Map<String, dynamic> toJson() => {
    'eventId': eventId,
    'userId': userId,
    'eventType': eventType,
    'screen': screen,
    'properties': properties,
    'timestamp': timestamp.toIso8601String(),
    'sessionId': sessionId,
    'context': context,
  };
}

/// Tournament analytics data
class TournamentAnalytics {
  final String tournamentId;
  final String tournamentName;
  final int totalParticipants;
  final int activeParticipants;
  final double engagementRate;
  final Duration averageSessionTime;
  final Map<String, int> participantsByRegion;
  final Map<String, double> revenueByCategory;
  final List<Map<String, dynamic>> matchStatistics;
  final DateTime startDate;
  final DateTime? endDate;
  
  const TournamentAnalytics({
    required this.tournamentId,
    required this.tournamentName,
    required this.totalParticipants,
    required this.activeParticipants,
    required this.engagementRate,
    required this.averageSessionTime,
    required this.participantsByRegion,
    required this.revenueByCategory,
    required this.matchStatistics,
    required this.startDate,
    this.endDate,
  });
  
  Map<String, dynamic> toJson() => {
    'tournamentId': tournamentId,
    'tournamentName': tournamentName,
    'totalParticipants': totalParticipants,
    'activeParticipants': activeParticipants,
    'engagementRate': engagementRate,
    'averageSessionTime': averageSessionTime.inMinutes,
    'participantsByRegion': participantsByRegion,
    'revenueByCategory': revenueByCategory,
    'matchStatistics': matchStatistics,
    'startDate': startDate.toIso8601String(),
    'endDate': endDate?.toIso8601String(),
  };
}

/// Revenue analytics data
class RevenueAnalytics {
  final DateTime period;
  final double totalRevenue;
  final double recurringRevenue;
  final double oneTimeRevenue;
  final Map<String, double> revenueBySource;
  final Map<String, double> revenueByRegion;
  final Map<String, double> revenueByUserType;
  final double averageRevenuePerUser;
  final double customerLifetimeValue;
  final int totalTransactions;
  final double conversionRate;
  
  const RevenueAnalytics({
    required this.period,
    required this.totalRevenue,
    required this.recurringRevenue,
    required this.oneTimeRevenue,
    required this.revenueBySource,
    required this.revenueByRegion,
    required this.revenueByUserType,
    required this.averageRevenuePerUser,
    required this.customerLifetimeValue,
    required this.totalTransactions,
    required this.conversionRate,
  });
  
  Map<String, dynamic> toJson() => {
    'period': period.toIso8601String(),
    'totalRevenue': totalRevenue,
    'recurringRevenue': recurringRevenue,
    'oneTimeRevenue': oneTimeRevenue,
    'revenueBySource': revenueBySource,
    'revenueByRegion': revenueByRegion,
    'revenueByUserType': revenueByUserType,
    'averageRevenuePerUser': averageRevenuePerUser,
    'customerLifetimeValue': customerLifetimeValue,
    'totalTransactions': totalTransactions,
    'conversionRate': conversionRate,
  };
}

/// User engagement prediction
class EngagementPrediction {
  final String userId;
  final double churnProbability;
  final double engagementScore;
  final String riskLevel; // 'low', 'medium', 'high'
  final List<String> recommendedActions;
  final Map<String, double> featureImportance;
  final DateTime predictionDate;
  final DateTime validUntil;
  
  const EngagementPrediction({
    required this.userId,
    required this.churnProbability,
    required this.engagementScore,
    required this.riskLevel,
    required this.recommendedActions,
    required this.featureImportance,
    required this.predictionDate,
    required this.validUntil,
  });
  
  Map<String, dynamic> toJson() => {
    'userId': userId,
    'churnProbability': churnProbability,
    'engagementScore': engagementScore,
    'riskLevel': riskLevel,
    'recommendedActions': recommendedActions,
    'featureImportance': featureImportance,
    'predictionDate': predictionDate.toIso8601String(),
    'validUntil': validUntil.toIso8601String(),
  };
}

/// A/B test configuration
class ABTestConfig {
  final String testId;
  final String testName;
  final String description;
  final List<String> variants;
  final Map<String, double> trafficAllocation;
  final Map<String, dynamic> targetingCriteria;
  final List<String> successMetrics;
  final DateTime startDate;
  final DateTime endDate;
  final bool isActive;
  
  const ABTestConfig({
    required this.testId,
    required this.testName,
    required this.description,
    required this.variants,
    required this.trafficAllocation,
    required this.targetingCriteria,
    required this.successMetrics,
    required this.startDate,
    required this.endDate,
    required this.isActive,
  });
  
  Map<String, dynamic> toJson() => {
    'testId': testId,
    'testName': testName,
    'description': description,
    'variants': variants,
    'trafficAllocation': trafficAllocation,
    'targetingCriteria': targetingCriteria,
    'successMetrics': successMetrics,
    'startDate': startDate.toIso8601String(),
    'endDate': endDate.toIso8601String(),
    'isActive': isActive,
  };
}

/// A/B test result
class ABTestResult {
  final String testId;
  final String variant;
  final int participants;
  final Map<String, double> metrics;
  final double conversionRate;
  final double confidence;
  final bool isStatisticallySignificant;
  final String winner;
  final DateTime lastUpdated;
  
  const ABTestResult({
    required this.testId,
    required this.variant,
    required this.participants,
    required this.metrics,
    required this.conversionRate,
    required this.confidence,
    required this.isStatisticallySignificant,
    required this.winner,
    required this.lastUpdated,
  });
  
  Map<String, dynamic> toJson() => {
    'testId': testId,
    'variant': variant,
    'participants': participants,
    'metrics': metrics,
    'conversionRate': conversionRate,
    'confidence': confidence,
    'isStatisticallySignificant': isStatisticallySignificant,
    'winner': winner,
    'lastUpdated': lastUpdated.toIso8601String(),
  };
}

/// Analytics pipeline configuration
class AnalyticsPipelineConfig {
  final String pipelineId;
  final String dataSource;
  final String destination;
  final Map<String, dynamic> transformations;
  final Duration batchInterval;
  final int batchSize;
  final Map<String, dynamic> errorHandling;
  final bool isRealTime;
  final DateTime createdDate;
  
  const AnalyticsPipelineConfig({
    required this.pipelineId,
    required this.dataSource,
    required this.destination,
    required this.transformations,
    required this.batchInterval,
    required this.batchSize,
    required this.errorHandling,
    required this.isRealTime,
    required this.createdDate,
  });
  
  Map<String, dynamic> toJson() => {
    'pipelineId': pipelineId,
    'dataSource': dataSource,
    'destination': destination,
    'transformations': transformations,
    'batchInterval': batchInterval.inMinutes,
    'batchSize': batchSize,
    'errorHandling': errorHandling,
    'isRealTime': isRealTime,
    'createdDate': createdDate.toIso8601String(),
  };
}

/// Advanced analytics and business intelligence service
/// Handles user behavior tracking, tournament analytics, revenue analytics, and predictive analytics
class AnalyticsBusinessIntelligenceService {
  static const String _tag = 'AnalyticsBusinessIntelligenceService';
  
  bool _isInitialized = false;
  String? _currentSessionId;
  final List<UserBehaviorEvent> _eventQueue = [];
  final Map<String, ABTestConfig> _abTests = {};
  final Map<String, String> _userABTestAssignments = {};
  final List<AnalyticsPipelineConfig> _pipelines = [];
  
  Timer? _flushTimer;
  Timer? _sessionTimer;
  
  /// Initialize analytics and BI service
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Start new session
      await _startSession();
      
      // Setup analytics pipelines
      await _setupAnalyticsPipelines();
      
      // Initialize A/B testing framework
      await _initializeABTesting();
      
      // Start periodic data flushing
      _startPeriodicFlush();
      
      _isInitialized = true;
      debugPrint('$_tag: Analytics and BI service initialized successfully');
    } catch (e) {
      debugPrint('$_tag: Failed to initialize analytics and BI service - $e');
      rethrow;
    }
  }
  
  /// Start new analytics session
  Future<void> _startSession() async {
    _currentSessionId = _generateSessionId();
    _sessionTimer?.cancel();
    
    // Session timeout after 30 minutes of inactivity
    _sessionTimer = Timer(const Duration(minutes: 30), () {
      _endSession();
    });
    
    // Track session start event
    await trackEvent(
      eventType: 'session_start',
      screen: 'app',
      properties: {
        'session_id': _currentSessionId,
        'app_version': '1.0.0',
        'platform': 'mobile',
      },
    );
    
    debugPrint('$_tag: New session started - $_currentSessionId');
  }
  
  /// End current session
  void _endSession() {
    if (_currentSessionId != null) {
      trackEvent(
        eventType: 'session_end',
        screen: 'app',
        properties: {
          'session_id': _currentSessionId,
          'session_duration': DateTime.now().millisecondsSinceEpoch,
        },
      );
      
      debugPrint('$_tag: Session ended - $_currentSessionId');
      _currentSessionId = null;
    }
  }
  
  /// Setup analytics pipelines
  Future<void> _setupAnalyticsPipelines() async {
    try {
      // Real-time user behavior pipeline
      _pipelines.add(AnalyticsPipelineConfig(
        pipelineId: 'user_behavior_realtime',
        dataSource: 'mobile_app',
        destination: 'analytics_warehouse',
        transformations: {
          'anonymize_pii': true,
          'enrich_geolocation': true,
          'session_aggregation': true,
        },
        batchInterval: const Duration(seconds: 30),
        batchSize: 100,
        errorHandling: {
          'retry_attempts': 3,
          'dead_letter_queue': true,
          'alert_on_failure': true,
        },
        isRealTime: true,
        createdDate: DateTime.now(),
      ));
      
      // Tournament analytics pipeline
      _pipelines.add(AnalyticsPipelineConfig(
        pipelineId: 'tournament_analytics',
        dataSource: 'tournament_service',
        destination: 'business_intelligence',
        transformations: {
          'calculate_engagement_metrics': true,
          'aggregate_revenue_data': true,
          'generate_insights': true,
        },
        batchInterval: const Duration(minutes: 15),
        batchSize: 50,
        errorHandling: {
          'retry_attempts': 5,
          'exponential_backoff': true,
          'circuit_breaker': true,
        },
        isRealTime: false,
        createdDate: DateTime.now(),
      ));
      
      // Revenue analytics pipeline
      _pipelines.add(AnalyticsPipelineConfig(
        pipelineId: 'revenue_analytics',
        dataSource: 'payment_service',
        destination: 'financial_warehouse',
        transformations: {
          'currency_normalization': true,
          'revenue_attribution': true,
          'cohort_analysis': true,
        },
        batchInterval: const Duration(hours: 1),
        batchSize: 200,
        errorHandling: {
          'data_validation': true,
          'financial_reconciliation': true,
          'audit_trail': true,
        },
        isRealTime: false,
        createdDate: DateTime.now(),
      ));
      
      debugPrint('$_tag: Analytics pipelines configured - ${_pipelines.length} pipelines');
    } catch (e) {
      debugPrint('$_tag: Analytics pipeline setup failed - $e');
      rethrow;
    }
  }
  
  /// Initialize A/B testing framework
  Future<void> _initializeABTesting() async {
    try {
      // Sample A/B tests
      _abTests['tournament_ui_v2'] = ABTestConfig(
        testId: 'tournament_ui_v2',
        testName: 'Tournament UI Redesign',
        description: 'Testing new tournament interface design',
        variants: ['control', 'variant_a', 'variant_b'],
        trafficAllocation: {
          'control': 0.34,
          'variant_a': 0.33,
          'variant_b': 0.33,
        },
        targetingCriteria: {
          'min_app_version': '1.0.0',
          'user_segments': ['active_players', 'tournament_participants'],
          'regions': ['US', 'CA', 'EU'],
        },
        successMetrics: [
          'tournament_participation_rate',
          'session_duration',
          'user_satisfaction_score',
        ],
        startDate: DateTime.now(),
        endDate: DateTime.now().add(const Duration(days: 30)),
        isActive: true,
      );
      
      _abTests['payment_flow_optimization'] = ABTestConfig(
        testId: 'payment_flow_optimization',
        testName: 'Payment Flow Optimization',
        description: 'Testing streamlined payment process',
        variants: ['current', 'streamlined', 'one_click'],
        trafficAllocation: {
          'current': 0.4,
          'streamlined': 0.3,
          'one_click': 0.3,
        },
        targetingCriteria: {
          'has_payment_method': true,
          'user_type': 'premium',
        },
        successMetrics: [
          'payment_completion_rate',
          'payment_time',
          'payment_errors',
        ],
        startDate: DateTime.now(),
        endDate: DateTime.now().add(const Duration(days: 21)),
        isActive: true,
      );
      
      debugPrint('$_tag: A/B testing framework initialized with ${_abTests.length} tests');
    } catch (e) {
      debugPrint('$_tag: A/B testing initialization failed - $e');
      rethrow;
    }
  }
  
  /// Start periodic data flushing
  void _startPeriodicFlush() {
    _flushTimer?.cancel();
    _flushTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      _flushEvents();
    });
  }
  
  /// Track user behavior event
  Future<void> trackEvent({
    required String eventType,
    required String screen,
    Map<String, dynamic>? properties,
    String? userId,
  }) async {
    try {
      if (!_isInitialized) {
        debugPrint('$_tag: Service not initialized, skipping event tracking');
        return;
      }
      
      final event = UserBehaviorEvent(
        eventId: _generateEventId(),
        userId: userId ?? 'anonymous',
        eventType: eventType,
        screen: screen,
        properties: properties ?? {},
        timestamp: DateTime.now(),
        sessionId: _currentSessionId ?? 'no_session',
        context: _buildEventContext(),
      );
      
      _eventQueue.add(event);
      
      // Immediate flush for critical events
      if (_isCriticalEvent(eventType)) {
        await _flushEvents();
      }
      
      // Reset session timer on activity
      _resetSessionTimer();
      
      debugPrint('$_tag: Event tracked - $eventType on $screen');
    } catch (e) {
      debugPrint('$_tag: Event tracking failed - $e');
    }
  }
  
  /// Build event context
  Map<String, dynamic> _buildEventContext() {
    return {
      'app_version': '1.0.0',
      'platform': 'mobile',
      'device_type': 'smartphone',
      'os_version': 'unknown',
      'network_type': 'wifi',
      'timezone': DateTime.now().timeZoneName,
      'locale': 'en_US',
    };
  }
  
  /// Check if event is critical
  bool _isCriticalEvent(String eventType) {
    const criticalEvents = [
      'error',
      'crash',
      'payment_completed',
      'payment_failed',
      'security_violation',
      'tournament_joined',
      'tournament_completed',
    ];
    return criticalEvents.contains(eventType);
  }
  
  /// Reset session timer
  void _resetSessionTimer() {
    _sessionTimer?.cancel();
    _sessionTimer = Timer(const Duration(minutes: 30), () {
      _endSession();
    });
  }
  
  /// Flush events to analytics pipeline
  Future<void> _flushEvents() async {
    if (_eventQueue.isEmpty) return;
    
    try {
      final events = List<UserBehaviorEvent>.from(_eventQueue);
      _eventQueue.clear();
      
      // In a real implementation, this would send to analytics service
      debugPrint('$_tag: Flushing ${events.length} events to analytics pipeline');
      
      // Simulate sending to analytics service
      await _sendEventsToAnalytics(events);
      
    } catch (e) {
      debugPrint('$_tag: Event flushing failed - $e');
      // Re-add events to queue for retry
      // _eventQueue.addAll(events);
    }
  }
  
  /// Send events to analytics service
  Future<void> _sendEventsToAnalytics(List<UserBehaviorEvent> events) async {
    // Simulate API call to analytics service
    await Future.delayed(const Duration(milliseconds: 100));
    
    for (final event in events) {
      // Process event through appropriate pipeline
      final pipeline = _pipelines.firstWhere(
        (p) => p.pipelineId == 'user_behavior_realtime',
        orElse: () => _pipelines.first,
      );
      
      if (pipeline.isRealTime) {
        // Process immediately
        await _processEventRealTime(event);
      } else {
        // Add to batch for later processing
        await _addEventToBatch(event);
      }
    }
  }
  
  /// Process event in real-time
  Future<void> _processEventRealTime(UserBehaviorEvent event) async {
    // Real-time processing logic
    await Future.delayed(const Duration(milliseconds: 10));
  }
  
  /// Add event to batch for processing
  Future<void> _addEventToBatch(UserBehaviorEvent event) async {
    // Batch processing logic
    await Future.delayed(const Duration(milliseconds: 5));
  }
  
  /// Generate tournament analytics
  Future<TournamentAnalytics> generateTournamentAnalytics(String tournamentId) async {
    try {
      // Simulate data collection and analysis
      await Future.delayed(const Duration(milliseconds: 500));
      
      final random = Random();
      
      return TournamentAnalytics(
        tournamentId: tournamentId,
        tournamentName: 'Sample Tournament',
        totalParticipants: 150 + random.nextInt(100),
        activeParticipants: 120 + random.nextInt(50),
        engagementRate: 0.75 + (random.nextDouble() * 0.2),
        averageSessionTime: Duration(minutes: 25 + random.nextInt(20)),
        participantsByRegion: {
          'North America': 45 + random.nextInt(20),
          'Europe': 35 + random.nextInt(15),
          'Asia': 40 + random.nextInt(25),
          'Other': 10 + random.nextInt(10),
        },
        revenueByCategory: {
          'Entry Fees': 2500.0 + (random.nextDouble() * 1000),
          'Premium Features': 800.0 + (random.nextDouble() * 400),
          'Sponsorships': 1200.0 + (random.nextDouble() * 600),
        },
        matchStatistics: [
          {
            'match_id': 'match_001',
            'duration_minutes': 15 + random.nextInt(20),
            'participants': 8,
            'completion_rate': 0.95,
          },
          {
            'match_id': 'match_002',
            'duration_minutes': 18 + random.nextInt(15),
            'participants': 6,
            'completion_rate': 0.88,
          },
        ],
        startDate: DateTime.now().subtract(const Duration(days: 5)),
        endDate: DateTime.now().add(const Duration(days: 2)),
      );
    } catch (e) {
      debugPrint('$_tag: Tournament analytics generation failed - $e');
      rethrow;
    }
  }
  
  /// Generate revenue analytics
  Future<RevenueAnalytics> generateRevenueAnalytics(DateTime period) async {
    try {
      // Simulate revenue data analysis
      await Future.delayed(const Duration(milliseconds: 300));
      
      final random = Random();
      final totalRevenue = 15000.0 + (random.nextDouble() * 10000);
      
      return RevenueAnalytics(
        period: period,
        totalRevenue: totalRevenue,
        recurringRevenue: totalRevenue * 0.6,
        oneTimeRevenue: totalRevenue * 0.4,
        revenueBySource: {
          'Tournament Fees': totalRevenue * 0.45,
          'Premium Subscriptions': totalRevenue * 0.30,
          'In-App Purchases': totalRevenue * 0.15,
          'Sponsorships': totalRevenue * 0.10,
        },
        revenueByRegion: {
          'North America': totalRevenue * 0.40,
          'Europe': totalRevenue * 0.35,
          'Asia': totalRevenue * 0.20,
          'Other': totalRevenue * 0.05,
        },
        revenueByUserType: {
          'Premium Users': totalRevenue * 0.70,
          'Free Users': totalRevenue * 0.30,
        },
        averageRevenuePerUser: 45.50 + (random.nextDouble() * 20),
        customerLifetimeValue: 185.0 + (random.nextDouble() * 100),
        totalTransactions: 850 + random.nextInt(300),
        conversionRate: 0.12 + (random.nextDouble() * 0.08),
      );
    } catch (e) {
      debugPrint('$_tag: Revenue analytics generation failed - $e');
      rethrow;
    }
  }
  
  /// Generate user engagement predictions
  Future<List<EngagementPrediction>> generateEngagementPredictions(List<String> userIds) async {
    try {
      // Simulate ML model prediction
      await Future.delayed(const Duration(milliseconds: 800));
      
      final predictions = <EngagementPrediction>[];
      final random = Random();
      
      for (final userId in userIds) {
        final churnProb = random.nextDouble();
        final engagementScore = 0.3 + (random.nextDouble() * 0.7);
        
        String riskLevel;
        List<String> actions;
        
        if (churnProb > 0.7) {
          riskLevel = 'high';
          actions = [
            'Send personalized re-engagement campaign',
            'Offer premium trial',
            'Schedule customer success call',
          ];
        } else if (churnProb > 0.4) {
          riskLevel = 'medium';
          actions = [
            'Send targeted tournament invitations',
            'Provide gameplay tips',
            'Offer exclusive content',
          ];
        } else {
          riskLevel = 'low';
          actions = [
            'Continue current engagement strategy',
            'Consider upselling opportunities',
          ];
        }
        
        predictions.add(EngagementPrediction(
          userId: userId,
          churnProbability: churnProb,
          engagementScore: engagementScore,
          riskLevel: riskLevel,
          recommendedActions: actions,
          featureImportance: {
            'session_frequency': 0.35,
            'tournament_participation': 0.28,
            'social_interactions': 0.18,
            'payment_history': 0.12,
            'support_tickets': 0.07,
          },
          predictionDate: DateTime.now(),
          validUntil: DateTime.now().add(const Duration(days: 7)),
        ));
      }
      
      debugPrint('$_tag: Generated engagement predictions for ${userIds.length} users');
      return predictions;
    } catch (e) {
      debugPrint('$_tag: Engagement prediction generation failed - $e');
      rethrow;
    }
  }
  
  /// Get A/B test variant for user
  String getABTestVariant(String testId, String userId) {
    try {
      final test = _abTests[testId];
      if (test == null || !test.isActive) {
        return 'control';
      }
      
      // Check if user already assigned
      final assignmentKey = '${testId}_$userId';
      if (_userABTestAssignments.containsKey(assignmentKey)) {
        return _userABTestAssignments[assignmentKey]!;
      }
      
      // Assign user to variant based on hash
      final hash = userId.hashCode.abs();
      final random = Random(hash);
      final randomValue = random.nextDouble();
      
      double cumulativeWeight = 0.0;
      for (final entry in test.trafficAllocation.entries) {
        cumulativeWeight += entry.value;
        if (randomValue <= cumulativeWeight) {
          _userABTestAssignments[assignmentKey] = entry.key;
          
          // Track assignment event
          trackEvent(
            eventType: 'ab_test_assignment',
            screen: 'system',
            properties: {
              'test_id': testId,
              'variant': entry.key,
              'user_id': userId,
            },
            userId: userId,
          );
          
          return entry.key;
        }
      }
      
      // Fallback to control
      _userABTestAssignments[assignmentKey] = 'control';
      return 'control';
    } catch (e) {
      debugPrint('$_tag: A/B test variant assignment failed - $e');
      return 'control';
    }
  }
  
  /// Track A/B test conversion
  void trackABTestConversion(String testId, String userId, String conversionEvent) {
    trackEvent(
      eventType: 'ab_test_conversion',
      screen: 'system',
      properties: {
        'test_id': testId,
        'conversion_event': conversionEvent,
        'variant': getABTestVariant(testId, userId),
      },
      userId: userId,
    );
  }
  
  /// Generate A/B test results
  Future<List<ABTestResult>> generateABTestResults(String testId) async {
    try {
      final test = _abTests[testId];
      if (test == null) {
        throw Exception('A/B test not found: $testId');
      }
      
      // Simulate results generation
      await Future.delayed(const Duration(milliseconds: 400));
      
      final results = <ABTestResult>[];
      final random = Random();
      
      for (final variant in test.variants) {
        final participants = 50 + random.nextInt(200);
        final conversionRate = 0.1 + (random.nextDouble() * 0.2);
        
        results.add(ABTestResult(
          testId: testId,
          variant: variant,
          participants: participants,
          metrics: {
            'conversion_rate': conversionRate,
            'average_session_time': 15.0 + (random.nextDouble() * 10),
            'bounce_rate': 0.2 + (random.nextDouble() * 0.3),
          },
          conversionRate: conversionRate,
          confidence: 0.85 + (random.nextDouble() * 0.14),
          isStatisticallySignificant: random.nextBool(),
          winner: variant == 'variant_a' ? 'winner' : 'loser',
          lastUpdated: DateTime.now(),
        ));
      }
      
      debugPrint('$_tag: Generated A/B test results for $testId');
      return results;
    } catch (e) {
      debugPrint('$_tag: A/B test results generation failed - $e');
      rethrow;
    }
  }
  
  /// Generate comprehensive analytics dashboard data
  Future<Map<String, dynamic>> generateAnalyticsDashboard() async {
    try {
      final now = DateTime.now();
      final lastMonth = now.subtract(const Duration(days: 30));
      
      // Generate sample data for dashboard
      final tournamentAnalytics = await generateTournamentAnalytics('sample_tournament');
      final revenueAnalytics = await generateRevenueAnalytics(lastMonth);
      final engagementPredictions = await generateEngagementPredictions(['user1', 'user2', 'user3']);
      
      final dashboard = {
        'dashboardGenerated': DateTime.now().toIso8601String(),
        'overview': {
          'total_users': 1250,
          'active_users_today': 186,
          'active_users_week': 745,
          'active_users_month': 1105,
          'total_tournaments': 45,
          'active_tournaments': 8,
          'total_revenue_month': revenueAnalytics.totalRevenue,
          'avg_session_duration': 22.5,
        },
        'user_behavior': {
          'top_screens': [
            {'screen': 'tournament_list', 'visits': 2450},
            {'screen': 'profile', 'visits': 1890},
            {'screen': 'leaderboard', 'visits': 1650},
            {'screen': 'settings', 'visits': 890},
          ],
          'user_flow': [
            {'from': 'home', 'to': 'tournaments', 'count': 1200},
            {'from': 'tournaments', 'to': 'tournament_detail', 'count': 800},
            {'from': 'tournament_detail', 'to': 'join_tournament', 'count': 450},
          ],
          'events_today': _eventQueue.length + 1500,
        },
        'tournament_analytics': tournamentAnalytics.toJson(),
        'revenue_analytics': revenueAnalytics.toJson(),
        'engagement_predictions': {
          'high_risk_users': engagementPredictions.where((p) => p.riskLevel == 'high').length,
          'medium_risk_users': engagementPredictions.where((p) => p.riskLevel == 'medium').length,
          'low_risk_users': engagementPredictions.where((p) => p.riskLevel == 'low').length,
          'average_engagement_score': engagementPredictions.map((p) => p.engagementScore).reduce((a, b) => a + b) / engagementPredictions.length,
        },
        'ab_tests': {
          'active_tests': _abTests.values.where((t) => t.isActive).length,
          'total_tests': _abTests.length,
          'test_results': await Future.wait(_abTests.keys.map((testId) => generateABTestResults(testId))),
        },
        'analytics_pipelines': {
          'total_pipelines': _pipelines.length,
          'realtime_pipelines': _pipelines.where((p) => p.isRealTime).length,
          'batch_pipelines': _pipelines.where((p) => !p.isRealTime).length,
        },
      };
      
      debugPrint('$_tag: Analytics dashboard generated successfully');
      return dashboard;
    } catch (e) {
      debugPrint('$_tag: Analytics dashboard generation failed - $e');
      rethrow;
    }
  }
  
  /// Generate unique event ID
  String _generateEventId() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final random = Random().nextInt(10000);
    return 'evt_${timestamp}_$random';
  }
  
  /// Generate unique session ID
  String _generateSessionId() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final random = Random().nextInt(10000);
    return 'ses_${timestamp}_$random';
  }
  
  /// Dispose service
  void dispose() {
    _flushTimer?.cancel();
    _sessionTimer?.cancel();
    _endSession();
    _eventQueue.clear();
    debugPrint('$_tag: Analytics service disposed');
  }
}

/// Provider for analytics and business intelligence service
@riverpod
AnalyticsBusinessIntelligenceService analyticsBusinessIntelligenceService(AnalyticsBusinessIntelligenceServiceRef ref) {
  final service = AnalyticsBusinessIntelligenceService();
  service.initialize();
  
  ref.onDispose(() {
    service.dispose();
  });
  
  return service;
}
