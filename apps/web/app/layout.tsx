import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Viral Content Factory',
  description: 'Internal editorial and production workspace',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          background: '#f7f7f8',
          color: '#18181b',
        }}
      >
        {children}
      </body>
    </html>
  );
}
