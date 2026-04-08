"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllLeads, getFeedbacks, getUnreadDonationsCount } from "@/lib/api";
import { Lead, Feedback } from "@/lib/types";

export default function AdminSidebar() {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState<number>(0);
  const [unreadDonationsCount, setUnreadDonationsCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const [leads, feedbacks, donationsCount] = await Promise.all([
        getAllLeads(),
        getFeedbacks(),
        getUnreadDonationsCount()
      ]);
      setPendingCount(leads.filter((l: Lead) => l.status === 'Pending').length);
      setUnreadFeedbackCount(feedbacks.filter((f: Feedback) => f.status === 'Unread').length);
      setUnreadDonationsCount(donationsCount);
    };

    fetchData();

    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-full md:w-64 bg-surface border-r border-border p-6 hidden md:block">
      <div className="text-lg font-bold text-foreground mb-8">Dashboard Admin</div>
      <nav className="space-y-2">
        <Link href="/admin" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-foreground">
          Gambaran Keseluruhan
        </Link>
        <Link href="/admin/leads" className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-foreground group">
          <span>Penyerahan & Lead</span>
          {pendingCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm animate-pulse">
              {pendingCount}
            </span>
          )}
        </Link>
        <Link href="/admin/feedback" className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-foreground group">
          <span>Maklumbalas</span>
          {unreadFeedbackCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm animate-pulse">
              {unreadFeedbackCount}
            </span>
          )}
        </Link>
        <Link href="/admin/donations" className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-foreground group">
          <span>Rekod Infaq</span>
          {unreadDonationsCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white shadow-sm animate-pulse">
              {unreadDonationsCount}
            </span>
          )}
        </Link>
        <Link href="/admin/projects" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-foreground">
          Projek Aktif
        </Link>
        <Link href="/admin/discovery" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-muted hover:text-primary transition-colors text-primary flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          Discovery AI
        </Link>
      </nav>
    </aside>
  );
}
