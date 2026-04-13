import React, { useState } from 'react';
import { User, Mail, Lock, RotateCcw, ShieldCheck, ArrowLeft, PawPrint } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('Shelter'); // 'Adopter' or 'Shelter'
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'Shelter') {
      setSubmitted(true);
    } else {
      alert('Adopter registration submitted!');
      console.log('Adopter Data:', formData);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-500 bg-white rounded-xl p-8 shadow-2xl">
        <div className="w-20 h-20 bg-[#6a79e0]/10 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={48} className="text-[#6a79e0]" />
        </div>
        <h3 className="text-2xl font-bold text-[#2a2f63] mb-4">Thank you for registering!</h3>
        <p className="text-slate-600 leading-relaxed max-w-sm">
          We are waiting now for approval from the admin. <br /> 
          You will receive an email once your account is verified.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-8 text-[#6a79e0] font-bold hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Return to Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-xl overflow-hidden shadow-2xl shadow-[#6a79e0]/5 mx-auto">
      
      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#6a79e0] text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-6 leading-tight">Start your journey to a new best friend.</h1>
          <p className="text-white/80 text-lg leading-relaxed font-medium">
            Join thousands of happy families who found their perfect furry companion through PetPal.
          </p>
        </div>

        {/* Decorative Paw Icon */}
        <div className="absolute bottom-[-50px] right-[-50px] opacity-20 transform rotate-12">
          <PawPrint size={300} strokeWidth={1} />
        </div>

        <div className="relative z-10 mt-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <img 
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-[#6a79e0] brightness-110 object-cover" 
                  src={`https://i.pravatar.cc/150?u=${i}`} 
                  alt="User" 
                />
              ))}
            </div>
            <span className="text-sm font-semibold">Join 5,000+ pet lovers</span>
          </div>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="p-8 lg:p-12 border border-slate-200 rounded-3xl">
        <div className="mb-8 text-left">
          <h2 className="text-2xl font-bold text-[#2a2f63]">Create an Account</h2>
          <p className="text-slate-500 mt-1">Fill in your details to get started.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {/* Role Selection */}
          <div className="space-y-2">
            <p className="text-[#2a2f63] text-sm font-bold">I am a...</p>
            <div className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setRole('Adopter')}
                className={`flex grow items-center justify-center rounded-lg h-full text-sm font-bold transition-all ${
                  role === 'Adopter' 
                  ? 'bg-white shadow-sm text-[#6a79e0]' 
                  : 'text-slate-500'
                }`}
              >
                Adopter
              </button>
              <button
                type="button"
                onClick={() => setRole('Shelter')}
                className={`flex grow items-center justify-center rounded-lg h-full text-sm font-bold transition-all ${
                  role === 'Shelter' 
                  ? 'bg-white shadow-sm text-[#6a79e0]' 
                  : 'text-slate-500'
                }`}
              >
                Shelter/Owner
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#2a2f63]">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a79e0]/60 group-focus-within:text-[#6a79e0]" size={20} />
              <input 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-[#6a79e0] focus:ring-2 focus:ring-[#6a79e0]/20 outline-none transition-all" 
                placeholder="John Doe" 
                type="text" 
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#2a2f63]">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a79e0]/60 group-focus-within:text-[#6a79e0]" size={20} />
              <input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-[#6a79e0] focus:ring-2 focus:ring-[#6a79e0]/20 outline-none transition-all" 
                placeholder="john@example.com" 
                type="email" 
                required
              />
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#2a2f63]">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a79e0]/60 group-focus-within:text-[#6a79e0]" size={20} />
                <input 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-[#6a79e0] focus:ring-2 focus:ring-[#6a79e0]/20 outline-none transition-all" 
                  placeholder="••••••••" 
                  type="password" 
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#2a2f63]">Confirm</label>
              <div className="relative group">
                <RotateCcw className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a79e0]/60 group-focus-within:text-[#6a79e0]" size={20} />
                <input 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-[#6a79e0] focus:ring-2 focus:ring-[#6a79e0]/20 outline-none transition-all" 
                  placeholder="••••••••" 
                  type="password" 
                  required
                />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 py-2">
            <input 
              id="terms" 
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="mt-1 rounded border-slate-300 text-[#6a79e0] focus:ring-[#6a79e0] h-4 w-4" 
              type="checkbox" 
              required
            />
            <label className="text-xs text-slate-500 leading-relaxed font-medium" htmlFor="terms">
              By creating an account, I agree to the <a className="text-[#6a79e0] font-bold hover:underline" href="#">Terms</a> and <a className="text-[#6a79e0] font-bold hover:underline" href="#">Privacy</a>.
            </label>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#6a79e0] hover:bg-[#6a79e0]/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#6a79e0]/25 transition-all transform active:scale-[0.98]"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
            <span className="bg-white px-2 text-slate-400">Or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <img className="w-5 h-5" src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" />
            <span className="text-sm font-bold text-[#2a2f63]">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-5 h-5 bg-[#1877F2] rounded-full flex items-center justify-center text-white text-[10px] font-bold">f</div>
            <span className="text-sm font-bold text-[#2a2f63]">Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;