import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-surface border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">M</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-primary-hover">MasjidFund</span>
            </Link>
            <div className="hidden sm:flex sm:space-x-6">
              <Link href="/projects" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Temui Projek
              </Link>
              <Link href="/donate" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Agih Derma
              </Link>
              <Link href="/submit" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Hantar Kempen
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/donate" className="hidden sm:inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              Derma Sekarang
            </Link>
            <button className="sm:hidden text-sm font-medium px-3 py-1.5 border border-border rounded-md hover:bg-surface-muted transition-colors">
              Menu
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
