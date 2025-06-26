import Header from '../shared/widgets';
import './global.css';
import { Poppins, Roboto } from 'next/font/google'
import Providers from './Provider';
import { Toaster } from 'sonner'


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
      <body className={`${roboto.variable} ${poppins.variable}  antialiased`}>
        <Toaster richColors position='top-right' visibleToasts={2} />
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
