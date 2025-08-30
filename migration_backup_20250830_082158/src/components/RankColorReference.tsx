
import { rankColors } from '../utils/rank-colors';

const RankColorReference = () => {
  const allRanks = Object.keys(rankColors);

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: "'Orbitron', monospace",
        background: '#f8f9fa',
        borderRadius: '12px',
        margin: '20px',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '20px',
          color: '#1f2937',
          fontSize: '24px',
          fontWeight: 700,
        }}
      >
        🎱 Bảng Màu Hạng - Sabo Billiards
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}
      >
        {allRanks.map(rank => {
          const rankInfo = rankColors[rank as keyof typeof rankColors];
          const IconComponent = rankInfo.icon;

          return (
            <div
              key={rank}
              style={{
                background: 'white',
                border: `3px solid ${rankInfo.borderColor}`,
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <IconComponent
                  style={{
                    color: rankInfo.color,
                    width: '24px',
                    height: '24px',
                    filter: `drop-shadow(${rankInfo.textShadow})`,
                  }}
                />
                <span
                  style={{
                    background: rankInfo.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                  }}
                >
                  RANK {rank}
                </span>
              </div>

              <div
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '8px',
                  fontWeight: 500,
                }}
              >
                {rankInfo.name}
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: rankInfo.color,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  letterSpacing: '1px',
                }}
              >
                {rankInfo.color}
              </div>

              <div
                style={{
                  marginTop: '8px',
                  height: '4px',
                  background: rankInfo.gradient,
                  borderRadius: '2px',
                }}
              ></div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '16px',
          background: 'white',
          borderRadius: '8px',
          border: '2px solid #e5e7eb',
        }}
      >
        <h3
          style={{
            color: '#1f2937',
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          📋 Hướng dẫn sử dụng:
        </h3>
        <ul
          style={{
            color: '#4b5563',
            fontSize: '14px',
            lineHeight: '1.6',
            paddingLeft: '20px',
          }}
        >
          <li>Mỗi hạng có màu sắc và icon riêng biệt</li>
          <li>Font chữ sử dụng: Orbitron, Exo 2, Rajdhani</li>
          <li>Gradient và shadow tự động theo từng hạng</li>
          <li>Border và hiệu ứng hover được tùy chỉnh</li>
          <li>Hỗ trợ cả light mode và dark mode</li>
        </ul>
      </div>
    </div>
  );
};

export default RankColorReference;
