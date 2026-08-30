import Link from "next/link";
import { UserIcon } from "@/components/icons";
import { PRIMARY_NAV } from "@/lib/nav-links";
import { CartLink } from "./cart-link";
import { Container } from "./container";
import { MobileNav } from "./mobile-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-sand">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-8">
            <MobileNav links={PRIMARY_NAV} />
            <Link
              href="/"
              className="font-display text-2xl font-semibold text-espresso"
            >
              Sundusk
            </Link>
            <nav
              className="hidden md:flex md:items-center md:gap-7"
              aria-label="Primary"
            >
              {PRIMARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm font-medium tracking-[0.1em] text-espresso uppercase transition-colors hover:text-terra"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/account"
              aria-label="Account"
              className="text-espresso transition-colors hover:text-terra"
            >
              <UserIcon className="h-5 w-5" />
            </Link>
            <CartLink />
          </div>
        </div>
      </Container>
    </header>
  );
}
