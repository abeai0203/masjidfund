import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-muted border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="font-bold text-xl tracking-tight text-primary-hover mb-4 block">MasjidFund</span>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Platform beracuankan komuniti untuk menemui dan menyokong projek pembinaan dan pengubahsuaian masjid yang disahkan di seluruh Malaysia.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Pautan Pantas</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/projects" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Temui Projek
                </Link>
              </li>
              <li>
                <Link href="/states/selangor" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Projek di Selangor
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Hantar Kempen
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Amanah & Pengesahan</h3>
            <p className="text-sm text-foreground/80 leading-relaxed mb-4">
              Kami mengesahkan semua kempen masjid untuk memastikan derma anda sampai ke jawatankuasa yang sah. Derma disalurkan terus ke akaun bank rasmi atau gerbang platform.
            </p>
            <Link href="/about/trust" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
              Ketahui lebih lanjut tentang proses pengesahan kami &rarr;
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-border-subtle pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-foreground/60">
            &copy; {new Date().getFullYear()} MasjidFund. Hak cipta terpelihara.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="text-xs text-foreground/60 hover:text-primary transition-colors">
              Syarat Perkhidmatan
            </Link>
            <Link href="/privacy" className="text-xs text-foreground/60 hover:text-primary transition-colors">
              Dasar Privasi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
