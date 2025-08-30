
import CardAvatar from '../components/ui/card-avatar';
import DarkCardAvatar from '../components/ui/dark-card-avatar';

const SABOStyleTestPage = () => {
  return (
    <div
      style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontFamily: "'Oswald', 'Bebas Neue', sans-serif",
          fontSize: '36px',
          fontWeight: 700,
          fontStretch: 'condensed',
          background:
            'linear-gradient(to right, #1d4ed8, #7c3aed, #1e40af, #ffffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.1em',
          lineHeight: 0.9,
          filter: 'brightness(1.1)',
          fontVariant: 'small-caps',
        }}
      >
        CONDENSED TACTICAL FONT TEST
      </h1>{' '}
      {/* Light Mode Test */}
      <div style={{ marginBottom: '40px' }}>
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#1f2937',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
          }}
        >
          Light Mode - SABO Style Username
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <CardAvatar
            nickname='SABO_PLAYER'
            rank='G+'
            elo={1485}
            spa={320}
            ranking={89}
            matches={37}
            userAvatar='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
          />
          <CardAvatar
            nickname='ARENA_HERO'
            rank='F'
            elo={1200}
            spa={250}
            ranking={156}
            matches={24}
            userAvatar='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
          />
        </div>
      </div>
      {/* Dark Mode Test */}
      <div
        style={{
          background: '#1a1a1a',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '40px',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#f1f1f1',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
          }}
        >
          Dark Mode - SABO Style Username
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <DarkCardAvatar
            nickname='SABO_MASTER'
            rank='H+'
            elo={1650}
            spa={380}
            ranking={45}
            matches={62}
            userAvatar='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
          />
          <DarkCardAvatar
            nickname='ARENA_PRO'
            rank='I'
            elo={1800}
            spa={420}
            ranking={12}
            matches={89}
            userAvatar='https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face'
          />
        </div>
      </div>
      {/* Comparison with original SABO header style */}
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #e5e7eb',
        }}
      >
        <h3
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#1f2937',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
          }}
        >
          Style Comparison
        </h3>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          {/* Original SABO header style */}
          <div style={{ textAlign: 'center' }}>
            <h4
              style={{
                marginBottom: '10px',
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: 500,
              }}
            >
              Header SABO Style
            </h4>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 900,
                fontSize: '18px',
                background:
                  'linear-gradient(to right, #2563eb, #9333ea, #1e40af)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.025em',
                lineHeight: 1,
              }}
            >
              SABO
            </div>
          </div>

          {/* Username style */}
          <div style={{ textAlign: 'center' }}>
            <h4
              style={{
                marginBottom: '10px',
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: 500,
              }}
            >
              Username Style
            </h4>
            <div
              style={{
                fontFamily: "'Oswald', 'Bebas Neue', 'Antonio', sans-serif",
                fontWeight: 700,
                fontSize: '14px', // Larger to show
                fontStretch: 'condensed',
                lineHeight: 0.9,
                background:
                  'linear-gradient(to right, #1d4ed8, #7c3aed, #1e40af, #ffffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontVariant: 'small-caps',
                filter: 'brightness(1.1)',
              }}
            >
              TACTICAL_OPERATOR
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#4b5563',
            lineHeight: '1.6',
          }}
        >
          <strong>🎯 Tactical Condensed Font Style:</strong>
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>
              <strong>Fonts:</strong> Oswald, Bebas Neue, Antonio, Fjalla One,
              Roboto Condensed
            </li>
            <li>
              <strong>Style:</strong> Condensed, tall, tactical look
            </li>
            <li>
              <strong>Line-height:</strong> 0.9 (compact và cao)
            </li>
            <li>
              <strong>Letter-spacing:</strong> 0.05em (spacing nhỏ)
            </li>
            <li>
              <strong>Font-variant:</strong> Small-caps cho cứng cáp
            </li>
            <li>
              <strong>Font-stretch:</strong> Condensed cho nén thon
            </li>
            <li>
              <strong>Weight:</strong> 900 (extra bold)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SABOStyleTestPage;
