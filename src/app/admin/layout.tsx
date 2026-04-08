import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import AdminGuard from "@/components/auth/AdminGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex flex-col md:flex-row min-h-screen w-full max-w-7xl mx-auto">
        <AdminSidebar />
        
        <AdminMobileNav />
        
        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 bg-surface-muted/30">
          {children}
        </div>
      </div>
    </AdminGuard>
  );
}
