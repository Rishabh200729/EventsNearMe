import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService.js';
import { AuthRequest } from '../middleware/auth.js';

export class AuthController {
  private authService = AuthService;

  // Register user
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, token } = await this.authService.register(req.body);

      res.status(201).json({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Login user
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { user, token } = await this.authService.login(email, password);

      res.json({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Logout user
  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await this.authService.logout(token);
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get current user
  getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.getCurrentUser(req.user!._id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  // Update profile
  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.updateProfile(req.user!._id, req.body);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  // Change password
  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      await this.authService.changePassword(req.user!._id, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Request password reset
  requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      await this.authService.requestPasswordReset(email);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (error) {
      next(error);
    }
  };

  // Reset password
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      await this.authService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Verify email
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.params;

      const user = await this.authService.verifyEmail(token);

      if (!user) {
        res.status(400).json({
          success: false,
          error: 'Invalid or expired verification token'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Email verified successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();