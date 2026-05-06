import React, { useState } from 'react';
import { register } from '../../api/api';
import { User, Mail, Lock, RotateCcw, ShieldCheck, ArrowLeft, PawPrint } from 'lucide-react';
import SuccessScreen from '../../components/auth/SuccessScreen';
import ErrorMessage from '../../components/auth/ErrorMessage';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Owner');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, role);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SuccessScreen
      type={role}
    />
    );
  }

  return (
  /* Main Wrapper: Full viewport width and height, no rounded corners, no shadows */
  <div className="w-screen h-screen grid grid-cols-1 lg:grid-cols-2 bg-white overflow-hidden">
    
    {/* Left Side: Branding (Takes exactly 50% width on large screens) */}
    <div className="hidden lg:flex flex-col justify-between p-20 bg-[#6a79e0] text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 my-auto max-w-xl">
        <div className="mb-10 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30">
          <PawPrint size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-7xl font-black mb-8 leading-[1.05] tracking-tighter">
          Start your <br/> journey here.
        </h1>
        <p className="text-white/80 text-2xl leading-relaxed font-medium max-w-md">
          Join thousands of happy families who found their perfect furry companion.
        </p>
      </div>

      {/* Social Proof Section at Bottom */}
      <div className="relative z-10 flex items-center gap-6 p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 w-fit">
        <div className="flex -space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <img 
              key={i} 
              className="w-12 h-12 rounded-full border-4 border-[#6a79e0] object-cover" 
              src={`https://i.pravatar.cc/150?u=pet${i}`} 
              alt="User" 
            />
          ))}
        </div>
        <div>
          <p className="text-lg font-bold text-white">Join 5,000+ pet lovers</p>
          <p className="text-sm text-white/60">Verified adopters worldwide</p>
        </div>
      </div>
    </div>

    {/* Right Side: Registration Form (Takes exactly 50% width) */}
    <div className="flex items-center justify-center bg-white p-8 lg:p-24 overflow-y-auto">
      {/* Internal Constrain: Keeps the form from getting too wide on ultra-wide monitors */}
      <div className="w-full max-w-[480px]">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create an Account</h2>
          <p className="text-slate-500 mt-3 text-lg font-medium">Please enter your details below.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Role Toggle */}
          <div className="space-y-3">
            <p className="text-slate-700 text-xs uppercase tracking-[0.2em] font-black">I am a...</p>
            <div className="flex h-16 w-full items-center justify-center rounded-2xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => setRole('Adopter')}
                className={`flex grow items-center justify-center rounded-xl h-full text-sm font-bold transition-all duration-300 ${
                  role === 'Adopter' 
                  ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-[#6a79e0]' 
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Adopter
              </button>
              <button
                type="button"
                onClick={() => setRole('Owner')}
                className={`flex grow items-center justify-center rounded-xl h-full text-sm font-bold transition-all duration-300 ${
                  role === 'Owner' 
                  ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-[#6a79e0]' 
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Shelter/Owner
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-slate-800 text-sm font-bold ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6a79e0] transition-colors" size={20} />
                <input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 focus:border-[#6a79e0] focus:bg-white focus:ring-4 focus:ring-[#6a79e0]/10 outline-none transition-all" 
                  placeholder="John Doe" 
                  type="text" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-800 text-sm font-bold ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6a79e0] transition-colors" size={20} />
                <input 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 focus:border-[#6a79e0] focus:bg-white focus:ring-4 focus:ring-[#6a79e0]/10 outline-none transition-all" 
                  placeholder="john@example.com" 
                  type="email" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-slate-800 text-sm font-bold ml-1">Password</label>
                <input 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:border-[#6a79e0] focus:bg-white outline-none transition-all" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-800 text-sm font-bold ml-1">Confirm</label>
                <input 
                  name="confirmPassword" 
                  type="password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:border-[#6a79e0] focus:bg-white outline-none transition-all" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <ErrorMessage error={error} />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6a79e0] hover:bg-[#5868cc] text-white font-black text-lg py-5 rounded-2xl shadow-[0_12px_30px_rgba(106,121,224,0.4)] transition-all transform active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <p className="text-center text-slate-500 font-bold mt-8">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} type="button" className="text-[#6a79e0] hover:text-indigo-800 underline underline-offset-8 transition-colors">
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  </div>
);
};

export default Register;