
import "./globals.css";
import Providers from "./providers";
import SidebarNav from "@/components/ui/SidebarNav";
import MobileNav from "@/components/ui/MobileNav";
import AppShell from "./AppShell";

export const metadata = {
  title: "Ada-Okpu Admin",
  description: "Internal tools for our sisterhood",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
