import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// --- Font Orchestration: Configuring MSI-style sleek typography ---
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Ensures text is visible during font load
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// --- System Metadata: Core SEO for MSI Smart Inventory ---
export const metadata = {
  title: "TECH Smart Inventory | High-Performance Hardware Terminal",
  description: "Advanced management portal for MSI hardware, components, and high-end gaming laptops.",
  icons: {
    icon: "/favicon.ico", 
  },
};

/**
 * RootLayout Component
 * Defines the global HTML structure and applies MSI's "The Genesis" theme visuals.
 */
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-black text-white font-sans selection:bg-red-600 selection:text-white">
        
        {/* Main Application Container */}
        <div className="flex-1 flex flex-col relative overflow-x-hidden">
          {/* Global Background Glow: Added a subtle fixed glow to the background 
            to enhance the "Genesis" aesthetic across all pages.
          */}
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(220,38,38,0.03),_transparent_70%)] pointer-events-none z-0"></div>
          
          <main className="relative z-10 flex-1 flex flex-col">
            {children}
          </main>
        </div>

      </body>
    </html>
  );
}