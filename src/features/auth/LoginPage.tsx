import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, ShieldCheck, MapPin, User, Mail, Smartphone, ArrowRight } from 'lucide-react';
import { useAppDispatch } from '../../hooks';
import { login } from './authSlice';
import { Button } from '../../components/ui';
import authService, { VerifyPayload, Location as ProfileLocation } from '../../services/authService';

export const LoginPage: React.FC = () => {
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

  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic for resend OTP
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending OTP to:', phone);
      const res = await authService.sendOtp(phone);
      console.log('OTP Response:', res);
      setStep(2);
      setResendTimer(60);
    } catch (err: any) {
      console.error('OTP Error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Trigger profile detail disclosure
    if (newOtp.every(digit => digit !== '')) {
      setShowProfile(true);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      setShowProfile(false);
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join('');

    if (finalOtp.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (!name || !email || !location.village || !location.block || !location.district || !location.state) {
      setError('Please complete your profile details');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: VerifyPayload = {
      phone: phone,
      otp: finalOtp,
      name,
      email,
      permanentLocation: location
    };

    try {
      const response = await authService.verifyOtp(payload);

      // Update global state
      dispatch(login({
        user: response.user,
        accessToken: response.accessToken || (response as any).token,
        refreshToken: response.refreshToken || ''
      }));

      // High-end Onboarding Navigation
      // First redirect to dashboard
      navigate('/dashboard');

      // Then specifically trigger navigation to Add Plots after a short delay for visual transition
      setTimeout(() => {
        navigate('/plots/create');
      }, 800);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-['Inter']">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-md w-full relative z-10 transition-all duration-500">
        {/* Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[2.5rem] overflow-hidden">
          <div className="p-10">
            {/* Header section */}
            <div className="mb-10 text-center">
              {step === 2 && (
                <button
                  onClick={() => { setStep(1); setShowProfile(false); }}
                  className="absolute left-8 top-8 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-2xl shadow-xl shadow-emerald-500/20 mb-6 mx-auto">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-white tracking-tight">FMS Pro</h1>
              <p className="text-slate-400 text-sm mt-2 font-medium uppercase tracking-[0.2em]">Advanced Agriculture</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            {step === 1 ? (
              /* STEP 1: PHONE INPUT (MINIMALIST) */
              <form onSubmit={handleSendOtp} className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <h2 className="text-xl font-semibold text-white">Start your journey</h2>
                    <p className="text-slate-500 text-sm mt-1">Enter your phone number to continue</p>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                      <span className="text-lg font-bold border-r border-white/10 pr-4">+91</span>
                      <Smartphone className="h-5 w-5 ml-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="86884XXXXX"
                      className="w-full pl-28 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white/10 transition-all text-white text-lg font-medium tracking-[0.1em] placeholder:text-slate-600 placeholder:tracking-normal"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-600/20 transition-all font-bold text-lg flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      Verify Account
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* STEP 2: VERIFICATION & PROGRESSIVE DISCLOSURE */
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white">Verify Intelligence</h2>
                  <p className="text-slate-500 text-sm mt-1">Code sent to +91 ******{phone.slice(-4)}</p>
                </div>

                {/* OTP INPUTS */}
                <div className="flex justify-between gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-full h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white/10 transition-all text-white"
                    />
                  ))}
                </div>

                {/* PROGRESSIVE DISCLOSURE: PROFILE DETAILS */}
                <div
                  className={`space-y-6 overflow-hidden transition-all duration-700 ease-in-out ${showProfile ? 'max-h-[800px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}
                >
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-500">Personalize Your Dashboard</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Mohit"
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 transition-all text-white text-sm"
                        />
                      </div>
                      <div className="col-span-2 relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="mohit@gmail.com"
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 transition-all text-white text-sm"
                        />
                      </div>

                      {/* Location Grid */}
                      <div className="col-span-2 mt-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-4">Farm Location</p>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={location.village}
                            onChange={(e) => setLocation({ ...location, village: e.target.value })}
                            placeholder="Village"
                            className="px-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 transition-all text-white text-sm"
                          />
                          <input
                            type="text"
                            value={location.block}
                            onChange={(e) => setLocation({ ...location, block: e.target.value })}
                            placeholder="Block"
                            className="px-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 transition-all text-white text-sm"
                          />
                          <input
                            type="text"
                            value={location.district}
                            onChange={(e) => setLocation({ ...location, district: e.target.value })}
                            placeholder="District"
                            className="px-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 transition-all text-white text-sm"
                          />
                          <input
                            type="text"
                            value={location.state}
                            onChange={(e) => setLocation({ ...location, state: e.target.value })}
                            placeholder="State"
                            className="px-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 transition-all text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-6 pt-4">
                    <Button
                      onClick={handleVerify}
                      disabled={isLoading}
                      className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-600/20 transition-all font-bold group"
                    >
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Finalize Setup
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>

                    <div className="flex items-center gap-4">
                      {resendTimer > 0 ? (
                        <p className="text-xs text-slate-500 font-medium">
                          Resend security code in <span className="text-emerald-500 tabular-nums">{resendTimer}s</span>
                        </p>
                      ) : (
                        <button
                          onClick={handleSendOtp}
                          className="text-xs text-emerald-500 font-bold hover:text-emerald-400 transition-colors underline decoration-emerald-500/30 underline-offset-4"
                        >
                          Send code again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Branding */}
          <div className="px-10 py-6 bg-white/5 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3 mr-2 text-emerald-500" />
              E2E Encrypted
            </div>
            <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <MapPin className="h-3 w-3 mr-2 text-blue-500" />
              Agri-Global 4.0
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-top {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-in-from-right {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top;
        }
        .slide-in-from-right-8 {
          animation-name: slide-in-from-right;
        }
      `}</style>
    </div>
  );
};
