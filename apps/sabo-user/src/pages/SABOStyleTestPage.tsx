
import React from 'react';
import CardAvatar from '../components/ui/card-avatar';
import DarkCardAvatar from '../components/ui/dark-card-avatar';
import { 
  PageLayout,
  Section, 
  FlexGrid,
  BrandedHeading,
  InfoCard,
  ComparisonDisplay
} from '@sabo/shared-ui';

const SABOStyleTestPage = () => {
  return (
    <PageLayout variant="gradient" padding="md">
      <BrandedHeading variant="tactical" size="xl">
        CONDENSED TACTICAL FONT TEST
      </BrandedHeading>

      {/* Light Mode Test */}
      <Section variant="light" spacing="md">
        <BrandedHeading variant="section" size="md">
          Light Mode - SABO Style Username
        </BrandedHeading>
        <FlexGrid gap="md" justify="center">
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
        </FlexGrid>
      </Section>

      {/* Dark Mode Test */}
      <Section variant="dark" spacing="lg">
        <BrandedHeading variant="section" size="md" className="text-gray-100">
          Dark Mode - SABO Style Username
        </BrandedHeading>
        <FlexGrid gap="md" justify="center">
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
        </FlexGrid>
      </Section>

      {/* Comparison with original SABO header style */}
      <Section variant="card" spacing="md">
        <ComparisonDisplay
          title="Style Comparison"
          items={[
            {
              label: "Header SABO Style",
              content: (
                <BrandedHeading variant="sabo" size="md">
                  SABO
                </BrandedHeading>
              )
            },
            {
              label: "Username Style", 
              content: (
                <BrandedHeading variant="username" size="sm">
                  TACTICAL_OPERATOR
                </BrandedHeading>
              )
            }
          ]}
        >
          <InfoCard 
            title="🎯 Tactical Condensed Font Style:" 
            variant="neutral"
            className="mt-5"
          >
            <ul className="ml-5 mt-2 space-y-1">
              <li>
                <strong>Fonts:</strong> Oswald, Bebas Neue, Antonio, Fjalla One, Roboto Condensed
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
          </InfoCard>
        </ComparisonDisplay>
      </Section>
    </PageLayout>
  );
};

export default SABOStyleTestPage;
