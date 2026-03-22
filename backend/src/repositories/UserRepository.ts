import { User, IUser } from '../models/User.js';
import { logger } from '../config/logger.js';

export class UserRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        id,
        {
          password: newPassword,
          passwordResetToken: undefined,
          passwordResetExpires: undefined,
          updatedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      logger.error('Error updating user password:', error);
      throw error;
    }
  }

  async setEmailVerificationToken(id: string, token: string, expires: Date): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        id,
        {
          emailVerificationToken: token,
          emailVerificationExpires: expires,
          updatedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      logger.error('Error setting email verification token:', error);
      throw error;
    }
  }

  async verifyEmail(id: string): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        id,
        {
          isEmailVerified: true,
          emailVerificationToken: undefined,
          emailVerificationExpires: undefined,
          updatedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      logger.error('Error verifying email:', error);
      throw error;
    }
  }

  async setPasswordResetToken(id: string, token: string, expires: Date): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        id,
        {
          passwordResetToken: token,
          passwordResetExpires: expires,
          updatedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      logger.error('Error setting password reset token:', error);
      throw error;
    }
  }

  async findByVerificationToken(token: string): Promise<IUser | null> {
    try {
      return await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() }
      });
    } catch (error) {
      logger.error('Error finding user by verification token:', error);
      throw error;
    }
  }

  async findByPasswordResetToken(token: string): Promise<IUser | null> {
    try {
      return await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      });
    } catch (error) {
      logger.error('Error finding user by password reset token:', error);
      throw error;
    }
  }

  async updatePreferences(id: string, preferences: Partial<IUser['preferences']>): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        id,
        { preferences, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      logger.error('Error updating user preferences:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }
}

export default new UserRepository();