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
    <main className='min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 dark:text-slate-50 transition-colors duration-300'>
      <SEOHead />
      {/* Top Header (Desktop & Mobile variant) */}
      <header className='sticky top-0 z-30 w-full border-b border-slate-200/70 bg-white/70 supports-[backdrop-filter]:bg-white/50 backdrop-blur px-4 md:px-8 dark:border-slate-800/60 dark:bg-slate-900/70 dark:supports-[backdrop-filter]:bg-slate-900/50 transition-colors duration-300'>
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
              <span className='font-black text-body-large md:text-title bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent tracking-tight'>
                SABO
              </span>
              <span className='text-[10px] md:text-caption font-semibold tracking-[0.25em] text-slate-400 group-hover:text-slate-200 transition-colors'>
                ARENA
              </span>
            </div>
          </Link>

          {/* Primary Nav (Desktop) */}
          <nav className='hidden md:flex items-center gap-6 text-body-small-medium'>
            <a
              href='#features'
              className='text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300 transition-colors'
            >
              Tính năng
            </a>
            <a
              href='#stats'
              className='text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300 transition-colors'
            >
              Số liệu
            </a>
            <a
              href='#join'
              className='text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300 transition-colors'
            >
              Tham gia
            </a>
          </nav>

          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className='h-9 w-9 rounded-full border border-slate-300/60 bg-white/40 hover:bg-slate-100 hover:border-slate-400 dark:border-slate-700/50 dark:bg-slate-800/40 dark:hover:border-slate-500 dark:hover:bg-slate-800/60 transition-colors'
              aria-label='Chuyển giao diện'
            >
              {theme === 'light' ? (
                <Moon className='w-4 h-4 text-slate-700' />
              ) : (
                <Sun className='w-4 h-4 text-amber-300' />
              )}
            </Button>
            <div className='hidden sm:flex gap-2'>
              <Link to='/auth/login'>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-slate-300 bg-white/60 backdrop-blur hover:bg-slate-100 hover:border-slate-400 dark:border-slate-600/70 dark:bg-slate-800/40 dark:hover:bg-slate-700/50 dark:hover:border-slate-400 font-slate transition-colors'
                >
                  <LogIn className='w-4 h-4' />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
              <Link to='/auth/register'>
                <Button
                  size='sm'
                  className='relative overflow-hidden bg-gradient-to-r from-indigo-500 via-sky-500 to-fuchsia-500 hover:from-indigo-400 hover:via-sky-400 hover:to-fuchsia-400 shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/40 font-slate'
                >
                  <UserPlus className='w-4 h-4' />
                  <span>Đăng ký</span>
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
          <div className='absolute inset-0 bg-gradient-to-br from-white/70 via-white/60 to-indigo-100/40 dark:from-slate-950/80 dark:via-slate-900/70 dark:to-indigo-900/60 backdrop-blur-sm transition-colors'></div>
        </div>

        {/* Hero Image - Mobile First */}
        <div className='w-full pt-2 pb-4 md:pt-4 md:pb-6 px-4 md:px-8'>
          <div className='relative w-full shadow-lg shadow-indigo-900/40 group'>
            {/* Animated Border - Running effect */}
            <div className='absolute inset-0 rounded-none overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-75 w-full h-0.5 top-0 animate-sabo-data-flow'></div>
              <div
                className='absolute inset-0 bg-gradient-to-b from-transparent via-sky-500 to-transparent opacity-75 w-0.5 h-full right-0 animate-sabo-data-flow'
                style={{ animationDelay: '0.5s' }}
              ></div>
              <div
                className='absolute inset-0 bg-gradient-to-l from-transparent via-fuchsia-500 to-transparent opacity-75 w-full h-0.5 bottom-0 animate-sabo-data-flow'
                style={{ animationDelay: '1s' }}
              ></div>
              <div
                className='absolute inset-0 bg-gradient-to-t from-transparent via-indigo-500 to-transparent opacity-75 w-0.5 h-full left-0 animate-sabo-data-flow'
                style={{ animationDelay: '1.5s' }}
              ></div>
            </div>

            {/* Static border base */}
            <div className='absolute inset-0 ring-1 ring-indigo-500/20'></div>

            {/* Image Container */}
            <div className='relative bg-slate-900/10 backdrop-blur-sm'>
              <img
                src='https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo/homepage-new.png'
                alt='SABO Arena Homepage'
                className='w-full h-auto object-contain drop-shadow-xl relative z-10'
                loading='lazy'
              />
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-6 md:px-10 pb-12 md:pb-16 text-center'>
          <h1 className='text-heading md:text-4xl lg:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 dark:from-sky-300 dark:via-indigo-300 dark:to-fuchsia-300 bg-clip-text text-transparent drop-shadow'>
            <div className='mb-1'>SABO ARENA</div>
            <div className='text-body-large md:text-heading lg:text-3xl font-semibold tracking-wider'>
              VIET NAM'S BILLIARDS PLATFORM
            </div>
          </h1>
          <p className='mt-5 max-w-2xl mx-auto text-body md:text-body-large text-slate-600 dark:text-slate-300'>
            Theo dõi phong độ – Tham gia giải đấu – Thách đấu bạn bè – Xây dựng
            cộng đồng.
          </p>
          <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
            <Link to='/auth/register' className='group'>
              <Button
                size='lg'
                className='relative overflow-hidden bg-gradient-to-r from-indigo-500 via-sky-500 to-fuchsia-500 hover:from-indigo-400 hover:via-sky-400 hover:to-fuchsia-400 shadow-xl shadow-indigo-500/30 dark:shadow-indigo-900/40 rounded-xl px-10 font-semibold tracking-wide font-slate'
              >
                <span className='relative z-10'>Đăng ký Tài Khoản</span>
                <span className='absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_60%)] transition-opacity'></span>
              </Button>
            </Link>
            <Link to='/auth/login'>
              <div className='group relative inline-flex rounded-xl p-[1px] bg-gradient-to-r from-indigo-500 via-sky-500 to-fuchsia-500 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-800/60 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 w-auto'>
                <Button
                  variant='outline'
                  size='lg'
                  className='rounded-[11px] px-8 border-transparent bg-white/60 backdrop-blur hover:bg-white/70 text-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-900/70 dark:text-slate-200 font-slate relative overflow-hidden transition-colors'
                >
                  <span className='absolute inset-0 opacity-0 group-hover:opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)] transition-opacity'></span>
                  <span className='relative'>Đăng nhập</span>
                </Button>
              </div>
            </Link>
          </div>

          {/* Stats quick */}
          <div
            id='stats'
            className='mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-body-small md:text-base'
          >
            <div className='p-4 rounded-lg bg-white/70 border border-slate-200/70 backdrop-blur-sm hover:border-sky-400/60 dark:bg-slate-900/50 dark:border-slate-700/60 dark:hover:border-sky-500/50 transition-colors'>
              <p className='font-semibold text-sky-600 dark:text-sky-300'>
                +250
              </p>
              <p className='text-[11px] md:text-caption text-slate-500 dark:text-slate-400 uppercase tracking-wide'>
                Thành viên
              </p>
            </div>
            <div className='p-4 rounded-lg bg-white/70 border border-slate-200/70 backdrop-blur-sm hover:border-sky-400/60 dark:bg-slate-900/50 dark:border-slate-700/60 dark:hover:border-sky-500/50 transition-colors'>
              <p className='font-semibold text-sky-600 dark:text-sky-300'>
                +1,200
              </p>
              <p className='text-[11px] md:text-caption text-slate-500 dark:text-slate-400 uppercase tracking-wide'>
                Trận đấu
              </p>
            </div>
            <div className='p-4 rounded-lg bg-white/70 border border-slate-200/70 backdrop-blur-sm hover:border-sky-400/60 dark:bg-slate-900/50 dark:border-slate-700/60 dark:hover:border-sky-500/50 transition-colors'>
              <p className='font-semibold text-sky-600 dark:text-sky-300'>
                Realtime
              </p>
              <p className='text-[11px] md:text-caption text-slate-500 dark:text-slate-400 uppercase tracking-wide'>
                Tournaments
              </p>
            </div>
            <div className='p-4 rounded-lg bg-white/70 border border-slate-200/70 backdrop-blur-sm hover:border-sky-400/60 dark:bg-slate-900/50 dark:border-slate-700/60 dark:hover:border-sky-500/50 transition-colors'>
              <p className='font-semibold text-sky-600 dark:text-sky-300'>
                ELO
              </p>
              <p className='text-[11px] md:text-caption text-slate-500 dark:text-slate-400 uppercase tracking-wide'>
                Minh bạch
              </p>
            </div>
          </div>

          {/* Social Media & Platform Icons */}
          <div className='mt-10 md:mt-14 max-w-4xl mx-auto'>
            <h3 className='text-body-small md:text-body font-semibold text-slate-500 dark:text-slate-300 mb-6 text-center tracking-wide'>
              Kết nối với chúng tôi
            </h3>
            <div className='grid grid-cols-5 lg:grid-cols-10 gap-4 justify-items-center'>
              {/* Facebook */}
              <a
                href='#'
                className='group flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 hover:border-blue-400/60 hover:bg-primary-50 dark:bg-slate-800/50 dark:border-slate-700/60 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/20 transition-all duration-300'
              >
                <svg
                  className='w-6 h-6 text-blue-500 group-hover:text-blue-400 transition-colors'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href='#'
                className='group flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 hover:border-pink-400/60 hover:bg-pink-50 dark:bg-slate-800/50 dark:border-slate-700/60 dark:hover:border-pink-500/50 dark:hover:bg-pink-900/20 transition-all duration-300'
              >
                <svg
                  className='w-6 h-6 text-pink-500 group-hover:text-pink-400 transition-colors'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                </svg>
              </a>

              {/* Zalo */}
              <a
                href='#'
                className='group flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 hover:border-blue-400/60 hover:bg-primary-50 dark:bg-slate-800/50 dark:border-slate-700/60 dark:hover:border-blue-400/50 dark:hover:bg-blue-800/20 transition-all duration-300'
              >
                <svg
                  className='w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M7.5 2C4.46 2 2 4.46 2 7.5S4.46 13 7.5 13H9v7l7-7h0.5c3.04 0 5.5-2.46 5.5-5.5S19.54 2 16.5 2H7.5z' />
                </svg>
              </a>

              {/* Threads */}
              <a
                href='#'
                aria-label='Threads'
                className='group flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 hover:border-slate-400/60 hover:bg-slate-100 dark:bg-slate-800/50 dark:border-slate-700/60 dark:hover:border-slate-300/50 dark:hover:bg-slate-700/20 transition-all duration-300'
              >
                <svg
                  className='w-6 h-6 text-slate-300 group-hover:text-slate-200 transition-colors'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.01 1.5 8.434 2.35 5.58 3.995 3.529 5.845 1.225 8.598.044 12.179.02h.007c3.581.024 6.334 1.205 8.184 3.509C21.65 5.58 22.5 8.434 22.5 12.01c0 3.576-.85 6.43-2.495 8.481C18.155 22.795 15.402 23.976 11.821 24h.365z' />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href='#'
                className='group flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 hover:border-pink-400/60 hover:bg-pink-50 dark:bg-slate-800/50 dark:border-slate-700/60 dark:hover:border-pink-500/50 dark:hover:bg-pink-900/20 transition-all duration-300'
              >
                <svg
                  className='w-6 h-6 text-pink-500 group-hover:text-pink-400 transition-colors'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href='#'
                className='group flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 hover:border-red-400/60 hover:bg-error-50 dark:bg-slate-800/50 dark:border-slate-700/60 dark:hover:border-red-500/50 dark:hover:bg-red-900/20 transition-all duration-300'
              >
                <svg
                  className='w-6 h-6 text-red-500 group-hover:text-red-400 transition-colors'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
                </svg>
              </a>

              {/* Spotify */}
              <a
                href='#'
                className='group flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 hover:border-green-400/60 hover:bg-success-50 dark:bg-slate-800/50 dark:border-slate-700/60 dark:hover:border-green-500/50 dark:hover:bg-green-900/20 transition-all duration-300'
              >
                <svg
                  className='w-6 h-6 text-green-500 group-hover:text-green-400 transition-colors'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.301.421-1.02.599-1.559.3z' />
                </svg>
              </a>

              {/* Shop */}
              <a
                href='#'
                className='group flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 hover:border-amber-400/60 hover:bg-amber-50 dark:bg-slate-800/50 dark:border-slate-700/60 dark:hover:border-amber-500/50 dark:hover:bg-amber-900/20 transition-all duration-300'
              >
                <svg
                  className='w-6 h-6 text-amber-500 group-hover:text-amber-400 transition-colors'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                  />
                </svg>
              </a>

              {/* Phone */}
              <a
                href='#'
                className='group flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 hover:border-emerald-400/60 hover:bg-emerald-50 dark:bg-slate-800/50 dark:border-slate-700/60 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-900/20 transition-all duration-300'
              >
                <svg
                  className='w-6 h-6 text-emerald-500 group-hover:text-emerald-400 transition-colors'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                  />
                </svg>
              </a>

              {/* Community */}
              <a
                href='#'
                className='group flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 hover:border-purple-400/60 hover:bg-info-50 dark:bg-slate-800/50 dark:border-slate-700/60 dark:hover:border-purple-500/50 dark:hover:bg-purple-900/20 transition-all duration-300'
              >
                <svg
                  className='w-6 h-6 text-purple-500 group-hover:text-purple-400 transition-colors'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id='features'
        className='px-6 md:px-10 pt-8 md:pt-12 pb-16 md:pb-20 max-w-7xl mx-auto w-full'
      >
        <h2 className='text-title md:text-3xl font-bold mb-8 md:mb-10 tracking-wide bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent'>
          Tính năng nổi bật
        </h2>
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6'>
          {features.map(f => (
            <div
              key={f.title}
              className='group relative p-6 md:p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm hover:border-sky-400/70 hover:shadow-lg hover:shadow-sky-200/50 dark:border-slate-700/60 dark:bg-slate-900/40 dark:hover:border-sky-500/70 dark:hover:shadow-sky-900/30 transition-all overflow-hidden'
            >
              <div className='absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br from-sky-500/5 to-indigo-600/5 blur-2xl group-hover:from-sky-500/15 group-hover:to-indigo-600/15 transition-opacity'></div>
              <div className='relative flex flex-col gap-2 md:gap-3'>
                <div className='inline-flex items-center justify-center text-heading md:text-[28px] drop-shadow select-none'>
                  {f.icon}
                </div>
                <h3 className='font-semibold text-slate-700 dark:text-slate-100 tracking-wide text-body-small md:text-body leading-snug'>
                  {f.title}
                </h3>
                <p className='text-caption md:text-body-small text-slate-500 dark:text-slate-400 leading-relaxed md:leading-relaxed'>
                  {f.desc}
                </p>
              </div>
              <div className='absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none bg-gradient-to-br from-sky-600/10 to-indigo-600/10 transition-opacity'></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section
        id='join'
        className='mt-auto w-full bg-white/80 dark:bg-slate-900/70 border-t border-slate-200/70 dark:border-slate-800/70 py-14 px-6 transition-colors'
      >
        <div className='max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between text-center md:text-left'>
          <div className='max-w-xl'>
            <h3 className='text-title md:text-heading font-extrabold bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 dark:from-sky-400 dark:via-indigo-400 dark:to-fuchsia-400 bg-clip-text text-transparent'>
              Sẵn sàng vào bàn?
            </h3>
            <p className='text-slate-600 dark:text-slate-400 text-body-small md:text-body mt-2'>
              Tạo tài khoản miễn phí và bắt đầu xây dựng hành trình lên hạng của
              bạn. Kết nối, thi đấu và phát triển kỹ năng mỗi ngày.
            </p>
          </div>
          <div className='flex flex-col sm:flex-row gap-4'>
            <Link to='/auth/register'>
              <Button
                size='lg'
                className='relative overflow-hidden bg-gradient-to-r from-indigo-500 via-sky-500 to-fuchsia-500 hover:from-indigo-400 hover:via-sky-400 hover:to-fuchsia-400 shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/40 rounded-xl px-8 font-semibold tracking-wide font-slate'
              >
                Đăng ký
              </Button>
            </Link>
            <Link to='/auth/login'>
              <div className='group relative inline-flex rounded-xl p-[1px] bg-gradient-to-r from-indigo-500 via-sky-500 to-fuchsia-500 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-800/60 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 w-auto'>
                <Button
                  variant='outline'
                  size='lg'
                  className='rounded-[11px] px-8 border-transparent bg-white/60 backdrop-blur hover:bg-white/70 text-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-900/70 dark:text-slate-200 font-slate relative overflow-hidden transition-colors'
                >
                  <span className='absolute inset-0 opacity-0 group-hover:opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)] transition-opacity'></span>
                  <span className='relative'>Đăng nhập</span>
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
