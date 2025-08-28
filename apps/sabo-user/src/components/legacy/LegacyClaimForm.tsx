import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Send, CheckCircle } from 'lucide-react';

interface LegacyClaimFormProps {
  selectedEntry?: {
    nick_name?: string;
    full_name?: string;
    spa_points?: number;
  };
  onSuccess?: () => void;
}

export const LegacyClaimForm: React.FC<LegacyClaimFormProps> = ({ selectedEntry, onSuccess }) => {
  const [formData, setFormData] = useState({
    user_email: '',
    user_name: '',
    user_phone: '',
    legacy_name: '',
    spa_points: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-fill form if selectedEntry is provided
  useEffect(() => {
    if (selectedEntry) {
      setFormData(prev => ({
        ...prev,
        legacy_name: selectedEntry.nick_name || selectedEntry.full_name || '',
        spa_points: selectedEntry.spa_points?.toString() || ''
      }));
    }
  }, [selectedEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('simple_legacy_claims' as any)
        .insert({
          user_email: formData.user_email,
          user_name: formData.user_name,
          user_phone: formData.user_phone,
          legacy_name: formData.legacy_name,
          spa_points: parseInt(formData.spa_points) || 0
        })
        .select();

      if (error) {
        console.error('❌ Submit error:', error);
        alert(`Lỗi: ${error.message}`);
      } else {
        console.log('✅ Submit success:', data);
        setSubmitted(true);
        setFormData({
          user_email: '',
          user_name: '',
          user_phone: '',
          legacy_name: '',
          spa_points: ''
        });
        
        // Call onSuccess callback if provided
        onSuccess?.();
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      alert(`Lỗi: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="text-center p-8 bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-700/50">
        <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-green-400 mb-3">
          Gửi yêu cầu thành công! ✅
        </h3>
        <p className="text-gray-300 mb-6 text-lg">
          Vui lòng đợi SABO xác nhận.
        </p>
        <Button 
          onClick={() => setSubmitted(false)} 
          variant="outline"
          className="bg-gray-800/80 hover:bg-gray-700/80 text-white border-gray-600 hover:border-gray-500"
        >
          Gửi yêu cầu khác
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center mb-6">
        <Gift className="w-8 h-8 text-yellow-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Claim SPA Points</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="user_name" className="text-gray-200 font-medium">Họ và tên *</Label>
            <Input
              id="user_name"
              type="text"
              value={formData.user_name}
              onChange={(e) => handleChange('user_name', e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              className="mt-2 bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20"
            />
          </div>

          <div>
            <Label htmlFor="user_email" className="text-gray-200 font-medium">Email *</Label>
            <Input
              id="user_email"
              type="email"
              value={formData.user_email}
              onChange={(e) => handleChange('user_email', e.target.value)}
              placeholder="email@example.com"
              required
              className="mt-2 bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20"
            />
          </div>

          <div>
            <Label htmlFor="user_phone" className="text-gray-200 font-medium">Số điện thoại</Label>
            <Input
              id="user_phone"
              type="tel"
              value={formData.user_phone}
              onChange={(e) => handleChange('user_phone', e.target.value)}
              placeholder="0123456789"
              className="mt-2 bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20"
            />
          </div>

          <div>
            <Label htmlFor="legacy_name" className="text-gray-200 font-medium">Tên Legacy Account *</Label>
            <Input
              id="legacy_name"
              type="text"
              value={formData.legacy_name}
              onChange={(e) => handleChange('legacy_name', e.target.value)}
              placeholder="LEGACY ACCOUNT NAME"
              required
              className="mt-2 bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20"
            />
          </div>

          <div>
            <Label htmlFor="spa_points" className="text-gray-200 font-medium">Số SPA Points yêu cầu *</Label>
            <Input
              id="spa_points"
              type="number"
              min="1"
              value={formData.spa_points}
              onChange={(e) => handleChange('spa_points', e.target.value)}
              placeholder="100"
              required
              className="mt-2 bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 text-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Gửi yêu cầu
              </>
            )}
          </Button>
        </form>
      </div>
    );
  };

  export default LegacyClaimForm;
