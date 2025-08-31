import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RankingUser {
  id: string;
  username: string;
  rank: number;
  elo: number;
  wins: number;
  losses: number;
  avatar_url?: string;
}

const mockRankings: RankingUser[] = [
  {
    id: '1',
    username: 'ProPlayer1',
    rank: 1,
    elo: 2150,
    wins: 45,
    losses: 8,
    avatar_url: 'https://via.placeholder.com/50',
  },
  {
    id: '2',
    username: 'PoolMaster',
    rank: 2,
    elo: 2089,
    wins: 38,
    losses: 12,
    avatar_url: 'https://via.placeholder.com/50',
  },
  {
    id: '3',
    username: 'CueExpert',
    rank: 3,
    elo: 1967,
    wins: 32,
    losses: 15,
    avatar_url: 'https://via.placeholder.com/50',
  },
  {
    id: '4',
    username: 'Player123',
    rank: 4,
    elo: 1834,
    wins: 28,
    losses: 18,
  },
  {
    id: '5',
    username: 'BilliardKing',
    rank: 5,
    elo: 1756,
    wins: 25,
    losses: 20,
  },
];

export default function RankingsScreen() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Ionicons name="trophy" size={24} color="#FFD700" />;
      case 2:
        return <Ionicons name="medal" size={24} color="#C0C0C0" />;
      case 3:
        return <Ionicons name="medal" size={24} color="#CD7F32" />;
      default:
        return (
          <View style={styles.rankNumber}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        );
    }
  };

  const getWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bảng xếp hạng</Text>
        <Text style={styles.subtitle}>Top players toàn server</Text>
      </View>

      <ScrollView style={styles.content}>
        {mockRankings.map((user, index) => (
          <View key={user.id} style={[styles.rankCard, index < 3 && styles.topRankCard]}>
            <View style={styles.rankInfo}>
              {getRankIcon(user.rank)}
              
              <View style={styles.avatarContainer}>
                {user.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={20} color="#9CA3AF" />
                  </View>
                )}
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.elo}>{user.elo} ELO</Text>
              </View>
            </View>

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.wins}W</Text>
                <Text style={styles.statLabel}>Thắng</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.losses}L</Text>
                <Text style={styles.statLabel}>Thua</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getWinRate(user.wins, user.losses)}%</Text>
                <Text style={styles.statLabel}>Tỷ lệ</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bảng xếp hạng được cập nhật theo thời gian thực
          </Text>
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
  rankCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRankCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#1F2937',
  },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  elo: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginLeft: 16,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
});
