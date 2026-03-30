import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Calendar, Loader2, AlertCircle, Eye, EyeOff, Hotel, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import DatePickerModal from '../components/DatePickerModal';

const Signup = () => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const dobValue = watch("dob");
  const passwordValue = watch("password", "");

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-800' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;

    const results = [
      { score: 0, label: 'CRITICAL', color: 'bg-red-500' },
      { score: 1, label: 'VULNERABLE', color: 'bg-orange-500' },
      { score: 2, label: 'MODERATE', color: 'bg-yellow-500' },
      { score: 3, label: 'SECURE', color: 'bg-blue-500' },
      { score: 4, label: 'OPTIMAL', color: 'bg-green-500' },
    ];
    return results[score];
  };

  const strength = getPasswordStrength(passwordValue);
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const res = await registerUser(data);
      if (res.status === 200) {
        navigate('/login');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failure.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
      {/* ── Background Decorative Elements ── */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-[#FF4D6D]/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-6xl bg-[#0f172a] rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/5 relative z-10">
        
        {/* ── Left Branding Panel ── */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#0f172a] to-[#020617] p-12 md:p-16 flex flex-col justify-between relative overflow-hidden border-r border-white/5">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-[#FF4D6D] rounded-xl flex items-center justify-center rotate-6 shadow-lg shadow-[#FF4D6D]/20">
                  <Hotel size={22} className="text-white" />
                </div>
                <span className="font-black text-white text-2xl tracking-tighter uppercase italic">LuxeStay</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-6 italic">
                Join the <span className="text-[#FF4D6D]">Elite</span> Collection.
              </h1>
              <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-xs uppercase tracking-widest">
                Unlock exclusive access to the world's most curated hospitality experiences.
              </p>
           </div>

           <div className="relative z-10 pt-12 space-y-6">
              {[
                { label: 'AUTHENTICITY', desc: 'Verified Luxury Properties' },
                { label: 'ELEGANCE', desc: 'Seamless Booking Logic' },
                { label: 'PRESENCE', desc: 'Global Concierge Support' }
              ].map(item => (
                <div key={item.label}>
                   <p className="text-[10px] font-black text-[#FF4D6D] tracking-[0.3em]">{item.label}</p>
                   <p className="text-white text-xs font-bold italic opacity-30">{item.desc}</p>
                </div>
              ))}
           </div>

           <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        </div>

        {/* ── Right Auth Panel ── */}
        <div className="md:w-7/12 p-12 md:p-16 bg-[#0f172a] flex flex-col justify-center overflow-y-auto max-h-[90vh] custom-scroll">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10">
              <p className="text-[#FF4D6D] text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Membership Initialization</p>
              <h2 className="text-3xl font-black text-white tracking-tighter">Create Identity.</h2>
            </div>

            {authError && (
              <div className="mb-6 bg-red-500/10 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                <AlertCircle size={14} />
                <p>{authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest transition-colors group-focus-within:text-[#FF4D6D]">Full Legal Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-700 group-focus-within:text-[#FF4D6D] transition-colors"><User size={16} /></div>
                      <input type="text" placeholder="JOHN DOE" {...register("fullName", { required: "REQUIRED" })} className="w-full pl-6 pr-4 py-3 bg-transparent border-b border-white/10 text-white placeholder-slate-800 focus:outline-none focus:border-[#FF4D6D] transition-all font-black text-[12px] tracking-widest uppercase rounded-none" />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest transition-colors group-focus-within:text-[#FF4D6D]">Network Alias</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-700 group-focus-within:text-[#FF4D6D] transition-colors font-black text-lg">@</div>
                      <input type="text" placeholder="JDOE" {...register("username", { required: "REQUIRED" })} className="w-full pl-7 pr-4 py-3 bg-transparent border-b border-white/10 text-white placeholder-slate-800 focus:outline-none focus:border-[#FF4D6D] transition-all font-black text-[12px] tracking-widest uppercase rounded-none" />
                    </div>
                  </div>
              </div>

              <div className="group">
                <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest transition-colors group-focus-within:text-[#FF4D6D]">Digital Coordinate (Email)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-700 group-focus-within:text-[#FF4D6D] transition-colors"><Mail size={16} /></div>
                  <input type="email" placeholder="COORDINATE@NETWORK.COM" {...register("email", { 
                      required: "REQUIRED",
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "INVALID AUTH" }
                    })} className="w-full pl-6 pr-4 py-3 bg-transparent border-b border-white/10 text-white placeholder-slate-800 focus:outline-none focus:border-[#FF4D6D] transition-all font-black text-[12px] tracking-widest uppercase rounded-none" />
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest transition-colors group-focus-within:text-[#FF4D6D]">Security Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-700 group-focus-within:text-[#FF4D6D] transition-colors"><Lock size={16} /></div>
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••••••" {...register("password", { 
                      required: "REQUIRED", 
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        message: "NEEDS UPPER, LOWER, DIGIT, SPECIAL (8+)"
                      }
                    })} className="w-full pl-6 pr-10 py-3 bg-transparent border-b border-white/10 text-white placeholder-slate-800 focus:outline-none focus:border-[#FF4D6D] transition-all font-black text-[12px] tracking-widest rounded-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-700 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordValue && (
                  <div className="mt-4 px-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Strength: <span className={strength.label !== 'OPTIMAL' ? 'text-yellow-500' : 'text-green-500'}>{strength.label}</span></span>
                    </div>
                    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-700`} style={{ width: `${(strength.score / 4) * 100}%` }}></div>
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-[#FF4D6D] text-[9px] font-black mt-2 tracking-widest italic">{errors.password.message}</p>}
              </div>

              <div className="group">
                <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest transition-colors group-focus-within:text-[#FF4D6D]">Validate Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-700 group-focus-within:text-[#FF4D6D] transition-colors"><Lock size={16} /></div>
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••••••" {...register("confirmPassword", { 
                      required: "REQUIRED",
                      validate: val => val === passwordValue || "KEY MISMATCH"
                    })} className="w-full pl-6 pr-4 py-3 bg-transparent border-b border-white/10 text-white placeholder-slate-800 focus:outline-none focus:border-[#FF4D6D] transition-all font-black text-[12px] tracking-widest rounded-none" />
                </div>
                {errors.confirmPassword && <p className="text-[#FF4D6D] text-[9px] font-black mt-2 tracking-widest italic">{errors.confirmPassword.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest transition-colors group-focus-within:text-[#FF4D6D]">Com-Link (Phone)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-700 group-focus-within:text-[#FF4D6D] transition-colors"><Phone size={16} /></div>
                      <input type="tel" placeholder="10-DIGIT MOBILE" {...register("phone", {
                        pattern: { value: /^[0-9]{10}$/, message: "INVALID LENGTH" }
                      })} className="w-full pl-6 pr-4 py-3 bg-transparent border-b border-white/10 text-white placeholder-slate-800 focus:outline-none focus:border-[#FF4D6D] transition-all font-black text-[12px] tracking-widest uppercase rounded-none" />
                    </div>
                    {errors.phone && <p className="text-[#FF4D6D] text-[9px] font-black mt-2 tracking-widest italic">{errors.phone.message}</p>}
                  </div>
                  <div className="group">
                    <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest transition-colors group-focus-within:text-[#FF4D6D]">Temporal Origin (DOB)</label>
                    <div className="relative group cursor-pointer" onClick={() => setIsDatePickerOpen(true)}>
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-700 group-focus-within:text-[#FF4D6D] transition-colors"><Calendar size={16} /></div>
                      <div className={`w-full pl-6 pr-2 py-3 bg-transparent border-b border-white/10 flex items-center ${dobValue ? 'text-white' : 'text-slate-800'} font-black text-[11px] tracking-widest h-[41px] uppercase`}>
                         {dobValue ? new Date(dobValue).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "CALIBRATE"}
                      </div>
                    </div>
                    <input type="hidden" {...register("dob", {
                      validate: (value) => {
                        if (!value) return true;
                        const today = new Date();
                        const dob = new Date(value);
                        if (dob > today) return "FUTURE PROHIBITED";
                        let age = today.getFullYear() - dob.getFullYear();
                        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
                        return age >= 18 || "MINORITY EXCLUSION (18+)";
                      }
                    })} />
                    {errors.dob && <p className="text-[#FF4D6D] text-[9px] font-black mt-2 tracking-widest italic">{errors.dob.message}</p>}
                  </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black hover:bg-[#FF4D6D] hover:text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-[11px]"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Initialize Identity <ChevronRight size={18} /></>}
                </button>
              </div>
            </form>

            <div className="text-center pt-8">
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
                Existing Protocol? <Link to="/login" className="text-white hover:text-[#FF4D6D] transition-colors ml-2">Resume Session</Link>
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
