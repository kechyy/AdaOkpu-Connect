"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home" },
  { href: "/user/members", label: "Member List" },
  { href: "/user/decisions", label: "Decisions Log" },
  { href: "/user/ledger", label: "Support Ledger" },
  { href: "/user/sessions", label: "Monthly Sessions" },
  { href: "/user/welcome", label: "Welcome Text" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="space-y-4">
      <div className="text-xl font-bold">Umu-Ada</div>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={clsx(
              "rounded-xl px-3 py-2 hover:bg-gray-100",
              isActive(l.href) && "bg-gray-900 text-white hover:bg-gray-900"
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="note">Use the links above to manage each area.</p>
    </aside>
  );
}
