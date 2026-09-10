// OTP Service - Simulates OTP sending and verification
// In production, replace with actual API calls

class OTPService {
  constructor() {
    // Store OTPs temporarily (in production, this would be on the server)
    this.otpStorage = {};
  }

  // Generate a random 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via Email (simulated)
  async sendOTPByEmail(email, otp) {
    console.log(`📧 Sending OTP ${otp} to ${email}`);
    
    // In production, this would be an API call
    // For demo, we'll just store it and show an alert
    this.otpStorage[email] = otp;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show OTP in alert for demo purposes
    alert(`📧 OTP sent to ${email}\n\nYour OTP is: ${otp}\n\n(Check console for details)`);
    
    return { success: true, message: 'OTP sent successfully' };
  }

  // Send OTP via SMS (simulated)
  async sendOTPByPhone(phone, otp) {
    console.log(`📱 Sending OTP ${otp} to ${phone}`);
    
    this.otpStorage[phone] = otp;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert(`📱 OTP sent to ${phone}\n\nYour OTP is: ${otp}\n\n(Check console for details)`);
    
    return { success: true, message: 'OTP sent successfully' };
  }

  // Verify OTP
  verifyOTP(identifier, otp) {
    const storedOTP = this.otpStorage[identifier];
    
    if (!storedOTP) {
      return { success: false, message: 'No OTP found. Please request a new OTP.' };
    }
    
    if (storedOTP === otp) {
      // Clear OTP after successful verification
      delete this.otpStorage[identifier];
      return { success: true, message: 'OTP verified successfully' };
    }
    
    return { success: false, message: 'Invalid OTP. Please try again.' };
  }

  // Resend OTP
  resendOTP(identifier) {
    const newOTP = this.generateOTP();
    this.otpStorage[identifier] = newOTP;
    
    // Determine if it's email or phone
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      alert(`📧 New OTP sent to ${identifier}\n\nYour OTP is: ${newOTP}`);
    } else {
      alert(`📱 New OTP sent to ${identifier}\n\nYour OTP is: ${newOTP}`);
    }
    
    return { success: true, message: 'OTP resent successfully', otp: newOTP };
  }
}

export default new OTPService();