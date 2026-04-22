import { ShieldCheck, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuccessScreen({ type }) {
  const isOwner = type === "Owner" || type === "owner";
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl p-8 shadow-2xl">
      <div className="w-20 h-20 bg-[#6a79e0]/10 rounded-full flex items-center justify-center mb-6">
        {isOwner 
          ? <ShieldCheck size={48} className="text-[#6a79e0]" />
          : <CheckCircle size={48} className="text-[#6a79e0]" />
        }
      </div>
      <h3 className="text-2xl font-bold text-[#2a2f63] mb-4">
        {isOwner ? 'Application Submitted!' : 'Account Created!'}
      </h3>
      <p className="text-slate-600 max-w-sm">
        {isOwner 
          ? 'Waiting for admin approval. You will receive an email once verified.'
          : 'Welcome to PetPal! You can now log in.'
        }
      </p>
      <button onClick={() => navigate('/login')} className="mt-8 text-[#6a79e0] font-bold hover:underline flex items-center gap-2">
        <ArrowLeft size={16} />
        {isOwner ? 'Wait for approval' : 'Go to Login'}
      </button>
    </div>
  );
}