
import { rankColors } from '../utils/rank-colors';

const RankColorReference = () => {
 const allRanks = Object.keys(rankColors);

 return (
  <div className="p-5 font-mono bg-gray-50 rounded-xl m-5">
   <h2 className="text-center mb-5 text-gray-800 text-2xl font-bold">
    🎱 Bảng Màu Hạng - Sabo Billiards
   </h2>

   <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
    {allRanks.map(rank => {
     const rankInfo = rankColors[rank as keyof typeof rankColors];
     const IconComponent = rankInfo.icon;

     return (
      <div
       key={rank}
       style={{
        background: 'var(--color-background)',
        border: `3px solid ${rankInfo.borderColor}`,
        borderRadius: '12px',
        padding: '16px',
        className="text-center",
        boxShadow: '0 4px 12px var(--color-var(--color-foreground)-10)',
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
       <div className="flex items-center justify-center gap-3 mb-3">
        <IconComponent
         style={{
          color: rankInfo.color,
          width: '24px',
          height: '24px',
          filter: `drop-shadow(${rankInfo.textShadow})`,
         }}
        />
        <span
         style={{ background: rankInfo.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '20px',
          className="font-bold",
          letterSpacing: '2px', }}
        >
         RANK {rank}
        </span>
       </div>

       <div className="text-sm text-gray-500 mb-2 font-medium">
        {rankInfo.name}
       </div>

       <div
        className="text-xs font-semibold font-mono tracking-wide"
        style={{ color: rankInfo.color }}
       >
        {rankInfo.color}
       </div>

       <div
        className="mt-2 h-1 rounded-sm"
        style={{ background: rankInfo.gradient }}
       ></div>
      </div>
     );
    })}
   </div>

   <div className="mt-8 p-4 bg-background rounded-lg border-2 border-gray-200">
    <h3 className="text-gray-800 mb-3 text-base font-semibold">
     📋 Hướng dẫn sử dụng:
    </h3>
    <ul
     className="text-gray-600 text-sm leading-relaxed pl-5"
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
