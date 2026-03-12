import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-muted border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="font-bold text-xl tracking-tight text-primary-hover mb-4 block">MasjidFund</span>
            <p className="text-sm text-foreground/80 leading-relaxed">
              A community-driven platform to discover and support verified mosque construction and renovation projects across Malaysia.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/projects" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Discover Projects
                </Link>
              </li>
              <li>
                <Link href="/states/selangor" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Projects in Selangor
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Submit a Campaign
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Trust & Verification</h3>
            <p className="text-sm text-foreground/80 leading-relaxed mb-4">
              We verify all mosque campaigns to ensure your donations reach legitimate committees. Donations go directly to official bank accounts or platform gateways.
            </p>
            <Link href="/about/trust" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
              Learn about our verification process &rarr;
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-border-subtle pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-foreground/60">
            &copy; {new Date().getFullYear()} MasjidFund. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="text-xs text-foreground/60 hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-xs text-foreground/60 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
