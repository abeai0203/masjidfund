"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicProjects, getAllStates } from "@/lib/api";
import { Project } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";

type ScopeType = "All" | "Best" | "State" | "";

export default function DonateFlowPage() {
  const [step, setStep] = useState(1);
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [numMosques, setNumMosques] = useState<number>(3);
  
  const [scope, setScope] = useState<ScopeType>("");
  const [selectedState, setSelectedState] = useState<string>("");
  
  const [recommendations, setRecommendations] = useState<Project[]>([]);
  
  const [allStates, setAllStates] = useState<string[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    getAllStates().then(setAllStates);
    getPublicProjects().then(setAllProjects);
  }, []);
  
  // Helpers for recommendations
  const getCandidateProjects = () => {
    let pool = [...allProjects];
    if (scope === "State" && selectedState) {
       pool = pool.filter(p => p.state.toLowerCase() === selectedState.toLowerCase());
    }
    // Simple shuffle for simulation
    return pool.sort(() => 0.5 - Math.random());
  };

  const generateRecommendations = () => {
    const pool = getCandidateProjects();
    // Cap at available projects or selected number
    const count = Math.min(numMosques, pool.length);
    setRecommendations(pool.slice(0, count));
    if (count > 0) setStep(3);
    else alert("Not enough active campaigns matching this criteria. Try changing the scope.");
  };

  const replaceProject = (indexToReplace: number) => {
    const currentSlugs = new Set(recommendations.map(r => r.slug));
    const pool = getCandidateProjects();
    const newCandidate = pool.find(p => !currentSlugs.has(p.slug));
    
    if (newCandidate) {
      const newRecs = [...recommendations];
      newRecs[indexToReplace] = newCandidate;
      setRecommendations(newRecs);
    } else {
      alert("No more unique campaigns available in this category to swap with.");
    }
  };

  // Derived calculations
  const parsedTotal = typeof totalAmount === "number" ? totalAmount : 0;
  const actualNum = recommendations.length > 0 ? recommendations.length : numMosques;
  // Floor to 2 decimals
  const splitAmount = actualNum > 0 ? Math.floor((parsedTotal / actualNum) * 100) / 100 : 0;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-3">Donation Allocator</h1>
        <p className="text-lg text-foreground/70">
          Distribute your contribution effortlessly across multiple verified mosque projects.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= s 
                  ? "bg-primary text-white" 
                  : "bg-surface-muted text-foreground/40 border-2 border-border"
              }`}>
                {s}
              </div>
              {s < 4 && (
                <div className={`w-8 h-1 mx-2 rounded-full transition-colors ${
                  step > s ? "bg-primary/50" : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Amount & Count */}
      {step === 1 && (
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground mb-6">Step 1: Determine Your Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Total Donation (RM)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-foreground/50 font-medium">RM</span>
                <input 
                  type="number" 
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value ? Number(e.target.value) : "")}
                  min="1"
                  className="w-full bg-surface-muted border border-border rounded-xl pl-12 pr-4 py-4 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="e.g. 100" 
                />
              </div>
            </div>
            <div>
               <label className="block text-sm font-semibold text-foreground/80 mb-2">How many mosques to support?</label>
               <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={numMosques}
                  onChange={(e) => setNumMosques(Number(e.target.value))}
                  className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary mt-4"
                />
                <div className="flex justify-between text-xs font-semibold text-foreground/60 mt-2 px-1">
                  <span>1</span>
                  <span>5 max</span>
                </div>
                <div className="text-center mt-2  text-primary font-bold text-xl">
                  {numMosques} {numMosques === 1 ? 'Mosque' : 'Mosques'}
                </div>
            </div>
          </div>

          {totalAmount && totalAmount > 0 && numMosques > 0 && (
             <div className="mt-8 bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                 <p className="text-foreground/80 font-medium">
                   We will allocate <span className="font-bold text-primary text-xl mx-1">RM {splitAmount.toFixed(2)}</span> per mosque.
                 </p>
             </div>
          )}

          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => setStep(2)}
              disabled={!totalAmount || totalAmount <= 0}
              className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Select Scope
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Scope */}
      {step === 2 && (
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Step 2: Where should we look?</h2>
              <button onClick={() => setStep(1)} className="text-sm font-medium text-foreground/60 hover:text-primary">← Go back</button>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {(["All", "Best", "State"] as ScopeType[]).map(s => (
                 <button 
                    key={s}
                    onClick={() => setScope(s)}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      scope === s 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-border bg-surface hover:bg-surface-muted hover:border-foreground/30 text-foreground/80"
                    }`}
                 >
                    <div className="font-bold mb-1">
                      {s === "All" ? "All Malaysia" : s === "Best" ? "Most Urgent" : "By State"}
                    </div>
                    {s === "State" && scope === "State" ? null : (
                       <p className="text-xs opacity-70">
                          {s === "All" && "Randomly select from all states"}
                          {s === "Best" && "Prioritize lowest funded projects"}
                          {s === "State" && "Focus on a specific location"}
                       </p>
                    )}
                 </button>
              ))}
           </div>

           {scope === "State" && (
              <div className="mb-8 p-6 bg-surface-muted rounded-xl border border-border animate-in fade-in slide-in-from-top-4 duration-300">
                 <label className="block text-sm font-semibold text-foreground/80 mb-2">Select State</label>
                 <select 
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full sm:w-1/2 bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                 >
                    <option value="">Choose a state...</option>
                    {allStates.map(state => <option key={state} value={state}>{state}</option>)}
                 </select>
              </div>
           )}

           <div className="flex justify-end">
            <button 
              onClick={generateRecommendations}
              disabled={!scope || (scope === "State" && !selectedState)}
              className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              View Recommendations
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Recommendations */}
      {step === 3 && (
        <div className="space-y-6">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface p-6 rounded-2xl border border-border shadow-sm">
             <div>
                <h2 className="text-xl font-bold text-foreground">Recommended Allocation</h2>
                <p className="text-sm text-foreground/70 mt-1">Total: RM {Number(totalAmount).toFixed(2)} • {actualNum} Mosques</p>
             </div>
             <div className="flex gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
               <button onClick={() => setStep(2)} className="px-4 py-2 border border-border rounded-lg text-sm font-medium bg-surface hover:bg-surface-muted transition-colors flex-1 sm:flex-none text-center">← Back</button>
               <button onClick={generateRecommendations} className="px-4 py-2 border border-border rounded-lg text-sm font-medium bg-surface hover:bg-surface-muted transition-colors flex-1 sm:flex-none text-center flex items-center justify-center">
                 <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 Refresh All
               </button>
             </div>
           </div>

           <div className="grid gap-4">
              {recommendations.map((project, idx) => (
                 <div key={project.slug} className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                       <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {project.mosque_name}
                            </h3>
                            <p className="text-sm font-medium text-foreground/60">{project.state} • {project.district}</p>
                          </div>
                          <Badge status={project.verification_status} />
                       </div>
                       <p className="text-sm text-foreground/80 line-clamp-2 mt-3 mb-4">{project.title}</p>
                       <ProgressBar 
                          collectedAmount={project.collected_amount} 
                          targetAmount={project.target_amount} 
                          percentage={project.completion_percent} 
                        />
                    </div>
                    <div className="w-full sm:w-48 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
                       <div className="text-center sm:text-right">
                          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1">Allocated</p>
                          <p className="text-2xl font-black text-primary">RM {splitAmount.toFixed(2)}</p>
                       </div>
                       <button 
                         onClick={() => replaceProject(idx)}
                         className="text-xs font-medium text-foreground/60 hover:text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground/40 transition-all mt-0 sm:mt-4"
                       >
                         Replace
                       </button>
                    </div>
                 </div>
              ))}
           </div>

           <div className="flex justify-center mt-8">
            <button 
              onClick={() => setStep(4)}
              className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-12 rounded-xl shadow-md transition-all text-lg transform hover:-translate-y-0.5"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Final Summary / Payment info */}
      {step === 4 && (
        <div className="space-y-6">
           <div className="text-center mb-8">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h2 className="text-2xl font-extrabold text-foreground">Ready to Donate</h2>
             <p className="text-foreground/70 mt-2 max-w-lg mx-auto">
               Your total intent of <strong>RM {Number(totalAmount).toFixed(2)}</strong> has been allocated across {actualNum} verified projects.
               Please complete the transfer to the official accounts below.
             </p>
           </div>

           <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
             <div className="divide-y divide-border">
                {recommendations.map(project => (
                   <div key={project.slug} className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
                     <div className="md:w-1/3 pr-4 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0">
                        <h3 className="font-bold text-foreground">{project.mosque_name}</h3>
                        <p className="text-sm mt-1 text-foreground/60 line-clamp-2 mb-3">{project.title}</p>
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 inline-block">
                           <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-0.5">Your Donation</p>
                           <p className="text-xl font-black text-primary">RM {splitAmount.toFixed(2)}</p>
                        </div>
                     </div>
                     <div className="md:w-2/3">
                        <h4 className="text-sm font-semibold text-foreground/80 mb-3 border-b border-border pb-2 uppercase tracking-wider">Official Payment Details</h4>
                        
                        {project.donation_method_type === "Both" || project.donation_method_type === "Bank Transfer" ? (
                          <div className="mb-4 bg-surface-muted rounded-xl p-4 border border-border">
                              <p className="text-xs font-semibold text-foreground/50 mb-1">Direct Transfer</p>
                              <p className="font-medium text-foreground">{project.bank_name}</p>
                              <p className="font-mono text-lg tracking-wide text-foreground my-1">{project.account_number}</p>
                              <p className="text-sm font-semibold text-foreground/80 uppercase mt-2">{project.account_name}</p>
                          </div>
                        ) : null}

                        {project.donation_method_type === "Both" || project.donation_method_type === "DuitNow QR" ? (
                          <div className="bg-surface-muted rounded-xl p-4 border border-border flex items-center justify-between">
                             <div>
                               <p className="text-xs font-semibold text-foreground/50 mb-1">Scan to Pay</p>
                               <p className="font-medium text-foreground mb-1">DuitNow QR Available</p>
                               <p className="text-xs text-foreground/60">Scan using your mobile banking app.</p>
                             </div>
                             {project.duitnow_qr_url ? (
                               <div className="w-16 h-16 bg-white border border-border rounded-lg p-1">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={project.duitnow_qr_url} alt="QR Code" className="w-full h-full object-contain opacity-50 sepia grayscale" />
                               </div>
                             ) : (
                                <div className="w-16 h-16 bg-border/50 rounded-lg"></div>
                             )}
                          </div>
                        ) : null}

                     </div>
                   </div>
                ))}
             </div>
           </div>

           <div className="flex justify-center mt-8">
             <Link href="/" className="px-6 py-3 border-2 border-border text-foreground hover:bg-surface-muted rounded-xl font-medium transition-colors">
               Return Home
             </Link>
           </div>
        </div>
      )}

    </div>
  );
}
