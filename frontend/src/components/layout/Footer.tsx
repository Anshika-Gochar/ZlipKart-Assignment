import { Link } from 'react-router-dom';

// ── Social icon SVGs (inline, no external dep) ────────────────
const SocialIcons = {
  Facebook: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  YouTube: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

const SOCIAL_LINKS = [
  { name: 'Facebook',  Icon: SocialIcons.Facebook,  href: '#' },
  { name: 'Instagram', Icon: SocialIcons.Instagram, href: '#' },
  { name: 'Twitter',   Icon: SocialIcons.Twitter,   href: '#' },
  { name: 'YouTube',   Icon: SocialIcons.YouTube,   href: '#' },
  { name: 'LinkedIn',  Icon: SocialIcons.LinkedIn,  href: '#' },
];

export const Footer = () => {
  return (
    <footer className="bg-[#172337] mt-auto">
      {/* Top links row */}
      <div className="border-b border-[#2e3f55]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 lg:gap-8">

            {/* About */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#878787] tracking-wider uppercase mb-3">
                About
              </h3>
              <ul className="space-y-1.5">
                {['Contact Us', 'About Us', 'Careers', 'ZlipKart Stories', 'Press', 'ZlipKart Wholesale', 'Corporate Information'].map(l => (
                  <li key={l}><Link to="/" className="text-[12px] text-[#d0d0d0] hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#878787] tracking-wider uppercase mb-3">
                Help
              </h3>
              <ul className="space-y-1.5">
                {['Payments', 'Shipping', 'Cancellation & Returns', 'FAQ', 'Report Infringement'].map(l => (
                  <li key={l}><Link to="/" className="text-[12px] text-[#d0d0d0] hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Policy */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#878787] tracking-wider uppercase mb-3">
                Policy
              </h3>
              <ul className="space-y-1.5">
                {['Return Policy', 'Terms of Use', 'Security', 'Privacy', 'Sitemap', 'EPR Compliance'].map(l => (
                  <li key={l}><Link to="/" className="text-[12px] text-[#d0d0d0] hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#878787] tracking-wider uppercase mb-3">
                Social
              </h3>
              <ul className="space-y-1.5 mb-4">
                {SOCIAL_LINKS.map(({ name, href }) => (
                  <li key={name}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-[#d0d0d0] hover:text-white transition-colors"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
              {/* Social icon strip */}
              <div className="flex items-center gap-2 mt-2">
                {SOCIAL_LINKS.map(({ name, Icon, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="w-7 h-7 rounded flex items-center justify-center text-[#878787] hover:text-white hover:bg-[#2e3f55] transition-all duration-150"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Registered Office */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-[11px] font-semibold text-[#878787] tracking-wider uppercase mb-3">
                Registered Office
              </h3>
              <address className="not-italic text-[12px] text-[#d0d0d0] leading-relaxed">
                Buildings Alyssa, Begonia &<br />
                Clover Embassy Tech Village,<br />
                Outer Ring Road, Devarabeesanahalli Village,<br />
                Bengaluru – 560103,<br />
                Karnataka, India
              </address>
              <p className="mt-2 text-[12px] text-[#d0d0d0]">
                CIN: <span className="text-[#878787]">U51109KA2012PTC066107</span>
              </p>
              <p className="text-[12px] text-[#d0d0d0] mt-0.5">
                Phone: <span className="text-[#878787]">044-45614700</span>
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 justify-center sm:justify-start">
            {[
              { icon: '🏪', label: 'Become a Seller' },
              { icon: '📢', label: 'Advertise' },
              { icon: '🎁', label: 'Gift Cards' },
              { icon: '💳', label: 'Help Centre' },
            ].map(({ icon, label }) => (
              <Link
                key={label}
                to="/"
                className="flex items-center gap-1.5 text-[12px] text-[#d0d0d0] hover:text-white transition-colors"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
          <p className="text-[11px] text-[#878787] text-center">
            © {new Date().getFullYear()} ZlipKart. Prices shown are illustrative only.
          </p>
        </div>
      </div>
    </footer>
  );
};
