import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, Lock, User, Eye, EyeOff, 
  Shield, AlertCircle, CheckCircle,
  LogIn, UserPlus, Key, ArrowLeft, Check, X
} from 'lucide-react';
import OTPInput from 'react-otp-input';
import OTPService from '../services/OTPService';

// Password criteria checks
const checkPasswordCriteria = (pwd) => {
  return {
    minLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
  };
};

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // Views: 'login' | 'signup' | 'otp_verify' | 'forgot_password_request' | 'forgot_password_reset'
  const [view, setView] = useState('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [devCodeHint, setDevCodeHint] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  // Password criteria status
  const pwdCriteria = checkPasswordCriteria(password);
  const isPwdValid = Object.values(pwdCriteria).every(Boolean);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // OTP Countdown Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [otpTimer]);

  // Clean error/success when switching views
  const switchView = (newView) => {
    setView(newView);
    setError('');
    setSuccess('');
    setOtp('');
    setDevCodeHint('');
  };

  // ============================================================
  // 1. HANDLE LOGIN
  // ============================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    const result = await OTPService.login(email, password);
    setIsLoading(false);

    if (result.success) {
      login(result.user, result.token);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } else {
      setError(result.message);
    }
  };

  // ============================================================
  // 2. REQUEST SIGNUP OTP
  // ============================================================
  const handleRequestSignupOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isPwdValid) {
      setError('Password must meet all 5 security criteria listed below.');
      return;
    }

    setIsLoading(true);
    const result = await OTPService.sendOTP(email, 'signup');
    setIsLoading(false);

    if (result.success) {
      setDevCodeHint(result.devCode || '');
      setOtpTimer(60);
      setResendDisabled(true);
      switchView('otp_verify');
      setSuccess(`Verification code sent to ${email}. Please check your inbox.`);
    } else {
      setError(result.message);
    }
  };

  // ============================================================
  // 3. VERIFY SIGNUP OTP & CREATE ACCOUNT
  // ============================================================
  const handleVerifySignupOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await OTPService.register({
      name: fullName,
      email,
      password,
      role,
      otp,
    });
    setIsLoading(false);

    if (result.success) {
      setSuccess('Account created and verified successfully! Redirecting...');
      login(result.user, result.token);
      setTimeout(() => {
        navigate('/dashboard');
      }, 900);
    } else {
      setError(result.message);
    }
  };

  // ============================================================
  // 4. REQUEST FORGOT PASSWORD OTP
  // ============================================================
  const handleRequestForgotPasswordOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter the registered email address.');
      return;
    }

    setIsLoading(true);
    const result = await OTPService.sendOTP(email, 'password_reset');
    setIsLoading(false);

    if (result.success) {
      setDevCodeHint(result.devCode || '');
      setOtpTimer(60);
      setResendDisabled(true);
      switchView('forgot_password_reset');
      setSuccess(`Password reset code sent to ${email}. Please check your inbox.`);
    } else {
      setError(result.message);
    }
  };

  // ============================================================
  // 5. SUBMIT NEW PASSWORD WITH OTP
  // ============================================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit code received on your email.');
      return;
    }
    if (!isPwdValid) {
      setError('New password must satisfy all security requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please recheck.');
      return;
    }

    setIsLoading(true);
    const result = await OTPService.resetPassword({
      email,
      otp,
      newPassword: password,
    });
    setIsLoading(false);

    if (result.success) {
      setSuccess('Password updated successfully! Please login with your new password.');
      setPassword('');
      setConfirmPassword('');
      setOtp('');
      setTimeout(() => {
        switchView('login');
      }, 1200);
    } else {
      setError(result.message);
    }
  };

  // ============================================================
  // 6. RESEND OTP
  // ============================================================
  const handleResendOTP = async () => {
    if (resendDisabled) return;
    setError('');
    setSuccess('');
    setIsLoading(true);

    const purpose = view === 'forgot_password_reset' ? 'password_reset' : 'signup';
    const result = await OTPService.sendOTP(email, purpose);
    setIsLoading(false);

    if (result.success) {
      setDevCodeHint(result.devCode || '');
      setOtpTimer(60);
      setResendDisabled(true);
      setSuccess(`New verification code sent to ${email}`);
    } else {
      setError(result.message);
    }
  };

  // ============================================================
  // 7. GOOGLE SIGN-IN HANDLER (BROWSER ACCOUNT DETECTION & SELECTION)
  // ============================================================
  const ensureGoogleLoaded = () => {
    return new Promise((resolve) => {
      if (window.google?.accounts?.oauth2) {
        return resolve(true);
      }
      const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      } else {
        let count = 0;
        const interval = setInterval(() => {
          count++;
          if (window.google?.accounts?.oauth2 || count > 30) {
            clearInterval(interval);
            resolve(!!window.google?.accounts?.oauth2);
          }
        }, 100);
      }
    });
  };

  const triggerGoogleAccountChooser = async (activeId) => {
    const isLoaded = await ensureGoogleLoaded();
    if (!isLoaded || !window.google?.accounts?.oauth2) {
      setError('Google Sign-In is initializing. Please wait a second and try again.');
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: activeId,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            if (tokenResponse.error !== 'popup_closed_by_user') {
              setError(`Google Sign-In error: ${tokenResponse.error_description || tokenResponse.error}`);
            }
            return;
          }

          setIsLoading(true);
          setError('');
          setSuccess('Verifying Google credentials with Google security servers...');

          // The backend cryptographically validates the token directly with Google's servers
          const result = await OTPService.googleAuth({ accessToken: tokenResponse.access_token });
          setIsLoading(false);

          if (result.success) {
            setSuccess('Google account verified! Logging in...');
            login(result.user, result.token);
            setTimeout(() => {
              navigate('/dashboard');
            }, 700);
          } else {
            setError(result.message);
          }
        },
      });

      // Opens native Google popup showing all logged-in accounts on user's browser!
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setError('Google Sign-In failed: ' + err.message);
    }
  };

  const DEFAULT_GOOGLE_CLIENT_ID = '716226754695-ln56t5l91t4bkibvg7ermcf6i2i70asl.apps.googleusercontent.com';

  const handleGoogleSignInClick = () => {
    setError('');
    setSuccess('');
    const activeId = process.env.REACT_APP_GOOGLE_CLIENT_ID || localStorage.getItem('reminiplay_google_client_id') || DEFAULT_GOOGLE_CLIENT_ID;
    if (!activeId) {
      setError('Google Sign-In requires a Google Client ID. Please set REACT_APP_GOOGLE_CLIENT_ID in .env.local.');
      return;
    }
    triggerGoogleAccountChooser(activeId);
  };

  // Helper component to render Password Criteria Checklist
  const renderPasswordCriteria = () => (
    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700/60 text-xs space-y-1.5">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Password Requirements:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        <div className={`flex items-center gap-1.5 ${pwdCriteria.minLength ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
          {pwdCriteria.minLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
          <span>At least 8 characters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${pwdCriteria.hasUpper ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
          {pwdCriteria.hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
          <span>One uppercase letter (A-Z)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${pwdCriteria.hasLower ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
          {pwdCriteria.hasLower ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
          <span>One lowercase letter (a-z)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${pwdCriteria.hasNumber ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
          {pwdCriteria.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
          <span>One number (0-9)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${pwdCriteria.hasSpecial ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
          {pwdCriteria.hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
          <span>One special symbol (!@#$)</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/40 p-4">
      <div className="w-full max-w-md">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white shadow-lg shadow-primary-500/30 mb-3 text-3xl font-black">
            🧠
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
            ReminiPlay
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {view === 'login' && 'Sign in to access your games and progress'}
            {view === 'signup' && 'Create your account with email OTP verification'}
            {view === 'otp_verify' && 'Verify your email to activate account'}
            {view === 'forgot_password_request' && 'Reset your forgotten password'}
            {view === 'forgot_password_reset' && 'Set a secure new password'}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/80 p-6 md:p-8 backdrop-blur-sm">
          
          {/* Status Notifications */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-2xl flex items-start text-red-700 dark:text-red-300 text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 mr-2.5 flex-shrink-0 mt-0.5 text-red-500" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-start text-emerald-700 dark:text-emerald-300 text-sm animate-fadeIn">
              <CheckCircle className="w-5 h-5 mr-2.5 flex-shrink-0 mt-0.5 text-emerald-500" />
              <div className="leading-snug">{success}</div>
            </div>
          )}

          {/* Development / Offline Helper Notice if Live SMTP is pending app password */}
          {devCodeHint && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>Code received: <strong className="font-mono text-sm tracking-wider text-amber-900 dark:text-amber-100">{devCodeHint}</strong></span>
              <button 
                type="button" 
                onClick={() => setOtp(devCodeHint)} 
                className="px-2 py-1 bg-amber-200 dark:bg-amber-800 rounded text-amber-900 dark:text-amber-100 font-bold hover:bg-amber-300"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 1: LOGIN FORM                                           */}
          {/* ============================================================ */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchView('forgot_password_request')}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span> Verifying credentials...
                  </span>
                ) : (
                  <><LogIn className="w-5 h-5 mr-2" /> Log In</>
                )}
              </button>

              {/* Social Login Separator */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <span className="relative px-3 bg-white dark:bg-gray-800 text-xs text-gray-400 uppercase tracking-wider">
                  Or continue with
                </span>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={isLoading}
                className="w-full py-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center"
              >
                <GoogleIcon />
                Sign in with Google
              </button>

              {/* Switch to Signup */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('signup')}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-bold"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: SIGN UP FORM                                         */}
          {/* ============================================================ */}
          {view === 'signup' && (
            <form onSubmit={handleRequestSignupOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Gmail / Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                {renderPasswordCriteria()}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      role === 'patient'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <User className="w-4 h-4" /> Patient / Player
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      role === 'doctor'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Shield className="w-4 h-4" /> Doctor / Carer
                  </button>
                </div>
              </div>

              {/* Signup Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isPwdValid}
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span> Dispatching OTP...
                  </span>
                ) : (
                  <><UserPlus className="w-5 h-5 mr-2" /> Send Verification OTP</>
                )}
              </button>

              {/* Social Login Separator */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <span className="relative px-3 bg-white dark:bg-gray-800 text-xs text-gray-400 uppercase tracking-wider">
                  Or register with
                </span>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={isLoading}
                className="w-full py-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center"
              >
                <GoogleIcon />
                Sign up with Google
              </button>

              {/* Switch back to Login */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-bold"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: OTP VERIFICATION (SIGN UP)                           */}
          {/* ============================================================ */}
          {view === 'otp_verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Enter 6-Digit Code
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                  We sent a 6-digit verification code to <span className="font-semibold text-gray-900 dark:text-white">{email}</span>. Please check your inbox.
                </p>
              </div>

              {/* 6-Digit OTP Box */}
              <div className="flex justify-center">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  renderSeparator={<span className="mx-1 text-gray-300">-</span>}
                  renderInput={(props) => (
                    <input
                      {...props}
                      className="w-11 h-14 text-center text-2xl font-mono font-bold bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  )}
                  containerStyle="flex gap-1.5 justify-center"
                />
              </div>

              {/* Resend Countdown */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  {otpTimer > 0 ? (
                    <span>Resend code in <strong className="text-primary-600 font-bold">{otpTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-bold text-xs"
                      disabled={resendDisabled}
                    >
                      Resend OTP Code
                    </button>
                  )}
                </p>
              </div>

              {/* Confirm & Activate Account */}
              <button
                type="button"
                onClick={handleVerifySignupOTP}
                disabled={otp.length !== 6 || isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span> Activating account...
                  </span>
                ) : (
                  <><CheckCircle className="w-5 h-5 mr-2" /> Verify & Create Account</>
                )}
              </button>

              <button
                type="button"
                onClick={() => switchView('signup')}
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Signup Details
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 4: FORGOT PASSWORD REQUEST (EMAIL ENTRY)                */}
          {/* ============================================================ */}
          {view === 'forgot_password_request' && (
            <form onSubmit={handleRequestForgotPasswordOTP} className="space-y-4">
              <div className="text-center mb-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-2">
                  <Key className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recover Password</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Enter your registered email address. We'll send a 6-digit verification code to reset your password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span> Sending Reset Code...
                  </span>
                ) : (
                  <><Key className="w-5 h-5 mr-2" /> Send Reset OTP</>
                )}
              </button>

              <button
                type="button"
                onClick={() => switchView('login')}
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </button>
            </form>
          )}

          {/* ============================================================ */}
          {/* VIEW 5: FORGOT PASSWORD RESET (OTP + NEW PASSWORD)           */}
          {/* ============================================================ */}
          {view === 'forgot_password_reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-2">
                  <Key className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Password</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Enter the 6-digit OTP code sent to <strong>{email}</strong>
                </p>
              </div>

              {/* 6-Digit OTP */}
              <div className="flex justify-center my-2">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  renderSeparator={<span className="mx-1 text-gray-300">-</span>}
                  renderInput={(props) => (
                    <input
                      {...props}
                      className="w-10 h-13 text-center text-xl font-mono font-bold bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  )}
                  containerStyle="flex gap-1.5 justify-center"
                />
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  {otpTimer > 0 ? (
                    <span>Resend in <strong className="text-amber-600 font-bold">{otpTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-bold text-xs"
                      disabled={resendDisabled}
                    >
                      Resend Reset OTP
                    </button>
                  )}
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {renderPasswordCriteria()}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isPwdValid || password !== confirmPassword || otp.length !== 6}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span> Updating Password...
                  </span>
                ) : (
                  <><Key className="w-5 h-5 mr-2" /> Reset & Save Password</>
                )}
              </button>

              <button
                type="button"
                onClick={() => switchView('login')}
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </button>
            </form>
          )}

        </div>

        {/* Security Assurance Footer */}
        <div className="text-center mt-6 space-y-1 text-xs text-gray-400 dark:text-gray-500">
          <p className="flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500 inline" />
            256-Bit Encrypted & Database-Synchronized
          </p>
        </div>



      </div>
    </div>
  );
};

export default Login;