import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/user_settings_service.dart';

/// Enhanced settings screen for COPILOT 2: Settings & Preferences
/// Implements complete settings management with advanced UI/UX
class EnhancedSettingsScreen extends StatefulWidget {
  final String userId;

  const EnhancedSettingsScreen({
    Key? key,
    required this.userId,
  }) : super(key: key);

  @override
  State<EnhancedSettingsScreen> createState() => _EnhancedSettingsScreenState();
}

class _EnhancedSettingsScreenState extends State<EnhancedSettingsScreen>
    with TickerProviderStateMixin {
  UserSettings? _settings;
  bool _isLoading = true;
  bool _isSaving = false;
  late TabController _tabController;
  
  // Form controllers for advanced settings
  final _volumeController = TextEditingController();
  final _autoDeclineController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadSettings();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _volumeController.dispose();
    _autoDeclineController.dispose();
    super.dispose();
  }

  Future<void> _loadSettings() async {
    setState(() => _isLoading = true);
    try {
      final settings = await UserSettingsService.getUserSettings(widget.userId);
      setState(() {
        _settings = settings;
        _volumeController.text = (settings.masterVolume * 100).round().toString();
        _autoDeclineController.text = settings.autoDeclineAfterMinutes.toString();
      });
    } catch (e) {
      _showErrorSnackBar('Failed to load settings: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _updateSettings(UserSettings newSettings) async {
    setState(() => _isSaving = true);
    try {
      final updated = await UserSettingsService.updateUserSettings(
        widget.userId,
        newSettings,
      );
      if (updated != null) {
        setState(() => _settings = updated);
        _showSuccessSnackBar('Settings saved successfully');
        HapticFeedback.lightImpact();
      }
    } catch (e) {
      _showErrorSnackBar('Failed to save settings: $e');
    } finally {
      setState(() => _isSaving = false);
    }
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.white),
            const SizedBox(width: 8),
            Text(message),
          ],
        ),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error, color: Colors.white),
            const SizedBox(width: 8),
            Text(message),
          ],
        ),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Settings'),
          centerTitle: true,
        ),
        body: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_settings == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Settings'),
          centerTitle: true,
        ),
        body: const Center(
          child: Text('Failed to load settings'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(
              icon: Icon(Icons.notifications),
              text: 'Notifications',
            ),
            Tab(
              icon: Icon(Icons.security),
              text: 'Privacy',
            ),
            Tab(
              icon: Icon(Icons.palette),
              text: 'Appearance',
            ),
            Tab(
              icon: Icon(Icons.games),
              text: 'Gaming',
            ),
          ],
        ),
        actions: [
          if (_isSaving)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadSettings,
            tooltip: 'Refresh Settings',
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: _handleMenuAction,
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'reset',
                child: Row(
                  children: [
                    Icon(Icons.restore),
                    SizedBox(width: 8),
                    Text('Reset to Defaults'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'export',
                child: Row(
                  children: [
                    Icon(Icons.download),
                    SizedBox(width: 8),
                    Text('Export Settings'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'import',
                child: Row(
                  children: [
                    Icon(Icons.upload),
                    SizedBox(width: 8),
                    Text('Import Settings'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildNotificationsTab(),
          _buildPrivacyTab(),
          _buildAppearanceTab(),
          _buildGamingTab(),
        ],
      ),
    );
  }

  Widget _buildNotificationsTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildSectionHeader('Communication'),
        _buildSwitchTile(
          title: 'Email Notifications',
          subtitle: 'Receive notifications via email',
          value: _settings!.emailNotifications,
          onChanged: (value) => _updateSettings(
            _settings!.copyWith(emailNotifications: value),
          ),
          icon: Icons.email,
        ),
        _buildSwitchTile(
          title: 'Push Notifications',
          subtitle: 'Receive push notifications on this device',
          value: _settings!.pushNotifications,
          onChanged: (value) => _updateSettings(
            _settings!.copyWith(pushNotifications: value),
          ),
          icon: Icons.notifications,
        ),
        _buildSwitchTile(
          title: 'SMS Notifications',
          subtitle: 'Receive notifications via SMS',
          value: _settings!.smsNotifications,
          onChanged: (value) => _updateSettings(
            _settings!.copyWith(smsNotifications: value),
          ),
          icon: Icons.sms,
        ),
        const Divider(height: 32),
        _buildSectionHeader('Tournament Updates'),
        _buildSwitchTile(
          title: 'Auto-Join Tournaments',
          subtitle: 'Automatically join tournaments you\'re eligible for',
          value: _settings!.autoJoinTournaments,
          onChanged: (value) => _updateSettings(
            _settings!.copyWith(autoJoinTournaments: value),
          ),
          icon: Icons.auto_awesome,
        ),
      ],
    );
  }

  Widget _buildPrivacyTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildSectionHeader('Profile Visibility'),
        _buildSwitchTile(
          title: 'Public Profile',
          subtitle: 'Allow others to view your profile',
          value: _settings!.profilePublic,
          onChanged: (value) => _updateSettings(
            _settings!.copyWith(profilePublic: value),
          ),
          icon: Icons.public,
        ),
        _buildSwitchTile(
          title: 'Show Online Status',
          subtitle: 'Let others see when you\'re online',
          value: _settings!.showOnlineStatus,
          onChanged: (value) => _updateSettings(
            _settings!.copyWith(showOnlineStatus: value),
          ),
          icon: Icons.circle,
        ),
        _buildSwitchTile(
          title: 'Show Real Name',
          subtitle: 'Display your real name instead of username',
          value: _settings!.showRealName,
          onChanged: (value) => _updateSettings(
            _settings!.copyWith(showRealName: value),
          ),
          icon: Icons.badge,
        ),
        const Divider(height: 32),
        _buildSectionHeader('Communication'),
        _buildSwitchTile(
          title: 'Allow Direct Messages',
          subtitle: 'Let other users send you direct messages',
          value: _settings!.allowDirectMessages,
          onChanged: (value) => _updateSettings(
            _settings!.copyWith(allowDirectMessages: value),
          ),
          icon: Icons.message,
        ),
      ],
    );
  }

  Widget _buildAppearanceTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildSectionHeader('Theme'),
        _buildThemeSelector(),
        const Divider(height: 32),
        _buildSectionHeader('Language'),
        _buildLanguageSelector(),
        const Divider(height: 32),
        _buildSectionHeader('Audio & Feedback'),
        _buildSwitchTile(
          title: 'Sound Effects',
          subtitle: 'Enable audio feedback for actions',
          value: _settings!.soundEffects,
          onChanged: (value) => _updateSettings(
            _settings!.copyWith(soundEffects: value),
          ),
          icon: Icons.volume_up,
        ),
        _buildSwitchTile(
          title: 'Haptic Feedback',
          subtitle: 'Enable vibration feedback',
          value: _settings!.hapticFeedback,
          onChanged: (value) => _updateSettings(
            _settings!.copyWith(hapticFeedback: value),
          ),
          icon: Icons.vibration,
        ),
        _buildVolumeSlider(),
      ],
    );
  }

  Widget _buildGamingTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildSectionHeader('Game Preferences'),
        _buildGameModeSelector(),
        const Divider(height: 32),
        _buildSectionHeader('Statistics'),
        _buildSwitchTile(
          title: 'Show Advanced Stats',
          subtitle: 'Display detailed performance metrics',
          value: _settings!.showAdvancedStats,
          onChanged: (value) => _updateSettings(
            _settings!.copyWith(showAdvancedStats: value),
          ),
          icon: Icons.analytics,
        ),
        const Divider(height: 32),
        _buildSectionHeader('Challenges'),
        _buildSwitchTile(
          title: 'Allow Challenges',
          subtitle: 'Let other players challenge you to games',
          value: _settings!.allowChallenges,
          onChanged: (value) => _updateSettings(
            _settings!.copyWith(allowChallenges: value),
          ),
          icon: Icons.sports_esports,
        ),
        _buildAutoDeclineField(),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16, top: 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.bold,
          color: Theme.of(context).primaryColor,
        ),
      ),
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    required IconData icon,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: SwitchListTile(
        title: Text(title),
        subtitle: Text(subtitle),
        value: value,
        onChanged: onChanged,
        secondary: Icon(icon),
        activeColor: Theme.of(context).primaryColor,
      ),
    );
  }

  Widget _buildThemeSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Theme Mode',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildThemeOption('Light', 'light', Icons.light_mode),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildThemeOption('Dark', 'dark', Icons.dark_mode),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildThemeOption('Auto', 'auto', Icons.auto_mode),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeOption(String label, String value, IconData icon) {
    final isSelected = _settings!.theme == value;
    return GestureDetector(
      onTap: () => _updateSettings(_settings!.copyWith(theme: value)),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected
              ? Theme.of(context).primaryColor.withOpacity(0.1)
              : Colors.transparent,
          border: Border.all(
            color: isSelected
                ? Theme.of(context).primaryColor
                : Colors.grey.withOpacity(0.3),
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? Theme.of(context).primaryColor : null,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Theme.of(context).primaryColor : null,
                fontWeight: isSelected ? FontWeight.bold : null,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageSelector() {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.language),
        title: const Text('Language'),
        subtitle: Text(_settings!.language == 'vi' ? 'Tiếng Việt' : 'English'),
        trailing: DropdownButton<String>(
          value: _settings!.language,
          underline: const SizedBox(),
          items: const [
            DropdownMenuItem(value: 'vi', child: Text('Tiếng Việt')),
            DropdownMenuItem(value: 'en', child: Text('English')),
          ],
          onChanged: (value) {
            if (value != null) {
              _updateSettings(_settings!.copyWith(language: value));
            }
          },
        ),
      ),
    );
  }

  Widget _buildVolumeSlider() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.volume_up),
                const SizedBox(width: 8),
                const Text(
                  'Master Volume',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Text('${(_settings!.masterVolume * 100).round()}%'),
              ],
            ),
            Slider(
              value: _settings!.masterVolume,
              onChanged: (value) {
                setState(() {
                  _settings = _settings!.copyWith(masterVolume: value);
                  _volumeController.text = (value * 100).round().toString();
                });
              },
              onChangeEnd: (value) {
                _updateSettings(_settings!.copyWith(masterVolume: value));
              },
              min: 0.0,
              max: 1.0,
              divisions: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGameModeSelector() {
    final gameModes = [
      {'value': 'any', 'label': 'Any Mode'},
      {'value': 'casual', 'label': 'Casual'},
      {'value': 'ranked', 'label': 'Ranked'},
      {'value': 'tournament', 'label': 'Tournament'},
    ];

    return Card(
      child: ListTile(
        leading: const Icon(Icons.sports_esports),
        title: const Text('Preferred Game Mode'),
        subtitle: Text(
          gameModes
              .firstWhere((mode) => mode['value'] == _settings!.preferredGameMode)['label']!,
        ),
        trailing: DropdownButton<String>(
          value: _settings!.preferredGameMode,
          underline: const SizedBox(),
          items: gameModes
              .map((mode) => DropdownMenuItem(
                    value: mode['value'],
                    child: Text(mode['label']!),
                  ))
              .toList(),
          onChanged: (value) {
            if (value != null) {
              _updateSettings(_settings!.copyWith(preferredGameMode: value));
            }
          },
        ),
      ),
    );
  }

  Widget _buildAutoDeclineField() {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.timer),
        title: const Text('Auto-decline Challenges'),
        subtitle: Text('After ${_settings!.autoDeclineAfterMinutes} minutes'),
        trailing: SizedBox(
          width: 80,
          child: TextFormField(
            controller: _autoDeclineController,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            decoration: const InputDecoration(
              suffix: Text('min'),
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            ),
            onFieldSubmitted: (value) {
              final minutes = int.tryParse(value) ?? 30;
              _updateSettings(_settings!.copyWith(autoDeclineAfterMinutes: minutes));
            },
          ),
        ),
      ),
    );
  }

  void _handleMenuAction(String action) async {
    switch (action) {
      case 'reset':
        _showResetConfirmationDialog();
        break;
      case 'export':
        _exportSettings();
        break;
      case 'import':
        _importSettings();
        break;
    }
  }

  void _showResetConfirmationDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset Settings'),
        content: const Text(
          'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(context).pop();
              final defaultSettings = await UserSettingsService.resetToDefaults(widget.userId);
              setState(() => _settings = defaultSettings);
              _showSuccessSnackBar('Settings reset to defaults');
            },
            child: const Text('Reset'),
          ),
        ],
      ),
    );
  }

  void _exportSettings() async {
    try {
      final settingsJson = await UserSettingsService.exportSettings(widget.userId);
      await Clipboard.setData(ClipboardData(text: settingsJson));
      _showSuccessSnackBar('Settings exported to clipboard');
    } catch (e) {
      _showErrorSnackBar('Failed to export settings: $e');
    }
  }

  void _importSettings() {
    showDialog(
      context: context,
      builder: (context) {
        final controller = TextEditingController();
        return AlertDialog(
          title: const Text('Import Settings'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Paste your exported settings JSON below:'),
              const SizedBox(height: 16),
              TextField(
                controller: controller,
                maxLines: 5,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: 'Paste settings JSON here...',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(context).pop();
                final imported = await UserSettingsService.importSettings(
                  widget.userId,
                  controller.text,
                );
                if (imported != null) {
                  setState(() => _settings = imported);
                  _showSuccessSnackBar('Settings imported successfully');
                } else {
                  _showErrorSnackBar('Failed to import settings');
                }
              },
              child: const Text('Import'),
            ),
          ],
        );
      },
    );
  }
}
