const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../../shared/audit');
const { JWT_SECRET } = require('../../shared/authMiddleware');
const emailService = require('../../shared/emailService');

const registrationOtps = new Map(); // email -> { otp, expiresAt }

class AuthController {
  static async sendRegistrationOtp(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in or reset your password.'
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      registrationOtps.set(email.toLowerCase().trim(), {
        otp,
        expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
      });

      // Dispatch real email via SMTP
      const mailRes = await emailService.sendOtpEmail({
        to: email,
        otp,
        purpose: 'Lawyer Account Registration Verification'
      });

      return res.json({
        success: true,
        message: mailRes.sent
          ? `Security verification code sent to ${email}. Please check your inbox.`
          : `Security verification code generated for ${email}.`,
        otp,
        email,
        emailSent: mailRes.sent
      });
    } catch (err) {
      console.error('[Send Registration OTP Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to send verification code.' });
    }
  }

  static async register(req, res) {
    try {
      const { email, password, name, avatar, role, otp } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and name are required.'
        });
      }

      // Verify OTP if provided
      const cleanEmail = email.toLowerCase().trim();
      if (otp) {
        const cached = registrationOtps.get(cleanEmail);
        if (!cached || cached.otp !== String(otp).trim() || Date.now() > cached.expiresAt) {
          return res.status(400).json({
            success: false,
            message: 'Invalid or expired email verification code. Please request a new code.'
          });
        }
        registrationOtps.delete(cleanEmail);
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      const newUser = await UserModel.create({
        email,
        password,
        name,
        avatar,
        role: role || 'lawyer'
      });

      const tokenPayload = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

      // Initialize active session
      await UserModel.setActiveSession(newUser.id, token);
      await logAudit(newUser.id, `User registered and verified: ${newUser.name}`, 'USER', newUser.id);

      return res.status(201).json({
        success: true,
        message: 'Account created and verified successfully.',
        data: {
          token,
          user: newUser
        }
      });
    } catch (err) {
      console.error('[Auth Register Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while registering user.'
      });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No registered account found with this email address.'
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await UserModel.setResetOtp(email, otp);
      await logAudit(user.id, `Password reset code requested for: ${user.name}`, 'AUTH', user.id);

      // Dispatch real email via SMTP
      const mailRes = await emailService.sendOtpEmail({
        to: email,
        otp,
        purpose: 'Account Password Reset Code'
      });

      return res.json({
        success: true,
        message: mailRes.sent
          ? `Password reset verification code sent to ${email}. Please check your inbox.`
          : `Password reset verification code generated for ${email}.`,
        otp,
        email,
        emailSent: mailRes.sent
      });
    } catch (err) {
      console.error('[Forgot Password Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to process forgot password request.' });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, verification code, and new password are required.'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      const validUser = await UserModel.verifyResetOtp(email, String(otp).trim());
      if (!validUser) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code. Please request a new code.'
        });
      }

      await UserModel.updatePassword(email, newPassword);
      await logAudit(validUser.id, `Password successfully reset for: ${validUser.name}`, 'AUTH', validUser.id);

      return res.json({
        success: true,
        message: 'Password has been reset successfully. You can now sign in with your new password.'
      });
    } catch (err) {
      console.error('[Reset Password Error]', err);
      return res.status(500).json({ success: false, message: 'Internal server error while resetting password.' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password, forceUnlock, currentToken } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const isMatch = await UserModel.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Check current active session in database
      const sessionData = await UserModel.getSessionStatus(user.id);

      if (sessionData && sessionData.is_active_session) {
        // 1. Same session token from same browser
        const isSameSession = Boolean(currentToken && sessionData.active_session_token === currentToken);

        // 2. Is previous session abandoned/stale? (Heartbeat stopped for > 75 seconds)
        const isStale = Boolean(sessionData.inactive_seconds !== null && sessionData.inactive_seconds !== undefined && sessionData.inactive_seconds > 75);

        // 3. User requested explicit takeover / force sign in
        const isForced = Boolean(forceUnlock);

        if (!isSameSession && !isStale && !isForced) {
          return res.status(403).json({
            success: false,
            isConcurrentSession: true,
            canForceUnlock: true,
            inactiveSeconds: sessionData.inactive_seconds || 0,
            message: 'Account is currently active in another session or window. If you closed the browser or forgot to sign out, you can terminate the old session and sign in here.'
          });
        }

        // Release previous session before binding new one
        await UserModel.clearActiveSession(user.id);
        const reason = isSameSession ? 'same-browser re-authentication' : isStale ? 'stale abandoned session' : 'user override';
        await logAudit(user.id, `Previous session cleared (${reason}): ${user.name}`, 'AUTH', user.id);
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      // Long-lived JWT token (30 days) to prevent unexpected session timeout during work
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

      // Save active session in MySQL database
      await UserModel.setActiveSession(user.id, token);
      await logAudit(user.id, `User logged in (Single active session initialized): ${user.name}`, 'AUTH', user.id);

      // Return user without password
      const userProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        created_at: user.created_at
      };

      return res.json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          user: userProfile
        }
      });
    } catch (err) {
      console.error('[Auth Login Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authentication.'
      });
    }
  }

  static async logout(req, res) {
    try {
      let userId = req.user ? req.user.id : (req.body && req.body.userId);
      if (!userId && req.body && req.body.email) {
        const u = await UserModel.findByEmail(req.body.email);
        if (u) userId = u.id;
      }
      if (userId) {
        await UserModel.clearActiveSession(userId);
        await logAudit(userId, `User logged out, active session lock released.`, 'AUTH', userId);
      }
      return res.json({
        success: true,
        message: 'Logged out successfully. Active session released.'
      });
    } catch (err) {
      console.error('[Auth Logout Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during logout.'
      });
    }
  }

  static async heartbeat(req, res) {
    try {
      const userId = req.user.id;
      const sessionData = await UserModel.getSessionStatus(userId);

      if (!sessionData || !sessionData.is_active_session) {
        return res.status(401).json({
          success: false,
          expired: true,
          message: 'Session has ended or logged out.'
        });
      }

      // Update last activity timestamp in MySQL to keep session alive
      await UserModel.updateLastActivity(userId);

      return res.json({
        success: true,
        active: true
      });
    } catch (err) {
      console.error('[Auth Heartbeat Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Heartbeat update failed.'
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found.'
        });
      }

      return res.json({
        success: true,
        data: user
      });
    } catch (err) {
      console.error('[Auth Profile Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching profile.'
      });
    }
  }

  static async verify(req, res) {
    return res.json({
      success: true,
      valid: true,
      user: req.user
    });
  }

  static async listUsers(req, res) {
    try {
      const users = await UserModel.getAllStaff();
      return res.json({
        success: true,
        data: users
      });
    } catch (err) {
      console.error('[Auth List Users Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve staff members.'
      });
    }
  }
}

module.exports = AuthController;
