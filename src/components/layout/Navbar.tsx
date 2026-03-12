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
              <Link href="/submit" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Hantar Kempen
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/projects" className="hidden sm:inline-flex bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
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
