import Link from "next/link";
import { InstagramIcon } from "@/components/icons";
import { FOOTER_NAV } from "@/lib/nav-links";
import { LEGAL_ENTITY_NAME, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL, SUPPORT_WHATSAPP_URL } from "@/lib/legal";
import { Container } from "./container";

export function Footer() {
  return (
    <footer className="border-t border-line bg-espresso text-sand">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <p className="font-display text-2xl font-semibold">Sundusk</p>
            <p className="mt-4 font-body text-sm leading-relaxed text-sand/70">
              {LEGAL_ENTITY_NAME}
              <br />
              D-43 Mahendru Enclave
              <br />
              near Model Town 3, Delhi 110033
              <br />
              GSTIN: 07AWDPS0826R1ZY
            </p>
          </div>

          <div>
            <p className="font-body text-xs font-medium tracking-[0.14em] text-sand/50 uppercase">
              Help
            </p>
            <ul className="mt-4 space-y-2">
              {FOOTER_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-sand/80 transition-colors hover:text-terra"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-body text-xs font-medium tracking-[0.14em] text-sand/50 uppercase">
              Contact
            </p>
            <ul className="mt-4 space-y-2 font-body text-sm text-sand/80">
              <li>
                <a
                  href="mailto:hellosundusk.in@gmail.com"
                  className="transition-colors hover:text-terra"
                >
                  hellosundusk.in@gmail.com
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SUPPORT_PHONE_TEL}`}
                  className="transition-colors hover:text-terra"
                >
                  {SUPPORT_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={SUPPORT_WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-terra"
                >
                  WhatsApp us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-body text-xs font-medium tracking-[0.14em] text-sand/50 uppercase">
              Follow
            </p>
            <a
              href="https://instagram.com/sundusk.official"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 font-body text-sm text-sand/80 transition-colors hover:text-terra"
            >
              <InstagramIcon className="h-5 w-5" />
              @sundusk.official
            </a>
          </div>
        </div>

        <p className="mt-16 border-t border-sand/15 pt-8 font-body text-xs text-sand/50">
          © {new Date().getFullYear()} {LEGAL_ENTITY_NAME}, trading as
          Sundusk. Prepaid only — no cash on delivery, anywhere.
        </p>
      </Container>
    </footer>
  );
}
