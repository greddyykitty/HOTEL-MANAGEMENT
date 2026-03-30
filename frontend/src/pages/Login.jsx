import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle, Eye, EyeOff, Hotel, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

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
      setAuthError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
      {/* ── Background Decorative Elements ── */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#FF4D6D]/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-5xl bg-[#0f172a] rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/5 relative z-10">
        
        {/* ── Left Branding Panel ── */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#0f172a] to-[#020617] p-12 md:p-20 flex flex-col justify-between relative overflow-hidden border-r border-white/5">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-[#FF4D6D] rounded-xl flex items-center justify-center rotate-6 shadow-lg shadow-[#FF4D6D]/20">
                  <Hotel size={22} className="text-white" />
                </div>
                <span className="font-black text-white text-2xl tracking-tighter uppercase italic">LuxeStay</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-8">
                The Art of <span className="text-[#FF4D6D]">Extraordinary</span> Living.
              </h1>
              <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-sm italic">
                "Step into a world where every stay is a masterpiece of comfort and elegance."
              </p>
           </div>

           <div className="relative z-10 pt-12">
              <div className="flex items-center gap-4 text-white/20">
                 <div className="h-[1px] flex-1 bg-white/10"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Established 2024</span>
                 <div className="h-[1px] flex-1 bg-white/10"></div>
              </div>
           </div>

           {/* Decorative Grid */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>

        {/* ── Right Auth Panel ── */}
        <div className="md:w-1/2 p-12 md:p-20 bg-[#0f172a] flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-12">
              <p className="text-[#FF4D6D] text-[10px] font-black uppercase tracking-[0.4em] mb-3 italic">Identity Verification</p>
              <h2 className="text-4xl font-black text-white tracking-tighter">Welcome back.</h2>
            </div>

            {authError && (
              <div className="mb-8 bg-red-500/10 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase tracking-widest border border-red-500/20">
                <AlertCircle size={18} />
                <p>{authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest group-focus-within:text-[#FF4D6D] transition-colors">Access Identifier</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-700 group-focus-within:text-[#FF4D6D] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="ENTER YOUR EMAIL"
                    {...register("identifier", { required: "REQUIRED" })}
                    className="w-full pl-8 pr-4 py-4 bg-transparent border-b border-white/10 text-white placeholder-slate-800 focus:outline-none focus:border-[#FF4D6D] transition-all font-black text-sm tracking-widest uppercase rounded-none"
                  />
                </div>
                {errors.identifier && <p className="text-[#FF4D6D] text-[9px] font-black mt-2 tracking-widest italic">{errors.identifier.message}</p>}
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest group-focus-within:text-[#FF4D6D] transition-colors">Security Protocol</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-700 group-focus-within:text-[#FF4D6D] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    {...register("password", { required: "REQUIRED" })}
                    className="w-full pl-8 pr-12 py-4 bg-transparent border-b border-white/10 text-white placeholder-slate-800 focus:outline-none focus:border-[#FF4D6D] transition-all font-black text-sm tracking-widest rounded-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-700 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-[#FF4D6D] text-[9px] font-black mt-2 tracking-widest italic">{errors.password.message}</p>}
              </div>

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black hover:bg-[#FF4D6D] hover:text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-[11px]"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Initiate Access <ChevronRight size={18} /></>}
                </button>
              </div>
            </form>

            <div className="text-center pt-12">
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
                New to the collection? <Link to="/signup" className="text-white hover:text-[#FF4D6D] transition-colors ml-2">Initialize Membership</Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
