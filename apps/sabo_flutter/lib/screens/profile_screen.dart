import 'package:flutter/material.dart';
import '../services/user_profile_service.dart';
import '../models/user_profile.dart';
import '../components/ui/CameraAvatar.dart';
import '../components/ui/AchievementDisplay.dart';
import '../components/ui/ProfileStatsDashboard.dart';
import 'enhanced_settings_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> with TickerProviderStateMixin {
  UserProfile? profile;
  bool isLoading = true;
  String? error;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    loadProfile();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> loadProfile() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    try {
      final loadedProfile = await UserProfileService.getUserProfile('current_user_id');
      setState(() {
        profile = loadedProfile;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  void _onAvatarUpdated(String newAvatarUrl) {
    if (profile != null) {
      setState(() {
        profile = profile!.copyWith(avatarUrl: newAvatarUrl);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const EnhancedSettingsScreen(
                    userId: 'current_user_id',
                  ),
                ),
              );
            },
            tooltip: 'Settings',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: loadProfile,
            tooltip: 'Refresh Profile',
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.person), text: 'Profile'),
            Tab(icon: Icon(Icons.emoji_events), text: 'Achievements'),
            Tab(icon: Icon(Icons.analytics), text: 'Statistics'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildProfileTab(),
          _buildAchievementsTab(),
          _buildStatisticsTab(),
        ],
      ),
    );
  }

  Widget _buildProfileTab() {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'Error loading profile',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              error!,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: loadProfile,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (profile == null) {
      return const Center(
        child: Text('No profile data available'),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Enhanced Profile Header with Camera Avatar
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // Camera-enabled avatar
                  CameraAvatar(
                    userId: 'current_user_id',
                    currentAvatarUrl: profile!.avatarUrl,
                    onAvatarUpdated: _onAvatarUpdated,
                    size: 100,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    profile!.displayName,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (profile!.username != profile!.displayName)
                    Text(
                      '@${profile!.username}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                  if (profile!.bio != null && profile!.bio!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      profile!.bio!,
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                  ],
                  const SizedBox(height: 16),
                  // Profile stats row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildStatItem(
                        'Level',
                        '${profile!.level}',
                        Icons.star,
                        Colors.amber,
                      ),
                      _buildStatItem(
                        'SPA Points',
                        '${profile!.spaPoints.currentPoints}',
                        Icons.score,
                        Colors.blue,
                      ),
                      _buildStatItem(
                        'Joined',
                        _formatDate(profile!.createdAt),
                        Icons.calendar_today,
                        Colors.green,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          // Profile Details Section
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Profile Details',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildDetailRow('Email', profile!.email, Icons.email),
                  if (profile!.phoneNumber != null)
                    _buildDetailRow('Phone', profile!.phoneNumber!, Icons.phone),
                  if (profile!.location != null)
                    _buildDetailRow('Location', profile!.location!, Icons.location_on),
                  if (profile!.dateOfBirth != null)
                    _buildDetailRow(
                      'Birthday',
                      _formatDate(profile!.dateOfBirth!),
                      Icons.cake,
                    ),
                  _buildDetailRow(
                    'Account Status',
                    profile!.isActive ? 'Active' : 'Inactive',
                    profile!.isActive ? Icons.check_circle : Icons.cancel,
                  ),
                  _buildDetailRow(
                    'Email Verified',
                    profile!.isEmailVerified ? 'Verified' : 'Not Verified',
                    profile!.isEmailVerified ? Icons.verified : Icons.warning,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Experience Progress Section
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Experience Progress',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Icon(Icons.star, color: Colors.amber),
                      const SizedBox(width: 8),
                      Text(
                        'Level ${profile!.level}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '${profile!.experience.currentXP}/${profile!.experience.requiredXP} XP',
                        style: TextStyle(
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: profile!.experience.currentXP / profile!.experience.requiredXP,
                    backgroundColor: Colors.grey[300],
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.amber),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAchievementsTab() {
    return AchievementDisplay(
      userId: 'current_user_id',
      showHeader: false, // Since we're in a tab, no need for additional header
    );
  }

  Widget _buildStatisticsTab() {
    return ProfileStatsDashboard(
      userId: 'current_user_id',
      profile: profile,
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          const SizedBox(width: 12),
          Text(
            '$label:',
            style: const TextStyle(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: Colors.grey[700],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
