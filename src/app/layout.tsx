import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Crypto Admin — Dashboard',
  description: 'Admin dashboard para pagamentos em criptomoeda',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'hsl(222 40% 9%)',
                color: 'hsl(210 40% 93%)',
                border: '1px solid hsl(222 30% 16%)',
                fontSize: '13px',
              },
              success: { iconTheme: { primary: 'hsl(142 76% 42%)', secondary: 'white' } },
              error: { iconTheme: { primary: 'hsl(0 84% 60%)', secondary: 'white' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
