"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getUserRecentActivity } from "@/lib/api";

export default function UserDashboardPage() {
  const { user, contributor, loading } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    async function fetchActivity() {
      if (contributor?.id) {
        setIsRefreshing(true);
        const data = await getUserRecentActivity(contributor.id);
        setActivities(data);
        setIsRefreshing(false);
      }
    }
    fetchActivity();
  }, [contributor]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: "Jumlah Infaq",
      value: `RM ${(contributor?.total_infaq_amount || 0).toLocaleString()}`,
      sub: `${contributor?.total_infaq_count || 0} kali menderma`,
      link: "/projects",
      cta: (contributor?.total_infaq_count || 0) === 0 ? "Mula Infaq" : null,
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-emerald-50 border-emerald-100",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
    },
    {
      label: "Sumbangan Kempen",
      value: contributor?.total_submissions || 0,
      sub: "Maklumat masjid dihantar",
      link: "/contribute",
      cta: (contributor?.total_submissions || 0) === 0 ? "Hantar Kempen" : null,
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      color: "bg-primary/5 border-primary/10",
      btnClass: "bg-primary hover:bg-primary-hover text-white shadow-primary/20"
    },
    {
      label: "Status Profil",
      value: contributor?.role === 'admin' ? "Super Admin" : "Penyumbang Aktif",
      sub: "Akaun disahkan Google",
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "bg-blue-50 border-blue-100"
    }
  ];

  return (
    <div className="min-h-screen bg-surface-muted/30 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-border pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl skew-y-2">
              {user.user_metadata.avatar_url ? (
                <Image 
                  src={user.user_metadata.avatar_url} 
                  alt={user.user_metadata.full_name} 
                  fill 
                  className="object-cover -skew-y-2 scale-110" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-3xl font-black">
                  {user.user_metadata.full_name?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                Salam, <span className="text-primary">{user.user_metadata.full_name?.split(' ')[0]}</span>!
              </h1>
              <p className="text-foreground/50 font-medium mt-1">
                Terima kasih kerana menjadi sebahagian daripada komuniti MasjidFund.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                  Penderma Sah
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/10">
                  {contributor?.total_submissions || 0} Sumbangan Kempen
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-5xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className={`p-8 rounded-3xl border shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all duration-500 bg-white`}
            >
              <div className={`p-4 rounded-2xl ${stat.color} mb-6 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <h3 className="text-xs font-black text-foreground/30 uppercase tracking-[0.2em] mb-2">{stat.label}</h3>
              <p className="text-3xl font-black text-foreground mb-1 tracking-tight">{stat.value}</p>
              <p className="text-xs font-bold text-foreground/40 mb-6">{stat.sub}</p>
              
              {stat.cta && stat.link && (
                <Link 
                  href={stat.link}
                  className={`w-full py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 ${stat.btnClass}`}
                >
                  {stat.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="max-w-5xl mx-auto px-6 mt-12 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Aktiviti Terkini</h2>
          {activities.length > 0 && (
            <button 
              onClick={() => {
                if (contributor?.id) getUserRecentActivity(contributor.id).then(setActivities);
              }}
              className="text-xs font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
            >
              Refresh
            </button>
          )}
        </div>

        {isRefreshing && activities.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-border p-20 text-center animate-pulse">
            <div className="w-12 h-12 bg-surface-muted rounded-full mx-auto mb-4" />
            <div className="h-4 bg-surface-muted rounded w-32 mx-auto" />
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-border p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-foreground/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-foreground mb-3">Belum ada aktiviti</h3>
            <p className="text-foreground/40 max-w-md mx-auto text-sm leading-relaxed mb-8">
              Mula menderma atau hantar maklumat masjid untuk melihat sejarah sumbangan anda di sini.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/projects" className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest">Mula Infaq</Link>
              <Link href="/contribute" className="px-8 py-3 bg-surface-muted text-foreground rounded-2xl font-black text-xs uppercase tracking-widest">Hantar Kempen</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="bg-white p-6 rounded-[2rem] border border-border flex items-center gap-6 hover:shadow-lg transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  activity.type === 'donation' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/10 text-primary'
                }`}>
                  {activity.type === 'donation' ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                      activity.type === 'donation' ? 'bg-emerald-100/50 text-emerald-700' : 'bg-primary/10 text-primary'
                    }`}>
                      {activity.type === 'donation' ? 'Infaq' : 'Kempen'}
                    </span>
                    <span className="text-[10px] font-bold text-foreground/30">
                      {new Date(activity.date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {activity.title}
                  </h4>
                  {activity.amount && (
                    <p className="text-sm font-black text-emerald-600 mt-1">RM {activity.amount.toLocaleString()}</p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                    activity.status === 'success' || activity.status === 'Published'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : activity.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                      : 'bg-surface-muted text-foreground/40 border-border'
                  }`}>
                    {activity.status === 'success' || activity.status === 'Published' ? 'Berjaya' : activity.status || 'Dihantar'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
