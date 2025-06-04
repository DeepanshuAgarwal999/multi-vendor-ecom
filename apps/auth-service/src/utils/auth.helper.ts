import { BadRequestException } from '@nestjs/common';
import crypto from 'crypto';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: 'user' | 'seller') => {
  const { name, email, password, phone_number, country } = data;
  if (!name || !email || !password || (userType === 'seller' && (!phone_number || !country))) {
    throw new BadRequestException('Please provide all required fields');
  }
  if (!emailRegex.test(email)) {
    throw new BadRequestException('Invalid email');
  }
};

export const checkOtpRestrictions = async (email: string, redisService: any) => {
  // Check if OTP was recently sent (rate limiting)
  const lastOtpTime = await redisService.get(`otp_sent:${email}`);
  if (lastOtpTime) {
    const timeDiff = Date.now() - parseInt(lastOtpTime);
    const waitTime = 60000; // 1 minute
    if (timeDiff < waitTime) {
      const remainingTime = Math.ceil((waitTime - timeDiff) / 1000);
      throw new BadRequestException(`Please wait ${remainingTime} seconds before requesting another OTP`);
    }
  }

  // Check daily OTP limit
  const dailyCount = await redisService.get(`otp_count:${email}:${new Date().toDateString()}`);
  const maxDailyOtps = 5;
  if (dailyCount && parseInt(dailyCount) >= maxDailyOtps) {
    throw new BadRequestException('Daily OTP limit exceeded. Please try again tomorrow.');
  }
};

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

export const sendOtp = async (name: string, email: string, template: string, redisService: any) => {
  try {
    // Check restrictions first
    await checkOtpRestrictions(email, redisService);

    const otp = generateOtp();

    // Store OTP in Redis with 5-minute expiration
    await redisService.setOtp(email, otp, 300);

    // Track OTP sending for rate limiting
    await redisService.set(`otp_sent:${email}`, Date.now().toString(), 60); // 1 minute

    // Increment daily counter
    const today = new Date().toDateString();
    await redisService.incrementCounter(`otp_count:${email}:${today}`, 86400); // 24 hours

    // TODO: Implement actual email sending logic here
    // For now, we'll just log it (remove in production)
    console.log(`OTP for ${email}: ${otp}`);

    return {
      success: true,
      message: 'OTP sent successfully',
      // Don't return OTP in production
      ...(process.env.NODE_ENV === 'development' && { otp }),
    };
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (email: string, providedOtp: string, redisService: any): Promise<boolean> => {
  try {
    const storedOtp = await redisService.getOtp(email);

    if (!storedOtp) {
      throw new BadRequestException('OTP has expired or does not exist');
    }

    if (storedOtp !== providedOtp) {
      // Increment failed attempts
      const failedAttempts = await redisService.incrementCounter(`otp_failed:${email}`, 300); // 5 minutes

      if (failedAttempts >= 3) {
        // Delete OTP after 3 failed attempts
        await redisService.deleteOtp(email);
        throw new BadRequestException('Too many failed attempts. Please request a new OTP.');
      }

      throw new BadRequestException('Invalid OTP');
    }

    // OTP is valid, clean up
    await redisService.deleteOtp(email);
    await redisService.del(`otp_failed:${email}`);

    return true;
  } catch (error) {
    throw error;
  }
};
