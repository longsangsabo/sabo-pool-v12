
import { SimpleCodeClaim } from '@/components/legacy/SimpleCodeClaim';

export default function ClaimCodePage() {
 return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
   <div className="w-full max-w-md">
    <div className="text-center mb-6">
     <h1 className="text-3xl font-bold text-neutral-900 mb-2">
      Claim SPA Points
     </h1>
     <p className="text-neutral-600">
      Nhập mã code để nhận điểm SPA
     </p>
    </div>
    
    <SimpleCodeClaim />
    
    <div className="mt-6 text-center text-body-small text-neutral-500">
     <p>Cần hỗ trợ? Liên hệ admin để được trợ giúp</p>
    </div>
   </div>
  </div>
 );
}
