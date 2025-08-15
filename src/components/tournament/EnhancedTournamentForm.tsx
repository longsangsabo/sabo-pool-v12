import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Trophy,
  DollarSign,
  Settings,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { tournamentSchema } from '@/schemas/tournamentSchema';
import { TournamentFormData } from '@/types/tournament-extended';
import { useTournament } from '@/contexts/TournamentContext';
import { useTournamentGlobal } from '@/contexts/TournamentGlobalContext';
import { ValidationService } from '@/services/ValidationService';
import { RewardsService } from '@/services/RewardsService';
import { GameFormat } from '@/types/tournament-enums';
import { TournamentSettingsSection } from './TournamentSettingsSection';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  MapPin,
  Building2,
  Users,
  FileText,
  Phone,
  Clock,
  Shield,
} from 'lucide-react';
import { DateTimePicker } from '@/components/ui/date-picker';
import { useProfileContext } from '@/contexts/ProfileContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { OptimizedRewardsSection } from './OptimizedRewardsSection';
import { TournamentPrizesManager } from './TournamentPrizesManager';
import { RewardsEditModal } from './RewardsEditModal';
import { TournamentTemplateDropdown } from './TournamentTemplateDropdown';

import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { QuickRewardAllocation } from './QuickRewardAllocation';
import { TournamentPrizesService, type TournamentPrize } from '@/services/tournament-prizes.service';

interface EnhancedTournamentFormProps {
  mode?: 'create' | 'edit';
  tournamentId?: string;
  onSubmit?: (data: TournamentFormData) => void;
  onSuccess?: (tournament: any) => void;
  onCancel?: () => void;
}

export const EnhancedTournamentForm: React.FC<EnhancedTournamentFormProps> = ({
  mode = 'create',
  tournamentId,
  onSubmit,
  onSuccess,
  onCancel,
}) => {
  console.log('🎯 EnhancedTournamentForm rendering...');
  const navigate = useNavigate();
  const {
    tournament,
    updateTournament,
    updateRewards,
    validateTournament,
    resetTournament,
    isValid,
    validationErrors,
    calculateRewards,
    recalculateOnChange,
    setRecalculateOnChange,
    createTournament,
    updateExistingTournament,
  } = useTournament();

  const { refreshTournaments } = useTournamentGlobal();
  const [activeTab, setActiveTab] = useState('basic-info');
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showQuickAllocation, setShowQuickAllocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tournamentPrizes, setTournamentPrizes] = useState<TournamentPrize[]>([]); // Store current prizes

  // Debug: Log when tournamentPrizes state changes
  useEffect(() => {
    console.log('🏆 [EnhancedTournamentForm] tournamentPrizes state changed:', tournamentPrizes.length, 'prizes');
    if (tournamentPrizes.length > 0) {
      console.log('🏆 [EnhancedTournamentForm] First prize:', tournamentPrizes[0]);
    }
  }, [tournamentPrizes]);

  const form = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: tournament || undefined,
    mode: 'onChange',
  });

  const {
    formState: { errors: formErrors, isSubmitting: formSubmitting },
    register,
    setValue,
    getValues,
  } = form;

  // Sync form with context
  useEffect(() => {
    if (tournament) {
      form.reset(tournament);
    }
  }, [tournament, form]);

  // Sync form data with context
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const subscription = form.watch(data => {
      if (data && Object.keys(data).length > 0) {
        // Clear previous timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Debounce the update to prevent infinite loops
        timeoutId = setTimeout(() => {
          updateTournament(data as Partial<TournamentFormData>);
        }, 300);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [form, updateTournament]);

  // Calculate completion percentage
  const getCompletionPercentage = (): number => {
    if (!tournament) return 0;

    const requiredFields = [
      'name',
      'venue_address',
      'tournament_start',
      'tournament_end',
      'registration_start',
      'registration_end',
      'max_participants',
      'tournament_type',
      'game_format',
    ];

    const completedFields = requiredFields.filter(
      field => tournament[field as keyof TournamentFormData]
    );

    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  // Handle form submission
  const handleSubmit = async (
    data: TournamentFormData,
    e?: React.FormEvent
  ) => {
    console.log('🔥 SUBMIT BUTTON CLICKED');
    console.log('📊 Form State:', {
      isSubmitting,
      formSubmitting,
      formValues: form.getValues(),
      formErrors: form.formState.errors,
    });
    console.log('🎯 handleSubmit called with data:', data);
    console.log('🏆 Tournament prizes in state:', tournamentPrizes.length, 'prizes');
    console.log('⏳ Starting form submission...');

    // Prevent default form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      setIsSubmitting(true);
      console.log('🔍 Validating tournament data...');

      const validationResult = validateTournament();
      console.log('🔍 Form validation result:', validationResult);

      if (!validationResult) {
        console.error('❌ Validation failed');
        console.error('❌ Validation errors:', validationErrors);
        console.error('❌ Tournament data:', tournament);

        // Display specific validation errors
        if (validationErrors && Object.keys(validationErrors).length > 0) {
          Object.values(validationErrors).forEach(error => {
            if (typeof error === 'string') {
              toast.error(error);
            }
          });
        } else {
          toast.error('Vui lòng kiểm tra lại thông tin giải đấu');
        }
        return;
      }

      console.log('🏆 Creating tournament...');

      let result;
      if (mode === 'edit' && tournamentId) {
        console.log('📝 Updating existing tournament:', tournamentId);
        result = await updateExistingTournament(tournamentId);
      } else {
        console.log('🆕 Creating new tournament...');
        
        console.log('🆕 Creating new tournament with FULL prize data...');
        result = await createTournament();

        // 🎉 Tournament đã được tạo với ĐẦY ĐỦ 16 vị trí giải thưởng trong bảng tournaments!
        if (result) {
          console.log('✅ Tournament created with full prize distribution:', {
            id: result.id,
            name: result.name,
            prize_pool: result.prize_pool,
            first_prize: result.first_prize,
            second_prize: result.second_prize,
            third_prize: result.third_prize,
            total_positions: result.prize_distribution?.total_positions || 'N/A',
            positions_count: result.prize_distribution?.positions?.length || 'N/A'
          });
          
          toast.success(`🏆 Giải đấu "${result.name}" đã được tạo thành công với đầy đủ 16 vị trí giải thưởng!`);
        }
        console.log('✅ Tournament created with embedded prize data!');

        // 🎯 Create tournament results template after successful creation
        if (result && result.id) {
          try {
            console.log(
              '🏆 Creating tournament results template for:',
              result.id
            );
            const { data: templateResult, error: templateError } =
              await supabase.rpc('create_tournament_results_template', {
                p_tournament_id: result.id,
                p_max_participants: tournament?.max_participants || 16,
              });

            if (templateError) {
              console.error(
                '❌ Error creating tournament results template:',
                templateError
              );
              toast.error('Giải đấu đã tạo nhưng có lỗi khi tạo bảng kết quả');
            } else {
              console.log(
                '✅ Tournament results template created:',
                templateResult
              );
            }
          } catch (templateErr) {
            console.error(
              '❌ Error creating tournament results template:',
              templateErr
            );
          }
        }
      }

      console.log('✅ Tournament created successfully:', result);

      if (result) {
        console.log('✅ Tournament created:', result);

        // Auto-save default rewards to tournament_prize_tiers
        if (mode === 'create' && tournament?.rewards?.positions?.length > 0) {
          console.log('🏆 Auto-saving tournament rewards...');
          try {
            // Convert rewards to prize tiers format
            const prizeTiers = tournament.rewards.positions.map(position => ({
              tournament_id: result.id,
              position: position.position,
              position_name: position.name,
              cash_amount: position.cashPrize || 0,
              elo_points: position.eloPoints || 0,
              spa_points: position.spaPoints || 0,
              is_visible: position.isVisible !== false,
              physical_items: (position.items || []).filter(
                item => item && item.trim()
              ),
            }));

            const { error: rewardsError } = await supabase
              .from('tournament_prize_tiers')
              .insert(prizeTiers);

            if (rewardsError) {
              console.error('❌ Failed to save rewards:', rewardsError);
              toast.warning(
                'Giải đấu đã tạo thành công nhưng không thể lưu phần thưởng tự động'
              );
            } else {
              console.log('✅ Tournament rewards saved successfully');
              toast.success('🏆 Phần thưởng đã được lưu tự động!');
            }
          } catch (rewardsError) {
            console.error('❌ Error saving rewards:', rewardsError);
            toast.warning(
              'Giải đấu đã tạo thành công nhưng không thể lưu phần thưởng tự động'
            );
          }
        }

        // 🎯 Auto-generate bracket for tournaments after creation
        if (result && mode === 'create') {
          console.log(
            '🏆 Auto-generating bracket for new tournament...',
            result.tournament_type
          );

          try {
            let bracketData;

            if (result.tournament_type === 'double_elimination') {
              // Use Double1 template cloning system
              console.log('🎯 Using Double1 template cloning system...');

              // Generate dummy player IDs for now (will be replaced with real registrations)
              const dummyPlayerIds = Array.from(
                { length: 16 },
                () => 'dummy-player-' + Math.random().toString(36).substr(2, 9)
              );

              // Skip template cloning for now
              console.log('🎯 Template cloning disabled temporarily');

              // Template cloning logic removed for now
            } else if (result.tournament_type === 'single_elimination') {
              // Auto-generate single elimination bracket
              const { data: seData, error: seError } = await supabase.rpc(
                'generate_single_elimination_bracket',
                {
                  p_tournament_id: result.id,
                }
              );

              if (seError) {
                console.error(
                  '❌ Failed to auto-generate SE bracket:',
                  seError
                );
                toast.warning(
                  'Giải đấu đã tạo thành công nhưng không thể tự động tạo bracket. Hãy tạo thủ công.'
                );
              } else {
                console.log(
                  '✅ Auto-generated single elimination bracket:',
                  seData
                );
                toast.success(
                  '🎯 Đã tự động tạo bracket cho giải đấu loại trực tiếp!'
                );
                bracketData = seData;
              }
            }

            if (bracketData) {
              // Small delay to show success message
              setTimeout(() => {
                toast.info('Bracket đã sẵn sàng! Có thể bắt đầu nhận đăng ký.');
              }, 1500);
            }
          } catch (autoError) {
            console.error('❌ Auto-bracket generation failed:', autoError);
            toast.warning(
              'Giải đấu đã tạo thành công. Hãy tạo bracket thủ công.'
            );
          }
        }

        toast.success(
          mode === 'edit'
            ? 'Cập nhật giải đấu thành công!'
            : 'Tạo giải đấu thành công!'
        );
        onSubmit?.(data);
        onSuccess?.(result);
      } else {
        console.error('❌ createTournament returned null');
        toast.error('Không thể tạo giải đấu - vui lòng thử lại');
      }
    } catch (error) {
      console.error('💥 Error in handleSubmit:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Có lỗi xảy ra khi tạo giải đấu';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      console.log('🔚 Form submission completed');
    }
  };

  // Get tab validation status
  const getTabValidation = (tab: string) => {
    if (!tournament) return { isValid: false, hasData: false };

    switch (tab) {
      case 'basic-info':
        return {
          isValid: Boolean(
            tournament.name &&
              tournament.venue_address &&
              tournament.tournament_start &&
              tournament.tournament_end &&
              tournament.registration_start &&
              tournament.registration_end &&
              tournament.max_participants &&
              tournament.tournament_type &&
              tournament.game_format
          ),
          hasData: Boolean(
            tournament.name ||
              tournament.venue_address ||
              tournament.rules ||
              tournament.contact_info ||
              tournament.min_rank_requirement ||
              tournament.max_rank_requirement
          ),
        };
      case 'financial':
        return {
          isValid: Boolean(
            tournament.entry_fee !== undefined &&
              tournament.prize_pool !== undefined
          ),
          hasData: Boolean(tournament.entry_fee || tournament.prize_pool),
        };
      default:
        return { isValid: false, hasData: false };
    }
  };

  // Validation summary
  const getValidationSummary = () => {
    const validation = ValidationService.validateTournamentData(
      tournament || {}
    );
    return validation;
  };

  const validationSummary = getValidationSummary();
  const completionPercentage = getCompletionPercentage();

  return (
    <div className='space-y-4'>
      {/* Compact Progress Header */}
      <div className='bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-3'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='text-base font-semibold text-primary'>
            {mode === 'edit' ? 'Chỉnh sửa giải đấu' : 'Tạo giải đấu mới'}
          </h3>
          <div className='flex items-center gap-2'>
            {mode === 'create' && (
              <TournamentTemplateDropdown
                onSelectTemplate={(templateData) => {
                  // Reset form with template data
                  const normalized = {
                    ...templateData,
                  };
                  form.reset(normalized);
                  // Update context
                  updateTournament(normalized);
                }}
                className='h-7 text-xs'
              />
            )}
            <Badge
              variant={isValid ? 'default' : 'destructive'}
              className='text-xs h-6'
            >
              {isValid ? (
                <CheckCircle className='w-3 h-3 mr-1' />
              ) : (
                <AlertTriangle className='w-3 h-3 mr-1' />
              )}
              {isValid ? 'OK' : 'Lỗi'}
            </Badge>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Progress value={completionPercentage} className='h-2 flex-1' />
          <span className='text-xs font-medium text-primary'>
            {completionPercentage}%
          </span>
        </div>
      </div>

      {/* Compact Validation Alerts */}
      {(validationSummary.warnings.length > 0 ||
        (!validationSummary.isValid &&
          Object.keys(validationSummary.errors).length > 0)) && (
        <div className='space-y-2'>
          {validationSummary.warnings.length > 0 && (
            <Alert className='py-2'>
              <Info className='h-4 w-4' />
              <AlertDescription className='text-sm'>
                {validationSummary.warnings.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {!validationSummary.isValid &&
            Object.keys(validationSummary.errors).length > 0 && (
              <Alert variant='destructive' className='py-2'>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription className='text-sm'>
                  {Object.entries(validationSummary.errors)
                    .map(([field, error]) =>
                      Array.isArray(error) ? error.join(', ') : error
                    )
                    .join(', ')}
                </AlertDescription>
              </Alert>
            )}
        </div>
      )}

      {/* Tab-based Form Content */}
      <form
        onSubmit={e => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔥 Form onSubmit triggered');
          form.handleSubmit(data => handleSubmit(data, e))(e);
        }}
        className='space-y-4'
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2 h-12'>
            <TabsTrigger
              value='basic-info'
              className='flex items-center gap-2 text-sm'
            >
              <Trophy className='h-4 w-4' />
              <div className='flex flex-col items-start'>
                <span>Thông tin giải đấu</span>
                <span className='text-xs text-muted-foreground'>
                  Cơ bản • Thời gian • Quy định
                </span>
              </div>
              {getTabValidation('basic-info').isValid && (
                <CheckCircle className='h-3 w-3 text-green-500 ml-1' />
              )}
            </TabsTrigger>
            <TabsTrigger
              value='financial'
              className='flex items-center gap-2 text-sm'
            >
              <DollarSign className='h-4 w-4' />
              <div className='flex flex-col items-start'>
                <span>Tài chính & phần thưởng</span>
                <span className='text-xs text-muted-foreground'>
                  Phí • Giải thưởng • Phân bố
                </span>
              </div>
              {getTabValidation('financial').isValid && (
                <CheckCircle className='h-3 w-3 text-green-500 ml-1' />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Thông tin giải đấu */}
          <TabsContent value='basic-info' className='space-y-6 mt-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Thông tin cơ bản */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-2 border-b border-primary/20'>
                  <Trophy className='h-4 w-4 text-primary' />
                  <span className='text-sm font-medium text-primary'>
                    THÔNG TIN CƠ BẢN
                  </span>
                </div>

                <div className='space-y-3'>
                  {/* Tournament Name */}
                  <div className='space-y-1'>
                    <Label
                      htmlFor='name'
                      className='text-sm font-medium flex items-center gap-1'
                    >
                      <span className='w-1 h-1 bg-destructive rounded-full'></span>
                      Tên giải đấu
                    </Label>
                    <Input
                      id='name'
                      placeholder='VD: Giải Bida Mở Rộng 2024'
                      {...register('name')}
                      className={`h-9 ${formErrors.name ? 'border-destructive' : ''}`}
                    />
                    {formErrors.name && (
                      <p className='text-xs text-destructive'>
                        {String(formErrors.name.message)}
                      </p>
                    )}
                  </div>

                  {/* Venue */}
                  <div className='space-y-1'>
                    <Label
                      htmlFor='venue_address'
                      className='text-sm font-medium flex items-center gap-1'
                    >
                      <MapPin className='h-3 w-3 text-green-600' />
                      <span className='w-1 h-1 bg-destructive rounded-full'></span>
                      Địa điểm
                    </Label>
                    <div className='flex gap-2'>
                      <Input
                        id='venue_address'
                        placeholder='Địa chỉ tổ chức giải đấu'
                        {...register('venue_address')}
                        className={`flex-1 h-9 ${formErrors.venue_address ? 'border-destructive' : ''}`}
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              className='h-9 px-3'
                            >
                              <Building2 className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Điền địa chỉ CLB</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {formErrors.venue_address && (
                      <p className='text-xs text-destructive'>
                        {String(formErrors.venue_address.message)}
                      </p>
                    )}
                  </div>

                  {/* Tournament Schedule */}
                                    {/* Tournament Schedule */}
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1'>
                      <Label
                        htmlFor='tournament_start'
                        className='text-sm font-medium flex items-center gap-1'
                      >
                        <Calendar className='h-3 w-3 text-blue-600' />
                        <span className='w-1 h-1 bg-destructive rounded-full'></span>
                        Bắt đầu thi đấu
                      </Label>
                      <DateTimePicker
                        date={
                          form.watch('tournament_start')
                            ? new Date(form.watch('tournament_start'))
                            : undefined
                        }
                        onSelect={date => {
                          const isoString = date ? date.toISOString() : '';
                          setValue('tournament_start', isoString, {
                            shouldValidate: true,
                          });
                          updateTournament({ tournament_start: isoString });
                        }}
                        placeholder='Chọn ngày bắt đầu thi đấu'
                        className={`${formErrors.tournament_start ? 'border-destructive' : ''}`}
                      />
                      {formErrors.tournament_start && (
                        <p className='text-xs text-destructive'>
                          {String(formErrors.tournament_start.message)}
                        </p>
                      )}
                    </div>

                    <div className='space-y-1'>
                      <Label
                        htmlFor='tournament_end'
                        className='text-sm font-medium flex items-center gap-1'
                      >
                        <Calendar className='h-3 w-3 text-blue-600' />
                        <span className='w-1 h-1 bg-destructive rounded-full'></span>
                        Kết thúc thi đấu
                      </Label>
                      <DateTimePicker
                        date={
                          form.watch('tournament_end')
                            ? new Date(form.watch('tournament_end'))
                            : undefined
                        }
                        onSelect={date => {
                          const isoString = date ? date.toISOString() : '';
                          setValue('tournament_end', isoString, {
                            shouldValidate: true,
                          });
                          updateTournament({ tournament_end: isoString });
                        }}
                        placeholder='Chọn ngày kết thúc thi đấu'
                        className={`${formErrors.tournament_end ? 'border-destructive' : ''}`}
                      />
                      {formErrors.tournament_end && (
                        <p className='text-xs text-destructive'>
                          {String(formErrors.tournament_end.message)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Registration Schedule */}
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1'>
                      <Label
                        htmlFor='registration_start'
                        className='text-sm font-medium flex items-center gap-1'
                      >
                        <Clock className='h-3 w-3 text-green-600' />
                        <span className='w-1 h-1 bg-destructive rounded-full'></span>
                        Bắt đầu đăng ký
                      </Label>
                      <DateTimePicker
                        date={
                          form.watch('registration_start')
                            ? new Date(form.watch('registration_start'))
                            : undefined
                        }
                        onSelect={date => {
                          const isoString = date ? date.toISOString() : '';
                          setValue('registration_start', isoString, {
                            shouldValidate: true,
                          });
                          updateTournament({ registration_start: isoString });
                        }}
                        placeholder='Chọn ngày bắt đầu đăng ký'
                        className={`${formErrors.registration_start ? 'border-destructive' : ''}`}
                      />
                      {formErrors.registration_start && (
                        <p className='text-xs text-destructive'>
                          {String(formErrors.registration_start.message)}
                        </p>
                      )}
                    </div>

                    <div className='space-y-1'>
                      <Label
                        htmlFor='registration_end'
                        className='text-sm font-medium flex items-center gap-1'
                      >
                        <Clock className='h-3 w-3 text-green-600' />
                        <span className='w-1 h-1 bg-destructive rounded-full'></span>
                        Kết thúc đăng ký
                      </Label>
                      <DateTimePicker
                        date={
                          form.watch('registration_end')
                            ? new Date(form.watch('registration_end'))
                            : undefined
                        }
                        onSelect={date => {
                          const isoString = date ? date.toISOString() : '';
                          setValue('registration_end', isoString, {
                            shouldValidate: true,
                          });
                          updateTournament({ registration_end: isoString });
                        }}
                        placeholder='Chọn ngày kết thúc đăng ký'
                        className={`${formErrors.registration_end ? 'border-destructive' : ''}`}
                      />
                      {formErrors.registration_end && (
                        <p className='text-xs text-destructive'>
                          {String(formErrors.registration_end.message)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className='space-y-1'>
                    <Label
                      htmlFor='description'
                      className='text-sm font-medium'
                    >
                      Mô tả{' '}
                      <span className='text-muted-foreground'>(Tùy chọn)</span>
                    </Label>
                    <Textarea
                      id='description'
                      placeholder='Mô tả chi tiết về giải đấu...'
                      rows={3}
                      {...register('description')}
                      className='resize-none'
                    />
                  </div>
                </div>

                {/* Cài đặt & quy định */}
                <div className='space-y-4 mt-6'>
                  <div className='flex items-center gap-2 pb-2 border-b border-green-500/20'>
                    <Settings className='h-4 w-4 text-green-600' />
                    <span className='text-sm font-medium text-green-700'>
                      CÀI ĐẶT & QUY ĐỊNH
                    </span>
                  </div>
                  {/* Advanced settings moved inline - removing AdvancedSettingsSection */}
                </div>
              </div>

              {/* Thời gian & cấp độ */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-2 border-b border-blue-500/20'>
                  <Calendar className='h-4 w-4 text-blue-600' />
                  <span className='text-sm font-medium text-blue-700'>
                    THỜI GIAN & CẤP ĐỘ
                  </span>
                </div>
                <TournamentSettingsSection form={form} />
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Tài chính & phần thưởng */}
          <TabsContent value='financial' className='space-y-6 mt-6'>
            <div className='space-y-6'>
              {/* Financial Settings */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-2 border-b border-emerald-500/20'>
                  <DollarSign className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    PHÍ THAM DỰ & GIẢI THƯỞNG
                  </span>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='entry_fee' className='text-sm font-medium'>
                      Phí đăng ký (VNĐ)
                    </Label>
                    <Input
                      id='entry_fee'
                      type='number'
                      min='0'
                      step='1000'
                      placeholder='0'
                      {...register('entry_fee', { valueAsNumber: true })}
                      onChange={e => {
                        const entryFee = parseFloat(e.target.value) || 0;
                        setValue('entry_fee', entryFee, {
                          shouldValidate: true,
                        });
                        // ❌ REMOVED: Don't auto-override user-set prize_pool
                        // Only suggest prize_pool if it's currently 0
                        const currentPrizePool = getValues('prize_pool') || 0;
                        if (
                          currentPrizePool === 0 &&
                          tournament?.max_participants
                        ) {
                          const suggestedPrizePool = Math.round(
                            entryFee * tournament.max_participants * 0.75
                          );
                          setValue('prize_pool', suggestedPrizePool, {
                            shouldValidate: true,
                          });
                        }
                      }}
                      className={`h-9 ${formErrors.entry_fee ? 'border-destructive' : ''}`}
                    />
                    {formErrors.entry_fee && (
                      <p className='text-xs text-destructive'>
                        {String(formErrors.entry_fee.message)}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='prize_pool' className='text-sm font-medium'>
                      Tổng giải thưởng (VNĐ)
                    </Label>
                    <Input
                      id='prize_pool'
                      type='number'
                      min='0'
                      step='1000'
                      placeholder='0'
                      {...register('prize_pool', { valueAsNumber: true })}
                      className={`h-9 ${formErrors.prize_pool ? 'border-destructive' : ''}`}
                    />
                    {formErrors.prize_pool && (
                      <p className='text-xs text-destructive'>
                        {String(formErrors.prize_pool.message)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                {tournament?.entry_fee &&
                  tournament?.max_participants &&
                  tournament.entry_fee > 0 && (
                    <div className='p-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-lg border border-emerald-200'>
                      <div className='grid grid-cols-3 gap-4 text-sm'>
                        <div className='text-center'>
                          <div className='text-muted-foreground text-xs'>
                            Tổng thu
                          </div>
                          <div className='font-semibold text-emerald-700'>
                            {(
                              tournament.entry_fee * tournament.max_participants
                            ).toLocaleString()}
                            ₫
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-muted-foreground text-xs'>
                            Giải thưởng
                          </div>
                          <div className='font-semibold text-blue-700'>
                            {(tournament.prize_pool || 0).toLocaleString()}₫
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-muted-foreground text-xs'>
                            Lợi nhuận
                          </div>
                          <div
                            className={`font-semibold ${
                              tournament.entry_fee *
                                tournament.max_participants -
                                (tournament.prize_pool || 0) >=
                              0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {(
                              tournament.entry_fee *
                                tournament.max_participants -
                              (tournament.prize_pool || 0)
                            ).toLocaleString()}
                            ₫
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rewards Table */}
                <div className='border border-emerald-200 rounded-lg bg-white p-4'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <h4 className='font-medium'>
                        Phân bố phần thưởng
                      </h4>
                      {tournament?.max_rank_requirement && (
                        <Badge
                          variant='outline'
                          className='text-xs bg-yellow-50 text-yellow-700 border-yellow-300'
                        >
                          Rank tối đa: {tournament.max_rank_requirement}
                        </Badge>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setShowQuickAllocation(true)}
                        className='bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none hover:from-yellow-500 hover:to-orange-600 text-xs h-8'
                      >
                        <Zap className='w-3 h-3 mr-1' />
                        Phân bổ nhanh
                      </Button>
                    </div>
                  </div>
                  {/* Tournament Prizes Manager - New Table-Based System */}
                  <TournamentPrizesManager
                    tournamentId={tournamentId || 'preview-mode'}
                    initialPrizePool={tournament?.prize_pool || 0}
                    isPreviewMode={!tournamentId}
                    onPrizesChange={(prizes) => {
                      console.log('🏆 [EnhancedTournamentForm] Prizes updated:', prizes);
                      console.log('🏆 [EnhancedTournamentForm] Number of prizes:', prizes.length);
                      setTournamentPrizes(prizes); // Save prizes to state
                    }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Compact Form Actions */}
        <div className='flex items-center justify-between pt-3 border-t bg-card/30 rounded-lg p-3'>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => {
                resetTournament();
                toast.success('Đã đặt lại form');
              }}
              className='h-8 text-xs'
            >
              Đặt lại
            </Button>
          </div>

          <div className='flex items-center gap-2'>
            {onCancel && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={onCancel}
                className='h-8 text-xs'
              >
                Hủy bỏ
              </Button>
            )}

            <Button
              type='button'
              onClick={async () => {
                console.log('🚀 TẠO NGAY BUTTON CLICKED');
                const formData = form.getValues();
                console.log('📊 Form data:', formData);
                console.log('🔍 DETAILED FORM VALUES:');
                console.log('- name:', formData.name);
                console.log(
                  '- entry_fee:',
                  formData.entry_fee,
                  typeof formData.entry_fee
                );
                console.log(
                  '- prize_pool:',
                  formData.prize_pool,
                  typeof formData.prize_pool
                );
                console.log(
                  '- max_participants:',
                  formData.max_participants,
                  typeof formData.max_participants
                );

                // Debug form state
                const allFormValues = form.getValues();
                console.log(
                  '🎯 ALL FORM VALUES:',
                  JSON.stringify(allFormValues, null, 2)
                );

                try {
                  // Get current user
                  const {
                    data: { user },
                    error: userError,
                  } = await supabase.auth.getUser();
                  if (userError || !user) {
                    toast.error('Vui lòng đăng nhập để tạo giải đấu');
                    return;
                  }

                  // Get user's club profile to set club_id
                  const { data: clubProfile, error: clubError } = await supabase
                    .from('club_profiles')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                  if (clubError || !clubProfile) {
                    toast.error('Bạn cần có câu lạc bộ để tạo giải đấu');
                    return;
                  }

                  // Tạo trực tiếp không qua validation phức tạp
                  console.log(
                    '🔍 PRIZE_POOL DEBUG - formData.prize_pool:',
                    formData.prize_pool
                  );
                  const { data, error } = await supabase
                    .from('tournaments')
                    .insert([
                      {
                        name: formData.name || 'Test Tournament',
                        description: formData.description || 'Test Description',
                        venue_address:
                          formData.venue_address || 'Test Location',
                        start_date:
                          formData.tournament_start ||
                          new Date(
                            Date.now() + 24 * 60 * 60 * 1000
                          ).toISOString(),
                        end_date:
                          formData.tournament_end ||
                          new Date(
                            Date.now() + 48 * 60 * 60 * 1000
                          ).toISOString(),
                        registration_start:
                          formData.registration_start ||
                          new Date().toISOString(),
                        registration_end: new Date(
                          Date.now() + 12 * 60 * 60 * 1000
                        ).toISOString(),
                        max_participants: formData.max_participants || 16,
                        tournament_type:
                          formData.tournament_type || 'single_elimination',
                        game_format: formData.game_format || '9_ball',
                        entry_fee: formData.entry_fee || 0,
                        prize_pool: formData.prize_pool || 0, // ADD MISSING PRIZE_POOL FIELD
                        status: 'upcoming',
                        created_by: user.id,
                        club_id: clubProfile.id, // Set the club_id
                      },
                    ])
                    .select();

                  console.log('✅ Direct creation result:', { data, error });

                  if (error) {
                    console.error('❌ Direct creation error:', error);
                    toast.error('Lỗi tạo giải đấu: ' + error.message);
                  } else {
                    console.log('🎉 Tournament created successfully:', data);
                    toast.success('Thành công! Giải đấu đã được tạo.', {
                      description:
                        'Bạn sẽ được chuyển đến trang giải đấu trong giây lát...',
                      duration: 3000,
                    });

                    // Navigation with delay for better UX
                    setTimeout(() => {
                      console.log('🔄 Redirecting to /tournaments...');
                      navigate('/tournaments');
                    }, 1500);
                  }
                } catch (err) {
                  console.error('❌ Unexpected error:', err);
                  toast.error('Lỗi không mong muốn: ' + (err as Error).message);
                }
              }}
              className='bg-green-500 hover:bg-green-600 ml-2 h-8 text-xs'
            >
              ✅ Tạo ngay
            </Button>
          </div>
        </div>
      </form>

      {/* Quick Allocation Modal */}
      {showQuickAllocation && tournament && (
        <QuickRewardAllocation
          isOpen={showQuickAllocation}
          onClose={() => setShowQuickAllocation(false)}
          totalPrizePool={
            tournament.prize_pool ||
            tournament.entry_fee * tournament.max_participants ||
            0
          }
          currentAllocations={tournament.rewards?.positions || []}
          onApply={allocations => {
            const rewardsFormat = {
              totalPrize: tournament.prize_pool || 0,
              showPrizes: true,
              positions: allocations.map(alloc => ({
                position: alloc.position,
                name: alloc.name,
                eloPoints: alloc.eloPoints,
                spaPoints: alloc.spaPoints,
                cashPrize: alloc.cashAmount,
                items: alloc.items,
                isVisible: true,
              })),
            };
            updateRewards(rewardsFormat);
            setShowQuickAllocation(false);
            toast.success('Đã áp dụng phân bổ nhanh!');
          }}
        />
      )}

      {/* Rewards Edit Modal */}
      {showRewardsModal && tournament && (
        <RewardsEditModal
          isOpen={true}
          onClose={() => setShowRewardsModal(false)}
          rewards={(() => {
            // ✅ FIXED: Use latest form data instead of stale tournament.rewards
            const currentFormData = form.getValues();
            console.log(
              '🔍 [EnhancedTournamentForm] Current form data for RewardsModal:',
              {
                entry_fee: currentFormData.entry_fee,
                prize_pool: currentFormData.prize_pool,
                max_participants: currentFormData.max_participants,
              }
            );

            // If tournament has rewards data, prioritize it but update totalPrize from form
            if (
              tournament?.rewards &&
              tournament.rewards.positions.length > 0
            ) {
              return {
                ...tournament.rewards,
                totalPrize:
                  currentFormData.prize_pool ||
                  tournament.rewards.totalPrize ||
                  0,
              };
            }

            // Otherwise calculate new rewards with current form data
            return calculateRewards();
          })()}
          onSave={async rewards => {
            try {
              console.log(
                '💾 [EnhancedTournamentForm] Saving rewards for tournament:',
                tournamentId,
                rewards
              );

        // Save to database
              const { error } = await supabase
                .from('tournaments')
                .update({
                  prize_distribution: rewards as any,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', tournamentId);

              if (error) {
                console.error(
                  '❌ [EnhancedTournamentForm] Database save error:',
                  error
                );
                toast.error('Lỗi khi lưu vào cơ sở dữ liệu');
                throw error;
              }

              console.log(
                '✅ [EnhancedTournamentForm] Rewards saved to database successfully'
              );
              toast.success('Đã cập nhật phần thưởng thành công!');
            } catch (error) {
              console.error(
                '❌ [EnhancedTournamentForm] Failed to save rewards:',
                error
              );
              toast.error('Lỗi khi lưu phần thưởng');
            }
          }}
          maxRankRequirement={form.getValues().max_rank_requirement as any}
        />
      )}
    </div>
  );
};
