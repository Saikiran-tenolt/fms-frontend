import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Smartphone, Edit2, User, Mail, MapPin, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../hooks';
import { login } from './authSlice';
import { Button } from '../../components/ui';
import { toast } from 'sonner';
import authService, { VerifyPayload, Location as ProfileLocation } from '../../services/authService';

// ─── Types ────────────────────────────────────────────────────────────────────
type Stage = 'PHONE' | 'OTP' | 'ADMIN_CORE' | 'ADMIN_ASSIGN';
type Role = 'farmer' | 'admin';

// ─── Styles (injected once) ───────────────────────────────────────────────────
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';

// ─── Component ────────────────────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  // Flow
  const [role, setRole] = useState<Role>('farmer');
  const [stage, setStage] = useState<Stage>('PHONE');
  const [isSignup, setIsSignup] = useState(false);

  // Farmer
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState<ProfileLocation>({
    village: '', block: '', district: '', state: '',
  });
  const [pincode, setPincode] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [isFetchingPin, setIsFetchingPin] = useState(false);

  // Admin
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminBlock, setAdminBlock] = useState('');

  // UI
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Inject Google Font ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  // ── Resend timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // ── PIN auto-fetch (useCallback fixes exhaustive-deps warning) ──────────────
  const fetchLocation = useCallback(async (pin: string) => {
    setIsFetchingPin(true);
    setIsPinVerified(false);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0].Status === 'Success') {
        const po = data[0].PostOffice[0];
        setLocation(prev => ({ ...prev, district: po.District, state: po.State }));
        setIsPinVerified(true);
        toast.success(`Location: ${po.District}, ${po.State}`);
      } else {
        toast.error('Invalid PIN code');
      }
    } catch {
      toast.error('Failed to fetch location');
    } finally {
      setIsFetchingPin(false);
    }
  }, []);

  useEffect(() => {
    if (pincode.length === 6) fetchLocation(pincode);
    else setIsPinVerified(false);
  }, [pincode, fetchLocation]);

  // ── OTP input handler ───────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    // FIX: use regex instead of isNaN(Number(value)) — Number('') === 0 (not NaN)
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    // FIX: only auto-submit when NOT in signup mode (form fields must be filled first)
    if (next.every(d => d) && !isSignup) handleFarmerVerify(next.join(''));
  };

  // ── Send OTP ────────────────────────────────────────────────────────────────
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!phone || phone.length !== 10 || !/^[6-9]/.test(phone)) {
      return setError('Enter a valid 10-digit number starting with 6–9');
    }
    setIsLoading(true); setError(null); setInfoMsg(null); setFieldErrors({}); setFieldErrors({});
    try {
      const res = await authService.sendOtp(phone);
      if (res.otp) {
        console.warn('DEV — OTP received:', res.otp);
        toast.success(`Code sent! (Demo: ${res.otp})`, { duration: 15000 });
      } else {
        toast.success('Verification code sent!');
      }
      setStage('OTP');
      setResendTimer(60);
      setOtp(Array(6).fill(''));
    } catch (err: any) {
      let msg = err.message ?? 'Failed to send OTP';
      const errors = err.errors || {};

      if (msg.includes('E11000')) {
        if (msg.includes('email')) msg = 'Email already taken, try for new email';
        else if (msg.includes('phone') || msg.includes('mobile')) msg = 'Mobile number already registered';
      }
      
      const newFieldErrors: Record<string, string> = { ...errors };
      if (Object.keys(errors).length === 0) {
        if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('mobile') || msg.toLowerCase().includes('number')) {
          newFieldErrors.phone = msg;
        }
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const handleFarmerVerify = async (forcedOtp?: string) => {
    const finalOtp = forcedOtp ?? otp.join('');
    if (finalOtp.length < 6) return setError('Enter the complete 6-digit code');

    if (isSignup) {
      if (!name || !email) return setError('Please fill in your name and email');
      if (!isPinVerified) return setError('Enter a valid 6-digit PIN code');
      if (!location.village || !location.block) return setError('Please enter your village and block name');
    }

    setIsLoading(true); setError(null); setInfoMsg(null);
    try {
      const payload: VerifyPayload = {
        phone,
        otp: finalOtp,
        ...(isSignup ? { name, email, permanentLocation: location } : {}),
      };

      const res = await authService.verifyOtp(payload);

      if (res.success) {
        if (res.data.type === 'SIGNUP_REQUIRED') {
          setIsSignup(true);
          setError('No account found. Fill in your details to register.');
          // Fresh OTP for signup flow
          const resendRes = await authService.sendOtp(phone);
          if (resendRes.otp) {
            console.warn('DEV — Fresh signup OTP:', resendRes.otp);
            toast.info(`New code for registration: ${resendRes.otp}`, { duration: 15000 });
          }
          setResendTimer(60);
          setOtp(Array(6).fill(''));
        } else {
          dispatch(login({
            user: res.data.user!,
            accessToken: res.data.accessToken!,
            refreshToken: res.data.refreshToken!,
          }));
          toast.success(`Welcome back, ${res.data.user!.name}`);
          navigate('/dashboard');
        }
      } else {
        setError(res.data.message ?? 'Verification failed');
      }
    } catch (err: any) {
      let msg = err.message ?? 'Something went wrong';
      const errors = err.errors || {};

      if (msg.includes('E11000')) {
        if (msg.includes('email')) msg = 'Email already taken, try for new email';
        else if (msg.includes('phone') || msg.includes('mobile')) msg = 'Mobile number already registered';
      }
      
      const newFieldErrors: Record<string, string> = { ...errors };
      if (Object.keys(errors).length === 0) {
        if (msg.toLowerCase().includes('email')) newFieldErrors.email = msg;
        else if (msg.toLowerCase().includes('name')) newFieldErrors.name = msg;
        else if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('mobile')) newFieldErrors.phone = msg;
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Admin flow ──────────────────────────────────────────────────────────────
  const handleAdminCore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) return setError('Both fields are required');
    setError(null);
    setStage('ADMIN_ASSIGN');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminBlock) return setError('Officer name and department required');
    setIsLoading(true);
    // TODO: replace with real admin auth API call before production
    setTimeout(() => {
      dispatch(login({
        user: { id: 'adm-1', name: adminName, role: 'ADMIN' } as any,
        accessToken: 'mock_access',
        refreshToken: 'mock_refresh',
      }));
      navigate('/admin/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  // ── Shared helpers ──────────────────────────────────────────────────────────
  const switchToAdmin = () => { setRole('admin'); setStage('ADMIN_CORE'); setError(null); };
  const switchToFarmer = () => { setRole('farmer'); setStage('PHONE'); setError(null); };

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ fontFamily: "'Sora', sans-serif", background: '#f9fafb' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[420px]"
      >
        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
          style={{ background: '#ffffff', borderColor: '#f1f5f9' }}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)' }}
          />

          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-wide"
            style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.3)' }} />
            FMS Platform
          </div>

          {/* Error / Info banners */}
          <AnimatePresence>
            {error && (
              <motion.div key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 flex items-start gap-3 rounded-xl border p-3 text-xs"
                style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.15)', color: '#f87171' }}
              >
                <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {infoMsg && (
              <motion.div key="info" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 flex items-start gap-3 rounded-xl border p-3 text-xs"
                style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}
              >
                <Info className="mt-px h-4 w-4 shrink-0" />
                <span>{infoMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ── PHONE STAGE ── */}
            {stage === 'PHONE' && (
              <motion.div key="phone" initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -12, opacity: 0 }}>
                <h1 className="mb-1.5 text-2xl font-semibold leading-tight" style={{ color: '#0f172a' }}>
                  Sign in to<br />your workspace
                </h1>
                <p className="mb-8 text-[13px] leading-relaxed" style={{ color: '#64748b' }}>
                  Enter your registered mobile number
                </p>

                {/* Role toggle */}
                <div className="mb-7 grid grid-cols-2 gap-1 rounded-[10px] border p-1"
                  style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
                >
                  {(['farmer', 'admin'] as Role[]).map(r => (
                    <button key={r}
                      onClick={() => r === 'admin' ? switchToAdmin() : undefined}
                      className="rounded-[7px] py-2 text-xs font-medium tracking-wide transition-all"
                      style={role === r
                        ? { background: '#ffffff', color: '#0f172a', border: '1px solid #ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }
                        : { color: '#64748b', background: 'transparent', border: '1px solid transparent' }
                      }
                    >
                      {r === 'farmer' ? 'Farmer access' : 'Admin portal'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest" style={{ color: '#64748b' }}>
                      Mobile number
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r px-3.5 font-mono text-xs"
                        style={{ borderColor: '#cbd5e1', color: '#64748b' }}>
                        +91
                      </span>
                      <input
                        type="tel" value={phone} maxLength={10}
                        onChange={e => {setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setFieldErrors(p => ({...p, phone: ''}))}}
                        placeholder="98765 43210"
                        className={`w-full rounded-[9px] border py-3 pr-4 text-[13px] outline-none transition-all ${fieldErrors.phone ? 'border-red-400 bg-red-50 text-red-900' : ''}`}
                        style={fieldErrors.phone ? { paddingLeft: '64px', fontFamily: "'Sora', sans-serif" } : { paddingLeft: '64px', background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a', fontFamily: "'Sora', sans-serif" }}
                        onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="mt-1.5 ml-1 text-[11px] font-semibold text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"><AlertCircle className="h-3 w-3" /> {fieldErrors.phone}</p>
                    )}
                  </div>
                  <Button type="submit" disabled={isLoading || phone.length !== 10}
                    className="flex w-full items-center justify-center gap-2 rounded-[9px] py-3 text-[13px] font-semibold transition-all"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue →</>}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── OTP STAGE ── */}
            {stage === 'OTP' && (
              <motion.div key="otp" initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 12, opacity: 0 }}>
                <h1 className="mb-1.5 text-2xl font-semibold leading-tight" style={{ color: '#0f172a' }}>
                  Verify your<br />identity
                </h1>
                <p className="mb-6 text-[13px] leading-relaxed" style={{ color: '#64748b' }}>
                  6-digit code sent to your number
                </p>

                {/* Phone pill */}
                <button
                  onClick={() => { setStage('PHONE'); setIsSignup(false); setError(null); setFieldErrors({}); }}
                  className="mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-all"
                  style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}
                >
                  <Smartphone className="h-3 w-3" />
                  +91 {phone}
                  <Edit2 className="h-2.5 w-2.5" style={{ color: '#64748b' }} />
                </button>

                {/* OTP cells */}
                <div className="mb-5 grid grid-cols-6 gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => (otpRefs.current[idx] = el)}
                      type="text" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }}
                      className="aspect-square w-full rounded-[9px] border text-center text-lg font-medium outline-none transition-all"
                      style={{
                        background: '#f8fafc', borderColor: digit ? '#cbd5e1' : '#e2e8f0',
                        color: digit ? '#10b981' : '#0f172a',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                      onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = digit ? '#cbd5e1' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  ))}
                </div>

                {/* Signup fields */}
                <AnimatePresence>
                  {isSignup && (
                    <motion.div key="signup"
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden border-t pt-5"
                      style={{ borderColor: '#cbd5e1', borderStyle: 'dashed' }}
                    >
                      <p className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#10b981' }}>
                        <span className="h-1 w-1 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 5px rgba(16,185,129,0.3)' }} />
                        New registration
                      </p>
                      <div className="space-y-3">
                        {/* Name */}
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#64748b' }} />
                          <input type="text" value={name} onChange={e => {setName(e.target.value); setFieldErrors(p => ({...p, name: ''}))}} placeholder="Full name"
                            className={`w-full rounded-[9px] border py-3 pl-10 pr-4 text-sm outline-none transition-all ${fieldErrors.name ? 'border-red-400 bg-red-50 text-red-900 placeholder:text-red-300' : ''}`}
                            style={fieldErrors.name ? { fontFamily: "'Sora', sans-serif" } : { background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a', fontFamily: "'Sora', sans-serif" }}
                          />
                          {fieldErrors.name && (
                            <p className="mt-1.5 ml-1 text-[11px] font-semibold text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"><AlertCircle className="h-3 w-3" /> {fieldErrors.name}</p>
                          )}
                        </div>
                        {/* Email */}
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#64748b' }} />
                          <input type="email" value={email} onChange={e => {setEmail(e.target.value); setFieldErrors(p => ({...p, email: ''}))}} placeholder="Email address"
                            className={`w-full rounded-[9px] border py-3 pl-10 pr-4 text-sm outline-none transition-all ${fieldErrors.email ? 'border-red-400 bg-red-50 text-red-900 placeholder:text-red-300' : ''}`}
                            style={fieldErrors.email ? { fontFamily: "'Sora', sans-serif" } : { background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a', fontFamily: "'Sora', sans-serif" }}
                          />
                          {fieldErrors.email && (
                            <p className="mt-1.5 ml-1 text-[11px] font-semibold text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"><AlertCircle className="h-3 w-3" /> {fieldErrors.email}</p>
                          )}
                        </div>
                        {/* PIN */}
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#64748b' }} />
                          <input
                            type="text" maxLength={6} value={pincode}
                            onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                            placeholder="PIN code"
                            className="w-full rounded-[9px] border py-3 pl-10 pr-16 text-sm font-medium tracking-widest outline-none transition-all"
                            style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a', fontFamily: "'JetBrains Mono', monospace" }}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            {isFetchingPin && <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#10b981' }} />}
                            {isPinVerified && <CheckCircle2 className="h-4 w-4" style={{ color: '#10b981' }} />}
                          </div>
                        </div>
                        {/* Location chips + village/block inputs */}
                        {isPinVerified && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 gap-2"
                          >
                            {[location.district, location.state].map((val, i) => (
                              <div key={i} className="flex items-center gap-2 rounded-[6px] border px-3 py-2 text-[11px] font-medium"
                                style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}
                              >
                                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#10b981' }} />
                                {val}
                              </div>
                            ))}
                            <input value={location.village} onChange={e => setLocation({ ...location, village: e.target.value })}
                              placeholder="Village name"
                              className="rounded-[6px] border px-3 py-2.5 text-xs outline-none transition-all"
                              style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontFamily: "'Sora', sans-serif" }}
                            />
                            <input value={location.block} onChange={e => setLocation({ ...location, block: e.target.value })}
                              placeholder="Block name"
                              className="rounded-[6px] border px-3 py-2.5 text-xs outline-none transition-all"
                              style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontFamily: "'Sora', sans-serif" }}
                            />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer row */}
                <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: '#e2e8f0' }}>
                  <button
                    disabled={resendTimer > 0}
                    onClick={handleSendOtp}
                    className="font-mono text-xs transition-colors disabled:opacity-40"
                    style={{ color: resendTimer > 0 ? '#64748b' : '#10b981', background: 'none', border: 'none', cursor: resendTimer > 0 ? 'default' : 'pointer' }}
                  >
                    {resendTimer > 0 ? `${resendTimer}s` : 'Resend code'}
                  </button>
                  <Button
                    onClick={() => handleFarmerVerify()}
                    disabled={isLoading || otp.includes('')}
                    className="flex items-center gap-2 rounded-[9px] px-6 py-2.5 text-[13px] font-semibold transition-all"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                  >
                    {isLoading
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : isSignup ? 'Create account' : 'Verify & enter'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── ADMIN CORE STAGE ── */}
            {stage === 'ADMIN_CORE' && (
              <motion.div key="admin" initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 12, opacity: 0 }}>
                <h1 className="mb-1.5 text-2xl font-semibold leading-tight" style={{ color: '#0f172a' }}>
                  Administrative<br />access
                </h1>
                <p className="mb-8 text-[13px] leading-relaxed" style={{ color: '#64748b' }}>
                  Government credentials required
                </p>
                <form onSubmit={handleAdminCore} className="space-y-3">
                  <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                    placeholder="officer@gov.in"
                    className="w-full rounded-[9px] border py-3 px-4 text-[13px] outline-none transition-all"
                    style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a', fontFamily: "'Sora', sans-serif" }}
                  />
                  <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full rounded-[9px] border py-3 px-4 text-[13px] outline-none transition-all"
                    style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a', fontFamily: "'Sora', sans-serif" }}
                  />
                  <Button type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-[9px] py-3 text-[13px] font-semibold"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', marginTop: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                  >
                    Authorize account →
                  </Button>
                </form>
                <div className="mt-5 border-t pt-4" style={{ borderColor: '#e2e8f0' }}>
                  <button onClick={switchToFarmer}
                    className="text-xs transition-colors"
                    style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#10b981')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                  >
                    ← Farmer access
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── ADMIN ASSIGN STAGE ── */}
            {stage === 'ADMIN_ASSIGN' && (
              <motion.div key="admin-assign" initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 12, opacity: 0 }}>
                <h1 className="mb-1.5 text-2xl font-semibold leading-tight" style={{ color: '#0f172a' }}>
                  Role assignment
                </h1>
                <p className="mb-6 text-[13px] leading-relaxed" style={{ color: '#64748b' }}>
                  Define your officer profile to proceed
                </p>
                {/* Verified email chip */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs break-all"
                  style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}
                >
                  <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: '#10b981' }} />
                  {adminEmail}
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-3">
                  <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)}
                    placeholder="Officer full name"
                    className="w-full rounded-[9px] border py-3 px-4 text-[13px] outline-none transition-all"
                    style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a', fontFamily: "'Sora', sans-serif" }}
                  />
                  <select value={adminBlock} onChange={e => setAdminBlock(e.target.value)}
                    className="w-full rounded-[9px] border py-3 px-4 text-[13px] outline-none transition-all"
                    style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: adminBlock ? '#0f172a' : '#64748b', fontFamily: "'Sora', sans-serif" }}
                  >
                    <option value="" disabled>Select department</option>
                    <option value="Agriculture">Agriculture sector</option>
                    <option value="Directorate">Central directorate</option>
                  </select>
                  <Button type="submit" disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-[9px] py-3 text-[13px] font-semibold"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', marginTop: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enter dashboard →'}
                  </Button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};