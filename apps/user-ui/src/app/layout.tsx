import Header from '../shared/widgets';
import './global.css';
import { Poppins, Roboto } from 'next/font/google'

export const metadata = {
  title: 'AQUALITY',
  description: 'AQUALITY Multi- Vendor Marketplace',
};
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-roboto',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${roboto.variable} antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
