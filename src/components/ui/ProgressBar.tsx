export default function ProgressBar({
  targetAmount,
  collectedAmount,
  percentage,
}: {
  targetAmount: number;
  collectedAmount: number;
  percentage: number;
}) {
  // Ensure we don't overflow the UI if percentage > 100
  const widthPercentage = Math.min(percentage, 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-2">
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-primary text-base">{formatCurrency(collectedAmount)}</span>
          <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">Terkumpul</span>
        </div>
        <div className="text-[11px] font-medium text-foreground/50">
          Sasaran: <span className="text-foreground/80">{formatCurrency(targetAmount)}</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${widthPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1.5 items-center">
        <div className="flex -space-x-1 opacity-40">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white"></div>
           ))}
        </div>
        <span className="text-[11px] font-black text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded leading-none">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
