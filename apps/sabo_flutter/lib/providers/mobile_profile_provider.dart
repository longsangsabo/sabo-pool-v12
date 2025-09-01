import 'package:flutter/material.dart';
import '../types/unified_profile.dart';

// Hook equivalent for Mobile Profile - port từ useMobileProfile.ts
class MobileProfileProvider with ChangeNotifier {
  UnifiedProfile? _profile;
  UnifiedProfile? _editingProfile;
  bool _loading = true;
  bool _saving = false;
  bool _uploading = false;

  // Getters
  UnifiedProfile? get profile => _profile;
  UnifiedProfile? get editingProfile => _editingProfile;
  bool get loading => _loading;
  bool get saving => _saving;
  bool get uploading => _uploading;

  // Mock data để demo - trong thực tế sẽ fetch từ Supabase
  void fetchProfile() async {
    _loading = true;
    notifyListeners();

    // Simulate API call delay
    await Future.delayed(const Duration(milliseconds: 500));

    // Mock profile data
    _profile = const UnifiedProfile(
      id: '1',
      userId: 'user_1',
      displayName: 'Nguyễn Văn An',
      phone: '0123456789',
      bio: 'Yêu thích billiards và muốn nâng cao kỹ năng',
      skillLevel: 'intermediate',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      avatarUrl: 'https://via.placeholder.com/150',
      memberSince: '2024-01-01',
      role: 'player',
      activeRole: 'player',
      verifiedRank: 'H3',
      email: 'user@example.com',
      fullName: 'Nguyễn Văn An',
      currentRank: 'H3',
      spaPoints: 1250,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-12-01T00:00:00Z',
      completionPercentage: 85,
    );

    _editingProfile = _profile;
    _loading = false;
    notifyListeners();
  }

  void handleEditField(String field, dynamic value) {
    if (_editingProfile != null) {
      switch (field) {
        case 'displayName':
          _editingProfile = _editingProfile!.copyWith(displayName: value);
          break;
        case 'phone':
          _editingProfile = _editingProfile!.copyWith(phone: value);
          break;
        case 'bio':
          _editingProfile = _editingProfile!.copyWith(bio: value);
          break;
        case 'city':
          _editingProfile = _editingProfile!.copyWith(city: value);
          break;
        case 'district':
          _editingProfile = _editingProfile!.copyWith(district: value);
          break;
        case 'skillLevel':
          _editingProfile = _editingProfile!.copyWith(skillLevel: value);
          break;
      }
      notifyListeners();
    }
  }

  Future<bool> handleSaveProfile() async {
    if (_editingProfile == null) return false;

    _saving = true;
    notifyListeners();

    try {
      // Simulate API call
      await Future.delayed(const Duration(milliseconds: 1000));

      // Update profile with editing data
      _profile = _editingProfile;
      _saving = false;
      notifyListeners();

      return true;
    } catch (e) {
      _saving = false;
      notifyListeners();
      return false;
    }
  }

  void handleCancelEdit() {
    _editingProfile = _profile;
    notifyListeners();
  }

  Future<void> handleAvatarUpload() async {
    _uploading = true;
    notifyListeners();

    // Simulate upload
    await Future.delayed(const Duration(milliseconds: 2000));

    _uploading = false;
    notifyListeners();
  }
}

// Mock data providers
class MockPlayerStatsProvider with ChangeNotifier {
  PlayerStats? _stats;
  bool _loading = false;

  PlayerStats? get stats => _stats;
  bool get loading => _loading;

  void fetchStats() async {
    _loading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 300));

    _stats = const PlayerStats(
      elo: 1350,
      spa: 1250,
      totalMatches: 45,
      winRate: 68.9,
    );

    _loading = false;
    notifyListeners();
  }
}

class MockPlayerRankingProvider with ChangeNotifier {
  PlayerRanking? _ranking;
  bool _loading = false;

  PlayerRanking? get ranking => _ranking;
  bool get loading => _loading;

  void fetchRanking() async {
    _loading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 200));

    _ranking = const PlayerRanking(
      rankingPosition: 23,
      tier: 'Hạng III',
    );

    _loading = false;
    notifyListeners();
  }
}
