import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full max-w-7xl mx-auto">
      <AdminSidebar />
      
      {/* Mobile Sub-Nav */}
      <div className="md:hidden flex bg-surface border-b border-border sticky top-16 z-40 overflow-x-auto no-scrollbar">
        <Link href="/admin" className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary whitespace-nowrap">Overview</Link>
        <Link href="/admin/leads" className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary whitespace-nowrap">Leads</Link>
        <Link href="/admin/projects" className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary whitespace-nowrap">Active</Link>
        <Link href="/admin/discovery" className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary whitespace-nowrap flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
          Discovery
        </Link>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-4 md:p-8 bg-surface-muted/30">
        {children}
      </div>
    </div>
  );
}
