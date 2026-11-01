import './globals.css';

export const metadata = {
  title: 'Lanyard 3D',
  description: 'Interactive 3D ID card landing page built with Next.js and React Three Fiber.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
