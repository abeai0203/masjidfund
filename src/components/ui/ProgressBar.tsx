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
      <div className="flex justify-between items-end mb-2 text-sm">
        <div>
          <span className="font-bold text-primary">{formatCurrency(collectedAmount)}</span>
          <span className="text-foreground/60 ml-1">dikumpul</span>
        </div>
        <div className="text-foreground/70">
          daripada <span className="font-medium">{formatCurrency(targetAmount)}</span>
        </div>
      </div>
      <div className="w-full bg-surface-muted border border-border rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${widthPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-end mt-1">
        <span className="text-xs font-medium text-foreground/50">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}
