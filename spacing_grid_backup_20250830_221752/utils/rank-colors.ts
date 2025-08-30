import {
  Crown,
  Shield,
  Star,
  Award,
  Gem,
  Sword,
  Target,
  Trophy,
  Medal,
  Zap,
  Flame,
  Diamond,
} from 'lucide-react';

// Bảng màu hạng theo Sabo Billiards
export const rankColors = {
  // Hạng K (Đen)
  K: {
    color: '#878787',
    name: 'Hạng K',
    icon: Crown,
    gradient: 'linear-gradient(135deg, #878787 0%, #5a5a5a 50%, #878787 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(135, 135, 135, 0.3)',
  },
  'K+': {
    color: '#72788F',
    name: 'Hạng K+',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #72788F 0%, #4a5061 50%, #72788F 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(114, 120, 143, 0.3)',
  },

  // Hạng J (Tím)
  J: {
    color: '#595988',
    name: 'Hạng J',
    icon: Star,
    gradient: 'linear-gradient(135deg, #595988 0%, #3c3c5e 50%, #595988 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(89, 89, 136, 0.3)',
  },
  'J+': {
    color: '#4641AA',
    name: 'Hạng J+',
    icon: Award,
    gradient: 'linear-gradient(135deg, #4641AA 0%, #2e2a6b 50%, #4641AA 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(70, 65, 170, 0.3)',
  },

  // Hạng I (Xanh dương)
  I: {
    color: '#3A6FD8',
    name: 'Hạng I',
    icon: Gem,
    gradient: 'linear-gradient(135deg, #3A6FD8 0%, #2451a3 50%, #3A6FD8 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(58, 111, 216, 0.3)',
  },
  'I+': {
    color: '#2A59C5',
    name: 'Hạng I+',
    icon: Sword,
    gradient: 'linear-gradient(135deg, #2A59C5 0%, #1e4193 50%, #2A59C5 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(42, 89, 197, 0.3)',
  },

  // Hạng H (Xanh lá)
  H: {
    color: '#20C997',
    name: 'Hạng H',
    icon: Target,
    gradient: 'linear-gradient(135deg, #20C997 0%, #17a085 50%, #20C997 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(32, 201, 151, 0.3)',
  },
  'H+': {
    color: '#17A77F',
    name: 'Hạng H+',
    icon: Trophy,
    gradient: 'linear-gradient(135deg, #17A77F 0%, #128a67 50%, #17A77F 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(23, 167, 127, 0.3)',
  },

  // Hạng G (Xanh lá đậm)
  G: {
    color: '#28A745',
    name: 'Hạng G',
    icon: Medal,
    gradient: 'linear-gradient(135deg, #28A745 0%, #1e7e34 50%, #28A745 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(40, 167, 69, 0.3)',
  },
  'G+': {
    color: '#1E8535',
    name: 'Hạng G+',
    icon: Zap,
    gradient: 'linear-gradient(135deg, #1E8535 0%, #155724 50%, #1E8535 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(30, 133, 53, 0.3)',
  },

  // Hạng F (Vàng)
  F: {
    color: '#FFC107',
    name: 'Hạng F',
    icon: Flame,
    gradient: 'linear-gradient(135deg, #FFC107 0%, #e0a800 50%, #FFC107 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  'F+': {
    color: '#FDA800',
    name: 'Hạng F+',
    icon: Diamond,
    gradient: 'linear-gradient(135deg, #FDA800 0%, #dc8f00 50%, #FDA800 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(253, 168, 0, 0.3)',
  },

  // Hạng E (Cam)
  E: {
    color: '#FD7E14',
    name: 'Hạng E',
    icon: Crown,
    gradient: 'linear-gradient(135deg, #FD7E14 0%, #e8680f 50%, #FD7E14 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(253, 126, 20, 0.3)',
  },
  'E+': {
    color: '#DC6502',
    name: 'Hạng E+',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #DC6502 0%, #bd5502 50%, #DC6502 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(220, 101, 2, 0.3)',
  },
};

// Function to get rank info
export const getRankInfo = (rank: string) => {
  const normalizedRank = rank.toUpperCase();
  return (
    rankColors[normalizedRank as keyof typeof rankColors] || rankColors['G']
  );
};

// Function to get rank display with icon
export const getRankDisplay = (rank: string) => {
  const rankInfo = getRankInfo(rank);
  return {
    ...rankInfo,
    displayText: rank.toUpperCase(),
  };
};
