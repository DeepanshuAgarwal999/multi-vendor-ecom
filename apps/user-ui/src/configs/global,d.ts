type NavItemsTypes = {
  title: string;
  href: string;
};

interface OtpInputRef {
  getOtp: () => string;
  clearOtp: () => void;
}
