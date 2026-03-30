import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

// Topographic aesthetic SVG component
const TopoPattern = () => (
  <svg className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none mix-blend-overlay" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <defs>
      <pattern id="topo" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
        <path fill="none" stroke="#ffffff" strokeWidth="1" d="M150 0C150 150 0 150 0 300 M300 0C300 150 150 150 150 300 M450 0C450 150 300 150 300 300 M0 0C0 150 -150 150 -150 300 M150 -300C150 -150 0 -150 0 0 M300 -300C300 -150 150 -150 150 0 M450 -300C450 -150 300 -150 300 0 M0 -300C0 -150 -150 -150 -150 0 M-150 0C-150 150 -300 150 -300 300 M-150 -300C-150 -150 -300 -150 -300 0" />
        <path fill="none" stroke="#ffffff" strokeWidth="1" d="M75 0C75 150 -75 150 -75 300 M225 0C225 150 75 150 75 300 M375 0C375 150 225 150 225 300 M-75 0C-75 150 -225 150 -225 300" />
        <path fill="none" stroke="#ffffff" strokeWidth="0.5" d="M37 0C37 150 -113 150 -113 300 M187 0C187 150 37 150 37 300 M337 0C337 150 187 150 187 300" />
        <circle cx="150" cy="150" r="120" fill="none" stroke="#ffffff" strokeWidth="1" />
        <circle cx="150" cy="150" r="90" fill="none" stroke="#ffffff" strokeWidth="1" />
        <circle cx="150" cy="150" r="60" fill="none" stroke="#ffffff" strokeWidth="1" />
        <circle cx="150" cy="150" r="30" fill="none" stroke="#ffffff" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#topo)" />
  </svg>
);

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const res = await login(data.identifier, data.password);
      if (res) {
        navigate('/dashboard');
      } else {
        setAuthError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication failed. Server error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fff0f0]">
      <div className="w-full max-w-[1000px] h-[650px] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-row animate-fade-in border border-red-50">
        
        {/* Left Peach Texture Panel */}
        <div className="w-5/12 bg-[#FF7B7B] relative hidden md:flex flex-col justify-end items-center px-12 pb-24 overflow-hidden">
          {/* Base organic gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF9A9A] via-[#FF7B7B] to-[#FF6B6B]"></div>
          
          <TopoPattern />
          
          {/* Organic Wave dividing the texture - like the image has a wave shape internally */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 text-center w-full max-w-sm">
             <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white text-left">Welcome</h1>
             <p className="text-white/80 font-medium leading-relaxed text-left text-sm">
                Lorem ipsum dolor sit amet consectetur. Lorem id sit
             </p>
             <div className="flex justify-end mt-8">
                <span className="text-white font-bold flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  Continue <div className="bg-white/20 p-2 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></div>
                </span>
             </div>
          </div>
        </div>

        {/* Right White Form Panel */}
        <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10">
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight inline-block">
                Sign in
                <div className="h-1 w-[80%] bg-[#FF7B7B] mt-2 rounded-full"></div>
              </h1>
            </div>

            {authError && (
              <div className="mb-6 bg-red-50 text-red-500 p-3 rounded-xl flex items-center gap-2 text-sm font-medium">
                <AlertCircle size={16} />
                <p>{authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-slate-500 mb-1 ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400 pb-1">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="demo@email.com"
                    {...register("identifier", { required: "Required" })}
                    className="w-full pl-8 pr-12 py-3 bg-transparent border-b border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#FF7B7B] transition-colors rounded-none outline-none font-medium text-sm"
                  />
                </div>
                {errors.identifier && <p className="text-[#FF7B7B] text-xs mt-1 ml-1">{errors.identifier.message}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-500 mb-1 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400 pb-1">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="enter your password"
                    {...register("password", { required: "Required" })}
                    className="w-full pl-8 pr-12 py-3 bg-transparent border-b border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#FF7B7B] transition-colors rounded-none outline-none font-medium text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-300 hover:text-[#FF7B7B] pb-1 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-[#FF7B7B] text-xs mt-1 ml-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between text-[12px] pt-2 px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-3.5 h-3.5 border border-slate-300 rounded-sm bg-white peer-checked:bg-[#FF7B7B] peer-checked:border-[#FF7B7B] transition-colors flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                  <span className="text-slate-700 font-bold group-hover:text-slate-900 transition-colors">Remember Me</span>
                </label>
                
                <a href="#" className="text-[#FF7B7B] font-bold transition-colors hover:text-[#ff5555]">
                  Forgot Password?
                </a>
              </div>

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FF7B7B] hover:bg-[#ff6565] text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#FF7B7B]/30 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Login'}
                </button>
              </div>
            </form>

            <div className="text-center pt-8">
              <p className="text-slate-400 text-sm font-medium">
                Don't have an Account ? <Link to="/signup" className="text-[#FF7B7B] font-bold transition-colors ml-1 hover:text-[#ff5555]">Sign up</Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
