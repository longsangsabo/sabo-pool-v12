import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogIn, UserPlus } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';

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
  const { theme, setTheme } = useTheme();

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
    <main className='min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800'>
      <SEOHead />
      {/* Top Header (Desktop & Mobile variant) */}
      <header className='sticky top-0 z-30 w-full border-b border-slate-800/60 backdrop-blur bg-slate-900/70 supports-[backdrop-filter]:bg-slate-900/50 px-4 md:px-8'>
        <div className='h-16 flex items-center justify-between gap-4 max-w-7xl mx-auto'>
          {/* Brand */}
          <Link to='/' className='flex items-center gap-3 group'>
            <div className='relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-500/40 shadow-md shadow-indigo-900/30'>
              <img
                src='https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo//logo-sabo-arena.png'
                alt='SABO ARENA'
                className='w-full h-full object-cover transition-transform group-hover:scale-105'
              />
            </div>
            <div className='flex flex-col leading-none'>
              <span className='font-black text-lg md:text-xl bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent tracking-tight'>SABO</span>
              <span className='text-[10px] md:text-xs font-semibold tracking-[0.25em] text-slate-400 group-hover:text-slate-200 transition-colors'>ARENA</span>
            </div>
          </Link>

          {/* Primary Nav (Desktop) */}
          <nav className='hidden md:flex items-center gap-6 text-sm font-medium'>
            <a href='#features' className='text-slate-300 hover:text-sky-300 transition-colors'>Tính năng</a>
            <a href='#stats' className='text-slate-300 hover:text-sky-300 transition-colors'>Số liệu</a>
            <a href='#join' className='text-slate-300 hover:text-sky-300 transition-colors'>Tham gia</a>
          </nav>

            <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className='h-9 w-9 rounded-full border border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/60'
              aria-label='Chuyển giao diện'
            >
              {theme === 'light' ? <Moon className='w-4 h-4' /> : <Sun className='w-4 h-4' />}
            </Button>
            <div className='hidden sm:flex gap-2'>
              <Link to='/auth/login'>
                <Button variant='outline' size='sm' className='border-slate-600/70 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-400'>
                  <LogIn className='w-4 h-4' />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
              <Link to='/auth/register'>
                <Button size='sm' className='relative overflow-hidden bg-gradient-to-r from-indigo-500 via-sky-500 to-fuchsia-500 hover:from-indigo-400 hover:via-sky-400 hover:to-fuchsia-400 shadow-lg shadow-indigo-900/40'>
                  <UserPlus className='w-4 h-4' />
                  <span>Bắt đầu</span>
                  <span className='absolute inset-0 opacity-0 hover:opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)] transition-opacity'></span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner with background image */}
      <section className='relative w-full overflow-hidden'>
        <div className='absolute inset-0 -z-10'>
          <img
            src='https://images.unsplash.com/photo-1601584115197-04ecc0da31a8?q=80&w=1600&auto=format&fit=crop'
            alt='Pool Arena'
            className='w-full h-full object-cover opacity-40 md:opacity-35 mix-blend-luminosity'
            loading='lazy'
          />
          <div className='absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-indigo-900/60 backdrop-blur-sm'></div>
        </div>
        <div className='max-w-7xl mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-20 text-center'>
          <h1 className='text-3xl md:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-sky-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent drop-shadow'>
            SABO ARENA - <span>Nền tảng Billiards đầu tiên tại Việt Nam</span>
          </h1>
          <p className='mt-5 max-w-2xl mx-auto text-base md:text-lg text-slate-300'>
            Theo dõi phong độ – Tham gia giải đấu realtime – Thách đấu bạn bè – Xây dựng cộng đồng cơ thủ chuyên nghiệp.
          </p>
          <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
            <Link to='/auth/register' className='group'>
              <Button size='lg' className='relative overflow-hidden bg-gradient-to-r from-indigo-500 via-sky-500 to-fuchsia-500 hover:from-indigo-400 hover:via-sky-400 hover:to-fuchsia-400 shadow-xl shadow-indigo-900/40 rounded-xl px-10 font-semibold tracking-wide'>
                <span className='relative z-10'>Bắt đầu ngay</span>
                <span className='absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_60%)] transition-opacity'></span>
              </Button>
            </Link>
            <Link to='/auth/login'>
              <Button
                variant='outline'
                size='lg'
                className='rounded-xl border-slate-600/70 bg-slate-800/50 backdrop-blur hover:bg-slate-700/60 hover:border-slate-400/80 text-slate-200'
              >
                Đăng nhập
              </Button>
            </Link>
          </div>

          {/* Stats quick */}
          <div id='stats' className='mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm md:text-base'>
            <div className='p-4 rounded-lg bg-slate-900/50 border border-slate-700/60 backdrop-blur-sm hover:border-sky-500/50 transition-colors'>
              <p className='font-semibold text-sky-300'>+250</p>
              <p className='text-[11px] md:text-xs text-slate-400 uppercase tracking-wide'>Thành viên</p>
            </div>
            <div className='p-4 rounded-lg bg-slate-900/50 border border-slate-700/60 backdrop-blur-sm hover:border-sky-500/50 transition-colors'>
              <p className='font-semibold text-sky-300'>+1,200</p>
              <p className='text-[11px] md:text-xs text-slate-400 uppercase tracking-wide'>Trận đấu</p>
            </div>
            <div className='p-4 rounded-lg bg-slate-900/50 border border-slate-700/60 backdrop-blur-sm hover:border-sky-500/50 transition-colors'>
              <p className='font-semibold text-sky-300'>Realtime</p>
              <p className='text-[11px] md:text-xs text-slate-400 uppercase tracking-wide'>Tournaments</p>
            </div>
            <div className='p-4 rounded-lg bg-slate-900/50 border border-slate-700/60 backdrop-blur-sm hover:border-sky-500/50 transition-colors'>
              <p className='font-semibold text-sky-300'>ELO</p>
              <p className='text-[11px] md:text-xs text-slate-400 uppercase tracking-wide'>Minh bạch</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id='features' className='px-6 md:px-10 py-16 md:py-24 max-w-7xl mx-auto w-full'>
        <h2 className='text-xl md:text-3xl font-bold mb-10 tracking-wide bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent'>Tính năng nổi bật</h2>
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {features.map(f => (
            <div
              key={f.title}
              className='group relative p-6 rounded-2xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-sm hover:border-sky-500/70 hover:shadow-lg hover:shadow-sky-900/30 transition-all overflow-hidden'
            >
              <div className='absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-sky-500/10 to-indigo-600/10 blur-2xl group-hover:from-sky-500/20 group-hover:to-indigo-600/20 transition-opacity'></div>
              <div className='text-2xl mb-3 drop-shadow'>{f.icon}</div>
              <h3 className='font-semibold text-slate-100 mb-2 tracking-wide text-sm md:text-base'>
                {f.title}
              </h3>
              <p className='text-xs md:text-sm text-slate-400 leading-relaxed'>{f.desc}</p>
              <div className='absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none bg-gradient-to-br from-sky-600/10 to-indigo-600/10 transition-opacity'></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section id='join' className='mt-auto w-full bg-slate-900/70 border-t border-slate-800/70 py-14 px-6'>
        <div className='max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between text-center md:text-left'>
          <div className='max-w-xl'>
            <h3 className='text-xl md:text-2xl font-extrabold bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent'>Sẵn sàng vào bàn?</h3>
            <p className='text-slate-400 text-sm md:text-base mt-2'>Tạo tài khoản miễn phí và bắt đầu xây dựng hành trình lên hạng của bạn. Kết nối, thi đấu và phát triển kỹ năng mỗi ngày.</p>
          </div>
          <div className='flex flex-col sm:flex-row gap-4'>
            <Link to='/auth/register'>
              <Button size='lg' className='relative overflow-hidden bg-gradient-to-r from-indigo-500 via-sky-500 to-fuchsia-500 hover:from-indigo-400 hover:via-sky-400 hover:to-fuchsia-400 shadow-lg shadow-indigo-900/40 rounded-xl px-8 font-semibold tracking-wide'>
                Đăng ký
              </Button>
            </Link>
            <Link to='/auth/login'>
              <Button
                variant='outline'
                size='lg'
                className='rounded-xl border-slate-600/70 bg-slate-800/40 backdrop-blur hover:bg-slate-700/60 hover:border-slate-400/80 text-slate-200'
              >
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
