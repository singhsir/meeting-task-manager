import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TaskPulse - Meeting Task Manager',
  description: 'Turn Fireflies meeting transcripts into actionable Kanban task boards with AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress unhandled errors from third-party browser extensions (chrome-extension://)
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(event) {
                  if (event && event.filename && (event.filename.indexOf('chrome-extension:') !== -1 || event.filename.indexOf('embed_script.js') !== -1)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    return true;
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(event) {
                  var str = event && event.reason ? String(event.reason.stack || event.reason) : '';
                  if (str.indexOf('chrome-extension:') !== -1 || str.indexOf('embed_script.js') !== -1) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    return true;
                  }
                }, true);
              }
            `,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
