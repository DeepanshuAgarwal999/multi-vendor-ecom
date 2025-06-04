import { BadRequestException } from '@nestjs/common';
import crypto from 'crypto';
import { sendMail } from './sendMail';
import { TooManyRequestsException } from 'packages/error-handler/exceptions';
import { RedisService } from '../app/redis/redis.service';

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

export const checkOtpRestrictions = async (email: string, redisService: RedisService) => {
  // Check if OTP was recently sent (rate limiting)
  const isLastOtpExist = await redisService.get(`otp_cooldown:${email}`);

  if (isLastOtpExist) {
    throw new TooManyRequestsException('Please wait 60 seconds before requesting another OTP');
  }

  if (await redisService.get(`otp_lock:${email}`)) {
    throw new TooManyRequestsException(
      'Account locked due to too many failed attempts, please try again after 30 minutes'
    );
  }

  if (await redisService.get(`otp_spam_lock:${email}`)) {
    throw new TooManyRequestsException('Too many OTP requests!, please wait 1 hour before trying again');
  }
};

export const generateOtp = (): string => {
  return crypto.randomInt(1000, 9999).toString(); // 4-digit OTP (was commented as 6-digit)
};

export const sendOtp = async (name: string, email: string, templateName: string, redisService: RedisService) => {

  const otp = generateOtp();

  await sendMail(email, 'OTP Verification', templateName, { name, otp });

  // Store OTP in Redis with 5-minute expiration
  await redisService.setOtp(email, otp, 300);

  // Track OTP sending for rate limiting
  await redisService.set(`otp_cooldown:${email}`, 'true', 60);

  // Log in development only
  if (process.env.NODE_ENV === 'development') {
    console.log(`OTP for ${email}: ${otp}`);
  }

  return {
    success: true,
    message: 'OTP sent successfully',
    // Don't return OTP in production
    ...(process.env.NODE_ENV === 'development' && { otp }),
  };
};

export const verifyOtp = async (email: string, providedOtp: string, redisService: RedisService): Promise<boolean> => {
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
};

export const trackOtpRequests = async (email: string, redisService: RedisService) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redisService.get(otpRequestKey)) || '0');
  if (otpRequests >= 2) {
    await redisService.set(`otp_spam_lock:${email}`, 'locked', 3600);
    throw new TooManyRequestsException('Too many OTP requests!, please wait 1 hour before trying again');
  }
  await redisService.incrementCounter(otpRequestKey, 3600);
};
