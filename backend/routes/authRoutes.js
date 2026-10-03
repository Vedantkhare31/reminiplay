const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendOTPEmail, GMAIL_SENDER } = require('../services/emailService');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'reminiplay_jwt_secret_key_2026_super_secure';

// Helper: Password Criteria Validator
const validatePasswordCriteria = (password) => {
  const minLength = password && password.length >= 8;
  const hasUpper = /[A-Z]/.test(password || '');
  const hasLower = /[a-z]/.test(password || '');
  const hasNumber = /[0-9]/.test(password || '');
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password || '');

  const isValid = minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  return {
    isValid,
    checks: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
    },
  };
};

// Helper: Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
    }
    req.user = decoded;
    next();
  });
};

// ============================================================
// 1. SEND OTP
// ============================================================
router.post('/send-otp', async (req, res) => {
  try {
    const { email, purpose = 'signup' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing user based on purpose
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (purpose === 'signup') {
      if (existingUser && existingUser.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please log in instead.',
        });
      }
    } else if (purpose === 'password_reset') {
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'No account registered with this email address. Please sign up first.',
        });
      }
    }

    // Invalidate prior active OTPs for this email and purpose
    await prisma.oTPCode.updateMany({
      where: {
        email: cleanEmail,
        purpose,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    // Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP in Database
    await prisma.oTPCode.create({
      data: {
        email: cleanEmail,
        code: otpCode,
        purpose,
        expiresAt,
        userId: existingUser ? existingUser.id : null,
      },
    });

    // Dispatch Email via Gmail SMTP
    const mailResult = await sendOTPEmail(cleanEmail, otpCode, purpose);

    return res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      deliveredLive: mailResult.deliveredLive,
      // Dev helper code included only if live delivery could not connect
      ...(mailResult.deliveredLive ? {} : { devCode: otpCode }),
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ success: false, message: 'Failed to send verification code. ' + error.message });
  }
});

// ============================================================
// 2. VERIFY OTP ONLY
// ============================================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, purpose = 'signup' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        email: cleanEmail,
        code: otp.trim(),
        purpose,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please request a new one.',
      });
    }

    return res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, message: 'Verification error: ' + error.message });
  }
});

// ============================================================
// 3. REGISTER NEW USER (WITH OTP + PASSWORD VALIDATION)
// ============================================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'patient', otp } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check Password Criteria
    const { isValid, checks } = validatePasswordCriteria(password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet required security criteria.',
        criteria: checks,
      });
    }

    // Verify OTP
    const validOtp = await prisma.oTPCode.findFirst({
      where: {
        email: cleanEmail,
        code: otp ? otp.trim() : '',
        purpose: 'signup',
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!validOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please verify with the code sent to your email.',
      });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing && existing.isEmailVerified && existing.passwordHash) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
    }

    // Hash password securely with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Create or update verified user
    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          passwordHash,
          role,
          isEmailVerified: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          role,
          isEmailVerified: true,
          coins: 100, // starting coins
          score: 0,
          level: 1,
          gameStats: JSON.stringify({ checkpoints: [1], drawingTier: 1, extraLives: 3 }),
        },
      });
    }

    // Mark OTP as consumed
    await prisma.oTPCode.update({
      where: { id: validOtp.id },
      data: { consumedAt: new Date() },
    });

    // Issue JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        coins: user.coins,
        score: user.score,
        level: user.level,
        gameStats: user.gameStats ? JSON.parse(user.gameStats) : {},
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
});

// ============================================================
// 4. LOGIN (STRICT AUTHENTICATION - NO UNREGISTERED ACCESS)
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Look up user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please create an account first.',
      });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: 'This account was registered via Google Sign-In. Please click "Continue with Google".',
      });
    }

    // Verify Password Hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your credentials or click "Forgot Password".',
      });
    }

    // Verify Email Status
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your email address is not yet verified. Please complete OTP verification.',
        needsVerification: true,
        email: user.email,
      });
    }

    // Generate JWT Session Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    let parsedStats = {};
    try {
      parsedStats = user.gameStats ? JSON.parse(user.gameStats) : {};
    } catch (e) {
      parsedStats = {};
    }

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        coins: user.coins,
        score: user.score,
        level: user.level,
        gameStats: parsedStats,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server login error: ' + error.message });
  }
});

// ============================================================
// 5. RESET PASSWORD VIA EMAIL OTP
// ============================================================
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP code, and new password are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Validate new password criteria
    const { isValid, checks } = validatePasswordCriteria(newPassword);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet required security criteria.',
        criteria: checks,
      });
    }

    // Verify OTP
    const validOtp = await prisma.oTPCode.findFirst({
      where: {
        email: cleanEmail,
        code: otp.trim(),
        purpose: 'password_reset',
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!validOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please request a new password reset email.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    // Hash new password and update
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Mark OTP consumed
    await prisma.oTPCode.update({
      where: { id: validOtp.id },
      data: { consumedAt: new Date() },
    });

    return res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ success: false, message: 'Password reset failed: ' + error.message });
  }
});

// ============================================================
// 6. GOOGLE SIGN-IN / SIGN-UP (CRYPTOGRAPHICALLY VERIFIED VIA GOOGLE)
// ============================================================
router.post('/google', async (req, res) => {
  try {
    const { credential, accessToken } = req.body;

    if (!credential && !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication token is required.',
      });
    }

    let verifiedEmail = null;
    let googleId = null;
    let name = null;
    let avatar = null;

    if (credential) {
      // Verify Google ID Token directly against Google's public tokeninfo API
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!googleRes.ok) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired Google token. Please sign in with Google again.',
        });
      }
      const googleData = await googleRes.json();
      if (!googleData.email || (googleData.email_verified !== 'true' && googleData.email_verified !== true)) {
        return res.status(401).json({
          success: false,
          message: 'Your Google email address is not verified by Google.',
        });
      }
      verifiedEmail = googleData.email.trim().toLowerCase();
      googleId = googleData.sub;
      name = googleData.name || verifiedEmail.split('@')[0];
      avatar = googleData.picture || null;
    } else if (accessToken) {
      // Verify Google OAuth2 Access Token against Google's userinfo API
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!googleRes.ok) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired Google session. Please sign in with Google again.',
        });
      }
      const googleData = await googleRes.json();
      if (!googleData.email || !googleData.email_verified) {
        return res.status(401).json({
          success: false,
          message: 'Your Google email address is not verified by Google.',
        });
      }
      verifiedEmail = googleData.email.trim().toLowerCase();
      googleId = googleData.sub;
      name = googleData.name || verifiedEmail.split('@')[0];
      avatar = googleData.picture || null;
    }

    if (!verifiedEmail) {
      return res.status(401).json({ success: false, message: 'Could not verify Google account.' });
    }

    // Look up or create user in database using verified email and Google ID
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(googleId ? [{ googleId }] : []),
          { email: verifiedEmail },
        ],
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleId,
          avatar: avatar || user.avatar,
          isEmailVerified: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: verifiedEmail,
          name: name || verifiedEmail.split('@')[0],
          googleId: googleId,
          avatar: avatar || null,
          role: 'patient',
          isEmailVerified: true,
          coins: 100,
          score: 0,
          level: 1,
          gameStats: JSON.stringify({ checkpoints: [1], drawingTier: 1, extraLives: 3 }),
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    let parsedStats = {};
    try {
      parsedStats = user.gameStats ? JSON.parse(user.gameStats) : {};
    } catch (e) {
      parsedStats = {};
    }

    return res.json({
      success: true,
      message: 'Google login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        coins: user.coins,
        score: user.score,
        level: user.level,
        gameStats: parsedStats,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ success: false, message: 'Google authentication failed: ' + error.message });
  }
});

// ============================================================
// 7. GET CURRENT USER PROFILE (/me)
// ============================================================
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        coins: true,
        score: true,
        level: true,
        gameStats: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let parsedStats = {};
    try {
      parsedStats = user.gameStats ? JSON.parse(user.gameStats) : {};
    } catch (e) {
      parsedStats = {};
    }

    return res.json({
      success: true,
      user: {
        ...user,
        gameStats: parsedStats,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile: ' + error.message });
  }
});

// ============================================================
// 8. SYNC USER PROGRESS (CROSS-DEVICE PERSISTENCE)
// ============================================================
router.post('/sync-progress', authenticateToken, async (req, res) => {
  try {
    const { coins, score, level, gameStats } = req.body;

    const updateData = {};
    if (coins !== undefined) updateData.coins = Number(coins);
    if (score !== undefined) updateData.score = Number(score);
    if (level !== undefined) updateData.level = Number(level);
    if (gameStats !== undefined) {
      updateData.gameStats = typeof gameStats === 'string' ? gameStats : JSON.stringify(gameStats);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        coins: true,
        score: true,
        level: true,
        gameStats: true,
      },
    });

    let parsedStats = {};
    try {
      parsedStats = updatedUser.gameStats ? JSON.parse(updatedUser.gameStats) : {};
    } catch (e) {
      parsedStats = {};
    }

    return res.json({
      success: true,
      message: 'Progress synced to database successfully',
      user: {
        ...updatedUser,
        gameStats: parsedStats,
      },
    });
  } catch (error) {
    console.error('Progress sync error:', error);
    return res.status(500).json({ success: false, message: 'Failed to sync progress: ' + error.message });
  }
});

module.exports = router;
