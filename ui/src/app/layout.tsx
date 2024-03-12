import { Metadata } from 'next';
import '@/styles/globals.css';
import { notoSansKr } from '@/styles/fonts';
import { AuthProvider } from '@/context/auth/auth-context';
import { ToastProvider } from '@/context/common/toast-context';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Next.js',
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${notoSansKr.className} antialiased`}>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
