import React from "react";
import Link from "next/link";

export type VerificationStatus = "Pending" | "Basic Checked" | "Verified";

interface BadgeProps {
  status: VerificationStatus;
}

export default function Badge({ status }: BadgeProps) {
  let colorStyles = "";
  let displayStatus: string = status;
  let level = 0;

  switch (status) {
    case "Verified":
      colorStyles = "bg-primary-light text-primary-hover border-primary/20 hover:bg-primary/20";
      displayStatus = "Disahkan";
      level = 2;
      break;
    case "Basic Checked":
      colorStyles = "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
      displayStatus = "Semakan Asas";
      level = 1;
      break;
    case "Pending":
      colorStyles = "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
      displayStatus = "Menunggu";
      level = 0; // Or link to top of page
      break;
    default:
      colorStyles = "bg-gray-100 text-gray-700 border-gray-200";
  }

  const badgeContent = (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black border transition-all cursor-pointer ${colorStyles} hover:scale-105 active:scale-95`}
    >
      {status === "Verified" && (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {displayStatus}
    </span>
  );

  if (level > 0) {
    return (
      <Link href={`/about/trust?level=${level}`} className="inline-flex">
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}
