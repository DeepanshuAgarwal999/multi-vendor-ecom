import { Response } from 'express';

export const setCookies = (response: Response, accessToken: string, refreshToken: string) => {
  // Cookie options that work cross-domain and prevent console warnings
  const cookieOptions = {
    httpOnly: true,
    secure: true, // Required for sameSite: 'none'
    sameSite: 'none' as const, // Required for cross-origin requests
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  // Clear existing cookies with proper options to prevent conflicts
  response.clearCookie('accessToken', {
    path: '/',
    secure: true,
    sameSite: 'none',
    httpOnly: true,
  });
  response.clearCookie('refreshToken', {
    path: '/',
    secure: true,
    sameSite: 'none',
    httpOnly: true,
  });

  // Set new cookies
  response.cookie('accessToken', accessToken, cookieOptions);
  response.cookie('refreshToken', refreshToken, cookieOptions);

  return { accessToken, refreshToken };
};

export const clearAuthCookies = (response: Response) => {
  const clearOptions = {
    path: '/',
    secure: true,
    sameSite: 'none' as const,
    httpOnly: true,
  };

  response.clearCookie('accessToken', clearOptions);
  response.clearCookie('refreshToken', clearOptions);
};
