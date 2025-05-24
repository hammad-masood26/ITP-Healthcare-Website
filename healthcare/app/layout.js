import "./globals.css";

export const metadata = {
  title: "HealthCare",
  description: "",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className="antialiased leading-8 overflow-x-hidden min-h-screen"
      >
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
