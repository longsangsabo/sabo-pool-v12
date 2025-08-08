import React from 'react';
import CardAvatar from '../components/ui/card-avatar';
import DarkCardAvatar from '../components/ui/dark-card-avatar';
import RankColorReference from '../components/RankColorReference';

const RankTestPage = () => {
  const testRanks = [
    'K',
    'K+',
    'J',
    'J+',
    'I',
    'I+',
    'H',
    'H+',
    'G',
    'G+',
    'F',
    'F+',
    'E',
    'E+',
  ];

  return (
    <div style={{ padding: '20px', background: '#f8f9fa' }}>
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontFamily: "'Orbitron', monospace",
          fontSize: '32px',
          fontWeight: 700,
          background:
            'linear-gradient(135deg, #1f2937 0%, #4b5563 50%, #1f2937 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        🎱 Test Hệ Thống Rank Mới
      </h1>

      {/* Bảng màu tham chiếu */}
      <RankColorReference />

      {/* Test Light Mode Cards */}
      <div style={{ marginTop: '40px' }}>
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            fontFamily: "'Orbitron', monospace",
            color: '#1f2937',
          }}
        >
          Light Mode - Card Avatar
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {testRanks.slice(0, 6).map(rank => (
            <CardAvatar
              key={`light-${rank}`}
              nickname={`PLAYER_${rank}`}
              rank={rank}
              elo={1200 + Math.floor(Math.random() * 800)}
              spa={200 + Math.floor(Math.random() * 100)}
              ranking={Math.floor(Math.random() * 500) + 1}
              matches={Math.floor(Math.random() * 100) + 10}
              userAvatar='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
            />
          ))}
        </div>
      </div>

      {/* Test Dark Mode Cards */}
      <div
        style={{
          marginTop: '40px',
          background: '#1a1a1a',
          padding: '30px',
          borderRadius: '12px',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            fontFamily: "'Orbitron', monospace",
            color: '#f1f1f1',
          }}
        >
          Dark Mode - Card Avatar
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {testRanks.slice(6, 12).map(rank => (
            <DarkCardAvatar
              key={`dark-${rank}`}
              nickname={`PLAYER_${rank}`}
              rank={rank}
              elo={1200 + Math.floor(Math.random() * 800)}
              spa={200 + Math.floor(Math.random() * 100)}
              ranking={Math.floor(Math.random() * 500) + 1}
              matches={Math.floor(Math.random() * 100) + 10}
              userAvatar='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
            />
          ))}
        </div>
      </div>

      {/* All Ranks Preview */}
      <div style={{ marginTop: '40px' }}>
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            fontFamily: "'Orbitron', monospace",
            color: '#1f2937',
          }}
        >
          Tất Cả Các Hạng
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {testRanks.map(rank => (
            <CardAvatar
              key={`all-${rank}`}
              nickname={`${rank}_RANK`}
              rank={rank}
              elo={1200}
              spa={250}
              ranking={100}
              matches={20}
              size='sm'
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RankTestPage;
