import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export const SimpleLegacySearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlayer = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Direct query without RLS dependency
      const { data, error } = await supabase
        .from('legacy_spa_points')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,nick_name.ilike.%${searchTerm}%`)
        .limit(5);

      if (error) {
        setError(`Lỗi: ${error.message}`);
        console.log('Full error:', error);
      } else {
        setResults(data || []);
        console.log('Found results:', data);
      }
    } catch (err) {
      setError(`Lỗi bất ngờ: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-bold mb-4">🔍 Tìm kiếm Legacy SPA đơn giản</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nhập tên để tìm kiếm..."
          className="flex-1 px-3 py-2 border rounded"
          onKeyDown={(e) => e.key === 'Enter' && searchPlayer()}
        />
        <button
          onClick={searchPlayer}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Đang tìm...' : 'Tìm kiếm'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded mb-4">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Kết quả tìm kiếm:</h4>
          {results.map((player) => (
            <div key={player.id} className="p-3 border rounded bg-gray-50">
              <div className="font-semibold">{player.display_name || player.full_name}</div>
              {player.nick_name && (
                <div className="text-sm text-gray-600">Biệt danh: {player.nick_name}</div>
              )}
              <div className="text-sm">
                <span className="font-medium">SPA Points: {player.spa_points}</span>
                <span className={`ml-4 px-2 py-1 rounded text-xs ${
                  player.claimed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {player.claimed ? 'Đã claim' : 'Chưa claim'}
                </span>
              </div>
              {player.facebook_url && (
                <div className="text-xs text-blue-600 truncate mt-1">
                  FB: {player.facebook_url}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && searchTerm && !loading && !error && (
        <div className="text-gray-500 text-center py-4">
          Không tìm thấy kết quả cho "{searchTerm}"
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        💡 Tip: Thử tìm "ANH LONG" để test tài khoản của bạn
      </div>
    </div>
  );
};
