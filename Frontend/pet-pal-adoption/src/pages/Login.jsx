import React from 'react';
import { useState } from 'react';
import { Mail, Lock, Eye, Check, PawPrint } from 'lucide-react';

const Login = () => {

    const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // You can now send formData to your backend/API
  };

  return (
    <div className="flex min-h-screen bg-[#f7f5ff] font-sans text-[#2a2f63]">
      <div className="flex w-full min-h-screen">
        
        {/* Left Side: Split Screen Image (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#6a79e0]/20 mix-blend-multiply z-10"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80')" }}
          ></div>
          <div className="relative z-20 flex flex-col justify-end p-16 text-white bg-gradient-to-t from-[#2a2f63]/90 to-transparent w-full">
            <div className="flex items-center gap-2 mb-6">
              <PawPrint size={36} className="text-white" />
              <h1 className="text-3xl font-black tracking-tight">PetPal Adoption</h1>
            </div>
            <h2 className="text-5xl font-bold leading-tight mb-4">Find your new <br/>best friend today.</h2>
            <p className="text-lg opacity-90 max-w-md">
              Join thousands of happy families who found their perfect match through our compassionate adoption network.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 bg-[#f7f5ff]">
          <div className="w-full max-w-md">
            
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-3 mb-12">
              <div className="bg-[#6a79e0] p-2 rounded-lg text-white">
                <PawPrint size={24} />
              </div>
              <span className="text-xl font-bold text-[#6a79e0]">PetPal</span>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-black text-[#2a2f63] mb-2">Welcome back</h2>
              <p className="text-slate-500">Please enter your details to sign in to your account.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#2a2f63]/80 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#6a79e0]">
                    <Mail size={20} />
                  </div>
                  <input 
                    className="block w-full pl-11 pr-4 h-14 bg-white border border-[#6a79e0]/10 rounded-xl focus:ring-2 focus:ring-[#6a79e0]/20 focus:border-[#6a79e0] outline-none transition-all text-[#2a2f63] placeholder:text-slate-400" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-[#2a2f63]/80">Password</label>
                  <a className="text-sm font-semibold text-[#6a79e0] hover:text-[#2a2f63] transition-colors" href="#">Forgot password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#6a79e0]">
                    <Lock size={20} />
                  </div>
                  <input 
                    className="block w-full pl-11 pr-12 h-14 bg-white border border-[#6a79e0]/10 rounded-xl focus:ring-2 focus:ring-[#6a79e0]/20 focus:border-[#6a79e0] outline-none transition-all text-[#2a2f63] placeholder:text-slate-400" 
                    name="password" 
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                  <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#6a79e0]" type="button">
                    <Eye size={20} />
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 px-1">
                <input 
                  className="w-4 h-4 text-[#6a79e0] border-[#6a79e0]/20 rounded focus:ring-[#6a79e0] bg-white" 
                  id="remember" 
                  type="checkbox" 
                />
                <label className="text-sm text-slate-600" htmlFor="remember">Remember for 30 days</label>
              </div>

              {/* Sign In Button */}
              <button className="w-full bg-[#6a79e0] hover:bg-[#2a2f63] text-white font-bold h-14 rounded-xl shadow-lg shadow-[#6a79e0]/20 transition-all flex items-center justify-center gap-2 text-lg" type="submit">
                Sign In
              </button>
            </form>

            {/* Social Logins */}
            <div className="mt-8">
              <div className="relative flex items-center mb-8">
                <div className="flex-grow border-t border-[#6a79e0]/10"></div>
                <span className="flex-shrink mx-4 text-sm text-slate-500 uppercase tracking-wider font-medium">Or continue with</span>
                <div className="flex-grow border-t border-[#6a79e0]/10"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 h-12 border border-[#6a79e0]/10 rounded-xl hover:bg-white hover:shadow-sm transition-all bg-white">
                  <img alt="Google" className="w-5 h-5" src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" />
                  <span className="text-sm font-semibold text-[#2a2f63]">Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 h-12 border border-[#6a79e0]/10 rounded-xl hover:bg-white hover:shadow-sm transition-all bg-white">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">f</div>
                  <span className="text-sm font-semibold text-[#2a2f63]">Facebook</span>
                </button>
              </div>
            </div>

            {/* Register Link */}
            <p className="mt-10 text-center text-slate-600">
              Don't have an account? 
              <a className="text-[#6a79e0] font-bold hover:text-[#2a2f63] transition-colors ml-1" href="#">Create an account</a>
            </p>
          </div>

          {/* Footer Small Links */}
          <div className="mt-auto pt-10 flex gap-6 text-xs text-slate-400">
            <a className="hover:text-[#6a79e0] transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-[#6a79e0] transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-[#6a79e0] transition-colors" href="#">Help Center</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;