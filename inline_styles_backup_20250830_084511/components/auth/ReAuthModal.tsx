import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ReAuthModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('auth-recovery', handler as any);
    return () => window.removeEventListener('auth-recovery', handler as any);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error('Đăng nhập lại thất bại');
      } else {
        toast.success('Khôi phục phiên thành công');
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
      <div className='bg-background border rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4'>
        <h2 className='text-lg font-semibold'>Phiên đăng nhập đã hết hạn</h2>
        <p className='text-sm text-muted-foreground'>
          Đăng nhập lại để tiếp tục thao tác mà không mất ngữ cảnh.
        </p>
        <form onSubmit={handleLogin} className='space-y-3'>
          <div>
            <input
              type='email'
              placeholder='Email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full border rounded px-3 py-2 text-sm bg-background'
              required
            />
          </div>
          <input
            type='password'
            placeholder='Mật khẩu'
            value={password}
            onChange={e => setPassword(e.target.value)}
            className='w-full border rounded px-3 py-2 text-sm bg-background'
            required
          />
          <div className='flex gap-2 pt-2'>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='flex-1 text-sm border rounded px-3 py-2 hover:bg-muted'
              disabled={loading}
            >
              Để sau
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 text-sm rounded px-3 py-2 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50'
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập lại'}
            </button>
          </div>
          <button
            type='button'
            onClick={() =>
              (window.location.href =
                '/auth?redirect=' +
                encodeURIComponent(window.location.pathname))
            }
            className='w-full text-xs underline text-muted-foreground hover:text-foreground'
          >
            Chuyển đến trang đăng nhập đầy đủ
          </button>
        </form>
      </div>
    </div>
  );
};
