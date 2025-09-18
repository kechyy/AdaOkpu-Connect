// app/AppShell.tsx
"use client";
import { usePathname } from "next/navigation";
import SidebarNav from "@/components/ui/SidebarNav";
import MobileNav from "@/components/ui/MobileNav";
import { LogoutButton } from "@/components/client/LogoutButton";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname.startsWith("/auth");

  
       // Full admin shell
  return (
    <>
      <header className="border-b bg-white">
        <div className="container h-16 flex items-center justify-between">
          <div className="font-bold">Umuada-Ogbonna-Bloodline</div>
          <div className="flex space-x-2 items-center ">
            <div className="note hidden md:block">Admin Tools</div>
            <LogoutButton/>
          </div>
          
        </div>
      </header>
      {
        (!isAuth) ? (
              <main className="container my-8">
              <MobileNav />
              <div className="mt-6 grid md:grid-cols-[220px_1fr] gap-6">
                <aside className="hidden md:block md:sticky md:top-20 self-start">
                  <SidebarNav />
                </aside>
                <section>{children}</section>
              </div>
            </main>
          ) :
          (
            <main className="container my-8">{children}</main>
          )
      }
      <footer className="container my-10 text-center note">
        Ada-Okpu • Built to connect and support our women at home and abroad
      </footer>
    </>
  );
    
  

  // Minimal shell for login
  return (
    <>
      <header className="border-b bg-white">
        <div className="container h-16 flex items-center justify-between">
          <div className="font-bold">Ada-Okpu</div>
          <div className="note hidden md:block">Welcome</div>
        </div>
      </header>
      <main className="container my-8">{children}</main>
      <footer className="container my-10 text-center note">
        Ada-Okpu • Built to connect and support our women at home and abroad
      </footer>
    </>
  );
}
