import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const features = [
  {
    title: 'Xếp Hạng & ELO',
    desc: 'Thuật toán ELO & SPA minh bạch giúp bạn theo dõi tiến bộ mỗi trận.',
    icon: '🏆',
  },
  {
    title: 'Thách Đấu Trực Tiếp',
    desc: 'Tạo, nhận và quản lý challenge dễ dàng – xây dựng rivalries của riêng bạn.',
    icon: '⚔️',
  },
  {
    title: 'Giải Đấu Realtime',
    desc: 'Bracket & cập nhật frame theo thời gian thực, không bỏ lỡ khoảnh khắc.',
    icon: '🎯',
  },
  {
    title: 'Club & Cộng Đồng',
    desc: 'Kết nối thành viên, quản lý sự kiện và phát triển phong trào cơ thủ địa phương.',
    icon: '🤝',
  },
];

const Home: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <main className='min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50'>
      {/* Hero */}
      <section className='relative pt-20 pb-16 px-6 md:px-10 max-w-6xl w-full mx-auto text-center'>
        <div className='absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(circle_at_30%_20%,#2563eb_0%,transparent_60%),radial-gradient(circle_at_70%_60%,#7c3aed_0%,transparent_55%)]'></div>
        <h1 className='text-3xl md:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-sky-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent'>
          Nền tảng Xếp Hạng & Thách Đấu Bida Hiện Đại
        </h1>
        <p className='mt-5 max-w-2xl mx-auto text-base md:text-lg text-slate-300'>
          Theo dõi phong độ – Tham gia giải đấu realtime – Thách đấu bạn bè –
          Xây dựng cộng đồng cơ thủ chuyên nghiệp.
        </p>
        <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            to='/auth/register'
            className='px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 shadow-lg shadow-indigo-800/40 transition-colors'
          >
            Bắt đầu ngay
          </Link>
          <Link
            to='/auth/login'
            className='px-8 py-3 rounded-lg font-semibold border border-slate-600/60 hover:border-slate-400/80 backdrop-blur-sm bg-slate-800/40 hover:bg-slate-700/40 transition-colors'
          >
            Đăng nhập
          </Link>
        </div>
        <div className='mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300'>
          <div className='p-3 rounded-md bg-slate-800/40 border border-slate-700/50'>
            +250 thành viên
          </div>
          <div className='p-3 rounded-md bg-slate-800/40 border border-slate-700/50'>
            +1,200 trận đấu
          </div>
          <div className='p-3 rounded-md bg-slate-800/40 border border-slate-700/50'>
            Realtime tournaments
          </div>
          <div className='p-3 rounded-md bg-slate-800/40 border border-slate-700/50'>
            ELO minh bạch
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='px-6 md:px-10 pb-20 max-w-6xl mx-auto w-full'>
        <h2 className='text-xl md:text-2xl font-bold mb-6 tracking-wide text-sky-300'>
          Tính năng nổi bật
        </h2>
        <div className='grid md:grid-cols-4 gap-6'>
          {features.map(f => (
            <div
              key={f.title}
              className='group relative p-5 rounded-xl border border-slate-700/60 bg-slate-900/50 backdrop-blur-sm hover:border-sky-500/60 hover:shadow-sky-700/30 shadow transition-all'
            >
              <div className='text-2xl mb-2'>{f.icon}</div>
              <h3 className='font-semibold text-slate-100 mb-1 tracking-wide'>
                {f.title}
              </h3>
              <p className='text-xs text-slate-400 leading-relaxed'>{f.desc}</p>
              <div className='absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none bg-gradient-to-br from-sky-600/10 to-indigo-600/10 transition-opacity'></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className='mt-auto w-full bg-slate-900/60 border-t border-slate-700/60 py-10 px-6'>
        <div className='max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 justify-between'>
          <div>
            <h3 className='text-lg md:text-xl font-bold text-sky-300'>
              Sẵn sàng vào bàn?
            </h3>
            <p className='text-slate-400 text-sm md:text-base mt-1'>
              Tạo tài khoản miễn phí và bắt đầu xây dựng hành trình lên hạng của
              bạn.
            </p>
          </div>
          <div className='flex gap-4'>
            <Link
              to='/auth/register'
              className='px-6 py-2 rounded-md font-semibold bg-sky-600 hover:bg-sky-500 transition-colors shadow'
            >
              Đăng ký
            </Link>
            <Link
              to='/auth/login'
              className='px-6 py-2 rounded-md font-semibold border border-slate-600 hover:border-slate-400 transition-colors'
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
