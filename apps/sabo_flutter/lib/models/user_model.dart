import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String name,
    required String email,
    required String phone,
    String? avatar,
    @Default(1000) int eloRating,
    @Default('Newcomer') String rank,
    required DateTime joinedDate,
    @Default([]) List<String> achievements,
    @Default(0) int tournamentsWon,
    @Default(0) int totalMatches,
    @Default(0) int winRate,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

extension UserX on User {
  String get displayName => name.isNotEmpty ? name : 'Người chơi';
  
  String get rankColor {
    switch (rank.toLowerCase()) {
      case 'newcomer':
        return '#9E9E9E'; // Grey
      case 'beginner':
        return '#4CAF50'; // Green
      case 'intermediate':
        return '#2196F3'; // Blue
      case 'advanced':
        return '#FF9800'; // Orange
      case 'expert':
        return '#F44336'; // Red
      case 'master':
        return '#9C27B0'; // Purple
      case 'grandmaster':
        return '#FFD700'; // Gold
      default:
        return '#9E9E9E';
    }
  }
  
  String get eloDescription {
    if (eloRating < 800) return 'Mới bắt đầu';
    if (eloRating < 1200) return 'Học việc';
    if (eloRating < 1600) return 'Trung bình';
    if (eloRating < 2000) return 'Khá';
    if (eloRating < 2400) return 'Giỏi';
    return 'Xuất sắc';
  }
  
  double get winRatePercentage => totalMatches > 0 ? (winRate / totalMatches) * 100 : 0.0;
}
