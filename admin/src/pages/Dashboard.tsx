import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminFeedbackApi, adminHospitalsApi } from "../lib/api";
import type { Feedback, Hospital } from "../lib/api";

function StatCard({
  title,
  value,
  trend,
  trendUp,
  icon,
}: {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          {icon}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            trendUp
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {trend}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{title}</p>
    </div>
  );
}

function RecentFeedbackRow({
  id,
  hospitalName,
  rating,
  comment,
  date,
  status,
  category,
}: {
  id: string;
  hospitalName: string;
  rating: number;
  comment: string;
  date: string;
  status: string;
  category: string;
}) {
  const navigate = useNavigate();
  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    reviewed: "bg-emerald-50 text-emerald-700",
    resolved: "bg-blue-50 text-blue-700",
  };

  return (
    <tr
      onClick={() => navigate(`/feedback/${id}`)}
      className="border-b border-slate-100 transition-colors hover:bg-slate-50 cursor-pointer"
    >
      <td className="py-3.5 pr-4">
        <p className="text-sm font-medium text-slate-900">{hospitalName}</p>
      </td>
      <td className="py-3.5 pr-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`h-4 w-4 ${i < rating ? "text-amber-400" : "text-slate-200"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </td>
      <td className="py-3.5 pr-4">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {category}
        </span>
      </td>
      <td className="max-w-xs truncate py-3.5 pr-4 text-sm text-slate-600">
        {comment}
      </td>
      <td className="py-3.5 pr-4 text-sm text-slate-500">
        {new Date(date).toLocaleDateString()}
      </td>
      <td className="py-3.5">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[status] ?? "bg-slate-100 text-slate-600"}`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
}

function MiniBarChart({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-emerald-500 transition-all hover:bg-emerald-600"
            style={{ height: `${(d.count / max) * 100}%` }}
          />
          <span className="text-xs text-slate-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [hospitalsList, setHospitalsList] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fb, hosp] = await Promise.all([
        adminFeedbackApi.getAll(),
        adminHospitalsApi.getAll()
      ]);
      setFeedbackList(fb);
      setHospitalsList(hosp);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate dynamic analytics
  const totalFeedback = feedbackList.length;
  const averageRating = totalFeedback > 0 
    ? feedbackList.reduce((acc, f) => acc + f.rating, 0) / totalFeedback 
    : 0;
  
  const positiveFeedbackPercentage = totalFeedback > 0 
    ? Math.round((feedbackList.filter(f => f.rating >= 4).length / totalFeedback) * 100) 
    : 0;
  
  const pendingCount = feedbackList.filter((f) => f.status === "pending").length;
  
  const recentFeedbackCount = feedbackList.filter(f => {
    const diff = Date.now() - new Date(f.date).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000; // last 7 days
  }).length;

  // Monthly feedback trend for charts
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();
  const visibleMonths = Array.from({ length: 6 }).map((_, i) => {
    const idx = (currentMonthIdx - 5 + i + 12) % 12;
    return months[idx];
  });

  const monthlyFeedback = visibleMonths.map(monthName => {
    const count = feedbackList.filter(f => {
      const fMonth = new Date(f.date).toLocaleString('en-US', { month: 'short' });
      return fMonth === monthName;
    }).length;
    return { month: monthName, count };
  });

  // Category breakdown
  const categories = ["Cleanliness", "Wait Time", "Staff", "Communication", "Billing", "General"];
  const categoryBreakdown = categories.map(cat => {
    const count = feedbackList.filter(f => f.category === cat).length;
    const percentage = totalFeedback > 0 ? Math.round((count / totalFeedback) * 100) : 0;
    return { category: cat, count, percentage };
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">
            Welcome back, Jane.{" "}
            <span className="text-slate-400">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          <svg
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
          </svg>
          {isLoading ? 'Syncing...' : 'Sync'}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Feedback"
          value={totalFeedback.toLocaleString()}
          trend="+12%"
          trendUp
          icon={
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Average Rating"
          value={averageRating.toFixed(1)}
          trend="+0.2"
          trendUp
          icon={
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          }
        />
        <StatCard
          title="Positive Feedback"
          value={`${positiveFeedbackPercentage}%`}
          trend="Stable"
          trendUp
          icon={
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />
        <StatCard
          title="Pending Reviews"
          value={pendingCount}
          trend={`${recentFeedbackCount} new`}
          trendUp={false}
          icon={
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Feedback Trend */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">
            Feedback Trend
          </h2>
          <p className="mb-6 text-sm text-slate-500">Monthly submissions</p>
          <MiniBarChart data={monthlyFeedback} />
        </div>

        {/* Category Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">
            Categories
          </h2>
          <p className="mb-6 text-sm text-slate-500">Feedback by category</p>
          <div className="space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {cat.category}
                  </span>
                  <span className="text-slate-500">{cat.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Feedback Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Feedback
            </h2>
            <p className="text-sm text-slate-500">
              Latest patient submissions
            </p>
          </div>
          <a
            href="/feedback"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-slate-400">
              Loading recent submissions...
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-slate-400">
              No feedback submissions found.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Hospital
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Rating
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Comment
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...feedbackList]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((fb) => {
                  const hospital = hospitalsList.find(
                    (h) => h.id === fb.hospitalId
                  );
                  return (
                    <RecentFeedbackRow
                      key={fb.id}
                      id={fb.id}
                      hospitalName={hospital?.name ?? "Unknown"}
                      rating={fb.rating}
                      comment={fb.comment}
                      date={fb.date}
                      status={fb.status}
                      category={fb.category}
                    />
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
