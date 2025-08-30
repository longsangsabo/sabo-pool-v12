# 🎯 HỆ THỐNG HANDICAP SABO - TÀI LIỆU THAM CHIẾU

## 📋 Tổng Quan

Hệ thống Handicap SABO được thiết kế để tạo ra trận đấu công bằng giữa các người chơi có trình độ khác nhau. Handicap được tính toán dựa trên:
- **Chênh lệch hạng** (Rank Difference)
- **Mức cược** (Bet Points/Stakes)
- **Độ dài trận đấu** (Race To)

## 🏆 BẢ MAPPING HẠNG - ELO

| Hạng | ELO Points | Skill Description |
|------|------------|-------------------|
| **K** | 1000 | 2-4 bi khi hình dễ; mới tập |
| **K+** | 1100 | Sát ngưỡng lên I |
| **I** | 1200 | 3-5 bi; chưa điều được chấm |
| **I+** | 1300 | Sát ngưỡng lên H |
| **H** | 1400 | 5-8 bi; có thể "rùa" 1 chấm hình dễ |
| **H+** | 1500 | Chuẩn bị lên G |
| **G** | 1600 | Clear 1 chấm + 3-7 bi kế; bắt đầu điều bi 3 băng |
| **G+** | 1700 | Trình phong trào "ngon"; sát ngưỡng lên F |
| **F** | 1800 | 60-80% clear 1 chấm, đôi khi phá 2 chấm |
| **F+** | 1900 | Safety & spin control khá chắc; sát ngưỡng lên E |
| **E** | 2000 | 90-100% clear 1 chấm, 70% phá 2 chấm |
| **E+** | 2100 | Điều bi phức tạp, safety chủ động; sát ngưỡng lên D |

## ⚖️ CẤU HÌNH HANDICAP THEO MỨC CƯỢC

### 📊 Bảng Configuration Chính

| Bet Points | Race To | handicap_1_rank | handicap_05_rank | Mô tả |
|------------|---------|-----------------|------------------|--------|
| **100** | 8 | 1.0 | 0.5 | Thách đấu sơ cấp |
| **200** | 12 | 1.5 | 1.0 | Thách đấu cơ bản |
| **300** | 14 | 2.0 | 1.5 | Thách đấu trung bình |
| **400** | 16 | 2.5 | 1.5 | Thách đấu trung cấp |
| **500** | 18 | 3.0 | 2.0 | Thách đấu trung cao |
| **600** | 22 | 3.5 | 2.5 | Thách đấu cao cấp |

### 🎯 Ý Nghĩa Từng Thành Phần

#### **A. Bet Points (Điểm Cược)**
- **Mức độ nghiêm trọng** của trận đấu
- **Cao hơn = Quan trọng hơn = Handicap lớn hơn**
- Range: 100-600 điểm (6 levels)

#### **B. Race To (Đua Đến)**
- **Số ván cần thắng** để thắng trận
- **Bet cao → Race to cao** = Trận đấu dài hơn
- Range: 8-22 ván

#### **C. handicap_1_rank (Handicap 1 Hạng Chênh Lệch)**
- **Áp dụng khi chênh lệch 1 hạng chính**
- Ví dụ: I vs H, H vs G, G vs F
- **Người yếu hơn** được cộng điểm này ban đầu

#### **D. handicap_05_rank (Handicap Sub-Rank)**
- **Áp dụng khi chênh lệch sub-rank**
- Ví dụ: I vs I+, H vs H+, G vs G+
- **Handicap nhỏ hơn** vì chênh lệch ít hơn

## 🎮 CÁC SCENARIO THỰC TẾ

### **Scenario 1: Chênh lệch 1 hạng chính**
```
🔥 Player H (1400 ELO) vs Player G (1600 ELO)
📊 Bet: 300 điểm → Race to 14
⚖️ Handicap: Player H được +2 ván ban đầu
🎯 Tỷ số bắt đầu: H=2, G=0
🏁 Để thắng: H cần 12 ván nữa (2+12=14), G cần 14 ván (0+14=14)
```

### **Scenario 2: Chênh lệch sub-rank**
```
🔥 Player F (1800 ELO) vs Player F+ (1900 ELO)
📊 Bet: 200 điểm → Race to 12
⚖️ Handicap: Player F được +1 ván ban đầu
🎯 Tỷ số bắt đầu: F=1, F+=0
🏁 Để thắng: F cần 11 ván nữa (1+11=12), F+ cần 12 ván (0+12=12)
```

### **Scenario 3: Cùng hạng**
```
🔥 Player G (1600 ELO) vs Player G (1600 ELO)
📊 Bet: 400 điểm → Race to 16
⚖️ Handicap: Không có (0-0)
🎯 Tỷ số bắt đầu: G1=0, G2=0
🏁 Để thắng: Cả hai cần 16 ván
```

### **Scenario 4: Bet cao - Handicap lớn**
```
🔥 Player I (1200 ELO) vs Player H (1400 ELO)
📊 Bet: 600 điểm → Race to 22
⚖️ Handicap: Player I được +3.5 ván ban đầu
🎯 Tỷ số bắt đầu: I=3.5, H=0
🏁 Để thắng: I cần 18.5 ván nữa (3.5+18.5=22), H cần 22 ván
```

## 🔢 LOGIC SCALING (Tăng Dần)

### **A. Progression Patterns**

#### **Bet Points:**
```
100 → 200 → 300 → 400 → 500 → 600
(+100 each level, 6 levels total)
```

#### **Race To:**
```
8 → 12 → 14 → 16 → 18 → 22
(Tăng dần độ dài trận)
```

#### **Handicap 1-Rank:**
```
1.0 → 1.5 → 2.0 → 2.5 → 3.0 → 3.5
(+0.5 each level, linear progression)
```

#### **Handicap Sub-Rank:**
```
0.5 → 1.0 → 1.5 → 1.5 → 2.0 → 2.5
(Tăng chậm hơn, có plateau ở level 3-4)
```

### **B. Mathematical Formulas**

#### **For 1-Rank Handicap:**
```
handicap_1_rank = 0.5 + (bet_level * 0.5)
Where bet_level = (bet_points / 100) - 1
```

#### **For Sub-Rank Handicap:**
```
handicap_05_rank = handicap_1_rank / 2 (with adjustments)
```

## 🎯 THIẾT KẾ PRINCIPLES

### **1. Fairness (Công Bằng)**
- **Người yếu hơn** được lợi thế ban đầu
- **Chênh lệch càng lớn** → handicap càng nhiều
- **Cân bằng cơ hội thắng** cho cả hai bên

### **2. Stakes Matter (Mức Cược Quan Trọng)**
- **Bet cao** → handicap cao → trận đấu cân bằng hơn
- **Bet thấp** → handicap thấp → có thể "chấp nhận" bất công nhẹ
- **Risk vs Reward** tương ứng

### **3. Game Length Balance**
- **Trận ngắn** (Race to 8) → handicap nhỏ → ít ảnh hưởng
- **Trận dài** (Race to 22) → handicap lớn → ảnh hưởng đáng kể
- **Sample size** đủ lớn để skill thể hiện

### **4. Rank Restrictions**
- **Chỉ cho phép thách đấu ±2 hạng chính**
- **Tối đa 4 sub-ranks difference**
- **Ngăn chặn mismatching** quá lớn

## 🔧 IMPLEMENTATION DETAILS

### **A. Frontend Components**

#### **ImprovedCreateChallengeModal.tsx:**
```typescript
const BET_CONFIGURATIONS = [
  { points: 100, raceTO: 8, description: 'Thách đấu sơ cấp - Race to 8' },
  { points: 200, raceTO: 12, description: 'Thách đấu cơ bản - Race to 12' },
  { points: 300, raceTO: 14, description: 'Thách đấu trung bình - Race to 14' },
  { points: 400, raceTO: 16, description: 'Thách đấu trung cấp - Race to 16' },
  { points: 500, raceTO: 18, description: 'Thách đấu trung cao - Race to 18' },
  { points: 600, raceTO: 22, description: 'Thách đấu cao cấp - Race to 22' },
];

// Calculate handicap preview
const calculateHandicap = () => {
  if (!formData.is_sabo || !currentUserProfile || !selectedOpponent) {
    return null;
  }
  
  const challengerRank = currentUserProfile.current_rank as SaboRank;
  const opponentRank = selectedOpponent.current_rank as SaboRank;
  
  return calculateSaboHandicap(
    challengerRank || 'K',
    opponentRank || 'K',
    formData.race_to
  );
};
```

### **B. Core Logic**

#### **src/utils/saboHandicap.ts:**
```typescript
export function calculateSaboHandicap(
  challengerRank: SaboRank,
  opponentRank: SaboRank,
  stakeAmount: number
): HandicapResult {
  const challengerValue = RANK_VALUES[challengerRank];
  const opponentValue = RANK_VALUES[opponentRank];
  const rankDiff = opponentValue - challengerValue;
  
  let handicapChallenger = 0;
  let handicapOpponent = 0;
  
  // Check max difference (±4 sub-ranks = ±2 main ranks)
  if (Math.abs(rankDiff) > 4) {
    return { isValid: false, errorMessage: 'Chênh lệch hạng quá lớn' };
  }
  
  // Calculate handicap based on rank difference and stake
  if (rankDiff > 0) {
    // Opponent is higher rank, give challenger handicap
    handicapChallenger = Math.max(0, Math.min(
      Math.abs(rankDiff),
      Math.floor(stakeAmount / (200 - rankDiff * 25))
    ));
  } else if (rankDiff < 0) {
    // Challenger is higher rank, give opponent handicap
    handicapOpponent = Math.max(0, Math.min(
      Math.abs(rankDiff),
      Math.floor(stakeAmount / (200 - Math.abs(rankDiff) * 25))
    ));
  }
  
  return {
    isValid: true,
    rankDifference: rankDiff,
    handicapChallenger,
    handicapOpponent,
    challengerRank,
    opponentRank,
    stakeAmount,
    explanation: generateExplanation(...)
  };
}
```

### **C. Database Schema**

#### **Challenges Table:**
```sql
CREATE TABLE challenges (
  -- ... other fields
  handicap_1_rank NUMERIC(3,1) DEFAULT 0,    -- Main rank handicap
  handicap_05_rank NUMERIC(3,1) DEFAULT 0,   -- Sub-rank handicap
  handicap_challenger INTEGER DEFAULT 0,      -- Final challenger handicap
  handicap_opponent INTEGER DEFAULT 0,        -- Final opponent handicap
  is_sabo BOOLEAN DEFAULT TRUE,               -- SABO mode always enabled
  -- ... other fields
);
```

#### **Auto-calculation Function:**
```sql
CREATE OR REPLACE FUNCTION calculate_sabo_handicap(
  challenger_rank TEXT,
  opponent_rank TEXT,
  stake INTEGER
) RETURNS TABLE(challenger_handicap DECIMAL, opponent_handicap DECIMAL);
```

## 📊 TESTING & VALIDATION

### **A. Unit Tests**

#### **rankMapping.test.ts:**
```typescript
describe('getRankByElo', () => {
  const cases: Array<[number, string]> = [
    [1000, 'K'],   [1100, 'K+'],  [1200, 'I'],
    [1300, 'I+'],  [1400, 'H'],   [1500, 'H+'],
    [1600, 'G'],   [1700, 'G+'],  [1800, 'F'],
    [1900, 'F+'],  [2000, 'E'],   [2100, 'E+'],
  ];
  
  it.each(cases)('elo %d maps to rank %s', (elo, expected) => {
    expect(getRankByElo(elo)).toBe(expected);
  });
});
```

### **B. Integration Tests**

#### **Challenge Creation Flow:**
1. User selects opponent with different rank
2. System calculates handicap automatically
3. Handicap applied to initial scores
4. Match proceeds with balanced starting point

### **C. Edge Cases**

#### **Invalid Scenarios:**
- **Rank difference > 4 sub-ranks**: Rejected
- **Missing rank information**: Default to K rank
- **Invalid bet amounts**: Use closest valid configuration

## 🎮 GAMEPLAY IMPACT

### **A. Player Experience**

#### **For Stronger Players:**
- **Motivation to accept challenges** from weaker players
- **Fair competition** despite skill difference
- **Opportunity to mentor** while still being challenged

#### **For Weaker Players:**
- **Confidence to challenge** stronger players
- **Learning opportunity** with fair starting advantage
- **Skill development** through balanced matches

### **B. Competitive Balance**

#### **Tournament Integration:**
- **Seeding adjustments** based on handicap performance
- **Bracket balancing** considering handicap history
- **ELO calculations** adjusted for handicap results

#### **Community Growth:**
- **More active participation** across all skill levels
- **Cross-rank interactions** and mentorship
- **Reduced skill-based segregation**

## 🔍 MONITORING & ANALYTICS

### **A. Key Metrics**

#### **Handicap Effectiveness:**
- **Win rate distribution** across handicap ranges
- **Average score margins** in handicapped matches
- **Player satisfaction** with handicap balance

#### **System Health:**
- **Challenge acceptance rates** by rank difference
- **Handicap calculation accuracy**
- **Edge case frequency** and handling

### **B. Adjustment Mechanisms**

#### **Data-Driven Tuning:**
- **Regular analysis** of win/loss patterns
- **Handicap value adjustments** based on outcomes
- **Bet configuration optimization**

## 📚 RELATED DOCUMENTATION

### **A. System Architecture:**
- `ELO_RESET_GUIDE.md` - ELO và Rank mapping
- `SABO_POOL_ARENA_RANKING_SYSTEM_COMPLETE_UPDATE.md` - Ranking system
- `DATABASE_SCHEMA.md` - Database structure

### **B. Implementation Files:**
- `src/utils/saboHandicap.ts` - Core handicap logic
- `src/types/challenge.ts` - Type definitions
- `src/components/modals/ImprovedCreateChallengeModal.tsx` - UI implementation

### **C. Testing & Validation:**
- `src/__tests__/rankMapping.test.ts` - Unit tests
- `debug-challenges-table.sql` - Schema validation
- `sabo-system-test.sql` - Integration tests

---

## 🎯 TÓM TẮT

Hệ thống Handicap SABO là một **cơ chế cân bằng trận đấu tinh vi**, được thiết kế để:

1. **Tạo ra competitive balance** giữa players có skill khác nhau
2. **Khuyến khích cross-rank challenges** và community interaction
3. **Đảm bảo fairness** thông qua mathematical precision
4. **Scale appropriately** với stakes và match importance
5. **Maintain engagement** across all skill levels

**Core Philosophy:** *"Every match should be winnable by both players, regardless of initial skill difference."*

---

*📅 Created: August 13, 2025*  
*🔄 Last Updated: August 13, 2025*  
*👨‍💻 Maintainer: SABO Pool Arena Development Team*
