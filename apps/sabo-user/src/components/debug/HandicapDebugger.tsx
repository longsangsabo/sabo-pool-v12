/**
 * Debug component to test handicap calculations
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Play } from 'lucide-react';
import { calculateSaboHandicapPrecise, formatHandicapForDisplay } from '@/utils/saboHandicapCalculator';
import { SaboRank } from '@/utils/saboHandicap';

const RANKS: SaboRank[] = ['K', 'K+', 'I', 'I+', 'H', 'H+', 'G', 'G+', 'F', 'F+', 'E', 'E+'];
const BET_AMOUNTS = [100, 200, 300, 400, 500, 600];

const HandicapDebugger: React.FC = () => {
  const [challengerRank, setChallengerRank] = useState<SaboRank>('K+');
  const [opponentRank, setOpponentRank] = useState<SaboRank>('I');
  const [betAmount, setBetAmount] = useState(100);
  const [result, setResult] = useState<any>(null);

  const calculateHandicap = () => {
    const result = calculateSaboHandicapPrecise(challengerRank, opponentRank, betAmount);
    setResult(result);
    console.log('🎯 Handicap Debug Result:', result);
  };

  const testCaseFromImage = () => {
    setChallengerRank('K+');
    setOpponentRank('I');
    setBetAmount(100);
    setTimeout(calculateHandicap, 100);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Handicap Calculator Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick test button for the image case */}
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
            🖼️ Test case từ ảnh: K+ (200 SPA) vs I (4000 SPA)
          </p>
          <Button onClick={testCaseFromImage} size="sm" variant="outline">
            <Play className="w-4 h-4 mr-2" />
            Test Case Từ Ảnh
          </Button>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Challenger Rank</label>
            <select 
              value={challengerRank} 
              onChange={(e) => setChallengerRank(e.target.value as SaboRank)}
              className="w-full p-2 border rounded-md"
            >
              {RANKS.map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Opponent Rank</label>
            <select 
              value={opponentRank} 
              onChange={(e) => setOpponentRank(e.target.value as SaboRank)}
              className="w-full p-2 border rounded-md"
            >
              {RANKS.map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Bet Amount</label>
            <select 
              value={betAmount} 
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              {BET_AMOUNTS.map(amount => (
                <option key={amount} value={amount}>{amount}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculate Button */}
        <Button onClick={calculateHandicap} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Tính Handicap
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Kết Quả:</h3>
              <Badge variant={result.isValid ? 'default' : 'destructive'}>
                {result.isValid ? 'Valid' : 'Invalid'}
              </Badge>
            </div>

            {result.isValid ? (
              <div className="space-y-3">
                {/* Visual Display */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="text-center">
                    <div className="font-semibold">{challengerRank}</div>
                    <div className="text-sm text-gray-600">Challenger</div>
                    {result.handicapChallenger > 0 && (
                      <Badge className="mt-1 bg-blue-100 text-blue-800">
                        +{result.handicapChallenger}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-2xl font-bold">vs</div>
                  
                  <div className="text-center">
                    <div className="font-semibold">{opponentRank}</div>
                    <div className="text-sm text-gray-600">Opponent</div>
                    {result.handicapOpponent > 0 && (
                      <Badge className="mt-1 bg-green-100 text-green-800">
                        +{result.handicapOpponent}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">Challenger Handicap</div>
                    <div className="text-xl font-bold text-blue-600">
                      {result.handicapChallenger}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">Opponent Handicap</div>
                    <div className="text-xl font-bold text-green-600">
                      {result.handicapOpponent}
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3 bg-gray-50 dark:bg-gray-900 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Explanation:</div>
                  <div className="font-medium">{result.explanation}</div>
                </div>

                {/* Format Display Test */}
                {(() => {
                  const displayInfo = formatHandicapForDisplay({
                    handicap_challenger: result.handicapChallenger,
                    handicap_opponent: result.handicapOpponent,
                    explanation: result.explanation
                  });

                  return (
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">UI Display Format:</div>
                      <div className={`
                        inline-flex items-center gap-2 px-3 py-2 rounded-full border font-medium
                        ${displayInfo.color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                        ${displayInfo.color === 'green' ? 'bg-green-50 border-green-200 text-green-700' : ''}
                        ${displayInfo.color === 'gray' ? 'bg-gray-50 border-gray-200 text-gray-700' : ''}
                      `}>
                        {displayInfo.icon} {displayInfo.displayText}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-800 font-medium">{result.errorMessage}</div>
              </div>
            )}
          </div>
        )}

        {/* Quick Test Cases */}
        <div className="space-y-2">
          <h4 className="font-medium">Quick Test Cases:</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { c: 'K', o: 'K+', desc: 'Sub-rank same main' },
              { c: 'K', o: 'I', desc: '1 main rank' },
              { c: 'K+', o: 'I', desc: '1 sub across main' },
              { c: 'K', o: 'I+', desc: '1 main + 1 sub' },
            ].map((test, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                onClick={() => {
                  setChallengerRank(test.c as SaboRank);
                  setOpponentRank(test.o as SaboRank);
                  setTimeout(calculateHandicap, 100);
                }}
              >
                {test.c} vs {test.o}
                <br />
                <span className="text-xs opacity-60">{test.desc}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HandicapDebugger;
