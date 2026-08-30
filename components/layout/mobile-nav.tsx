"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CartIcon, CloseIcon, MenuIcon, UserIcon } from "@/components/icons";
import type { NavLink } from "@/lib/nav-links";

/**
 * Hamburger trigger + full-screen nav panel, mobile only (md:hidden).
 * 85%+ of traffic is phones (spec section 1), so this — not the desktop
 * nav — is the primary navigation surface for most visitors.
 *
 * Accessibility: traps Tab focus in the panel while open, closes on
 * Escape and on route change, restores focus to the trigger button on
 * close, and locks body scroll while open.
 */
export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Route changed (a link was followed) — close the panel.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function close() {
      setOpen(false);
      buttonRef.current?.focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="-ml-2 p-2 text-espresso md:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 flex flex-col bg-sand md:hidden"
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <span className="font-display text-xl font-semibold text-espresso">
              Sundusk
            </span>
            <button
              type="button"
              className="p-2 text-espresso"
              aria-label="Close menu"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          <nav
            className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-4"
            aria-label="Primary"
          >
            {links.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                ref={i === 0 ? firstLinkRef : undefined}
                className="border-b border-line py-4 font-display text-2xl font-medium text-espresso"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6 border-t border-line px-6 py-6">
            <Link
              href="/account"
              className="flex items-center gap-2 font-body text-sm font-medium tracking-[0.14em] text-espresso uppercase"
            >
              <UserIcon className="h-5 w-5" /> Account
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 font-body text-sm font-medium tracking-[0.14em] text-espresso uppercase"
            >
              <CartIcon className="h-5 w-5" /> Cart
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
