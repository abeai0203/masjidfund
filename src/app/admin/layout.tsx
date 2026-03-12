import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-full w-full max-w-7xl mx-auto">
      <AdminSidebar />
      
      {/* Content Area */}
      <div className="flex-1 p-6 md:p-8 bg-surface-muted/30">
        {children}
      </div>
    </div>
  );
}
