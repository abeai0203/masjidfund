"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAllLeads, getFeedbacks, getUnreadDonationsCount } from "@/lib/api";
import { Lead, Feedback } from "@/lib/types";

export default function AdminMobileNav() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState(0);
  const [unreadDonationsCount, setUnreadDonationsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [leads, feedbacks, donationsCount] = await Promise.all([
        getAllLeads(),
        getFeedbacks(),
        getUnreadDonationsCount(),
      ]);
      setPendingCount(leads.filter((l: Lead) => l.status === "Pending").length);
      setUnreadFeedbackCount(feedbacks.filter((f: Feedback) => f.status === "Unread").length);
      setUnreadDonationsCount(donationsCount);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const active = (href: string) =>
    pathname === href
      ? "text-primary border-b-2 border-primary"
      : "text-foreground border-b-2 border-transparent hover:text-primary hover:border-primary";

  const navItems = [
    { href: "/admin", label: "Overview", badge: 0 },
    { href: "/admin/leads", label: "Leads", badge: pendingCount, badgeColor: "bg-red-500" },
    { href: "/admin/feedback", label: "Maklumbalas", badge: unreadFeedbackCount, badgeColor: "bg-red-500" },
    { href: "/admin/donations", label: "Rekod Infaq", badge: unreadDonationsCount, badgeColor: "bg-emerald-500" },
    { href: "/admin/projects", label: "Projek", badge: 0 },
    { href: "/admin/discovery", label: "Discovery AI", badge: 0, isPrimary: true },
  ];

  return (
    <div className="md:hidden flex bg-surface border-b border-border sticky top-16 z-40 overflow-x-auto no-scrollbar">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`relative flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${active(item.href)} ${item.isPrimary ? "text-primary" : ""}`}
        >
          {item.isPrimary && (
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          )}
          {item.label}
          {item.badge > 0 && (
            <span className={`flex h-4 w-4 items-center justify-center rounded-full ${item.badgeColor} text-[9px] font-black text-white shadow-sm animate-pulse`}>
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
