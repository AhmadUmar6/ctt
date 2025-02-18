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
  title: 'CTPredict',
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
        <footer style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          color: 'rgba(255, 255, 255, 0.5)', 
          fontSize: '12px',
          zIndex: 1000,
          pointerEvents: 'auto'
        }}>
          Designed by: <a 
            href="https://www.ahmadumar.space" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >Ahmad Umar</a>
        </footer>
      </body>
    </html>
  );
}