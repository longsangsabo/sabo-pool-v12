// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserImpl _$$UserImplFromJson(Map<String, dynamic> json) => _$UserImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String,
      avatar: json['avatar'] as String?,
      eloRating: (json['eloRating'] as num?)?.toInt() ?? 1000,
      rank: json['rank'] as String? ?? 'Newcomer',
      joinedDate: DateTime.parse(json['joinedDate'] as String),
      achievements: (json['achievements'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      tournamentsWon: (json['tournamentsWon'] as num?)?.toInt() ?? 0,
      totalMatches: (json['totalMatches'] as num?)?.toInt() ?? 0,
      winRate: (json['winRate'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$UserImplToJson(_$UserImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'email': instance.email,
      'phone': instance.phone,
      'avatar': instance.avatar,
      'eloRating': instance.eloRating,
      'rank': instance.rank,
      'joinedDate': instance.joinedDate.toIso8601String(),
      'achievements': instance.achievements,
      'tournamentsWon': instance.tournamentsWon,
      'totalMatches': instance.totalMatches,
      'winRate': instance.winRate,
    };
