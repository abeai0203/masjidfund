import React from "react";

export default function StatusPill({ status }: { status: string }) {
  let colorStyles = "bg-gray-100 text-gray-800 border-gray-200";

  switch (status) {
    case "Published":
    case "Approved":
      colorStyles = "bg-green-100 text-green-800 border-green-200";
      break;
    case "Draft":
      colorStyles = "bg-surface-muted text-foreground/70 border-border";
      break;
    case "Needs Manual Check":
      colorStyles = "bg-orange-100 text-orange-800 border-orange-200";
      break;
    case "Rejected":
      colorStyles = "bg-red-100 text-red-800 border-red-200";
      break;
    case "Pending":
      colorStyles = "bg-blue-100 text-blue-800 border-blue-200";
      break;
    default:
      colorStyles = "bg-gray-100 text-gray-800 border-gray-200";
  }

  const statusLabels: Record<string, string> = {
    "Published": "Diterbitkan",
    "Approved": "Diluluskan",
    "Draft": "Draf",
    "Needs Manual Check": "Perlu Semakan Manual",
    "Rejected": "Ditolak",
    "Pending": "Menunggu",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colorStyles}`}>
      {statusLabels[status] || status}
    </span>
  );
}
