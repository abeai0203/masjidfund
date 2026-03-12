export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Gambaran Keseluruhan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="text-sm text-foreground/70 font-medium mb-1">Jumlah Projek Disahkan</div>
          <div className="text-3xl font-bold text-primary">12</div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="text-sm text-foreground/70 font-medium mb-1">Penyerahan Menunggu</div>
          <div className="text-3xl font-bold text-yellow-600">5</div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="text-sm text-foreground/70 font-medium mb-1">Impak Jumlah Derma</div>
          <div className="text-3xl font-bold text-foreground">RM 250k+</div>
        </div>
      </div>
    </div>
  );
}
