import Link from "next/link";

const editorial = [
  { href: "/about", label: "About MMDb" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/newsletter", label: "Newsletter" },
];

const legal = [
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-surface-variant/30 mt-stack-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg px-margin-mobile md:px-margin-desktop py-stack-lg w-full max-w-container-max mx-auto">

        {/* Brand */}
        <div>
          <Link
            href="/"
            className="font-display text-xl font-extrabold text-primary tracking-tighter leading-none block mb-4"
          >
            MMDb
          </Link>
          <p className="type-body-md text-secondary max-w-xs">
            The Maven&apos;s Guide to Culinary Excellence. Dedicated to the
            pursuit of the perfect palate.
          </p>
        </div>

        {/* Editorial */}
        <div>
          <h4 className="type-label-sm text-on-surface mb-6 uppercase tracking-widest">
            Editorial
          </h4>
          <ul className="space-y-4">
            {editorial.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="type-body-md text-secondary hover:text-primary transition-colors hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="type-label-sm text-on-surface mb-6 uppercase tracking-widest">
            Connect
          </h4>
          <ul className="space-y-4">
            {legal.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="type-body-md text-secondary hover:text-primary transition-colors hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="px-margin-mobile md:px-margin-desktop py-4 border-t border-surface-variant/20">
        <p className="type-label-sm text-secondary text-center">
          © 2024 MMDb. The Maven&apos;s Guide to Culinary Excellence.
        </p>
      </div>
    </footer>
  );
}
