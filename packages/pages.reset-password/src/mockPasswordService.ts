import {
  ResetPasswordRequest,
  ResetPasswordResponse,
  NewPasswordRequest,
  NewPasswordResponse,
} from './types';

class MockPasswordService {
  private readonly validEmails = ['test@example.com', 'user@example.com'];

  async requestPasswordReset(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    if (!this.validEmails.includes(data.email)) {
      throw new Error('Email not found');
    }

    return {
      success: true,
      message: 'Password reset link has been sent to your email',
    };
  }

  async resetPassword(data: NewPasswordRequest): Promise<NewPasswordResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (data.token.length < 10) {
      throw new Error('Invalid or expired token');
    }

    return {
      success: true,
      message: 'Password has been reset successfully',
    };
  }
}

export const mockPasswordService = new MockPasswordService();
