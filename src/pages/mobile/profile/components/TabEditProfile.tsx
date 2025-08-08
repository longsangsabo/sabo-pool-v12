import React from 'react';
import { ProfileData } from '../types';
import { Button } from '@/components/ui/button';

interface Props {
  editingProfile: ProfileData | null;
  saving: boolean;
  onChange: <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => void;
  onSave: () => void;
  onCancel: () => void;
  theme: string;
}

export const TabEditProfile: React.FC<Props> = ({ editingProfile, saving, onChange, onSave, onCancel, theme }) => {
  return (
    <div className='p-4 space-y-4'>
      <div className='grid gap-4'>
        <div className='space-y-1'>
          <label className='text-xs font-medium'>Tên hiển thị</label>
          <input
            className={`w-full px-3 py-2 text-sm rounded-md border outline-none transition ${
              theme === 'dark'
                ? 'bg-slate-800/70 border-slate-600/60 text-slate-100 focus:border-amber-400'
                : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
            }`}
            value={editingProfile?.display_name || ''}
            onChange={e => onChange('display_name', e.target.value)}
            placeholder='Nhập tên hiển thị'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs font-medium'>Số điện thoại</label>
          <input
            className={`w-full px-3 py-2 text-sm rounded-md border outline-none transition ${
              theme === 'dark'
                ? 'bg-slate-800/70 border-slate-600/60 text-slate-100 focus:border-amber-400'
                : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
            }`}
            value={editingProfile?.phone || ''}
            onChange={e => onChange('phone', e.target.value)}
            placeholder='Số điện thoại'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs font-medium'>Tỉnh / Thành phố</label>
          <input
            className={`w-full px-3 py-2 text-sm rounded-md border outline-none transition ${
              theme === 'dark'
                ? 'bg-slate-800/70 border-slate-600/60 text-slate-100 focus:border-amber-400'
                : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
            }`}
            value={editingProfile?.city || ''}
            onChange={e => onChange('city', e.target.value)}
            placeholder='VD: TP. Hồ Chí Minh'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs font-medium'>Quận / Huyện</label>
          <input
            className={`w-full px-3 py-2 text-sm rounded-md border outline-none transition ${
              theme === 'dark'
                ? 'bg-slate-800/70 border-slate-600/60 text-slate-100 focus:border-amber-400'
                : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
            }`}
            value={editingProfile?.district || ''}
            onChange={e => onChange('district', e.target.value)}
            placeholder='VD: Quận 1'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs font-medium'>Trình độ</label>
          <select
            className={`w-full px-3 py-2 text-sm rounded-md border outline-none transition ${
              theme === 'dark'
                ? 'bg-slate-800/70 border-slate-600/60 text-slate-100 focus:border-amber-400'
                : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
            }`}
            value={editingProfile?.skill_level || 'beginner'}
            onChange={e => onChange('skill_level', e.target.value as any)}
          >
            <option value='beginner'>Người mới</option>
            <option value='intermediate'>Trung bình</option>
            <option value='advanced'>Khá</option>
            <option value='pro'>Chuyên nghiệp</option>
          </select>
        </div>
        <div className='space-y-1'>
          <label className='text-xs font-medium'>Giới thiệu</label>
          <textarea
            rows={3}
            className={`w-full px-3 py-2 text-sm rounded-md border outline-none resize-none transition ${
              theme === 'dark'
                ? 'bg-slate-800/70 border-slate-600/60 text-slate-100 focus:border-amber-400'
                : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
            }`}
            value={editingProfile?.bio || ''}
            onChange={e => onChange('bio', e.target.value)}
            placeholder='Mô tả ngắn về bạn...'
          />
        </div>
      </div>
      <div className='flex gap-2 pt-2'>
        <Button disabled={saving} onClick={onSave} className={`flex-1 ${saving ? 'opacity-70 pointer-events-none' : ''}`} size='sm'>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
        <Button disabled={saving} onClick={onCancel} variant='outline' size='sm' className='flex-1'>
          Hủy
        </Button>
      </div>
    </div>
  );
};
