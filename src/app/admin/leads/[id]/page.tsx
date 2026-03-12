"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { getLeadById } from "@/lib/api";
import { Lead } from "@/lib/types";
import StatusPill from "@/components/admin/StatusPill";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    params.then(resolved => {
      getLeadById(resolved.id).then(data => {
        setLead(data);
        setIsLoading(false);
      });
    });
  }, [params]);

  if (isLoading) return <div>Loading...</div>;
  if (!lead) return notFound();



  const handleAction = (action: string) => {
    // In a real app we'd call an API here. Let's just mock router push for this UI workflow.
    alert(`Mock ACTION: Lead marked as ${action}.`);
    router.push('/admin/leads');
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <Link 
          href="/admin/leads" 
          className="inline-flex items-center text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Inbox
        </Link>
        <StatusPill status={lead.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-4 border-b border-border pb-2">Raw Lead Information</h2>
            <div className="mb-4">
              <h1 className="text-xl font-bold text-foreground mb-2">{lead.raw_title}</h1>
              <div className="p-4 bg-surface-muted rounded-lg text-sm text-foreground/80 leading-relaxed border border-border whitespace-pre-wrap">
                {lead.raw_summary}
              </div>
            </div>

            {lead.source_url && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-foreground/60 mb-1">Source Link</p>
                <a href={lead.source_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm break-all">
                  {lead.source_url}
                </a>
              </div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-4 border-b border-border pb-2">Extracted Data</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-foreground/60 mb-1">Mosque Name</p>
                <p className="text-sm font-medium">{lead.extracted_mosque_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground/60 mb-1">State</p>
                <p className="text-sm font-medium">{lead.state || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground/60 mb-1">Project Type</p>
                <p className="text-sm font-medium">{lead.detected_project_type || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground/60 mb-1">Account Info</p>
                <p className="text-sm font-medium">{lead.detected_account_info || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Meta & Actions */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-4 border-b border-border pb-2">Analysis</h2>
            
            <div className="mb-4">
              <p className="text-xs font-semibold text-foreground/60 mb-1">Source Type</p>
              <p className="text-sm font-medium">{lead.source_type}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-xs font-semibold text-foreground/60 mb-1">Confidence Score</p>
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">{lead.lead_score}</span>
                <span className="text-xs text-foreground/60">/ 100</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-foreground/60 mb-2">Review Notes</p>
              <textarea 
                className="w-full bg-surface-muted border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-foreground/40"
                rows={4}
                placeholder="Add internal notes for other reviewers..."
                defaultValue={lead.notes || ""}
              ></textarea>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-4 border-b border-border pb-2">Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => handleAction("Draft Project Generated")}
                className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
              >
                Approve & Create Draft
              </button>
              <button 
                onClick={() => handleAction("Needs Manual Check")}
                className="w-full bg-orange-100 hover:bg-orange-200 border border-orange-200 text-orange-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Mark for Manual Check
              </button>
              <button 
                onClick={() => handleAction("Rejected")}
                className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Reject Lead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
