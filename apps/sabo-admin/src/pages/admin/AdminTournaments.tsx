import { useState, useEffect } from 'react';
import { supabase } from '@sabo/shared-auth';
import {
  Search,
  Eye,
  Settings,
  Users,
  Trophy,
  Clock,
  MapPin,
  DollarSign,
  UserPlus,
  Zap,
  Trash2,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  status: string;
  max_participants: number;
  current_participants: number;
  tournament_type: string;
  game_format: string;
  entry_fee: number;
  prize_pool: number;
  registration_start: string;
  registration_end: string;
  start_date: string;
  end_date: string;
  venue_address: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    setLoading(true);
    setError(null);
    try {

      const { data, error: tournamentsError } = await supabase
        .from('tournaments')
        .select(`
          id, name, status, max_participants, tournament_type, game_format,
          entry_fee, prize_pool, registration_start, registration_end,
          start_date, end_date, venue_address, created_by,
          created_at, updated_at
        `)
        .order('created_at', { ascending: false });

      if (tournamentsError) {
        console.error('Error loading tournaments:', tournamentsError);
        throw tournamentsError;
      }

      // Calculate current participants for each tournament
      const tournamentsWithCounts = await Promise.all(
        (data || []).map(async tournament => {
          const { count } = await supabase
            .from('tournament_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('tournament_id', tournament.id)
            .eq('registration_status', 'confirmed');

          return {
            ...tournament,
            current_participants: count || 0,
          };
        })
      );

      setTournaments(tournamentsWithCounts);
    } catch (error: any) {
      console.error('❌ Failed to load tournaments:', error);
      setError(error.message || 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'bg-success-background0/10 text-green-400 border-green-400';
      case 'registration_closed':
        return 'bg-warning-background0/10 text-yellow-400 border-yellow-400';
      case 'ongoing':
        return 'bg-primary-background0/10 text-blue-400 border-blue-400';
      case 'completed':
        return 'bg-neutral-background0/10 text-gray-400 border-gray-400';
      case 'cancelled':
        return 'bg-error-background0/10 text-red-400 border-red-400';
      default:
        return 'bg-neutral-background0/10 text-gray-400 border-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'Registration Open';
      case 'registration_closed':
        return 'Registration Closed';
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch =
      !searchQuery ||
      tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.venue_address?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || tournament.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not Set';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const openParticipantModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsParticipantModalOpen(true);
  };

  const closeParticipantModal = () => {
    setSelectedTournament(null);
    setIsParticipantModalOpen(false);
  };

  const handleDeleteTournament = async (tournamentId: string, tournamentName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete tournament"${tournamentName}"?\n\n` +
        `⚠️ WARNING: This action will:\n` +
        `• Permanently delete all tournament data\n` +
        `• Delete all participant registrations\n` +
        `• Delete all matches and results\n` +
        `• CANNOT be undone!\n\n` +
        `Type"DELETE" to confirm:`
    );

    if (!confirmed) return;

    const confirmText = prompt('Type"DELETE" to confirm permanent deletion:');
    if (confirmText !== 'DELETE') {
      alert('Cancellation: Tournament not deleted due to incorrect confirmation');
      return;
    }

    try {
      setIsDeleting(true);

      // Delete tournament registrations first
      const { error: registrationsError } = await supabase
        .from('tournament_registrations')
        .delete()
        .eq('tournament_id', tournamentId);

      if (registrationsError) throw registrationsError;

      // Delete tournament matches
      const { error: matchesError } = await supabase
        .from('tournament_matches')
        .delete()
        .eq('tournament_id', tournamentId);

      if (matchesError) throw matchesError;

      // Finally delete the tournament
      const { error: tournamentError } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);

      if (tournamentError) throw tournamentError;

      await loadTournaments(); // Reload the tournaments list
    } catch (error: any) {
      console.error('❌ Failed to delete tournament:', error);
      setError(error.message || 'Failed to delete tournament');
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="text-var(--color-background) p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Tournament Management Error</h2>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={loadTournaments}
              className="mt-4 px-4 py-2 bg-red-600 text-var(--color-background) rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-var(--color-background) p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-var(--color-background) mb-2'>
            🏆 Tournament Management
          </h1>
          <p className='text-gray-400'>
            View and manage all tournaments in the system
          </p>
        </div>

        {/* Search and Filters */}
        <div className='flex gap-4 mb-6'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              placeholder='Search tournaments...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-var(--color-background) placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-48 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-var(--color-background) appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="registration_open">Registration Open</option>
              <option value="registration_closed">Registration Closed</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          <button
            onClick={loadTournaments}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-var(--color-background) rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>

          <button
            onClick={() => setIsQuickAddModalOpen(true)}
            className='flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-var(--color-background) rounded transition-colors'
            disabled={loading}
          >
            <Zap className='h-4 w-4' />
            Quick Add User
          </button>
        </div>

        {/* Tournaments Grid */}
        {loading ? (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-gray-400'>Loading tournaments...</p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className='text-center py-12'>
            <Trophy className='h-12 w-12 text-neutral mx-auto mb-4' />
            <h3 className='text-lg font-medium text-var(--color-background) mb-2'>
              No tournaments found
            </h3>
            <p className='text-gray-400'>
              {searchQuery || statusFilter !== 'all'
                ? 'Try changing the filter or search terms'
                : 'No tournaments in the system yet'}
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {filteredTournaments.map(tournament => (
              <div
                key={tournament.id}
                className='bg-gray-800 border border-gray-700 rounded-lg hover:shadow-lg transition-shadow'
              >
                {/* Tournament Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='text-lg font-bold text-var(--color-background) line-clamp-2 mb-2'>
                        {tournament.name}
                      </h3>
                      <div className='flex items-center gap-2'>
                        <span className={`px-2 py-1 text-xs border rounded ${getStatusColor(tournament.status)}`}>
                          {getStatusText(tournament.status)}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded border border-gray-600">
                          {tournament.tournament_type}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className='flex gap-2'>
                      <button
                        onClick={() => openParticipantModal(tournament)}
                        title='Manage participants'
                        className="p-2 text-gray-400 hover:text-var(--color-background) hover:bg-gray-700 rounded transition-colors"
                      >
                        <UserPlus className='h-4 w-4' />
                      </button>
                      <button
                        title='View details'
                        className="p-2 text-gray-400 hover:text-var(--color-background) hover:bg-gray-700 rounded transition-colors"
                      >
                        <Eye className='h-4 w-4' />
                      </button>
                      <button
                        title='Settings'
                        className="p-2 text-gray-400 hover:text-var(--color-background) hover:bg-gray-700 rounded transition-colors"
                      >
                        <Settings className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleDeleteTournament(tournament.id, tournament.name)}
                        title='Delete tournament permanently'
                        disabled={isDeleting}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tournament Content */}
                <div className="p-6 space-y-4">
                  {/* Participants */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Users className='h-4 w-4 text-blue-400' />
                      <span className='text-sm text-gray-300'>Participants</span>
                    </div>
                    <span className='font-medium text-var(--color-background)'>
                      {tournament.current_participants}/{tournament.max_participants}
                    </span>
                  </div>

                  {/* Prize Pool */}
                  {tournament.prize_pool > 0 && (
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Trophy className='h-4 w-4 text-yellow-400' />
                        <span className='text-sm text-gray-300'>Prize Pool</span>
                      </div>
                      <span className='font-medium text-yellow-400'>
                        {formatCurrency(tournament.prize_pool)}
                      </span>
                    </div>
                  )}

                  {/* Entry Fee */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <DollarSign className='h-4 w-4 text-green-400' />
                      <span className='text-sm text-gray-300'>Entry Fee</span>
                    </div>
                    <span className='font-medium text-var(--color-background)'>
                      {tournament.entry_fee === 0
                        ? 'Free'
                        : formatCurrency(tournament.entry_fee)}
                    </span>
                  </div>

                  {/* Start Date */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-purple-400' />
                      <span className='text-sm text-gray-300'>Start Time</span>
                    </div>
                    <span className='text-sm text-gray-400'>
                      {formatDate(tournament.start_date)}
                    </span>
                  </div>

                  {/* Venue */}
                  {tournament.venue_address && (
                    <div className='flex items-start gap-2'>
                      <MapPin className='h-4 w-4 text-red-400 mt-0.5' />
                      <span className='text-sm text-gray-400 line-clamp-2'>
                        {tournament.venue_address}
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className="text-gray-300">Registration Progress</span>
                      <span className="text-gray-400">
                        {Math.round(
                          (tournament.current_participants / tournament.max_participants) * 100
                        )}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-primary-background0 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${Math.min((tournament.current_participants / tournament.max_participants) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Placeholder Modals - Would be implemented with proper tournament management components */}
        {isParticipantModalOpen && selectedTournament && (
          <div className="fixed inset-0 bg-var(--color-foreground)/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4">
              <h3 className="text-lg font-bold text-var(--color-background) mb-4">
                Manage Participants: {selectedTournament.name}
              </h3>
              <p className="text-gray-400 mb-4">
                Participant management functionality would be implemented here
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeParticipantModal}
                  className="px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {isQuickAddModalOpen && (
          <div className="fixed inset-0 bg-var(--color-foreground)/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-var(--color-background) mb-4">Quick Add User</h3>
              <p className="text-gray-400 mb-4">
                Quick add user functionality would be implemented here
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsQuickAddModalOpen(false)}
                  className="px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
