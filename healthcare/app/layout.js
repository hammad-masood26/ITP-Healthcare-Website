import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "ITP HealthCare - AI-Powered Healthcare Solutions",
  description: "Revolutionize healthcare with ITP's cutting-edge AI technology. Access disease prediction, mental health analysis, and medical assistance through our intelligent healthcare platform. Get personalized health insights and improve your well-being today.",
  keywords: "healthcare, AI, disease prediction, mental health, medical assistance, health technology, EHR, electronic health records",
  authors: [{ name: "ITP Healthcare Team" }],
  openGraph: {
    title: "ITP HealthCare - AI-Powered Healthcare Solutions",
    description: "Revolutionize healthcare with ITP's cutting-edge AI technology. Access disease prediction, mental health analysis, and medical assistance.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ITP HealthCare",
    description: "AI-powered healthcare platform for disease prediction, mental health analysis, and medical assistance.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className="antialiased leading-8 overflow-x-hidden min-h-screen"
      >
        <Toaster position="top-right" />
        <div
          className="min-h-screen relative"
          style={{
            backgroundImage: "url('/bg.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
