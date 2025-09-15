import "./globals.css";
import Providers from "./providers";
import SidebarNav from "@/components/ui/SidebarNav";
import MobileNav from "@/components/ui/MobileNav";

export const metadata = {
  title: "Ada-Okpu Admin",
  description: "Internal tools for our sisterhood",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="border-b bg-white">
            <div className="container h-16 flex items-center justify-between">
              <div className="font-bold">Ada-Okpu</div>
              <div className="note hidden md:block">Admin Tools</div>
            </div>
          </header>

          <main className="container my-8">
            {/* Mobile nav toggle */}
            <MobileNav />

            <div className="mt-6 grid md:grid-cols-[220px_1fr] gap-6">
              {/* Left sidebar for md+ screens */}
              <div className="hidden md:block md:sticky md:top-20 self-start">
                <SidebarNav />
              </div>

              {/* Content */}
              <div>{children}</div>
            </div>
          </main>

          <footer className="container my-10 text-center note">
            Built with Next.js 15 • Tailwind • React Query • React Hook Form
          </footer>
        </Providers>
      </body>
    </html>
  );
}
