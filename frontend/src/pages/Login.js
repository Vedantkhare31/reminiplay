import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, Phone, Lock, User, Eye, EyeOff, 
  ChevronRight, Shield, AlertCircle, CheckCircle,
  Smartphone, AtSign, UserPlus, LogIn, Key
} from 'lucide-react';
import OTPInput from 'react-otp-input';
import OTPService from '../services/OTPService';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // States
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [otpTimer]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo login - accept any credentials
    if (identifier.trim() && password.trim()) {
      const userData = {
        id: Date.now(),
        name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
        email: identifier.includes('@') ? identifier : '',
        phone: !identifier.includes('@') ? identifier : '',
        role: 'patient',
        loginMethod: loginMethod
      };
      login(userData);
      navigate('/dashboard');
    } else {
      setError('Please enter valid credentials');
    }
    setIsLoading(false);
  };

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!identifier.trim()) {
      setError(`Please enter your ${loginMethod === 'email' ? 'email' : 'phone number'}`);
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Send OTP
    setIsLoading(true);
    const otpCode = OTPService.generateOTP();
    
    if (loginMethod === 'email') {
      await OTPService.sendOTPByEmail(identifier, otpCode);
    } else {
      await OTPService.sendOTPByPhone(identifier, otpCode);
    }
    
    setOtpSent(true);
    setStep(2);
    setOtpTimer(60);
    setResendDisabled(true);
    setIsLoading(false);
    setSuccess(`OTP sent to ${identifier}`);
  };

  // Verify OTP
  const handleVerifyOTP = () => {
    setIsLoading(true);
    const result = OTPService.verifyOTP(identifier, otp);
    
    if (result.success) {
      setOtpVerified(true);
      setSuccess('OTP verified successfully!');
      
      // Create account
      const userData = {
        id: Date.now(),
        name: fullName,
        email: loginMethod === 'email' ? identifier : '',
        phone: loginMethod === 'phone' ? identifier : '',
        role: role,
        loginMethod: loginMethod,
        isVerified: true
      };
      
      // Save to localStorage (simulate database)
      const users = JSON.parse(localStorage.getItem('reminiplay_users') || '[]');
      users.push(userData);
      localStorage.setItem('reminiplay_users', JSON.stringify(users));
      
      // Login user
      login(userData);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!identifier.trim()) {
      setError(`Please enter your ${loginMethod === 'email' ? 'email' : 'phone number'}`);
      return;
    }
    
    setIsLoading(true);
    const otpCode = OTPService.generateOTP();
    
    if (loginMethod === 'email') {
      await OTPService.sendOTPByEmail(identifier, otpCode);
    } else {
      await OTPService.sendOTPByPhone(identifier, otpCode);
    }
    
    setOtpSent(true);
    setStep(2);
    setOtpTimer(60);
    setResendDisabled(true);
    setIsLoading(false);
    setSuccess(`OTP sent to ${identifier} for password reset`);
  };

  // Resend OTP
  const handleResendOTP = () => {
    if (resendDisabled) return;
    const newOTP = OTPService.resendOTP(identifier);
    setOtpTimer(60);
    setResendDisabled(true);
    setSuccess('New OTP sent successfully');
  };

  // Toggle between Login and Signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setStep(1);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
    setError('');
    setSuccess('');
    setIdentifier('');
    setPassword('');
    setFullName('');
  };

  // Toggle login method
  const toggleLoginMethod = (method) => {
    setLoginMethod(method);
    setIdentifier('');
    setError('');
  };

  // Render Login Form
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* Identifier Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {loginMethod === 'email' ? (
              <Mail className="w-5 h-5 text-gray-400" />
            ) : (
              <Phone className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <input
            type={loginMethod === 'email' ? 'email' : 'tel'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => toggleLoginMethod('email')}
            className={`flex-1 py-1 text-xs rounded-lg transition-colors ${
              loginMethod === 'email' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <AtSign className="w-3 h-3 inline mr-1" /> Email
          </button>
          <button
            type="button"
            onClick={() => toggleLoginMethod('phone')}
            className={`flex-1 py-1 text-xs rounded-lg transition-colors ${
              loginMethod === 'phone' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Smartphone className="w-3 h-3 inline mr-1" /> Phone
          </button>
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Forgot Password */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => { setIsForgotPassword(true); setStep(1); setOtpSent(false); }}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Forgot Password?
        </button>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
          </span>
        ) : (
          <><LogIn className="w-5 h-5 mr-2" /> Login</>
        )}
      </button>

      {/* Switch to Signup */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign Up
          </button>
        </p>
      </div>
    </form>
  );

  // Render Signup Form
  const renderSignupForm = () => (
    <form onSubmit={handleRegister} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Identifier */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {loginMethod === 'email' ? (
              <Mail className="w-5 h-5 text-gray-400" />
            ) : (
              <Phone className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <input
            type={loginMethod === 'email' ? 'email' : 'tel'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => toggleLoginMethod('email')}
            className={`flex-1 py-1 text-xs rounded-lg transition-colors ${
              loginMethod === 'email' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <AtSign className="w-3 h-3 inline mr-1" /> Email
          </button>
          <button
            type="button"
            onClick={() => toggleLoginMethod('phone')}
            className={`flex-1 py-1 text-xs rounded-lg transition-colors ${
              loginMethod === 'phone' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Smartphone className="w-3 h-3 inline mr-1" /> Phone
          </button>
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password (min 6 characters)
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          I am a
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`p-4 rounded-xl border-2 transition-all ${
              role === 'patient'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="w-6 h-6 mx-auto mb-1 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium">Patient</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`p-4 rounded-xl border-2 transition-all ${
              role === 'doctor'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="w-6 h-6 mx-auto mb-1 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium">Doctor</span>
          </button>
        </div>
      </div>

      {/* Signup Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending OTP...
          </span>
        ) : (
          <><UserPlus className="w-5 h-5 mr-2" /> Create Account</>
        )}
      </button>

      {/* Switch to Login */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </form>
  );

  // Render OTP Verification
  const renderOTPVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {isForgotPassword ? 'Reset Password' : 'Verify Your Account'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {isForgotPassword 
            ? `We sent a 6-digit OTP to ${identifier}`
            : `We sent a 6-digit OTP to ${identifier}`
          }
        </p>
      </div>

      <div className="flex justify-center">
        <OTPInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          renderSeparator={<span className="mx-1"></span>}
          renderInput={(props) => (
            <input
              {...props}
              className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          )}
          containerStyle="flex gap-2"
        />
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          {otpTimer > 0 ? (
            `Resend in ${otpTimer}s`
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-primary-600 hover:text-primary-700 font-medium"
              disabled={resendDisabled}
            >
              Resend OTP
            </button>
          )}
        </p>
      </div>

      <button
        onClick={handleVerifyOTP}
        disabled={otp.length !== 6 || isLoading}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </span>
        ) : (
          <><CheckCircle className="w-5 h-5 mr-2" /> Verify OTP</>
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setStep(1);
          setOtp('');
          setOtpSent(false);
          setError('');
          if (isForgotPassword) setIsForgotPassword(false);
        }}
        className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800"
      >
        ← Back
      </button>
    </div>
  );

  // Render Forgot Password Form
  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
          <Key className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reset Password</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Enter your {loginMethod === 'email' ? 'email' : 'phone number'} to receive OTP
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {loginMethod === 'email' ? (
              <Mail className="w-5 h-5 text-gray-400" />
            ) : (
              <Phone className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <input
            type={loginMethod === 'email' ? 'email' : 'tel'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending OTP...
          </span>
        ) : (
          <><Key className="w-5 h-5 mr-2" /> Send OTP</>
        )}
      </button>

      <button
        type="button"
        onClick={() => { setIsForgotPassword(false); setStep(1); setError(''); }}
        className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800"
      >
        ← Back to Login
      </button>
    </form>
  );

  // Main Render
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-950/30 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="ReminiPlay" className="h-16 w-16 mx-auto mb-3" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
            ReminiPlay
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Error / Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center text-green-700 dark:text-green-300 text-sm">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Forms */}
          {isForgotPassword ? (
            step === 1 ? renderForgotPasswordForm() : renderOTPVerification()
          ) : step === 1 ? (
            isLogin ? renderLoginForm() : renderSignupForm()
          ) : (
            renderOTPVerification()
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;