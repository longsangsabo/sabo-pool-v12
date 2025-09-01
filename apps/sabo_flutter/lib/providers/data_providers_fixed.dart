import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/tournament_model_simple.dart';
import '../models/club_model_simple.dart';
import '../models/challenge_model_simple.dart';
import '../models/auth_state_simple.dart';
import '../services/data_service.dart';
import 'real_auth_provider.dart';

// Tournament providers
final tournamentsProvider = FutureProvider<List<Tournament>>((ref) async {
  return await DataService.getTournaments();
});

final userTournamentsProvider = FutureProvider<List<Tournament>>((ref) async {
  final authState = ref.watch(realAuthProvider);
  if (!authState.isAuthenticated || authState.user == null) {
    return [];
  }
  return await DataService.getUserTournaments(authState.user!.id);
});

// Join tournament action
final joinTournamentProvider = StateNotifierProvider<JoinTournamentNotifier, AsyncValue<void>>((ref) {
  return JoinTournamentNotifier(ref);
});

class JoinTournamentNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref ref;

  JoinTournamentNotifier(this.ref) : super(const AsyncValue.data(null));

  Future<void> joinTournament(String tournamentId) async {
    state = const AsyncValue.loading();
    try {
      final authState = ref.read(realAuthProvider);
      if (!authState.isAuthenticated || authState.user == null) {
        throw Exception('User not authenticated');
      }

      await DataService.joinTournament(tournamentId, authState.user!.id);
      
      // Invalidate tournaments to refresh the list
      ref.invalidate(tournamentsProvider);
      ref.invalidate(userTournamentsProvider);
      
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// Club providers
final clubsProvider = FutureProvider<List<Club>>((ref) async {
  return await DataService.getClubs();
});

final userClubsProvider = FutureProvider<List<Club>>((ref) async {
  final authState = ref.watch(realAuthProvider);
  if (!authState.isAuthenticated || authState.user == null) {
    return [];
  }
  return await DataService.getUserClubs(authState.user!.id);
});

// Join club action
final joinClubProvider = StateNotifierProvider<JoinClubNotifier, AsyncValue<void>>((ref) {
  return JoinClubNotifier(ref);
});

class JoinClubNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref ref;

  JoinClubNotifier(this.ref) : super(const AsyncValue.data(null));

  Future<void> joinClub(String clubId) async {
    state = const AsyncValue.loading();
    try {
      final authState = ref.read(realAuthProvider);
      if (!authState.isAuthenticated || authState.user == null) {
        throw Exception('User not authenticated');
      }

      await DataService.joinClub(clubId, authState.user!.id);
      
      // Invalidate clubs to refresh the list
      ref.invalidate(clubsProvider);
      ref.invalidate(userClubsProvider);
      
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// Challenge providers  
final challengesProvider = FutureProvider<List<Challenge>>((ref) async {
  return await DataService.getChallenges();
});

final createChallengeProvider = StateNotifierProvider<CreateChallengeNotifier, AsyncValue<void>>((ref) {
  return CreateChallengeNotifier(ref);
});

class CreateChallengeNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref ref;

  CreateChallengeNotifier(this.ref) : super(const AsyncValue.data(null));

  Future<void> createChallenge({
    required String opponentId,
    required String gameType,
    required double stakeAmount,
  }) async {
    state = const AsyncValue.loading();
    try {
      final authState = ref.read(realAuthProvider);
      if (!authState.isAuthenticated || authState.user == null) {
        throw Exception('User not authenticated');
      }

      await DataService.createChallenge(
        challengerId: authState.user!.id,
        opponentId: opponentId,
        gameType: gameType,
        stakeAmount: stakeAmount,
      );
      
      // Invalidate challenges to refresh the list
      ref.invalidate(challengesProvider);
      
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// User profile update
final updateProfileProvider = StateNotifierProvider<UpdateProfileNotifier, AsyncValue<void>>((ref) {
  return UpdateProfileNotifier(ref);
});

class UpdateProfileNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref ref;

  UpdateProfileNotifier(this.ref) : super(const AsyncValue.data(null));

  Future<void> updateProfile(Map<String, dynamic> updates) async {
    state = const AsyncValue.loading();
    try {
      final authState = ref.read(realAuthProvider);
      if (!authState.isAuthenticated || authState.user == null) {
        throw Exception('User not authenticated');
      }

      await DataService.updateUserProfile(authState.user!.id, updates);
      
      // Invalidate auth state to refresh user data
      ref.invalidate(realAuthProvider);
      
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// User statistics provider
final userStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final authState = ref.watch(realAuthProvider);
  if (!authState.isAuthenticated || authState.user == null) {
    return {};
  }
  return await DataService.getUserStatistics(authState.user!.id);
});

// Rankings provider
final rankingsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  return await DataService.getRankings();
});
