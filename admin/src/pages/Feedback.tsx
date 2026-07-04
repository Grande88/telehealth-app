import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { adminFeedbackApi, adminHospitalsApi } from "../lib/api";
import type { Feedback, Hospital } from "../lib/api";

export default function FeedbackPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed" | "resolved">("all");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fb, hosp] = await Promise.all([
        adminFeedbackApi.getAll(),
        adminHospitalsApi.getAll()
      ]);
      setFeedbacks(fb);
      setHospitals(hosp);
    } catch (err) {
      console.error("Failed to load feedback list:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = (filter === "all" ? feedbacks : feedbacks.filter((f) => f.status === filter))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleMarkReviewed = async (id: string) => {
    try {
      await adminFeedbackApi.update(id, { status: "reviewed" });
      setFeedbacks((prev) => prev.map((f) => f.id === id ? { ...f, status: "reviewed" } : f));
    } catch (err) {
      console.error("Failed to mark feedback as reviewed:", err);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    reviewed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    resolved: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feedback Management</h1>
          <p className="text-slate-500">Review and manage patient feedback submissions</p>
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

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(["all", "pending", "reviewed", "resolved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === s
                ? "bg-emerald-500 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s}
            {s !== "all" && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                {feedbacks.filter((f) => f.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
            Loading feedbacks...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500 font-medium">No {filter !== "all" ? filter : ""} feedback found.</p>
          </div>
        ) : (
          filtered.map((fb) => {
            const hospital = hospitals.find((h) => h.id === fb.hospitalId);
            return (
              <div
                key={fb.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="font-semibold text-slate-900">
                        {hospital?.name ?? `Hospital ${fb.hospitalId}`}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[fb.status]}`}
                      >
                        {fb.status}
                      </span>
                    </div>

                    <div className="mb-3 flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${i < fb.rating ? "text-amber-400" : "text-slate-200"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span>•</span>
                      <span>{fb.category}</span>
                      <span>•</span>
                      <span>{new Date(fb.date).toLocaleDateString()}</span>
                    </div>

                    <p className="text-sm text-slate-600">{fb.comment}</p>
                  </div>

                  <div className="ml-4 flex gap-2">
                    {fb.status === "pending" && (
                      <button
                        onClick={() => handleMarkReviewed(fb.id)}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    <Link
                      to={`/feedback/${fb.id}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 flex items-center justify-center"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
