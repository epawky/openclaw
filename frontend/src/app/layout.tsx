import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'Whiskr - Shopify Operations Dashboard',
  description: 'AI-powered operating cockpit for Shopify store management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('dark');
              })();
            `,
          }}
        />
      </head>
      <body style={{ backgroundColor: 'var(--cartex-bg)', color: 'var(--cartex-text)' }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
