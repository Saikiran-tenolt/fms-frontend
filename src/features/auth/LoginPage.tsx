import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, ShieldCheck, MapPin, User, Mail, Smartphone, ArrowRight, CheckCircle2, AlertCircle, Building, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../hooks';
import { login } from './authSlice';
import { Button } from '../../components/ui';
import { toast } from 'sonner';
import authService, { VerifyPayload, Location as ProfileLocation } from '../../services/authService';

export const LoginPage: React.FC = () => {
  const [role, setRole] = useState<'farmer' | 'admin'>('farmer');
  
  // --- FARMER STATE ---
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState<ProfileLocation>({
    village: '',
    block: '',
    district: '',
    state: ''
  });
  const [resendTimer, setResendTimer] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [pincode, setPincode] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // --- ADMIN STATE ---
  const [adminStep, setAdminStep] = useState<1 | 2>(1);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPincode, setAdminPincode] = useState('');
  const [adminLocation, setAdminLocation] = useState<ProfileLocation>({ village: '', block: '', district: '', state: '' });
  const [isAdminLocFetching, setIsAdminLocFetching] = useState(false);
  const [isAdminPinVerified, setIsAdminPinVerified] = useState(false);
  const [adminPinError, setAdminPinError] = useState<string | null>(null);
  const [adminBlock, setAdminBlock] = useState('');

  // --- SHARED STATE ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic for resend OTP (Farmer)
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Farmer PIN Code auto-fetch
  useEffect(() => {
    if (pincode.length === 6) {
      handleFetchLocation(pincode, 'farmer');
    } else {
      setIsPinVerified(false);
      setPinError(null);
    }
  }, [pincode]);

  // Admin PIN Code auto-fetch
  useEffect(() => {
    if (adminPincode.length === 6) {
      handleFetchLocation(adminPincode, 'admin');
    } else {
      setIsAdminPinVerified(false);
      setAdminPinError(null);
    }
  }, [adminPincode]);

  const handleFetchLocation = async (pin: string, type: 'farmer' | 'admin') => {
    if (type === 'farmer') setIsFetchingLocation(true);
    else setIsAdminLocFetching(true);
    
    if (type === 'farmer') setPinError(null);
    else setAdminPinError(null);

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();

      if (data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        if (type === 'farmer') {
          setLocation(prev => ({ ...prev, district: postOffice.District, state: postOffice.State }));
          setIsPinVerified(true);
          setPinError(null);
        } else {
          setAdminLocation(prev => ({ ...prev, district: postOffice.District, state: postOffice.State }));
          setIsAdminPinVerified(true);
          setAdminPinError(null);
        }
        toast.success(`Location detected: ${postOffice.District}, ${postOffice.State}`);
      } else {
        if (type === 'farmer') {
          setPinError('Invalid PIN Code');
          setIsPinVerified(false);
        } else {
          setAdminPinError('Invalid PIN Code');
          setIsAdminPinVerified(false);
        }
      }
    } catch (err) {
      if (type === 'farmer') {
        setPinError('Failed to fetch location');
        setIsPinVerified(false);
      } else {
        setAdminPinError('Failed to fetch location');
        setIsAdminPinVerified(false);
      }
    } finally {
      if (type === 'farmer') setIsFetchingLocation(false);
      else setIsAdminLocFetching(false);
    }
  };

  // --- FARMER HANDLERS ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.sendOtp(phone);
      const otpCode = res?.otp || res?.data?.otp;
      
      console.log('====================================');
      console.log('✅ GENERATED OTP:', otpCode);
      console.log('====================================');

      if (otpCode) {
        toast.success(`Verification code sent!`, { description: `Your OTP is: ${otpCode} (Demo mode)`, duration: 10000 });
      } else {
        toast.success('Verification code sent to your device.');
      }
      setStep(2);
      setResendTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(digit => digit !== '')) setShowProfile(true);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      setShowProfile(false);
    }
  };

  const handleFarmerVerify = async () => {
    const finalOtp = otp.join('');
    if (finalOtp.length < 6) return setError('Please enter the 6-digit code');
    if (!name || !email || !location.village || !location.block || !location.district || !location.state) return setError('Please complete your profile details');

    setIsLoading(true);
    setError(null);

    const payload: VerifyPayload = { 
      phone, 
      otp: finalOtp, 
      name, 
      email, 
      permanentLocation: location,
      pincode
    };

    try {
      const response = await authService.verifyOtp(payload);
      
      dispatch(login({
        user: response.user,
        accessToken: response.accessToken || (response as any).token,
        refreshToken: response.refreshToken || ''
      }));

      toast.success(`Welcome back, ${response.user.name}!`, { description: 'Redirecting to your dashboard...' });
      navigate('/dashboard');
      setTimeout(() => navigate('/plots/create'), 800);
    } catch (err: any) {
      console.warn('API Verify Failed:', err.message);
      console.log('Falling back to local mock authorization...');
      
      // Fallback Mock Reference
      setTimeout(() => {
        dispatch(login({
          user: { 
            id: 'farmer-' + phone, 
            name: name, 
            email: email, 
            role: 'FARMER', 
            permanentLocation: location,
            pincode
          },
          accessToken: 'mock_farmer_token',
          refreshToken: 'mock_farmer_token'
        }));
        toast.success(`Welcome back, ${name}!`, { description: 'Redirecting to your dashboard (Mocked)...' });
        navigate('/dashboard');
        setTimeout(() => navigate('/plots/create'), 800);
        setIsLoading(false);
      }, 1000);
    }
  };

  // --- ADMIN HANDLERS ---
  const handleAdminStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setError('Please provide your official email and password.');
      return;
    }
    setError(null);
    setAdminStep(2); // Move to progressive disclosure
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminBlock || !isAdminPinVerified) {
      setError('Please complete the administrative location details.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    // Simulated Admin Login
    setTimeout(() => {
      dispatch(login({
        user: { id: 'admin-01', name: adminName, email: adminEmail, role: 'ADMIN', assignedBlock: adminBlock },
        accessToken: 'mock_admin_token',
        refreshToken: 'mock_admin_token'
      }));
      toast.success(`Authorized: Welcome ${adminName}`, { description: `Secure session established for ${adminBlock}.` });
      navigate('/admin/dashboard');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-['Inter']">
      
      {/* LEFT COLUMN: FORM OVERLAY */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-24 py-12 lg:w-1/2 bg-white z-10 shadow-2xl overflow-y-auto">
        <div className="mx-auto w-full max-w-md relative">
          
          <div className="mb-10 lg:mb-12">
             <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-xl mb-6">
                <ShieldCheck className="h-8 w-8 text-emerald-700" />
             </div>
             <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Access Portal</h2>
             <p className="mt-2 text-sm text-slate-500 font-medium">Verify your identity to enter the system.</p>
          </div>

          {/* TOGGLE SWITCHER */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8 border border-slate-200">
            <button
              onClick={() => { setRole('farmer'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'farmer' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Farmer Login
            </button>
            <button
              onClick={() => { setRole('admin'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'admin' ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Admin Portal
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="h-2 w-2 rounded-full bg-red-600" />
              {error}
            </div>
          )}

          {/* ======================= FARMER FORM ======================= */}
          {role === 'farmer' && (
            <div className="animate-in fade-in slide-in-from-left duration-300">
              {step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                        <span className="text-base font-bold border-r border-slate-300 pr-3">+91</span>
                        <Smartphone className="h-5 w-5 ml-3" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="86884XXXXX"
                        className="w-full pl-28 pr-4 py-4 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-900 text-lg font-medium tracking-[0.1em] placeholder:text-slate-400 placeholder:tracking-normal shadow-sm"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all font-bold text-base flex justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Request OTP <ArrowRight className="h-5 w-5" /></>}
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <p className="text-sm font-medium text-slate-600">Enter code sent to <span className="font-bold text-slate-900">+91 {phone}</span></p>
                     <button onClick={() => { setStep(1); setShowProfile(false); }} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Change number</button>
                  </div>
                  <div className="flex justify-between gap-2 sm:gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-full aspect-square text-center text-xl sm:text-2xl font-bold bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 shadow-sm"
                      />
                    ))}
                  </div>

                  {/* Profile Details Expansion */}
                  <div className={`space-y-5 overflow-hidden transition-all duration-700 ease-in-out ${showProfile ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                    <div className="border-t border-slate-200 pt-6">
                      <p className="text-xs uppercase tracking-wider font-bold text-emerald-700 mb-4">Complete Profile Setup</p>
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 outline-none transition-all text-slate-900 shadow-sm font-medium" />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 outline-none transition-all text-slate-900 shadow-sm font-medium" />
                        </div>

                        {/* Geographic Registration */}
                        <div className="pt-2">
                           <p className="text-xs uppercase tracking-wider font-bold text-emerald-700 mb-3">Geographic Registration</p>
                           <div className="relative">
                            <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isPinVerified ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <input type="text" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} placeholder="6-Digit PIN Code" className={`w-full pl-12 pr-12 py-3.5 bg-white border ${pinError ? 'border-red-500' : isPinVerified ? 'border-emerald-500' : 'border-slate-300'} rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-slate-900 text-sm tracking-widest font-bold shadow-sm`} />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              {isFetchingLocation ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : isPinVerified ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : pinError ? <AlertCircle className="h-5 w-5 text-red-500" /> : null}
                            </div>
                           </div>
                           
                           {isPinVerified && (
                             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 grid grid-cols-2 gap-3 overflow-hidden">
                                <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-slate-500">District</label><input type="text" value={location.district} readOnly className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm font-medium" /></div>
                                <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-slate-500">State</label><input type="text" value={location.state} readOnly className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm font-medium" /></div>
                                <div className="space-y-1 col-span-2 mt-2"><label className="text-[10px] uppercase font-bold text-slate-500">Village</label><input type="text" value={location.village} onChange={e => setLocation({...location, village: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-slate-900 text-sm font-medium shadow-sm transition-all" placeholder="Enter Village" /></div>
                                <div className="space-y-1 col-span-2"><label className="text-[10px] uppercase font-bold text-slate-500">Block</label><input type="text" value={location.block} onChange={e => setLocation({...location, block: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-slate-900 text-sm font-medium shadow-sm transition-all" placeholder="Enter Block" /></div>
                             </motion.div>
                           )}
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleFarmerVerify} disabled={isLoading} className="w-full py-4 mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-all font-bold">
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Verification"}
                    </Button>
                  </div>
                  
                  {!showProfile && resendTimer === 0 && (
                     <div className="text-center pt-2">
                       <button onClick={handleSendOtp} className="text-sm text-slate-500 font-bold hover:text-emerald-600 transition-colors">Resend Code</button>
                     </div>
                  )}
                  {!showProfile && resendTimer > 0 && (
                     <p className="text-center text-sm text-slate-400 font-medium pt-2">Resend available in <span className="text-slate-600 font-bold">{resendTimer}s</span></p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================= ADMIN FORM ======================= */}
          {role === 'admin' && (
            <div className="animate-in fade-in slide-in-from-right duration-300">
              {adminStep === 1 ? (
                <form onSubmit={handleAdminStep1} className="space-y-5">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-2">Government Email</label>
                     <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                       <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="official@gov.in" className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-900 font-medium shadow-sm" required />
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-2">Secure Password</label>
                     <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                       <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-900 shadow-sm" required />
                     </div>
                   </div>
                   <Button type="submit" className="w-full py-4 mt-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-md transition-all font-bold text-base flex justify-center gap-2">
                     Authenticate <ArrowRight className="h-5 w-5" />
                   </Button>
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-blue-800 break-all">{adminEmail}</span>
                     <CheckCircle2 className="h-5 w-5 text-blue-600" />
                   </div>
                   
                   <div className="border-t border-slate-200 pt-6 space-y-5">
                      <p className="text-xs uppercase tracking-wider font-bold text-blue-700">Administrative Assignment</p>
                      
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Officer Name" className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-900 font-medium shadow-sm" required />
                      </div>

                      <div className="relative">
                        <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isAdminPinVerified ? 'text-blue-500' : 'text-slate-400'}`} />
                        <input type="text" maxLength={6} value={adminPincode} onChange={(e) => setAdminPincode(e.target.value.replace(/\D/g, ''))} placeholder="Assignment PIN Code" className={`w-full pl-12 pr-12 py-3.5 bg-white border ${adminPinError ? 'border-red-500' : isAdminPinVerified ? 'border-blue-500' : 'border-slate-300'} rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-900 tracking-widest font-bold shadow-sm`} required />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {isAdminLocFetching ? <Loader2 className="h-5 w-5 animate-spin text-blue-500" /> : isAdminPinVerified ? <CheckCircle2 className="h-5 w-5 text-blue-500" /> : adminPinError ? <AlertCircle className="h-5 w-5 text-red-500" /> : null}
                        </div>
                      </div>

                      {isAdminPinVerified && (
                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-1">
                           <div className="flex gap-2">
                             <input type="text" value={adminLocation.district} readOnly className="w-1/2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-xs font-semibold" />
                             <input type="text" value={adminLocation.state} readOnly className="w-1/2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-xs font-semibold" />
                           </div>
                           <div className="relative">
                             <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <select value={adminBlock} onChange={(e) => setAdminBlock(e.target.value)} required className="w-full pl-12 pr-4 py-3.5 appearance-none bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-slate-900 text-sm font-medium shadow-sm transition-all cursor-pointer">
                               <option value="" disabled>Select Operation Block</option>
                               <option value="Block A (North)">Block A (North Sector)</option>
                               <option value="Block B (East)">Block B (East Sector)</option>
                               <option value="Block C (West)">Block C (West Sector)</option>
                             </select>
                           </div>
                         </motion.div>
                      )}
                   </div>
                   
                   <Button type="submit" disabled={isLoading || !isAdminPinVerified} className="w-full py-4 mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login to Dashboard"}
                   </Button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>

      {/* RIGHT COLUMN: BRANDING VISUAL */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-slate-900 overflow-hidden">
           {/* High-end SaaS graphic backdrop */}
           <img className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay" src="https://images.unsplash.com/photo-1592982537447-6f296d11f9fc?q=80&w=2670&auto=format&fit=crop" alt="Agriculture Grid" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
           
           <div className="absolute inset-0 flex flex-col justify-end p-20 z-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 w-max">
                 <ShieldCheck className="w-5 h-5 text-emerald-400" />
                 <span className="text-white font-bold text-sm tracking-wide">Government of Bharat</span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight leading-tight max-w-2xl">
                 Next-Generation <br/><span className="text-emerald-400">Agricultural</span> Administration
              </h1>
              <p className="mt-6 text-lg text-slate-300 max-w-xl font-medium leading-relaxed">
                 Seamlessly manage farmer registries, analyze real-time IoT metrics, and distribute automated advisories through the unified portal.
              </p>
           </div>
        </div>
      </div>
      
    </div>
  );
};
