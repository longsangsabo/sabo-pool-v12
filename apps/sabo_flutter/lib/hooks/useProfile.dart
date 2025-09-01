import 'package:flutter/material.dart';
import '../types/profile.dart';

class ProfileProvider extends ChangeNotifier {
  UnifiedProfile? _profile;
  UnifiedProfile? _editingProfile;
  PlayerStats? _playerStats;
  PlayerRanking? _playerRanking;
  bool _loading = true;
  bool _saving = false;
  bool _uploading = false;
  bool _showImageCropper = false;
  String? _originalImageForCrop;

  // Getters
  UnifiedProfile? get profile => _profile;
  UnifiedProfile? get editingProfile => _editingProfile;
  PlayerStats? get playerStats => _playerStats;
  PlayerRanking? get playerRanking => _playerRanking;
  bool get loading => _loading;
  bool get saving => _saving;
  bool get uploading => _uploading;
  bool get showImageCropper => _showImageCropper;
  String? get originalImageForCrop => _originalImageForCrop;

  // Mock data initialization
  void initializeProfile() {
    _loading = true;
    notifyListeners();

    // Simulate API call delay
    Future.delayed(const Duration(milliseconds: 800), () {
      _profile = UnifiedProfile(
        id: '1',
        userId: 'user-123',
        displayName: 'Nguyễn Văn An',
        phone: '0901234567',
        bio:
            'Passionate billiards player. Always looking to improve my game and compete at the highest level.',
        skillLevel: 'intermediate',
        city: 'Hồ Chí Minh',
        district: 'Quận 1',
        avatarUrl:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        memberSince: '2023-01-15',
        role: 'player',
        activeRole: 'player',
        verifiedRank: 'A',
        email: 'nguyenvanan@example.com',
        fullName: 'Nguyễn Văn An',
        currentRank: 'A',
        spaPoints: 1250,
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2024-12-01T14:20:00Z',
        completionPercentage: 85,
      );

      _playerStats = PlayerStats(
        elo: 1420,
        spa: 1250,
        totalMatches: 45,
        winRate: 73,
        currentStreak: 5,
      );

      _playerRanking = PlayerRanking(
        rankingPosition: 12,
        category: 'A',
        totalPlayers: 156,
      );

      _editingProfile = UnifiedProfile(
        id: _profile!.id,
        userId: _profile!.userId,
        displayName: _profile!.displayName,
        phone: _profile!.phone,
        bio: _profile!.bio,
        skillLevel: _profile!.skillLevel,
        city: _profile!.city,
        district: _profile!.district,
        avatarUrl: _profile!.avatarUrl,
        memberSince: _profile!.memberSince,
        role: _profile!.role,
        activeRole: _profile!.activeRole,
        verifiedRank: _profile!.verifiedRank,
        email: _profile!.email,
        fullName: _profile!.fullName,
        currentRank: _profile!.currentRank,
        spaPoints: _profile!.spaPoints,
        createdAt: _profile!.createdAt,
        updatedAt: _profile!.updatedAt,
        completionPercentage: _profile!.completionPercentage,
      );

      _loading = false;
      notifyListeners();
    });
  }

  void handleEditField(String field, dynamic value) {
    if (_editingProfile == null) return;

    switch (field) {
      case 'display_name':
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
      case 'skill_level':
        _editingProfile = _editingProfile!.copyWith(skillLevel: value);
        break;
      case 'role':
        _editingProfile = _editingProfile!.copyWith(role: value);
        break;
      case 'active_role':
        _editingProfile = _editingProfile!.copyWith(activeRole: value);
        break;
    }
    notifyListeners();
  }

  Future<bool> handleSaveProfile() async {
    if (_editingProfile == null) return false;

    _saving = true;
    notifyListeners();

    try {
      // Simulate API call
      await Future.delayed(const Duration(milliseconds: 1000));

      _profile = UnifiedProfile(
        id: _editingProfile!.id,
        userId: _editingProfile!.userId,
        displayName: _editingProfile!.displayName,
        phone: _editingProfile!.phone,
        bio: _editingProfile!.bio,
        skillLevel: _editingProfile!.skillLevel,
        city: _editingProfile!.city,
        district: _editingProfile!.district,
        avatarUrl: _editingProfile!.avatarUrl,
        memberSince: _editingProfile!.memberSince,
        role: _editingProfile!.role,
        activeRole: _editingProfile!.activeRole,
        verifiedRank: _editingProfile!.verifiedRank,
        email: _editingProfile!.email,
        fullName: _editingProfile!.fullName,
        currentRank: _editingProfile!.currentRank,
        spaPoints: _editingProfile!.spaPoints,
        createdAt: _editingProfile!.createdAt,
        updatedAt: DateTime.now().toIso8601String(),
        completionPercentage: _editingProfile!.completionPercentage,
      );

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
    if (_profile == null) return;

    _editingProfile = UnifiedProfile(
      id: _profile!.id,
      userId: _profile!.userId,
      displayName: _profile!.displayName,
      phone: _profile!.phone,
      bio: _profile!.bio,
      skillLevel: _profile!.skillLevel,
      city: _profile!.city,
      district: _profile!.district,
      avatarUrl: _profile!.avatarUrl,
      memberSince: _profile!.memberSince,
      role: _profile!.role,
      activeRole: _profile!.activeRole,
      verifiedRank: _profile!.verifiedRank,
      email: _profile!.email,
      fullName: _profile!.fullName,
      currentRank: _profile!.currentRank,
      spaPoints: _profile!.spaPoints,
      createdAt: _profile!.createdAt,
      updatedAt: _profile!.updatedAt,
      completionPercentage: _profile!.completionPercentage,
    );
    notifyListeners();
  }

  Future<void> handleAvatarUpload(String imagePath) async {
    _uploading = true;
    notifyListeners();

    try {
      // Simulate upload
      await Future.delayed(const Duration(milliseconds: 1500));

      if (_profile != null && _editingProfile != null) {
        _profile = _profile!.copyWith(avatarUrl: imagePath);
        _editingProfile = _editingProfile!.copyWith(avatarUrl: imagePath);
      }

      _uploading = false;
      notifyListeners();
    } catch (e) {
      _uploading = false;
      notifyListeners();
    }
  }

  void setShowImageCropper(bool show) {
    _showImageCropper = show;
    notifyListeners();
  }

  void setOriginalImageForCrop(String? imagePath) {
    _originalImageForCrop = imagePath;
    notifyListeners();
  }
}
