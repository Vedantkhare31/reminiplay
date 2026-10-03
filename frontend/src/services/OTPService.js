import api from '../utils/api';

const extractErrorMessage = (error, defaultMsg) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Network Error')) {
    return 'Cannot reach backend server. Please make sure server.js is running on port 5000 (cd backend && npm start)';
  }
  return error.friendlyMessage || error.message || defaultMsg;
};

/**
 * ReminiPlay OTP Service
 * Dispatches verification emails via backend SMTP service
 * and validates 6-digit cryptographic OTPs.
 */
class OTPService {
  /**
   * Send OTP via Email
   * @param {string} email
   * @param {string} purpose - 'signup' | 'password_reset'
   */
  async sendOTP(email, purpose = 'signup') {
    try {
      const response = await api.post('/api/auth/send-otp', {
        email: email.trim().toLowerCase(),
        purpose,
      });
      return {
        success: true,
        message: response.data.message || 'OTP sent successfully',
        deliveredLive: response.data.deliveredLive,
        devCode: response.data.devCode,
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Failed to send OTP'),
      };
    }
  }

  /**
   * Verify 6-digit OTP code with backend
   * @param {string} email
   * @param {string} otp
   * @param {string} purpose
   */
  async verifyOTP(email, otp, purpose = 'signup') {
    try {
      const response = await api.post('/api/auth/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        purpose,
      });
      return {
        success: true,
        message: response.data.message || 'OTP verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Invalid or expired OTP code'),
      };
    }
  }

  /**
   * Register a new verified account
   */
  async register({ name, email, password, role, otp }) {
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email: email.trim().toLowerCase(),
        password,
        role,
        otp: otp.trim(),
      });
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Registration failed'),
        criteria: error.response?.data?.criteria,
      };
    }
  }

  /**
   * Authenticate existing registered account
   */
  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Login failed. Please verify credentials.'),
      };
    }
  }

  /**
   * Reset forgotten password with OTP
   */
  async resetPassword({ email, otp, newPassword }) {
    try {
      const response = await api.post('/api/auth/forgot-password/reset', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Password reset failed'),
        criteria: error.response?.data?.criteria,
      };
    }
  }

  /**
   * Sign in / sign up with Google
   */
  async googleAuth(profile) {
    try {
      const response = await api.post('/api/auth/google', profile);
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Google sign-in failed'),
      };
    }
  }
}
const otpService = new OTPService();
export default otpService;