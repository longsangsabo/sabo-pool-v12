import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  Eye, 
  Users, 
  MessageCircle, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings,
  Heart,
  Share,
  Trophy,
  Clock,
  Target
} from 'lucide-react';

interface SpectatorModeProps {
  matchId: string;
  tournament: {
    id: string;
    name: string;
    round: string;
  };
  players: {
    player1: {
      id: string;
      name: string;
      avatar?: string;
      score: number;
    };
    player2: {
      id: string;
      name: string;
      avatar?: string;
      score: number;
    };
  };
  spectatorCount: number;
  chatMessages: Array<{
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: Date;
    type?: 'message' | 'cheer' | 'prediction';
  }>;
  isFullscreen?: boolean;
  audioEnabled?: boolean;
  onToggleFullscreen?: () => void;
  onToggleAudio?: () => void;
  onSendMessage?: (message: string) => void;
  onCheer?: (playerId: string) => void;
  onShare?: () => void;
  className?: string;
}

export const SpectatorMode: React.FC<SpectatorModeProps> = ({
  matchId,
  tournament,
  players,
  spectatorCount,
  chatMessages,
  isFullscreen = false,
  audioEnabled = true,
  onToggleFullscreen,
  onToggleAudio,
  onSendMessage,
  onCheer,
  onShare,
  className
}) => {
  const [chatInput, setChatInput] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isTyping) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
    return () => clearTimeout(timeout);
  }, [isTyping, showControls]);

  const handleSendMessage = () => {
    if (chatInput.trim() && onSendMessage) {
      onSendMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={clsx(
      'relative bg-black text-white overflow-hidden',
      isFullscreen ? 'fixed inset-0 z-50' : 'rounded-lg',
      className
    )}>
      {/* Main Match Display */}
      <div className="relative h-full min-h-96">
        {/* Match Background - This would be the actual match view */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold">
              {tournament.name} - {tournament.round}
            </div>
            <div className="text-6xl font-bold">
              {players.player1.score} : {players.player2.score}
            </div>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold">
                  {players.player1.name[0]}
                </div>
                <div>{players.player1.name}</div>
              </div>
              <div className="text-white/60">VS</div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold">
                  {players.player2.name[0]}
                </div>
                <div>{players.player2.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className={clsx(
          'absolute top-0 left-0 right-0 bg-black bg-opacity-50 p-4 transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
        onMouseEnter={() => setShowControls(true)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {spectatorCount.toLocaleString()} watching
                </span>
              </div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-400 font-medium">LIVE</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onShare}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <Share className="w-5 h-5" />
              </button>
              <button
                onClick={onToggleAudio}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={onToggleFullscreen}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Cheer Buttons */}
        <div className={clsx(
          'absolute left-4 top-1/2 transform -translate-y-1/2 space-y-3 transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0'
        )}>
          <button
            onClick={() => onCheer?.(players.player1.id)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 bg-opacity-80 rounded-full hover:bg-opacity-100 transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm">Cheer {players.player1.name}</span>
          </button>
          <button
            onClick={() => onCheer?.(players.player2.id)}
            className="flex items-center space-x-2 px-3 py-2 bg-red-600 bg-opacity-80 rounded-full hover:bg-opacity-100 transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm">Cheer {players.player2.name}</span>
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {!isFullscreen && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Live Chat</span>
              <span className="text-sm text-gray-400">({chatMessages.length})</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((message) => (
              <div key={message.id} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-400">
                    {message.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className={clsx(
                  'text-sm',
                  message.type === 'cheer' && 'text-red-400',
                  message.type === 'prediction' && 'text-yellow-400',
                  !message.type && 'text-gray-300'
                )}>
                  {message.message}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Chat Overlay */}
      {isFullscreen && (
        <div className={clsx(
          'absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="max-w-md">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:border-opacity-60"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="px-4 py-2 bg-blue-600 bg-opacity-80 text-white rounded-lg hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to detect mouse movement */}
      <div 
        className="absolute inset-0 z-10 cursor-default"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => !isTyping && setShowControls(false)}
      />
    </div>
  );
};
