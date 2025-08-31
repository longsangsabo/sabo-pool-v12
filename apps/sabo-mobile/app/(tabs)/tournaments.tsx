import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTournamentStore } from '../../src/store/tournamentStore';
import { useAuthStore } from '../../src/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function TournamentsScreen() {
  const { tournaments, isLoading, error, fetchTournaments, joinTournament, clearError } = useTournamentStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để tham gia giải đấu');
      return;
    }

    try {
      await joinTournament(tournamentId);
      Alert.alert('Thành công', 'Bạn đã tham gia giải đấu thành công!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tham gia giải đấu. Vui lòng thử lại.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open':
        return '#22C55E';
      case 'in_progress':
        return '#F59E0B';
      case 'completed':
        return '#6B7280';
      default:
        return '#3B82F6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'Đang mở đăng ký';
      case 'in_progress':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã kết thúc';
      default:
        return 'Sắp tới';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>Đang tải giải đấu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Giải đấu</Text>
        <Text style={styles.subtitle}>Tìm và tham gia các giải đấu</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content}>
        {tournaments.length > 0 ? (
          tournaments.map((tournament) => (
            <View key={tournament.id} style={styles.tournamentCard}>
              <View style={styles.tournamentHeader}>
                <Text style={styles.tournamentTitle}>{tournament.title}</Text>
                <View 
                  style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(tournament.status) }
                  ]}
                >
                  <Text style={styles.statusText}>{getStatusText(tournament.status)}</Text>
                </View>
              </View>

              {tournament.description && (
                <Text style={styles.tournamentDescription}>{tournament.description}</Text>
              )}

              <View style={styles.tournamentInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="people" size={16} color="#9CA3AF" />
                  <Text style={styles.infoText}>
                    {tournament.current_participants}/{tournament.max_participants} người chơi
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={16} color="#9CA3AF" />
                  <Text style={styles.infoText}>
                    {new Date(tournament.start_date).toLocaleDateString('vi-VN')}
                  </Text>
                </View>

                {tournament.entry_fee && (
                  <View style={styles.infoRow}>
                    <Ionicons name="card" size={16} color="#9CA3AF" />
                    <Text style={styles.infoText}>
                      Phí: {tournament.entry_fee.toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </View>
                )}

                {tournament.prize_pool && (
                  <View style={styles.infoRow}>
                    <Ionicons name="trophy" size={16} color="#F59E0B" />
                    <Text style={styles.prizeText}>
                      Giải thưởng: {tournament.prize_pool.toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </View>
                )}
              </View>

              {tournament.status === 'registration_open' && (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinTournament(tournament.id)}
                >
                  <Text style={styles.joinButtonText}>Tham gia</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={64} color="#6B7280" />
            <Text style={styles.emptyTitle}>Chưa có giải đấu</Text>
            <Text style={styles.emptyText}>Các giải đấu sẽ xuất hiện ở đây</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#DC2626',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    flex: 1,
  },
  errorButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  tournamentCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tournamentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tournamentDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  tournamentInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 8,
  },
  prizeText: {
    color: '#F59E0B',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
  },
});
