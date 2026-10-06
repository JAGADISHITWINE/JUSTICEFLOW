const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../../shared/audit');
const { JWT_SECRET } = require('../../shared/authMiddleware');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, name, avatar, role } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and name are required.'
        });
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

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      await logAudit(newUser.id, `User registered: ${newUser.name}`, 'USER', newUser.id);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
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

  static async login(req, res) {
    try {
      const { email, password } = req.body;

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

      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      await logAudit(user.id, `User logged in: ${user.name}`, 'AUTH', user.id);

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
