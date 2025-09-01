import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../utils/production/production_testing_service.dart';

/// Production testing control widget for development builds
class ProductionTestingWidget extends ConsumerStatefulWidget {
  const ProductionTestingWidget({super.key});

  @override
  ConsumerState<ProductionTestingWidget> createState() => _ProductionTestingWidgetState();
}

class _ProductionTestingWidgetState extends ConsumerState<ProductionTestingWidget> {
  bool _isRunningTests = false;
  Map<String, dynamic>? _testReport;
  String? _errorMessage;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Production Testing'),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Production Testing Suite',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Comprehensive testing for production readiness',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 16),
                    if (_isRunningTests)
                      const LinearProgressIndicator()
                    else
                      ElevatedButton.icon(
                        onPressed: _runAllTests,
                        icon: const Icon(Icons.play_arrow),
                        label: const Text('Run All Tests'),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildTestButton(
                    'Device\nCompatibility',
                    Icons.devices,
                    _runDeviceTests,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildTestButton(
                    'Performance\nRegression',
                    Icons.speed,
                    _runPerformanceTests,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _buildTestButton(
                    'App Store\nValidation',
                    Icons.store,
                    _runStoreValidation,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildTestButton(
                    'Setup\nInfrastructure',
                    Icons.settings,
                    _setupInfrastructure,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_errorMessage != null)
              Card(
                color: Theme.of(context).colorScheme.errorContainer,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Error',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onErrorContainer,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _errorMessage!,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onErrorContainer,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            if (_testReport != null)
              Expanded(
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Test Report',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 16),
                        Expanded(
                          child: _buildTestReport(),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestButton(String label, IconData icon, VoidCallback onPressed) {
    return ElevatedButton(
      onPressed: _isRunningTests ? null : onPressed,
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 32),
          const SizedBox(height: 8),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildTestReport() {
    if (_testReport == null) return const SizedBox.shrink();

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildOverallReadiness(),
          const SizedBox(height: 16),
          _buildDeviceCompatibilitySection(),
          const SizedBox(height: 16),
          _buildPerformanceSection(),
          const SizedBox(height: 16),
          _buildStoreValidationSection(),
        ],
      ),
    );
  }

  Widget _buildOverallReadiness() {
    final readiness = _testReport!['overallReadiness'] as Map<String, dynamic>?;
    if (readiness == null) return const SizedBox.shrink();

    final score = readiness['overallScore'] as int? ?? 0;
    final isReady = readiness['readyForProduction'] as bool? ?? false;

    return Card(
      color: isReady 
          ? Theme.of(context).colorScheme.primaryContainer
          : Theme.of(context).colorScheme.secondaryContainer,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  isReady ? Icons.check_circle : Icons.warning,
                  color: isReady ? Colors.green : Colors.orange,
                ),
                const SizedBox(width: 8),
                Text(
                  'Production Readiness: $score%',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              isReady ? 'Ready for Production' : 'Needs Attention',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: isReady ? Colors.green : Colors.orange,
              ),
            ),
            if (readiness['recommendations'] is List) ...[
              const SizedBox(height: 8),
              ...((readiness['recommendations'] as List).map((rec) => 
                Padding(
                  padding: const EdgeInsets.only(top: 4.0),
                  child: Row(
                    children: [
                      const Icon(Icons.arrow_right, size: 16),
                      const SizedBox(width: 4),
                      Expanded(child: Text(rec.toString())),
                    ],
                  ),
                ),
              )),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDeviceCompatibilitySection() {
    final compatibility = _testReport!['deviceCompatibility'] as Map<String, dynamic>?;
    if (compatibility == null) return const SizedBox.shrink();

    final total = compatibility['totalDevicesTested'] as int? ?? 0;
    final compatible = compatibility['compatibleDevices'] as int? ?? 0;

    return ExpansionTile(
      title: Text('Device Compatibility ($compatible/$total)'),
      leading: Icon(
        compatible == total ? Icons.devices : Icons.warning,
        color: compatible == total ? Colors.green : Colors.orange,
      ),
      children: [
        if (compatibility['results'] is List)
          ...(compatibility['results'] as List).map((result) {
            final device = result as Map<String, dynamic>;
            final isCompatible = device['isCompatible'] as bool? ?? false;
            
            return ListTile(
              leading: Icon(
                isCompatible ? Icons.check_circle : Icons.error,
                color: isCompatible ? Colors.green : Colors.red,
              ),
              title: Text(device['deviceModel']?.toString() ?? 'Unknown Device'),
              subtitle: Text(device['osVersion']?.toString() ?? 'Unknown OS'),
              trailing: Text(
                isCompatible ? 'Compatible' : 'Issues',
                style: TextStyle(
                  color: isCompatible ? Colors.green : Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              ),
            );
          }),
      ],
    );
  }

  Widget _buildPerformanceSection() {
    final performance = _testReport!['performanceRegression'] as Map<String, dynamic>?;
    if (performance == null) return const SizedBox.shrink();

    final total = performance['totalTests'] as int? ?? 0;
    final regressions = performance['regressions'] as int? ?? 0;

    return ExpansionTile(
      title: Text('Performance Tests ($regressions/$total regressions)'),
      leading: Icon(
        regressions == 0 ? Icons.speed : Icons.warning,
        color: regressions == 0 ? Colors.green : Colors.orange,
      ),
      children: [
        if (performance['results'] is List)
          ...(performance['results'] as List).map((result) {
            final test = result as Map<String, dynamic>;
            final isRegression = test['isRegression'] as bool? ?? false;
            final change = test['changePercentage'] as double? ?? 0.0;
            
            return ListTile(
              leading: Icon(
                isRegression ? Icons.trending_down : Icons.trending_up,
                color: isRegression ? Colors.red : Colors.green,
              ),
              title: Text(test['testName']?.toString() ?? 'Unknown Test'),
              subtitle: Text(
                '${change.toStringAsFixed(1)}% change',
              ),
              trailing: Text(
                isRegression ? 'Regression' : 'OK',
                style: TextStyle(
                  color: isRegression ? Colors.red : Colors.green,
                  fontWeight: FontWeight.bold,
                ),
              ),
            );
          }),
      ],
    );
  }

  Widget _buildStoreValidationSection() {
    final store = _testReport!['appStoreValidation'] as Map<String, dynamic>?;
    if (store == null) return const SizedBox.shrink();

    final platforms = store['platforms'] as List? ?? [];
    final readyPlatforms = store['readyPlatforms'] as List? ?? [];

    return ExpansionTile(
      title: Text('App Store Validation (${readyPlatforms.length}/${platforms.length} ready)'),
      leading: Icon(
        readyPlatforms.length == platforms.length ? Icons.store : Icons.warning,
        color: readyPlatforms.length == platforms.length ? Colors.green : Colors.orange,
      ),
      children: [
        if (store['results'] is List)
          ...(store['results'] as List).map((result) {
            final validation = result as Map<String, dynamic>;
            final isReady = validation['readyForSubmission'] as bool? ?? false;
            final platform = validation['platform']?.toString() ?? 'Unknown';
            
            return ListTile(
              leading: Icon(
                isReady ? Icons.check_circle : Icons.error,
                color: isReady ? Colors.green : Colors.red,
              ),
              title: Text(platform.toUpperCase()),
              subtitle: Text(
                isReady ? 'Ready for submission' : 'Has issues',
              ),
              trailing: Text(
                isReady ? 'Ready' : 'Issues',
                style: TextStyle(
                  color: isReady ? Colors.green : Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              ),
            );
          }),
      ],
    );
  }

  Future<void> _runAllTests() async {
    setState(() {
      _isRunningTests = true;
      _errorMessage = null;
      _testReport = null;
    });

    try {
      final service = ref.read(productionTestingServiceProvider);
      final report = await service.generateTestingReport();
      
      setState(() {
        _testReport = report;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to run tests: $e';
      });
    } finally {
      setState(() {
        _isRunningTests = false;
      });
    }
  }

  Future<void> _runDeviceTests() async {
    setState(() {
      _isRunningTests = true;
      _errorMessage = null;
    });

    try {
      final service = ref.read(productionTestingServiceProvider);
      final results = await service.runDeviceCompatibilityTests();
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Device tests completed: ${results.length} devices tested'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      setState(() {
        _errorMessage = 'Device tests failed: $e';
      });
    } finally {
      setState(() {
        _isRunningTests = false;
      });
    }
  }

  Future<void> _runPerformanceTests() async {
    setState(() {
      _isRunningTests = true;
      _errorMessage = null;
    });

    try {
      final service = ref.read(productionTestingServiceProvider);
      final results = await service.runPerformanceRegressionTests();
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Performance tests completed: ${results.length} tests run'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      setState(() {
        _errorMessage = 'Performance tests failed: $e';
      });
    } finally {
      setState(() {
        _isRunningTests = false;
      });
    }
  }

  Future<void> _runStoreValidation() async {
    setState(() {
      _isRunningTests = true;
      _errorMessage = null;
    });

    try {
      final service = ref.read(productionTestingServiceProvider);
      final results = await service.validateAppStoreSubmission();
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Store validation completed: ${results.length} platforms checked'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      setState(() {
        _errorMessage = 'Store validation failed: $e';
      });
    } finally {
      setState(() {
        _isRunningTests = false;
      });
    }
  }

  Future<void> _setupInfrastructure() async {
    setState(() {
      _isRunningTests = true;
      _errorMessage = null;
    });

    try {
      final service = ref.read(productionTestingServiceProvider);
      await service.setupCrashReporting();
      await service.setupBetaTesting();
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Infrastructure setup completed'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      setState(() {
        _errorMessage = 'Infrastructure setup failed: $e';
      });
    } finally {
      setState(() {
        _isRunningTests = false;
      });
    }
  }
}
