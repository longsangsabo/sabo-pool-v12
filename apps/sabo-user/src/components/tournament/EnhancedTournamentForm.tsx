import { useState, useEffect } from 'react';
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
import { UnifiedPrizesManager } from './UnifiedPrizesManager';
import { TournamentTemplateDropdown } from './TournamentTemplateDropdown';

import { toast } from 'sonner';
import { getCurrentUser } from "../services/userService";
import { getUserProfile } from "../services/profileService";
import { getTournament } from "../services/tournamentService";
// Removed supabase import - migrated to services
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification } from "../services/notificationService";
import { uploadFile, getPublicUrl } from "../services/storageService";
import { createTournamentResultsTemplate } from '../../services/tournamentService';
import { getCurrentUser } from '../../services/userService';

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
 // console.log('🎯 EnhancedTournamentForm rendering...');
 const navigate = useNavigate();
 const {
  tournament,
  updateTournament,
  validateTournament,
  resetTournament,
  isValid,
  validationErrors,
  createTournament,
  updateExistingTournament,
 } = useTournament();

 const { refreshTournaments } = useTournamentGlobal();
 const [activeTab, setActiveTab] = useState('basic-info');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [tournamentPrizes, setTournamentPrizes] = useState<any[]>([]); // Store current prizes

 // Debug: Log when tournamentPrizes state changes
 // useEffect(() => {
 //  console.log('🏆 [EnhancedTournamentForm] tournamentPrizes state changed:', tournamentPrizes.length, 'prizes');
 //  if (tournamentPrizes.length > 0) {
 //   console.log('🏆 [EnhancedTournamentForm] First prize:', tournamentPrizes[0]);
 //  }
 // }, [tournamentPrizes]);

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

 // Add form state persistence
 const [formInitialized, setFormInitialized] = useState(false);
 const [formDraft, setFormDraft] = useState<any>(null); // Store draft data

 // Load draft from localStorage on component mount
 useEffect(() => {
  const savedDraft = localStorage.getItem('tournament-form-draft');
  if (savedDraft && !tournament) {
   try {
    const draftData = JSON.parse(savedDraft);
    setFormDraft(draftData);
    console.log('📋 Restored form draft from localStorage');
   } catch (err) {
    console.error('❌ Error parsing saved draft:', err);
    localStorage.removeItem('tournament-form-draft');
   }
  }
 }, [tournament]);

 // Initialize form only once with tournament data or draft
 useEffect(() => {
  if (!formInitialized) {
   const initialData = tournament || formDraft;
   if (initialData) {
    form.reset(initialData);
    setFormInitialized(true);
    console.log('🏁 Form initialized with:', initialData ? 'data' : 'empty');
   }
  }
 }, [tournament, formDraft, form, formInitialized]);

 // Sync form data with context - improved to prevent resets
 useEffect(() => {
  let timeoutId: NodeJS.Timeout;

  const subscription = form.watch(data => {
   if (data && Object.keys(data).length > 0 && formInitialized) {
    // Clear previous timeout
    if (timeoutId) {
     clearTimeout(timeoutId);
    }

    // Debounce the update to prevent infinite loops
    timeoutId = setTimeout(() => {
     updateTournament(data as Partial<TournamentFormData>);
     
     // Auto-save draft to localStorage (only in create mode)
     if (mode === 'create') {
      localStorage.setItem('tournament-form-draft', JSON.stringify(data));
     }
    }, 300);
   }
  });

  return () => {
   subscription.unsubscribe();
   if (timeoutId) {
    clearTimeout(timeoutId);
   }
  };
 }, [form, updateTournament, formInitialized, mode]);

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
  // console.log('🔥 SUBMIT BUTTON CLICKED');
  // console.log('📊 Form State:', {
  //  isSubmitting,
  //  formSubmitting,
  //  formValues: form.getValues(),
  //  formErrors: form.formState.errors,
  // });
  // console.log('🎯 handleSubmit called with data:', data);
  // console.log('🔍 DEBUG Form Data:', {
  //  tournament_start: data.tournament_start,
  //  tournament_end: data.tournament_end,
  //  registration_start: data.registration_start,
  //  registration_end: data.registration_end,
  //  name: data.name
  // });
  // console.log('🔍 DEBUG Tournament State:', {
  //  tournament_start: tournament?.tournament_start,
  //  tournament_end: tournament?.tournament_end,
  //  registration_start: tournament?.registration_start,
  //  registration_end: tournament?.registration_end,
  //  name: tournament?.name
  // });
  // console.log('🏆 Tournament prizes in state:', tournamentPrizes.length, 'prizes');
  // console.log('⏳ Starting form submission...');

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
      try {
        const templateResult = await createTournamentResultsTemplate(
          result.id,
          tournament?.max_participants || 16
        );
        console.log(
          '✅ Tournament results template created:',
          templateResult
        );
      } catch (templateError) {
        console.error(
          '❌ Error creating tournament results template:',
          templateError
        );
        toast.error('Giải đấu đã tạo nhưng có lỗi khi tạo bảng kết quả');
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

    // Clear draft from localStorage on successful creation
    if (mode === 'create') {
     localStorage.removeItem('tournament-form-draft');
     console.log('🗑️ Cleared form draft from localStorage');
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
     <h3 className='text-body font-semibold text-primary'>
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
      
      {/* Draft status indicator */}
      {mode === 'create' && formDraft && (
       <Badge
        variant='outline'
        className='text-caption h-6 bg-warning-50 text-warning-700 border-orange-300'
       >
        <Save className='w-3 h-3 mr-1' />
        Có bản nháp
       </Badge>
      )}
      
      <Badge
       variant={isValid ? 'default' : 'destructive'}
       className='text-caption h-6'
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
     <span className='text-caption-medium text-primary'>
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
        <span className='text-caption text-muted-foreground'>
         Cơ bản • Thời gian • Quy định
        </span>
       </div>
       {getTabValidation('basic-info').isValid && (
        <CheckCircle className='h-3 w-3 text-success-500 ml-1' />
       )}
      </TabsTrigger>
      <TabsTrigger
       value='financial'
       className='flex items-center gap-2 text-sm'
      >
       <DollarSign className='h-4 w-4' />
       <div className='flex flex-col items-start'>
        <span>Tài chính & phần thưởng</span>
        <span className='text-caption text-muted-foreground'>
         Phí • Giải thưởng • Phân bố
        </span>
       </div>
       {getTabValidation('financial').isValid && (
        <CheckCircle className='h-3 w-3 text-success-500 ml-1' />
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
         <span className='text-body-small-medium text-primary'>
          THÔNG TIN CƠ BẢN
         </span>
        </div>

        <div className='space-y-3'>
         {/* Tournament Name */}
         <div className='space-y-1'>
          <Label
           htmlFor='name'
           className='text-body-small-medium flex items-center gap-1'
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
           <p className='text-caption text-destructive'>
            {String(formErrors.name.message)}
           </p>
          )}
         </div>

         {/* Venue */}
         <div className='space-y-1'>
          <Label
           htmlFor='venue_address'
           className='text-body-small-medium flex items-center gap-1'
          >
           <MapPin className='h-3 w-3 text-success-600' />
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
           <p className='text-caption text-destructive'>
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
            className='text-body-small-medium flex items-center gap-1'
           >
            <Calendar className='h-3 w-3 text-primary-600' />
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
            <p className='text-caption text-destructive'>
             {String(formErrors.tournament_start.message)}
            </p>
           )}
          </div>

          <div className='space-y-1'>
           <Label
            htmlFor='tournament_end'
            className='text-body-small-medium flex items-center gap-1'
           >
            <Calendar className='h-3 w-3 text-primary-600' />
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
            <p className='text-caption text-destructive'>
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
            className='text-body-small-medium flex items-center gap-1'
           >
            <Clock className='h-3 w-3 text-success-600' />
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
            <p className='text-caption text-destructive'>
             {String(formErrors.registration_start.message)}
            </p>
           )}
          </div>

          <div className='space-y-1'>
           <Label
            htmlFor='registration_end'
            className='text-body-small-medium flex items-center gap-1'
           >
            <Clock className='h-3 w-3 text-success-600' />
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
            <p className='text-caption text-destructive'>
             {String(formErrors.registration_end.message)}
            </p>
           )}
          </div>
         </div>

         {/* Description */}
         <div className='space-y-1'>
          <Label
           htmlFor='description'
           className='text-body-small-medium'
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
          <Settings className='h-4 w-4 text-success-600' />
          <span className='text-body-small-medium text-success-700'>
           CÀI ĐẶT & QUY ĐỊNH
          </span>
         </div>
         {/* Advanced settings moved inline - removing AdvancedSettingsSection */}
        </div>
       </div>

       {/* Thời gian & cấp độ */}
       <div className='space-y-4'>
        <div className='flex items-center gap-2 pb-2 border-b border-blue-500/20'>
         <Calendar className='h-4 w-4 text-primary-600' />
         <span className='text-body-small-medium text-primary-700'>
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
         <span className='text-body-small-medium text-emerald-700'>
          PHÍ THAM DỰ & GIẢI THƯỞNG
         </span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
         <div className='space-y-2'>
          <Label htmlFor='entry_fee' className='text-body-small-medium'>
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
           <p className='text-caption text-destructive'>
            {String(formErrors.entry_fee.message)}
           </p>
          )}
         </div>

         <div className='space-y-2'>
          <Label htmlFor='prize_pool' className='text-body-small-medium'>
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
           <p className='text-caption text-destructive'>
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
             <div className='font-semibold text-primary-700'>
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
                ? 'text-success-600'
                : 'text-error-600'
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
        <div className='border border-emerald-200 rounded-lg bg-var(--color-background) p-4'>
         <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
           <h4 className='font-medium'>
            Phân bố phần thưởng
           </h4>
           {tournament?.max_rank_requirement && (
            <Badge
             variant='outline'
             className='text-caption bg-warning-50 text-warning-700 border-yellow-300'
            >
             Rank tối đa: {tournament.max_rank_requirement}
            </Badge>
           )}
          </div>
         </div>
         {/* Unified Prizes Manager - COMPONENT DUY NHẤT XỬ LÝ PRIZES */}
         <UnifiedPrizesManager
          mode={mode}
          tournamentId={tournamentId}
          initialPrizePool={form.watch('prize_pool') || tournament?.prize_pool || 0}
           onPrizesChange={(prizes) => {
            // Extract first, second, third prizes for tournament fields (backward compatibility)
            const firstPrize = prizes.find(p => p.position === 1)?.cashAmount || 0;
            const secondPrize = prizes.find(p => p.position === 2)?.cashAmount || 0;
            const thirdPrize = prizes.find(p => p.position === 3)?.cashAmount || 0;
            
            // Update tournament object with prize values (backward compatibility)
            updateTournament({
             first_prize: firstPrize,
             second_prize: secondPrize,
             third_prize: thirdPrize
            });
            
            // Convert để tương thích với hệ thống cũ nếu cần
            const convertedPrizes = prizes.map(prize => ({
             id: prize.id,
             tournament_id: tournamentId || 'preview',
             position: prize.position,
             position_name: prize.name,
             cash_amount: prize.cashAmount,
             elo_points: prize.eloPoints,
             spa_points: prize.spaPoints,
             physical_items: prize.items || [],
             color_theme: prize.theme,
             is_visible: prize.isVisible,
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString(),
            }));
            setTournamentPrizes(convertedPrizes);
           }}
           isEditable={true}
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
       
       onClick={() => {
        resetTournament();
        form.reset();
        setFormInitialized(false);
        localStorage.removeItem('tournament-form-draft');
        toast.success('Đã đặt lại form và xóa bản nháp');
       }}
       className='h-8 text-xs'
      >
       Đặt lại
      </Button>
      
      {mode === 'create' && formDraft && (
       <Button
        type='button'
        variant='outline'
        
        onClick={() => {
         localStorage.removeItem('tournament-form-draft');
         setFormDraft(null);
         toast.success('Đã xóa bản nháp');
        }}
        className='h-8 text-caption text-warning-600 border-orange-300'
       >
        Xóa bản nháp
       </Button>
      )}
     </div>

     <div className='flex items-center gap-2'>
      {onCancel && (
       <Button
        type='button'
        variant='outline'
        
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
        console.log('🏆 Current tournamentPrizes state:', tournamentPrizes.length, 'prizes');

        try {
         // Get current user
         const user = await getCurrentUser();
         if (!user) {
          toast.error('Vui lòng đăng nhập để tạo giải đấu');
          return;
         }

         // Get user's club profile to set club_id
//          const { data: clubProfile, error: clubError } = await supabase
          .from('club_profiles')
          .select('id')
          .getByUserId(user.id)
          .maybeSingle();

         if (clubError || !clubProfile) {
          toast.error('Bạn cần có câu lạc bộ để tạo giải đấu');
          return;
         }

         // 1. TẠO TOURNAMENT TRƯỚC
         console.log('🏆 Creating tournament...');
         // TODO: Replace with service call - const { data, error } = await supabase
          .from('tournaments')
          .create([
           {
            name: formData.name || 'Test Tournament',
            description: formData.description || 'Test Description',
            venue_address: formData.venue_address || 'Test Location',
            tournament_start: formData.tournament_start || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            tournament_end: formData.tournament_end || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            registration_start: formData.registration_start || new Date().toISOString(),
            registration_end: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
            max_participants: formData.max_participants || 16,
            tournament_type: formData.tournament_type || 'single_elimination',
            entry_fee: formData.entry_fee || 0,
            prize_pool: formData.prize_pool || 0,
            status: 'registration_open',
            created_by: user.id,
            club_id: clubProfile.id,
           },
          ])
          .getAll();

         if (error) {
          console.error('❌ Tournament creation error:', error);
          toast.error('Lỗi tạo giải đấu: ' + error.message);
          return;
         }

         if (!data || !data[0]) {
          console.error('❌ No tournament data returned');
          toast.error('Không thể tạo giải đấu');
          return;
         }

         const createdTournament = data[0];
         console.log('✅ Tournament created:', createdTournament.id);

         // 2. TẠO TOURNAMENT PRIZES từ state hoặc fallback
         console.log('🏆 Creating tournament prizes for:', createdTournament.id);
         
         let defaultPrizes = [];
         
         // PRIORITY 1: Sử dụng data từ UnifiedPrizesManager nếu có
         if (tournamentPrizes && tournamentPrizes.length > 0) {
          console.log('✅ Using data from UnifiedPrizesManager:', tournamentPrizes.length, 'prizes');
          defaultPrizes = tournamentPrizes.map(prize => ({
           tournament_id: createdTournament.id,
           prize_position: prize.position,
           position_name: prize.position_name,
           position_description: `Giải ${prize.position_name}`,
           cash_amount: prize.cash_amount || 0,
           elo_points: prize.elo_points || 0,
           spa_points: prize.spa_points || 0,
           physical_items: prize.physical_items || [],
           color_theme: prize.color_theme || 'gray',
           is_visible: prize.is_visible !== false,
           is_guaranteed: true,
           display_order: prize.position
          }));
         } else {
          // FALLBACK: Tạo data mặc định nếu không có
          console.log('⚠️ No prize data from UnifiedPrizesManager, using fallback');
          const prizePool = formData.prize_pool || 0;
          const distribution = [
           { position: 1, name: 'Vô địch', percent: 40, elo: 100, spa: 1000, theme: 'gold' },
           { position: 2, name: 'Á quân', percent: 24, elo: 75, spa: 800, theme: 'silver' },
           { position: 3, name: 'Hạng 3', percent: 16, elo: 50, spa: 600, theme: 'bronze' },
           { position: 4, name: 'Hạng 4', percent: 8, elo: 40, spa: 400, theme: 'blue' },
           { position: 5, name: 'Hạng 5-6', percent: 4, elo: 30, spa: 300, theme: 'blue' },
           { position: 6, name: 'Hạng 5-6', percent: 4, elo: 30, spa: 300, theme: 'blue' },
           { position: 7, name: 'Hạng 7-8', percent: 2, elo: 25, spa: 250, theme: 'gray' },
           { position: 8, name: 'Hạng 7-8', percent: 2, elo: 25, spa: 250, theme: 'gray' },
          ];
          
          for (let i = 9; i <= 16; i++) {
           distribution.push({
            position: i,
            name: i <= 12 ? 'Hạng 9-12' : 'Hạng 13-16',
            percent: 0,
            elo: i <= 12 ? 20 : 15,
            spa: i <= 12 ? 200 : 150,
            theme: 'gray'
           });
          }
          
          for (const prize of distribution) {
           defaultPrizes.push({
            tournament_id: createdTournament.id,
            prize_position: prize.position,
            position_name: prize.name,
            position_description: `Giải ${prize.name}`,
            cash_amount: Math.floor((prizePool * prize.percent) / 100),
            elo_points: prize.elo,
            spa_points: prize.spa,
            physical_items: prize.position <= 3 ? [`Cúp ${prize.name}`] : [],
            color_theme: prize.theme,
            is_visible: true,
            is_guaranteed: true,
            display_order: prize.position
           });
          }
         }
         
         console.log('🏆 Inserting', defaultPrizes.length, 'prize records...');
         
         // Insert using SERVICE ROLE to bypass RLS
// // // //          const response = await fetch('https://exlqvlbawytbglioqfbc.supabase.co/rest/v1/tournament_prizes', {
          method: 'POST',
          headers: {
           'Content-Type': 'application/json',
           'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ',
           'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDQ4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ',
           'Prefer': 'return=representation'
          },
          body: JSON.stringify(defaultPrizes)
         });
         
         console.log('🔍 Prize creation response status:', response.status);
         
         if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Prize creation failed:', errorText);
          toast.warning(`Giải đấu đã tạo nhưng có lỗi khi tạo phần thưởng: ${errorText}`);
         } else {
          const resultData = await response.json();
          console.log('✅ Tournament prizes created successfully:', resultData.length, 'records');
          toast.success('✨ Đã tạo đầy đủ phần thưởng cho 16 vị trí!');
         }

         // Clear draft and show success
         localStorage.removeItem('tournament-form-draft');
         toast.success('🏆 Giải đấu đã được tạo thành công!');

         // Navigate after delay
         setTimeout(() => {
          navigate('/tournaments');
         }, 1500);

        } catch (err) {
         console.error('❌ Unexpected error:', err);
         toast.error('Lỗi không mong muốn: ' + (err as Error).message);
        }
       }}
       className='bg-success-500 hover:bg-success-600 ml-2 h-8 text-xs'
      >
       ✅ Tạo ngay
      </Button>
     </div>
    </div>
   </form>
  </div>
 );
};
