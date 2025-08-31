import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useTournamentStore } from '../../src/store/tournamentStore';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { tournaments, isLoading, fetchTournaments } = useTournamentStore();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const upcomingTournaments = tournaments.filter(t => t.status === 'registration_open' || t.status === 'upcoming');
  const ongoingTournaments = tournaments.filter(t => t.status === 'in_progress');

  const userStats = {
    tournaments: tournaments.length,
    wins: 0, // TODO: Get from user profile
    elo: 1000,
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Chào mừng trở lại, {user?.username || user?.email || 'Player'}!
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.tournaments}</Text>
            <Text style={styles.statLabel}>Giải đấu</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.wins}</Text>
            <Text style={styles.statLabel}>Thắng</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.elo}</Text>
            <Text style={styles.statLabel}>ELO</Text>
          </View>
        </View>

        {/* Ongoing Tournaments */}
        {ongoingTournaments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giải đấu đang diễn ra</Text>
            {ongoingTournaments.map((tournament) => (
              <TouchableOpacity key={tournament.id} style={styles.tournamentCard}>
                <View style={styles.tournamentHeader}>
                  <Text style={styles.tournamentName}>{tournament.title}</Text>
                  <View style={[styles.statusBadge, styles.ongoingBadge]}>
                    <Text style={styles.statusText}>Đang diễn ra</Text>
                  </View>
                </View>
                <Text style={styles.tournamentParticipants}>
                  {tournament.current_participants}/{tournament.max_participants} người chơi
                </Text>
                {tournament.prize_pool && (
                  <Text style={styles.tournamentPrize}>
                    Giải thưởng: {tournament.prize_pool.toLocaleString('vi-VN')} VNĐ
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Tournaments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giải đấu sắp tới</Text>
          {upcomingTournaments.length > 0 ? (
            upcomingTournaments.map((tournament) => (
              <TouchableOpacity key={tournament.id} style={styles.tournamentCard}>
                <View style={styles.tournamentHeader}>
                  <Text style={styles.tournamentName}>{tournament.title}</Text>
                  <View style={[styles.statusBadge, styles.upcomingBadge]}>
                    <Text style={styles.statusText}>Sắp tới</Text>
                  </View>
                </View>
                <Text style={styles.tournamentParticipants}>
                  {tournament.current_participants}/{tournament.max_participants} người chơi
                </Text>
                <Text style={styles.tournamentDate}>
                  Bắt đầu: {new Date(tournament.start_date).toLocaleDateString('vi-VN')}
                </Text>
                {tournament.entry_fee && (
                  <Text style={styles.tournamentFee}>
                    Phí tham gia: {tournament.entry_fee.toLocaleString('vi-VN')} VNĐ
                  </Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Không có giải đấu sắp tới</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hành động nhanh</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="trophy" size={24} color="#fff" />
              <Text style={styles.actionTitle}>Tham gia giải đấu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="flash" size={24} color="#fff" />
              <Text style={styles.actionTitle}>Tạo thách đấu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    color: '#666',
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  tournamentCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  upcomingBadge: {
    backgroundColor: '#0066FF',
  },
  ongoingBadge: {
    backgroundColor: '#00AA44',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tournamentParticipants: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  tournamentDate: {
    color: '#0066FF',
    fontSize: 14,
    marginBottom: 4,
  },
  tournamentFee: {
    color: '#666',
    fontSize: 14,
  },
  tournamentPrize: {
    color: '#00AA44',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#0066FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});
