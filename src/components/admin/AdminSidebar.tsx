import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="w-full md:w-64 bg-surface border-r border-border p-6 hidden md:block">
      <div className="text-lg font-bold text-foreground mb-8">Admin Dashboard</div>
      <nav className="space-y-2">
        <Link href="/admin" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-foreground">
          Overview
        </Link>
        <Link href="/admin/leads" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-foreground">
          Submissions & Leads
        </Link>
        <Link href="/admin/projects" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-foreground">
          Active Projects
        </Link>
      </nav>
    </aside>
  );
}
