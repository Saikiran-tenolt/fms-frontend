import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, MapPin, User, Mail, Smartphone, ArrowRight, CheckCircle2, AlertCircle, Edit2, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../hooks';
import { login } from './authSlice';
import { Button } from '../../components/ui';
import { toast } from 'sonner';
import authService, { VerifyPayload, Location as ProfileLocation } from '../../services/authService';

export const LoginPage: React.FC = () => {
  const [role, setRole] = useState<'farmer' | 'admin'>('farmer');
  
  // --- FLOW STATE ---
  const [stage, setStage] = useState<'PHONE' | 'OTP' | 'ADMIN_CORE' | 'ADMIN_ASSIGN'>('PHONE');
  const [isSignup, setIsSignup] = useState(false);
  
  // --- FARMER DATA ---
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState<ProfileLocation>({
    village: '', block: '', district: '', state: ''
  });
  const [pincode, setPincode] = useState('');
  
  // --- HELPERS ---
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  // const [pinError, setPinError] = useState<string | null>(null);

  // --- ADMIN DATA ---
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminBlock, setAdminBlock] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Pincode auto-fetch
  useEffect(() => {
    if (pincode.length === 6) handleFetchLocation(pincode, 'farmer');
    else { setIsPinVerified(false); /* setPinError(null); */ }
  }, [pincode]);

  const handleFetchLocation = async (pin: string, type: 'farmer' | 'admin') => {
    try {
      if (type === 'farmer') { setIsFetchingLocation(true); /* setPinError(null); */ }
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();
      if (data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        if (type === 'farmer') {
          setLocation(prev => ({ ...prev, district: postOffice.District, state: postOffice.State }));
          setIsPinVerified(true);
        }
        toast.success(`Location identified: ${postOffice.District}`);
      } else {
        if (type === 'farmer') { /* setPinError('Invalid PIN Code'); */ }
      }
    } catch (err) {
      if (type === 'farmer') { /* setPinError('Failed to fetch location'); */ }
    } finally {
      if (type === 'farmer') setIsFetchingLocation(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '')) handleFarmerVerify(newOtp.join(''));
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone || phone.length !== 10 || !/^[6-9]/.test(phone)) return setError('Enter valid 10-digit number (starting 6-9)');
    setIsLoading(true); setError(null);
    try {
      const res = await authService.sendOtp(phone);
      if (res.otp) {
        console.log("OTP RECEIVED:", res.otp);
        toast.success(`Code sent! (Demo: ${res.otp})`, { duration: 15000 });
      } else {
        toast.success('Verification code sent!');
      }
      setStage('OTP');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']); 
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleFarmerVerify = async (forcedOtp?: string) => {
    const finalOtp = forcedOtp || otp.join('');
    if (finalOtp.length < 6) return setError('Enter 6-digit code');
    
    // Strict signup validation
    if (isSignup) {
      if (!name || !email || !isPinVerified) return setError('Please complete all profile details');
      if (!location.village || !location.block) return setError('Please provide your Village and Block name');
    }

    setIsLoading(true); setError(null);
    try {
      const payload: VerifyPayload = { 
        phone, otp: finalOtp,
        ...(isSignup ? { name, email, permanentLocation: location } : {})
      };
      
      const res = await authService.verifyOtp(payload);
      if (res.success) {
        if (res.data.type === 'SIGNUP_REQUIRED') {
          setIsSignup(true);
          setError('Account not found. Please provide details to create your account.');
          // Auto-trigger fresh OTP for signup
          const resendRes = await authService.sendOtp(phone);
          if (resendRes.otp) {
            console.log("FRESH SIGNUP OTP:", resendRes.otp);
            toast.info(`New code for registration: ${resendRes.otp}`, { duration: 15000 });
          }
          setResendTimer(60);
          setOtp(['', '', '', '', '', '']);
        } else {
          dispatch(login({ user: res.data.user!, accessToken: res.data.accessToken!, refreshToken: res.data.refreshToken! }));
          toast.success(`Welcome back, ${res.data.user!.name}`);
          navigate('/dashboard');
        }
      } else { setError(res.data.message || 'Verification failed'); }
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleAdminCore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) return setError('Credentials required');
    setStage('ADMIN_ASSIGN');
    setError(null);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminBlock) return setError('Role & Block required');
    setIsLoading(true);
    setTimeout(() => {
      dispatch(login({ user: { id: 'adm-1', name: adminName, role: 'ADMIN' } as any, accessToken: 'm_a', refreshToken: 'm_r' }));
      navigate('/admin/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-['Inter']">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
      >
        <div className="px-8 pt-12 pb-10">
          {/* Header Icon */}
          <div className="flex flex-col items-center mb-10">
            <div className={`p-4 rounded-2xl mb-4 transition-colors ${role === 'farmer' ? 'bg-emerald-50' : 'bg-slate-100'}`}>
              {role === 'farmer' ? <Leaf className="h-8 w-8 text-emerald-600" /> : <ShieldCheck className="h-8 w-8 text-slate-700" />}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {stage === 'PHONE' ? 'Welcome' : stage === 'OTP' ? 'Verify Account' : 'Administrative Login'}
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Platform Access Portal</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px] flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {stage === 'PHONE' && (
              <motion.div 
                key="phone"
                initial={{ x: -15, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -15, opacity: 0 }}
                className="space-y-8"
              >
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider ml-1">Mobile Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <span className="text-sm font-bold border-r border-slate-200 pr-3">+91</span>
                      </div>
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter 10-digit number" 
                        className="w-full pl-16 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 placeholder-slate-400 font-medium" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <button 
                      type="button"
                      onClick={() => { setRole('admin'); setStage('ADMIN_CORE'); }}
                      className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest"
                    >
                      {role === 'farmer' ? 'Admin Portal' : 'Farmer Access'}
                    </button>
                    <Button 
                      type="submit"
                      disabled={isLoading || phone.length !== 10}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex gap-2"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {stage === 'OTP' && (
              <motion.div 
                key="otp"
                initial={{ x: 15, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 15, opacity: 0 }}
                className="space-y-8"
              >
                <div 
                  className="flex items-center gap-2 w-fit px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 mb-8 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => { setStage('PHONE'); setIsSignup(false); setError(null); }}
                >
                  <Smartphone className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600" />
                  <span className="text-xs font-bold text-slate-600">+91 {phone}</span>
                  <Edit2 className="h-3 w-3 text-slate-400" />
                </div>

                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input 
                      key={idx} 
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text" 
                      maxLength={1} 
                      value={digit} 
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => { 
                        if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); 
                      }}
                      className="w-full aspect-square text-center text-xl font-black border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm bg-slate-50 focus:bg-white text-slate-900" 
                    />
                  ))}
                </div>

                {isSignup && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    className="space-y-4 pt-6 mt-8 border-t border-dashed border-slate-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <p className="text-[10px] font-black uppercase text-emerald-700 tracking-[0.2em]">Identify Registration</p>
                    </div>
                    <div className="space-y-3">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm font-medium" />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm font-medium" />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" maxLength={6} value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} placeholder="PIN Code" className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold tracking-[0.3em]" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                          {isFetchingLocation && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
                          {isPinVerified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        </div>
                      </div>
                      {isPinVerified && (
                        <div className="grid grid-cols-2 gap-3 mt-2 animate-in fade-in slide-in-from-top-2">
                          <div className="col-span-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-emerald-500" /> {location.district}
                          </div>
                          <div className="col-span-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {location.state}
                          </div>
                          <input 
                            value={location.village} 
                            onChange={e => setLocation({...location, village: e.target.value})} 
                            placeholder="Village Name" 
                            className="col-span-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm" 
                          />
                          <input 
                            value={location.block} 
                            onChange={e => setLocation({...location, block: e.target.value})} 
                            placeholder="Block Name" 
                            className="col-span-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm" 
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between pt-8">
                  <button 
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0}
                    className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-600 disabled:opacity-50 transition-colors"
                  >
                    {resendTimer > 0 ? `Retry in ${resendTimer}s` : "Resend Code"}
                  </button>
                  <Button 
                    onClick={() => handleFarmerVerify()}
                    disabled={isLoading || otp.includes('')}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-xl active:scale-95"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : isSignup ? "Create Account" : "Verify & Enter"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ADMIN LOGIN */}
            {stage === 'ADMIN_CORE' && (
              <motion.form key="admin-core" initial={{ x: 15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onSubmit={handleAdminCore} className="space-y-8">
                <div className="space-y-4">
                  <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="Government Email" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" />
                  <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Secure Password" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="flex justify-between items-center pt-4">
                  <button type="button" onClick={() => { setRole('farmer'); setStage('PHONE'); }} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Farmer Login</button>
                  <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl">Authorize Account</Button>
                </div>
              </motion.form>
            )}

            {stage === 'ADMIN_ASSIGN' && (
               <motion.form key="admin-assign" initial={{ x: 15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onSubmit={handleAdminLogin} className="space-y-8">
                 <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 mb-6 border border-slate-200">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-slate-600 break-all">{adminEmail}</span>
                 </div>
                 <div className="space-y-4">
                    <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Officer Full Name" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" />
                    <select value={adminBlock} onChange={e => setAdminBlock(e.target.value)} className="w-full px-4 py-4 border border-slate-200 rounded-xl outline-none bg-slate-50 font-bold text-slate-600">
                      <option value="" disabled>Select Department</option>
                      <option value="Agriculture">Agriculture Sector</option>
                      <option value="Directorate">Central Directorate</option>
                    </select>
                 </div>
                 <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-3 rounded-xl font-bold shadow-xl">Enter Dashboard</Button>
                 </div>
               </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">FMS v2.4.0</span>
            <div className="flex gap-4">
                <span className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 cursor-pointer uppercase transition-colors">Support</span>
                <span className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 cursor-pointer uppercase transition-colors">Privacy</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
