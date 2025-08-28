
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StandardCard } from '@/config/StandardComponents';
import { StandardPageWrapper } from '@/config/PageLayoutConfig';

const ThemeDemoPage = () => {
  const { theme } = useTheme();

  return (
    <StandardPageWrapper variant="content">
      <div className="space-y-8">
        {/* Theme Demo Header */}
        <StandardCard 
          title="🎨 Light/Dark Mode Demo" 
          description={`Current theme: ${theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}`}
          variant="feature"
          headerActions={
            <div className="flex gap-2">
              <ThemeToggle variant="button" />
              <ThemeToggle variant="compact" />
              <ThemeToggle variant="icon" />
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Color Palette Demo */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Colors</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-primary text-primary-foreground p-2 rounded text-xs text-center">Primary</div>
                <div className="bg-secondary text-secondary-foreground p-2 rounded text-xs text-center">Secondary</div>
                <div className="bg-green-500 text-white p-2 rounded text-xs text-center">Success</div>
                <div className="bg-red-500 text-white p-2 rounded text-xs text-center">Error</div>
                <div className="bg-yellow-500 text-white p-2 rounded text-xs text-center">Warning</div>
                <div className="bg-blue-500 text-white p-2 rounded text-xs text-center">Info</div>
              </div>
            </div>

            {/* Typography Demo */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Typography</h3>
              <div className="space-y-1">
                <p className="text-xl font-bold">Heading XL</p>
                <p className="text-lg font-semibold">Heading LG</p>
                <p className="text-base font-medium">Heading Base</p>
                <p className="text-sm">Body Small</p>
                <p className="text-xs text-muted-foreground">Caption</p>
              </div>
            </div>

            {/* Shadow Demo */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Shadows</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-card p-2 rounded shadow-sm text-xs text-center">Small</div>
                <div className="bg-card p-2 rounded shadow text-xs text-center">Base</div>
                <div className="bg-card p-2 rounded shadow-md text-xs text-center">Medium</div>
                <div className="bg-card p-2 rounded shadow-lg text-xs text-center">Large</div>
              </div>
            </div>
          </div>
        </StandardCard>

        {/* Cards Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StandardCard 
            title="Default Card" 
            description="This is a default card design"
            variant="default"
          >
            <p className="text-sm text-muted-foreground">
              Card content goes here. This demonstrates how cards look in both light and dark modes.
            </p>
          </StandardCard>

          <StandardCard 
            title="Feature Card" 
            description="This is a feature card with enhanced styling"
            variant="feature"
          >
            <p className="text-sm text-muted-foreground">
              Feature cards have more prominent styling and are perfect for highlighting important content.
            </p>
          </StandardCard>

          <StandardCard 
            title="Tournament Card" 
            description="Special styling for tournament content"
            variant="tournament"
          >
            <p className="text-sm text-muted-foreground">
              Tournament cards are optimized for gaming content with hover effects.
            </p>
          </StandardCard>

          <StandardCard 
            title="Challenge Card" 
            description="Challenge cards with accent border"
            variant="challenge"
          >
            <p className="text-sm text-muted-foreground">
              Challenge cards feature a colored left border to draw attention.
            </p>
          </StandardCard>

          <StandardCard 
            title="Compact Card" 
            description="Space-efficient design"
            variant="compact"
          >
            <p className="text-sm text-muted-foreground">
              Compact cards save space while maintaining readability.
            </p>
          </StandardCard>

          <StandardCard 
            title="Card with Footer" 
            description="Demonstrates footer functionality"
            variant="default"
            footer={
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Updated 2 hours ago</span>
                <button className="text-xs text-primary hover:underline">View details</button>
              </div>
            }
          >
            <p className="text-sm text-muted-foreground">
              This card includes a footer section for additional actions or metadata.
            </p>
          </StandardCard>
        </div>

        {/* Interactive Elements Demo */}
        <StandardCard title="🎮 Interactive Elements" variant="feature">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Buttons</h4>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Primary
                </button>
                <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
                  Secondary
                </button>
                <button className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
                  Outline
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Form Elements</h4>
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Enter text here..." 
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Select option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>
          </div>
        </StandardCard>

        {/* Code and Data Demo */}
        <StandardCard title="💻 Code & Data" variant="compact">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Code Block</h4>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                <code>{`const theme = useTheme();
const { toggleTheme } = theme;

// Toggle between light and dark
toggleTheme();`}</code>
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Data Table</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">Player</th>
                      <th className="text-left py-2">ELO</th>
                      <th className="text-left py-2">Wins</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-2">Player 1</td>
                      <td className="py-2">1,250</td>
                      <td className="py-2">45</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2">Player 2</td>
                      <td className="py-2">1,180</td>
                      <td className="py-2">38</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-xs">
                          Away
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </StandardCard>
      </div>
    </StandardPageWrapper>
  );
};

export default ThemeDemoPage;
