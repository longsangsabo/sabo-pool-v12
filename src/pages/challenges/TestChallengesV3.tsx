import React from 'react';

const TestChallengesV3: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🏆 ENHANCED CHALLENGES V3 🎯
          </h1>
          <p className="text-lg text-muted-foreground">
            PHASE 1 Implementation - New Tab Structure
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Community Tab Preview */}
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🌍 Thách đấu Cộng đồng
              </h2>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span>🎯 Kèo (Open Challenges)</span>
                  <span className="text-green-500 font-bold">NEW</span>
                </div>
                <div className="flex justify-between">
                  <span>🔥 Live (Live Matches)</span>
                  <span className="text-red-500 font-bold">LIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>⏰ Sắp tới (Upcoming)</span>
                  <span className="text-blue-500 font-bold">SOON</span>
                </div>
                <div className="flex justify-between">
                  <span>🏆 Xong (Completed)</span>
                  <span className="text-gray-500">DONE</span>
                </div>
              </div>
            </div>

            {/* My Tab Preview */}
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                👑 Thách đấu của tôi
              </h2>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span>⏳ Đợi đối thủ</span>
                  <span className="text-yellow-500 font-bold">WAIT</span>
                </div>
                <div className="flex justify-between">
                  <span>⏰ Sắp tới</span>
                  <span className="text-blue-500 font-bold">MY</span>
                </div>
                <div className="flex justify-between">
                  <span>✅ Hoàn thành</span>
                  <span className="text-green-500 font-bold">WIN</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              ✅ PHASE 1 Implementation Status
            </h3>
            <div className="text-left space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Enhanced Challenges Hook V3 - Centralized filtering</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Community Tab Component - 4 sections</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>My Tab Component - 3 sections</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Enhanced Challenges Page V3 - Main container</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Route setup - /challenges-v3</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-x-4">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              🚀 Test Live Demo (Coming Soon)
            </button>
            <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
              📊 View Components
            </button>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>
              <strong>Next Steps:</strong> Integrate with real data, add error handling, 
              optimize performance, and implement remaining phases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestChallengesV3;
