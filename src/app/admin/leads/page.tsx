"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllLeads } from "@/lib/api";
import { Lead } from "@/lib/types";
import StatusPill from "@/components/admin/StatusPill";

export default function AdminLeadsPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  
  useEffect(() => {
    getAllLeads().then(setAllLeads);
  }, []);

  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredLeads = allLeads.filter(lead => 
    statusFilter === "All" ? true : lead.status === statusFilter
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());



  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Inbox</h1>
          <p className="text-foreground/70 text-sm mt-1">Review and manage incoming mosque donation projects.</p>
        </div>
        
        <div className="flex bg-surface-muted p-1 rounded-lg border border-border">
          {["All", "Pending", "Needs Manual Check", "Approved", "Rejected"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                statusFilter === status 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground/80">
            <thead className="bg-surface-muted border-b border-border text-xs uppercase font-semibold text-foreground/60">
              <tr>
                <th className="px-6 py-4">Title / Mosque</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground line-clamp-1">{lead.raw_title}</div>
                      <div className="text-xs text-foreground/60 mt-1">
                        {lead.extracted_mosque_name || "Unknown Mosque"} 
                        {lead.state ? ` • ${lead.state}` : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-muted border border-border">
                        {lead.source_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-surface-muted rounded-full h-1.5 mr-2 overflow-hidden border border-border">
                          <div 
                            className={`h-1.5 rounded-full ${lead.lead_score > 80 ? 'bg-green-500' : lead.lead_score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${lead.lead_score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{lead.lead_score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      <Link 
                        href={`/admin/leads/${lead.id}`}
                        className="text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-foreground/60">
                    No leads found matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
