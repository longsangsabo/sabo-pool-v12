import { useState, useEffect } from 'react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, X } from 'lucide-react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
import { submitRankVerificationRequest } from '../services/verificationService';
// Removed supabase import - migrated to services
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification } from "../services/notificationService";
import { uploadFile, getPublicUrl } from "../services/storageService";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ClubProfile {
 id: string;
 club_name: string;
 address: string;
 verification_status: string;
}

interface EvidenceFile {
 id: string;
 name: string;
 url: string;
 file?: File;
}

const RankRegistration: React.FC = () => {
 const { user } = useAuth();
 const { toast } = useToast();
 const [clubs, setClubs] = useState<ClubProfile[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [isLoadingClubs, setIsLoadingClubs] = useState(true);
 const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
 const [isUploading, setIsUploading] = useState(false);
 const [selectedRank, setSelectedRank] = useState('');
 const [selectedClub, setSelectedClub] = useState('');

 const ranks = [
  { value: 'K', label: 'Hạng K (1000 ELO)' },
  { value: 'K+', label: 'Hạng K+ (1100 ELO)' },
  { value: 'I', label: 'Hạng I (1200 ELO)' },
  { value: 'I+', label: 'Hạng I+ (1300 ELO)' },
  { value: 'H', label: 'Hạng H (1400 ELO)' },
  { value: 'H+', label: 'Hạng H+ (1500 ELO)' },
  { value: 'G', label: 'Hạng G (1600 ELO)' },
  { value: 'G+', label: 'Hạng G+ (1700 ELO)' },
  { value: 'F', label: 'Hạng F (1800 ELO)' },
  { value: 'F+', label: 'Hạng F+ (1900 ELO)' },
  { value: 'E', label: 'Hạng E (2000 ELO)' },
  { value: 'E+', label: 'Hạng E+ (2100 ELO)' },
 ];

 const fetchClubs = async () => {
  try {
   setIsLoadingClubs(true);
   console.log('Fetching clubs...');

   // Query club_profiles table with approved status
//    const { data: clubProfiles, error: clubError } = await supabase
    .from('club_profiles')
    .select('id, club_name, address, verification_status')
    .eq('verification_status', 'approved')
    .limit(10);

   if (clubError) {
    console.error('Error fetching approved clubs:', clubError);
    
    // Fallback: get all club profiles
    console.log('No approved clubs found, trying all club profiles...');
//     const { data: allClubProfiles, error: allError } = await supabase
     .from('club_profiles')
     .select('id, club_name, address, verification_status')
     .limit(10);

    if (allError) {
     console.error('Error fetching all club profiles:', allError);
     throw allError;
    }

    console.log('All club profiles found:', allClubProfiles?.length || 0);
    setClubs(allClubProfiles || []);
   } else {
    console.log('Approved club profiles found:', clubProfiles?.length || 0);
    setClubs(clubProfiles || []);
   }
  } catch (error) {
   console.error('Error fetching clubs:', error);
   toast({
    title: 'Lỗi',
    description: 'Không thể tải danh sách câu lạc bộ. Vui lòng thử lại.',
    variant: 'destructive',
   });
   setClubs([]);
  } finally {
   setIsLoadingClubs(false);
  }
 };

 useEffect(() => {
  fetchClubs();
 }, []);

 const handleFileUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
 ) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  setIsUploading(true);

  try {
   const uploadedFiles: EvidenceFile[] = [];

   for (const file of Array.from(files)) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `evidence/${fileName}`;

// // //     const { error: uploadError } = // TODO: Replace with service call - await // TODO: Replace with service call - supabase.storage
     .from('evidence')
     .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
     data: { publicUrl },
    } = storageService.upload('evidence').getPublicUrl(filePath);

    uploadedFiles.push({
     id: Math.random().toString(),
     name: file.name,
     url: publicUrl,
     file: file,
    });
   }

   setEvidenceFiles(prev => [...prev, ...uploadedFiles]);
   toast({
    title: 'Thành công',
    description: `Đã tải lên ${uploadedFiles.length} file minh chứng.`,
   });
  } catch (error) {
   console.error('Error uploading files:', error);
   toast({
    title: 'Lỗi',
    description: 'Không thể tải lên file. Vui lòng thử lại.',
    variant: 'destructive',
   });
  } finally {
   setIsUploading(false);
  }
 };

 const removeFile = (fileId: string) => {
  setEvidenceFiles(prev => prev.filter(file => file.id !== fileId));
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!user?.id) {
   toast({
    title: 'Lỗi',
    description: 'Vui lòng đăng nhập để sử dụng tính năng này.',
    variant: 'destructive',
   });
   return;
  }

  if (!selectedRank || !selectedClub) {
   toast({
    title: 'Lỗi',
    description: 'Vui lòng chọn hạng và câu lạc bộ.',
    variant: 'destructive',
   });
   return;
  }

  setIsLoading(true);

  try {
// // //    // TODO: Replace with service call - const { error } = // TODO: Replace with service call - await // TODO: Replace with service call - supabase.from('rank_requests').create({
    user_id: user.id,
    requested_rank: selectedRank,
    club_id: selectedClub,
    evidence_files: evidenceFiles as any,
    status: 'pending',
   });

   if (error) {
    console.error('Error submitting rank request:', error);
    throw error;
   }

   toast({
    title: 'Thành công',
    description:
     'Đã gửi yêu cầu xác nhận hạng. Câu lạc bộ sẽ xem xét và phản hồi sớm.',
   });

   // Reset form
   setSelectedRank('');
   setSelectedClub('');
   setEvidenceFiles([]);
  } catch (error) {
   console.error('Error submitting rank request:', error);
   toast({
    title: 'Lỗi',
    description: 'Không thể gửi yêu cầu. Vui lòng thử lại.',
    variant: 'destructive',
   });
  } finally {
   setIsLoading(false);
  }
 };

 if (!user) {
  return (
   <Card className='max-w-2xl mx-auto'>
    <CardHeader>
     <CardTitle>Đăng ký xác nhận hạng</CardTitle>
    </CardHeader>
    <CardContent>
     <Alert>
      <AlertCircle className='h-4 w-4' />
      <AlertDescription>
       Bạn cần đăng nhập để sử dụng tính năng này.
      </AlertDescription>
     </Alert>
    </CardContent>
   </Card>
  );
 }

 return (
  <Card className='max-w-2xl mx-auto'>
   <CardHeader>
    <CardTitle>Đăng ký xác nhận hạng</CardTitle>
   </CardHeader>
   <CardContent>
    <form onSubmit={handleSubmit} className='space-y-6'>
     {/* Rank Selection */}
     <div className='space-y-2'>
      <Label htmlFor='rank'>Hạng muốn xác nhận *</Label>
      <Select value={selectedRank} onValueChange={setSelectedRank}>
       <SelectTrigger>
        <SelectValue placeholder='Chọn hạng' />
       </SelectTrigger>
       <SelectContent>
        {ranks.map(rank => (
         <SelectItem key={rank.value} value={rank.value}>
          {rank.label}
         </SelectItem>
        ))}
       </SelectContent>
      </Select>
     </div>

     {/* Club Selection */}
     <div className='space-y-2'>
      <Label htmlFor='club'>Câu lạc bộ xác nhận *</Label>
      <Select
       value={selectedClub}
       onValueChange={setSelectedClub}
       disabled={isLoadingClubs}
      >
       <SelectTrigger>
        <SelectValue
         placeholder={
          isLoadingClubs ? 'Đang tải...' : 'Chọn câu lạc bộ'
         }
        />
       </SelectTrigger>
       <SelectContent>
        {clubs.length === 0 && !isLoadingClubs && (
         <SelectItem value='' disabled>
          Không có câu lạc bộ nào
         </SelectItem>
        )}
        {clubs.map(club => (
         <SelectItem key={club.id} value={club.id}>
          {club.club_name} - {club.address}
         </SelectItem>
        ))}
       </SelectContent>
      </Select>
      {clubs.length === 0 && !isLoadingClubs && (
       <p className='text-body-small text-muted-foreground'>
        Chưa có câu lạc bộ nào có thể xác nhận hạng. Vui lòng liên hệ
        admin.
       </p>
      )}
     </div>

     {/* Evidence Upload */}
     <div className='space-y-2'>
      <Label htmlFor='evidence'>Minh chứng (tùy chọn)</Label>
      <div className='border-2 border-dashed border-neutral-300 rounded-lg p-4'>
       <input
        type='file'
        multiple
        accept='image/*,.pdf'
        onChange={handleFileUpload}
        className='hidden'
        id='evidence-upload'
        disabled={isUploading}
       />
       <label
        htmlFor='evidence-upload'
        className={`flex flex-col items-center justify-center cursor-pointer ${
         isUploading ? 'opacity-50' : ''
        }`}
       >
        <Upload className='w-8 h-8 text-gray-400 mb-2' />
        <span className='text-body-small-neutral'>
         {isUploading ? 'Đang tải lên...' : 'Tải lên hình ảnh hoặc PDF'}
        </span>
       </label>
      </div>

      {evidenceFiles.length > 0 && (
       <div className='space-y-2'>
        <Label>Files đã tải lên:</Label>
        {evidenceFiles.map(file => (
         <div
          key={file.id}
          className='flex items-center justify-between p-2 bg-neutral-50 rounded'
         >
          <span className='text-body-small truncate'>{file.name}</span>
          <Button
           type='button'
           variant='ghost'
           
           onClick={() => removeFile(file.id)}
           className='h-6 w-6 p-0'
          >
           <X className='w-4 h-4' />
          </Button>
         </div>
        ))}
       </div>
      )}
     </div>

     {/* Submit Button */}
     <Button
      type='submit'
      className='w-full'
      disabled={
       isLoading || !selectedRank || !selectedClub || isLoadingClubs
      }
     >
      {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu xác nhận'}
     </Button>
    </form>
   </CardContent>
  </Card>
 );
};

export default RankRegistration;
