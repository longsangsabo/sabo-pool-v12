import { useState, useEffect } from 'react';
import { supabase } from '@sabo/shared-auth';
import { formatDate } from '@sabo/shared-utils';
import {
  Trophy,
  Users,
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';

interface Tournament {
  id: string
  name: string
  description?: string
  status: string
  tournament_type: string
  max_participants: number
  current_participants: number
  entry_fee?: number
  prize_pool?: number
  created_at: string
  created_by?: string
}

export default function AdminTournamentManagerFunctional() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          id,
          name,
          description,
          status,
          tournament_type,
          max_participants,
          current_participants,
          entry_fee,
          prize_pool,
          created_at,
          created_by
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching tournaments:', error)
        throw error
      }

      setTournaments(data || [])
    } catch (error: any) {
      console.error('❌ Failed to fetch tournaments:', error)
      setError(error.message || 'Failed to load tournaments')
    } finally {
      setLoading(false)
    }
  }

  const deleteTournament = async (tournamentId: string, tournamentName: string) => {
    if (!confirm(`Are you sure you want to delete "${tournamentName}"? This action cannot be undone.`)) {
      return
    }

    try {
      
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId)

      if (error) {
        console.error('❌ Error deleting tournament:', error)
        throw error
      }

      
      // Remove from local state
      setTournaments(prev => prev.filter(t => t.id !== tournamentId))
      
      alert('Tournament deleted successfully!')
    } catch (error: any) {
      console.error('❌ Failed to delete tournament:', error)
      alert(`Failed to delete tournament: ${error.message}`)
    }
  }

  useEffect(() => {
    fetchTournaments()
  }, [])

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'bg-blue-600'
      case 'ongoing':
        return 'bg-green-600'
      case 'completed':
        return 'bg-gray-600'
      case 'cancelled':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Tournaments</h2>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={fetchTournaments}
              className="mt-4 px-4 py-2 bg-red-600 text-var(--color-background) rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-var(--color-background) p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏆 Tournament Management</h1>
            <p className="text-gray-400">Manage all tournaments and competitions</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-var(--color-background) rounded hover:bg-green-700 transition-colors">
            <Plus className="h-4 w-4" />
            Create Tournament
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-var(--color-background) placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-var(--color-background) focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="registration_open">Registration Open</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-var(--color-background)">
              Tournaments ({filteredTournaments.length})
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading tournaments...</p>
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-neutral mx-auto mb-4" />
                <p className="text-gray-400">No tournaments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTournaments.map(tournament => (
                  <div
                    key={tournament.id}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-var(--color-background)">{tournament.name}</h3>
                        <span className={`px-2 py-1 text-xs text-var(--color-background) rounded ${getStatusColor(tournament.status)}`}>
                          {tournament.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-600 text-var(--color-background) rounded">
                          {tournament.tournament_type}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        {tournament.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{tournament.current_participants}/{tournament.max_participants} players</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created {formatDate(tournament.created_at)}</span>
                        </div>
                        {tournament.entry_fee && (
                          <div className="flex items-center gap-1">
                            <span>${tournament.entry_fee}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-400 hover:bg-blue-900/20 rounded transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-yellow-400 hover:bg-yellow-900/20 rounded transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteTournament(tournament.id, tournament.name)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Tournaments</p>
                <p className="text-2xl font-bold text-var(--color-background)">{tournaments.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-400">
                  {tournaments.filter(t => t.status === 'ongoing').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-blue-400">
                  {tournaments.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Registration Open</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {tournaments.filter(t => t.status === 'registration_open').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
