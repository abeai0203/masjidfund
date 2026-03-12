import React from "react";

export type VerificationStatus = "Pending" | "Basic Checked" | "Verified";

interface BadgeProps {
  status: VerificationStatus;
}

export default function Badge({ status }: BadgeProps) {
  let colorStyles = "";

  switch (status) {
    case "Verified":
      colorStyles = "bg-primary-light text-primary-hover border-primary/20";
      break;
    case "Basic Checked":
      colorStyles = "bg-blue-100 text-blue-700 border-blue-200";
      break;
    case "Pending":
      colorStyles = "bg-yellow-100 text-yellow-700 border-yellow-200";
      break;
    default:
      colorStyles = "bg-gray-100 text-gray-700 border-gray-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorStyles}`}
    >
      {status === "Verified" && (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {status}
    </span>
  );
}
