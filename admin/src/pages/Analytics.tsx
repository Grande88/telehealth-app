import { useState, useEffect } from "react";
import { adminHospitalsApi, adminFeedbackApi } from "../lib/api";
import type { Hospital, Feedback } from "../lib/api";

export default function Analytics() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [h, f] = await Promise.all([
          adminHospitalsApi.getAll(),
          adminFeedbackApi.getAll()
        ]);
        setHospitals(h);
        setFeedbackList(f);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-400">
        Loading analytics...
      </div>
    );
  }

  // Calculate stats dynamically
  const totalFeedback = feedbackList.length;
  const averageRating =
    totalFeedback > 0
      ? Number((feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1))
      : 0;

  const positiveFeedbackCount = feedbackList.filter((f) => f.rating >= 4).length;
  const positiveFeedbackPercentage =
    totalFeedback > 0 ? Math.round((positiveFeedbackCount / totalFeedback) * 100) : 0;

  // Monthly feedback trend
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyFeedbackMap: Record<string, number> = {};
  
  // Initialise last 6 months
  const now = new Date();
  const last6Months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = monthNames[d.getMonth()];
    last6Months.push(mName);
    monthlyFeedbackMap[mName] = 0;
  }

  feedbackList.forEach((fb) => {
    if (!fb.date) return;
    const fbDate = new Date(fb.date);
    const mName = monthNames[fbDate.getMonth()];
    if (mName in monthlyFeedbackMap) {
      monthlyFeedbackMap[mName]++;
    }
  });

  const monthlyFeedback = last6Months.map((m) => ({
    month: m,
    count: monthlyFeedbackMap[m]
  }));

  // Category breakdown
  const categories = ["Cleanliness", "Wait Time", "Staff", "Communication", "Billing", "General"];
  const categoryCounts: Record<string, number> = {};
  categories.forEach((c) => (categoryCounts[c] = 0));

  feedbackList.forEach((fb) => {
    const cat = categories.find((c) => c.toLowerCase() === (fb.category || "").toLowerCase()) || "General";
    categoryCounts[cat]++;
  });

  const categoryBreakdown = categories.map((c) => {
    const count = categoryCounts[c];
    const percentage = totalFeedback > 0 ? Math.round((count / totalFeedback) * 100) : 0;
    return { category: c, count, percentage };
  });

  // Per-hospital stats
  const hospitalStats = hospitals.map((h) => {
    const hFeedback = feedbackList.filter((f) => f.hospitalId === h.id);
    const avgRating =
      hFeedback.length > 0
        ? hFeedback.reduce((sum, f) => sum + f.rating, 0) / hFeedback.length
        : 0;
    return { ...h, feedbackCount: hFeedback.length, avgRating };
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500">Insights into platform performance</p>
      </div>

      {/* Overview Stats */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-3xl font-bold text-emerald-600">
            {totalFeedback.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-500">Total Feedback</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-3xl font-bold text-emerald-600">
            {averageRating}
          </p>
          <p className="mt-1 text-sm text-slate-500">Average Rating</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-3xl font-bold text-emerald-600">
            {positiveFeedbackPercentage}%
          </p>
          <p className="mt-1 text-sm text-slate-500">Positive Feedback</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-3xl font-bold text-emerald-600">
            {hospitals.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">Active Hospitals</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Monthly Trend */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">
            Monthly Feedback Trend
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Number of submissions per month
          </p>
          <div className="flex items-end gap-3" style={{ height: 160 }}>
            {monthlyFeedback.map((d) => {
              const max = Math.max(...monthlyFeedback.map((m) => m.count)) || 1;
              return (
                <div
                  key={d.month}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-xs font-medium text-slate-700">
                    {d.count}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-emerald-500 transition-all hover:bg-emerald-600"
                    style={{ height: `${(d.count / max) * 100}%` }}
                  />
                  <span className="text-xs text-slate-500">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">
            Category Breakdown
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Distribution by feedback category
          </p>
          <div className="space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {cat.category}
                  </span>
                  <span className="font-medium text-slate-900">
                    {cat.count}{" "}
                    <span className="text-slate-400">({cat.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
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

      {/* Per-Hospital Performance */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          Hospital Performance
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Ratings and feedback count per facility
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Hospital
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Address
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Overall Rating
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Feedback Count
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Avg. from Feedback
                </th>
              </tr>
            </thead>
            <tbody>
              {hospitalStats.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="py-3.5 pr-4 font-medium text-slate-900">
                    {h.name}
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-slate-500">
                    {h.address}
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4 text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-slate-700">
                        {h.rating}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-slate-600">
                    {h.feedbackCount}
                  </td>
                  <td className="py-3.5 text-sm font-medium text-slate-700">
                    {h.avgRating > 0 ? h.avgRating.toFixed(1) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
