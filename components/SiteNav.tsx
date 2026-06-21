"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/contacts", label: "Contacts" },
  { href: "/companies", label: "Companies" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

// A nav item is active when it's the dashboard root, or when the path sits
// within its section.
function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
      {navLinks.map((link) => {
        const active = isActive(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`relative whitespace-nowrap px-2.5 py-2 font-display text-sm font-medium uppercase tracking-[0.1em] transition-colors ${
              active ? "text-pine" : "text-moss hover:text-pine"
            }`}
          >
            {link.label}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-rust"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
