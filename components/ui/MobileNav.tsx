"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/members", label: "Member List" },
  { href: "/decisions", label: "Decisions Log" },
  { href: "/support", label: "Support Ledger" },
  { href: "/sessions", label: "Monthly Sessions" },
  { href: "/welcome", label: "Welcome Text" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="md:hidden">
      <button className="btn w-full" onClick={() => setOpen((v) => !v)}>
        {open ? "Close Menu" : "Open Menu"}
      </button>
      {open && (
        <div className="mt-3 card space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "block rounded-xl px-3 py-2 hover:bg-gray-100",
                pathname === l.href && "bg-gray-900 text-white hover:bg-gray-900"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
