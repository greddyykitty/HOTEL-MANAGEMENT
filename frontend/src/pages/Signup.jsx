import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Calendar, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import DatePickerModal from '../components/DatePickerModal';

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

const Signup = () => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const dobValue = watch("dob");
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const res = await registerUser(data);
      if (res.status === 200) {
        navigate('/login');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fff0f0]">
      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-row animate-fade-in border border-red-50 relative" style={{ height: '700px' }}>
        
        {/* Left Peach Texture Panel */}
        <div className="w-5/12 bg-[#FF7B7B] relative hidden md:flex flex-col justify-end items-center px-12 pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF9A9A] via-[#FF7B7B] to-[#FF6B6B]"></div>
          <TopoPattern />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 text-center w-full max-w-sm">
             <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white text-left">Join Us</h1>
             <p className="text-white/80 font-medium leading-relaxed text-left text-sm">
                Create an account to track your progress and manage your profile securely.
             </p>
          </div>
        </div>

        {/* Right White Form Panel */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white relative overflow-y-auto">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight inline-block">
                Sign up
                <div className="h-1 w-[80%] bg-[#FF7B7B] mt-1.5 rounded-full"></div>
              </h1>
            </div>

            {authError && (
              <div className="mb-4 bg-red-50 text-red-500 p-3 rounded-xl flex items-center gap-2 text-sm font-medium">
                <AlertCircle size={16} />
                <p>{authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 mb-0.5 ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400 pb-1"><User size={15} /></div>
                      <input type="text" placeholder="John Doe" {...register("fullName", { required: "Required" })} className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#FF7B7B] transition-colors rounded-none outline-none font-medium text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 mb-0.5 ml-1">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400 pb-1 font-bold">@</div>
                      <input type="text" placeholder="johndoe" {...register("username", { required: "Required" })} className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#FF7B7B] transition-colors rounded-none outline-none font-medium text-sm" />
                    </div>
                  </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-0.5 ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400 pb-1"><Mail size={15} /></div>
                  <input type="email" placeholder="demo@office.com" {...register("email", { 
                      required: "Required",
                      pattern: { value: /^.+@office\.com$/i, message: "Must be @office.com" }
                    })} className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#FF7B7B] transition-colors rounded-none outline-none font-medium text-sm" />
                </div>
                {errors.email && <p className="text-[#FF7B7B] text-xs mt-1 ml-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-0.5 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400 pb-1"><Lock size={15} /></div>
                  <input type={showPassword ? "text" : "password"} placeholder="create a password" {...register("password", { 
                      required: "Required", 
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        message: "8+ chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char"
                      }
                    })} className="w-full pl-7 pr-8 py-2 bg-transparent border-b border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#FF7B7B] transition-colors rounded-none outline-none font-medium text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-300 hover:text-[#FF7B7B] pb-1">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-[#FF7B7B] text-[10px] mt-1 ml-1 leading-tight">{errors.password.message}</p>}
              </div>

              <div className="pt-1 flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[12px] font-bold text-slate-500 mb-0.5 ml-1">Phone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400 pb-1"><Phone size={15} /></div>
                      <input type="tel" placeholder="Optional" {...register("phone")} className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#FF7B7B] transition-colors rounded-none outline-none font-medium text-sm" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[12px] font-bold text-slate-500 mb-0.5 ml-1">DOB</label>
                    <div className="relative group cursor-pointer" onClick={() => setIsDatePickerOpen(true)}>
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400 pb-1 group-hover:text-[#FF7B7B] transition-colors"><Calendar size={15} /></div>
                      <div className={`w-full pl-7 pr-2 py-2 bg-transparent border-b border-slate-200 group-hover:border-[#FF7B7B] transition-colors flex items-center ${dobValue ? 'text-slate-800' : 'text-slate-400'} font-medium text-[13px] h-[37px] rounded-none outline-none`}>
                         {dobValue ? new Date(dobValue).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "Set Date"}
                      </div>
                    </div>
                    <input type="hidden" {...register("dob", {
                      validate: (value) => {
                        if (!value) return true;
                        const today = new Date();
                        const dob = new Date(value);
                        let age = today.getFullYear() - dob.getFullYear();
                        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
                           age--;
                        }
                        return age >= 10 || "Must be >= 10 years";
                      }
                    })} />
                    {errors.dob && <p className="text-[#FF7B7B] text-xs mt-1 ml-1">{errors.dob.message}</p>}
                  </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FF7B7B] hover:bg-[#ff6565] text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#FF7B7B]/30 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
                </button>
              </div>
            </form>

            <div className="text-center pt-6 pb-2">
              <p className="text-slate-400 text-sm font-medium">
                Already have an Account ? <Link to="/login" className="text-[#FF7B7B] font-bold transition-colors ml-1 hover:text-[#ff5555]">Log in</Link>
              </p>
            </div>
          </div>
        </div>

      </div>
      
      <DatePickerModal 
        isOpen={isDatePickerOpen} 
        onClose={() => setIsDatePickerOpen(false)} 
        initialDate={dobValue}
        onSelect={(dateStr) => {
          setValue('dob', dateStr, { shouldValidate: true, shouldDirty: true });
        }}
      />
    </div>
  );
};

export default Signup;
