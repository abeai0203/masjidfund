import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="w-full md:w-64 bg-surface border-r border-border p-6 hidden md:block">
      <div className="text-lg font-bold text-foreground mb-8">Dashboard Admin</div>
      <nav className="space-y-2">
        <Link href="/admin" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-foreground">
          Gambaran Keseluruhan
        </Link>
        <Link href="/admin/leads" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-foreground">
          Penyerahan & Lead
        </Link>
        <Link href="/admin/projects" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-foreground">
          Projek Aktif
        </Link>
        <Link href="/admin/discovery" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-primary flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          Discovery AI
        </Link>
      </nav>
    </aside>
  );
}
