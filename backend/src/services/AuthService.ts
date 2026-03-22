import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import UserRepository from '../repositories/UserRepository.js';
import { redisClient } from '../config/redis.config.js';
import { logger } from '../config/logger.js';
import { IUser } from '../models/User.js';

export class AuthService {
  private userRepo = UserRepository;
  private jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
  private jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'user' | 'organizer';
  }): Promise<{ user: IUser; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepo.findByEmail(userData.email);
      if (existingUser) {
        const error: any = new Error('User already exists with this email');
        error.statusCode = 400;
        throw error;
      }

      // Create user
      const user = await this.userRepo.create({
        ...userData,
        role: userData.role || 'user'
      });

      // Generate JWT token
      const token = this.generateToken(user._id);

      logger.info(`User registered: ${user._id} (${user.email})`);
      return { user, token };
    } catch (error) {
      logger.error('Error in register service:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    try {
      // Find user by email
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        const error: any = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        const error: any = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      // Generate JWT token
      const token = this.generateToken(user._id);

      logger.info(`User logged in: ${user._id} (${user.email})`);
      return { user, token };
    } catch (error) {
      logger.error('Error in login service:', error);
      throw error;
    }
  }

  async logout(token: string): Promise<void> {
    try {
      // Add token to blacklist (with expiration matching JWT)
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        await redisClient.setex(`blacklist:${token}`, ttl, 'true');
      }

      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Error in logout service:', error);
      throw error;
    }
  }

  async getCurrentUser(userId: string): Promise<IUser | null> {
    try {
      return await this.userRepo.findById(userId);
    } catch (error) {
      logger.error('Error in getCurrentUser service:', error);
      throw error;
    }
  }

  async updateProfile(
    userId: string,
    updateData: Partial<Pick<IUser, 'firstName' | 'lastName' | 'avatar'>>
  ): Promise<IUser | null> {
    try {
      return await this.userRepo.update(userId, updateData);
    } catch (error) {
      logger.error('Error in updateProfile service:', error);
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      await this.userRepo.updatePassword(userId, newPassword);

      logger.info(`Password changed for user: ${userId}`);
    } catch (error) {
      logger.error('Error in changePassword service:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await this.userRepo.setPasswordResetToken(user._id, resetToken, resetExpires);

      // TODO: Send email with reset token
      // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      logger.info(`Password reset requested for: ${email}`);
    } catch (error) {
      logger.error('Error in requestPasswordReset service:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepo.findByPasswordResetToken(token);
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      await this.userRepo.updatePassword(user._id, newPassword);

      logger.info(`Password reset successful for user: ${user._id}`);
    } catch (error) {
      logger.error('Error in resetPassword service:', error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<IUser | null> {
    try {
      const user = await this.userRepo.findByVerificationToken(token);
      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      const verifiedUser = await this.userRepo.verifyEmail(user._id);

      logger.info(`Email verified for user: ${user._id}`);
      return verifiedUser;
    } catch (error) {
      logger.error('Error in verifyEmail service:', error);
      throw error;
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign({ id: userId }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });
  }

  // Verify token (used by middleware)
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();