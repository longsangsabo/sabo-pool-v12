/**
 * SABO Handicap Management Component
 * Provides interface for applying handicap system to matched challenges
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Zap, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Info,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  formatHandicapForDisplay,
  calculateSaboHandicapPrecise,
  SABO_HANDICAP_CONFIGURATIONS
} from '@/utils/saboHandicapCalculator';
import { SaboRank } from '@/utils/saboHandicap';

interface ChallengeHandicapData {
  id: string;
  challenger_name: string;
  opponent_name: string;
  challenger_rank: SaboRank;
  opponent_rank: SaboRank;
  bet_points: number;
  current_handicap?: any;
  status: string;
}

interface HandicapManagementProps {
  challenges?: ChallengeHandicapData[];
  onApplyHandicap?: (challengeId: string, handicapData: any) => Promise<boolean>;
  onBulkApply?: () => Promise<void>;
  className?: string;
}

const HandicapManagement: React.FC<HandicapManagementProps> = ({
  challenges = [],
  onApplyHandicap,
  onBulkApply,
  className
}) => {
  const [selectedChallenges, setSelectedChallenges] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Calculate handicap for a challenge
  const calculateHandicapForChallenge = (challenge: ChallengeHandicapData) => {
    try {
      return calculateSaboHandicapPrecise(
        challenge.challenger_rank,
        challenge.opponent_rank,
        challenge.bet_points
      );
    } catch (error) {
      console.error('Error calculating handicap:', error);
      return null;
    }
  };

  // Apply handicap to single challenge
  const handleApplyHandicap = async (challenge: ChallengeHandicapData) => {
    if (!onApplyHandicap) return;

    const handicapResult = calculateHandicapForChallenge(challenge);
    if (!handicapResult) return;

    setProcessingIds(prev => new Set(prev).add(challenge.id));

    try {
      const handicapData = {
        handicap_challenger: handicapResult.handicapChallenger,
        handicap_opponent: handicapResult.handicapOpponent,
        challenger_rank: challenge.challenger_rank,
        opponent_rank: challenge.opponent_rank,
        bet_points: challenge.bet_points,
        explanation: handicapResult.explanation,
        is_valid: handicapResult.isValid,
      };

      await onApplyHandicap(challenge.id, handicapData);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(challenge.id);
        return newSet;
      });
    }
  };

  // Toggle challenge selection
  const toggleChallengeSelection = (challengeId: string) => {
    setSelectedChallenges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(challengeId)) {
        newSet.delete(challengeId);
      } else {
        newSet.add(challengeId);
      }
      return newSet;
    });
  };

  // Select all challenges
  const selectAllChallenges = () => {
    const eligibleChallenges = challenges.filter(c => !c.current_handicap);
    setSelectedChallenges(new Set(eligibleChallenges.map(c => c.id)));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedChallenges(new Set());
  };

  const eligibleChallenges = challenges.filter(c => !c.current_handicap);
  const completedChallenges = challenges.filter(c => c.current_handicap);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            Quản Lý Handicap SABO
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Áp dụng hệ thống handicap cho các trận đấu đã được ghép cặp
          </p>
        </div>
        
        {/* Bulk Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={selectAllChallenges}
            disabled={eligibleChallenges.length === 0}
          >
            Chọn tất cả ({eligibleChallenges.length})
          </Button>
          <Button
            variant="outline"
            onClick={clearSelection}
            disabled={selectedChallenges.size === 0}
          >
            Bỏ chọn
          </Button>
          <Button
            onClick={onBulkApply}
            disabled={!onBulkApply || isProcessing}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Áp dụng hàng loạt
          </Button>
        </div>
      </div>

      {/* Configuration Reference */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Cấu Hình Handicap SABO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {SABO_HANDICAP_CONFIGURATIONS.map((config) => (
              <div key={config.bet_points} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {config.bet_points} điểm
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                  <div>Race to {config.race_to}</div>
                  <div>1 hạng: +{config.handicap_1_rank}</div>
                  <div>0.5 hạng: +{config.handicap_05_rank}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cần áp dụng</p>
                <p className="text-2xl font-bold text-orange-600">{eligibleChallenges.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{completedChallenges.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đã chọn</p>
                <p className="text-2xl font-bold text-blue-600">{selectedChallenges.size}</p>
              </div>
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Trận đấu cần áp dụng handicap ({eligibleChallenges.length})
        </h3>
        
        {eligibleChallenges.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Tất cả trận đấu đã có handicap!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Không có trận đấu nào cần áp dụng hệ thống handicap.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {eligibleChallenges.map((challenge) => {
              const handicapResult = calculateHandicapForChallenge(challenge);
              const handicapDisplay = handicapResult ? 
                formatHandicapForDisplay({
                  handicap_challenger: handicapResult.handicapChallenger,
                  handicap_opponent: handicapResult.handicapOpponent,
                  explanation: handicapResult.explanation
                }) : null;
              
              const isProcessingThis = processingIds.has(challenge.id);
              const isSelected = selectedChallenges.has(challenge.id);

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'border rounded-lg p-4 cursor-pointer transition-all',
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  onClick={() => toggleChallengeSelection(challenge.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {challenge.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {challenge.bet_points} điểm
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm">
                          <span className="font-medium">{challenge.challenger_name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {challenge.challenger_rank}
                          </Badge>
                        </div>
                        
                        <div className="text-lg font-bold text-gray-600 dark:text-gray-300">vs</div>
                        
                        <div className="text-sm">
                          <span className="font-medium">{challenge.opponent_name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {challenge.opponent_rank}
                          </Badge>
                        </div>
                      </div>

                      {handicapDisplay && (
                        <div className={`
                          inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border
                          ${handicapDisplay.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300' : ''}
                          ${handicapDisplay.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300' : ''}
                          ${handicapDisplay.color === 'gray' ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300' : ''}
                        `}>
                          {handicapDisplay.icon} {handicapDisplay.displayText}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyHandicap(challenge);
                        }}
                        disabled={isProcessingThis || !onApplyHandicap}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                      >
                        {isProcessingThis ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Trận đấu đã có handicap ({completedChallenges.length})
          </h3>
          <div className="space-y-2">
            {completedChallenges.slice(0, 5).map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">
                    {challenge.challenger_name} vs {challenge.opponent_name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {challenge.bet_points} điểm
                  </Badge>
                </div>
                {challenge.current_handicap && (
                  <div className="text-sm text-green-700 dark:text-green-300">
                    {formatHandicapForDisplay(challenge.current_handicap).shortText}
                  </div>
                )}
              </div>
            ))}
            {completedChallenges.length > 5 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                ... và {completedChallenges.length - 5} trận khác
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HandicapManagement;
