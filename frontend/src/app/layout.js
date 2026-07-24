// frontend/src/app/layout.js
import './globals.css';
import { Fraunces, Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata = {
  title: 'Mercato - E-Commerce Platform',
  description: 'Considered everyday goods',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}