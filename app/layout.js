import './globals.css';
import AuthInitializer from '@/components/shared/AuthInitializer';
import localFont from 'next/font/local';

const premierSans = localFont({
  src: [
    {
      path: '../public/fonts/Premier-Sans.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-premier-sans'
});

export const metadata = {
  title: 'CT Predictor',
  description: 'Predict CT matches and compete in leagues',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          defer
        ></script>
      </head>
      <body className={`${premierSans.variable} font-sans`}>
        <AuthInitializer>{children}</AuthInitializer>
      </body>
    </html>
  );
}