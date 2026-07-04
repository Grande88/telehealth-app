import { useState, useEffect } from "react";
import {
  adminHospitalsApi,
  adminFeedbackApi,
  adminUsersApi,
} from "../lib/api";
import type { Hospital, Feedback, User } from "../lib/api";
import { Download, FileText, CheckCircle } from "lucide-react";

// ─── CSV helpers ─────────────────────────────────────────────────────────────

function toCSV(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
}

function downloadCSV(filename: string, csvString: string) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        const [h, f, u] = await Promise.all([
          adminHospitalsApi.getAll(),
          adminFeedbackApi.getAll(),
          adminUsersApi.getAll()
        ]);
        setHospitals(h);
        setFeedbackList(f);
        setUsers(u);
      } catch (err) {
        console.error("Failed to load reports data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-400">
        Loading reports...
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

  const analytics = {
    totalFeedback,
    averageRating,
    positiveFeedbackPercentage
  };

  // Monthly feedback trend
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyFeedbackMap: Record<string, number> = {};
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

  // ─── Report generators ───────────────────────────────────────────────────────

  const downloadMonthlyFeedbackSummary = () => {
    const header = ["ID", "Hospital", "User ID", "Rating", "Category", "Status", "Date", "Comment"];
    const rows = feedbackList.map((fb) => {
      const hospital = hospitals.find((h) => h.id === fb.hospitalId);
      return [
        fb.id,
        hospital?.name ?? "Unknown",
        fb.userId,
        String(fb.rating),
        fb.category,
        fb.status,
        new Date(fb.date).toLocaleDateString(),
        fb.comment,
      ];
    });

    const summary = [
      [],
      ["=== SUMMARY ==="],
      ["Total Feedback", String(analytics.totalFeedback)],
      ["Average Rating", String(analytics.averageRating)],
      ["Positive Feedback %", `${analytics.positiveFeedbackPercentage}%`],
      [],
      ["=== MONTHLY TRENDS ==="],
      ["Month", "Feedback Count"],
      ...monthlyFeedback.map((m) => [m.month, String(m.count)]),
    ];

    downloadCSV(
      `monthly-feedback-summary-${new Date().toISOString().split("T")[0]}.csv`,
      toCSV([header, ...rows, ...summary])
    );
  };

  const downloadHospitalPerformanceReport = () => {
    const header = ["Hospital ID", "Name", "Address", "Static Rating", "Avg Rating from Feedback", "Total Feedback"];
    const rows = hospitals.map((h) => {
      const hFeedback = feedbackList.filter((fb) => fb.hospitalId === h.id);
      const avg =
        hFeedback.length > 0
          ? (hFeedback.reduce((s, fb) => s + fb.rating, 0) / hFeedback.length).toFixed(2)
          : "—";
      return [h.id, h.name, h.address, String(h.rating), avg, String(hFeedback.length)];
    });

    const catSection = [
      [],
      ["=== FEEDBACK CATEGORY BREAKDOWN ==="],
      ["Category", "Count", "Percentage"],
      ...categoryBreakdown.map((c) => [c.category, String(c.count), `${c.percentage}%`]),
    ];

    downloadCSV(
      `hospital-performance-report-${new Date().toISOString().split("T")[0]}.csv`,
      toCSV([header, ...rows, ...catSection])
    );
  };

  const downloadUserActivityReport = () => {
    const header = [
      "User ID",
      "Name",
      "Email",
      "Role",
      "Phone",
      "Join Date",
      "Feedback Count",
      "Feedback Submitted",
      "Status",
    ];

    const rows = users.map((u) => {
      const feedbackSubmitted = feedbackList.filter((fb) => fb.userId === u.id).length;
      return [
        u.id,
        u.name,
        u.email,
        u.role,
        u.phone ?? "—",
        new Date(u.joinDate).toLocaleDateString(),
        String(u.feedbackCount),
        String(feedbackSubmitted),
        feedbackSubmitted > 0 ? "Active" : "Inactive",
      ];
    });

    const summary = [
      [],
      ["=== USER SUMMARY ==="],
      ["Total Users", String(users.length)],
      ["Patients", String(users.filter((u) => u.role === "patient").length)],
      ["Admins", String(users.filter((u) => u.role === "admin").length)],
      ["Active Users (with feedback)", String(users.filter((u) => u.feedbackCount > 0).length)],
    ];

    downloadCSV(
      `user-activity-report-${new Date().toISOString().split("T")[0]}.csv`,
      toCSV([header, ...rows, ...summary])
    );
  };

  const exportFullPlatformPDF = () => {
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const hospitalRows = hospitals
      .map((h) => {
        const hFeedback = feedbackList.filter((fb) => fb.hospitalId === h.id);
        const avg =
          hFeedback.length > 0
            ? (hFeedback.reduce((s, fb) => s + fb.rating, 0) / hFeedback.length).toFixed(2)
            : "—";
        return `<tr>
          <td>${h.name}</td>
          <td>${h.address}</td>
          <td>${h.rating}</td>
          <td>${avg}</td>
          <td>${hFeedback.length}</td>
          <td>${hFeedback.filter((fb) => fb.status === "pending").length}</td>
        </tr>`;
      })
      .join("");

    const catRows = categoryBreakdown
      .map(
        (c) =>
          `<tr><td>${c.category}</td><td>${c.count}</td><td>${c.percentage}%</td></tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Telehealth Platform Report — ${today}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; color: #1e293b; padding: 40px; font-size: 13px; }
    h1 { font-size: 22px; color: #059669; margin-bottom: 4px; }
    .subtitle { color: #64748b; margin-bottom: 32px; font-size: 13px; }
    h2 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 28px 0 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 8px; }
    .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .stat-value { font-size: 22px; font-weight: 700; color: #0f172a; }
    .stat-value.green { color: #059669; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 12px; }
    th { background: #f1f5f9; text-align: left; padding: 8px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    tr:hover td { background: #f8fafc; }
    .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>📋 Telehealth Platform Report</h1>
  <p class="subtitle">Generated on ${today} · Admin Export</p>

  <h2>Platform Summary</h2>
  <div class="stats">
    <div class="stat">
      <div class="stat-label">Total Feedback</div>
      <div class="stat-value">${analytics.totalFeedback.toLocaleString()}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Average Rating</div>
      <div class="stat-value">${analytics.averageRating}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Positive Feedback</div>
      <div class="stat-value green">${analytics.positiveFeedbackPercentage}%</div>
    </div>
    <div class="stat">
      <div class="stat-label">Active Hospitals</div>
      <div class="stat-value">${hospitals.length}</div>
    </div>
  </div>

  <h2>Hospital Performance</h2>
  <table>
    <thead>
      <tr>
        <th>Hospital</th><th>Address</th><th>Overall Rating</th>
        <th>Avg Feedback Rating</th><th>Total Feedback</th><th>Pending</th>
      </tr>
    </thead>
    <tbody>${hospitalRows}</tbody>
  </table>

  <h2>Feedback by Category</h2>
  <table>
    <thead><tr><th>Category</th><th>Count</th><th>Percentage</th></tr></thead>
    <tbody>${catRows}</tbody>
  </table>

  <div class="footer">Telehealth Admin Dashboard · Confidential · ${today}</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  const REPORTS = [
    {
      id: "monthly",
      title: "Monthly Feedback Summary",
      description: "Aggregated feedback data, ratings, and monthly trends",
      date: `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      format: "CSV",
      onDownload: downloadMonthlyFeedbackSummary,
    },
    {
      id: "hospital",
      title: "Hospital Performance Report",
      description: "Ratings and feedback comparison across all hospital facilities",
      date: `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      format: "CSV",
      onDownload: downloadHospitalPerformanceReport,
    },
    {
      id: "user",
      title: "User Activity Report",
      description: "Patient engagement, submission trends, and user statistics",
      date: `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      format: "CSV",
      onDownload: downloadUserActivityReport,
    },
  ];

  const handleDownload = (id: string, fn: () => void) => {
    fn();
    setDownloadedIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setDownloadedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 3000);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500">Generate and export platform reports</p>
        </div>
        <button
          onClick={exportFullPlatformPDF}
          className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <FileText size={16} />
          Export Full PDF
        </button>
      </div>

      {/* Platform Summary */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Platform Summary
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <p className="text-sm text-slate-500">Total Feedback</p>
            <p className="text-2xl font-bold text-slate-900">
              {analytics.totalFeedback.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Avg. Rating</p>
            <p className="text-2xl font-bold text-slate-900">
              {analytics.averageRating}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Positive %</p>
            <p className="text-2xl font-bold text-emerald-600">
              {analytics.positiveFeedbackPercentage}%
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Hospitals</p>
            <p className="text-2xl font-bold text-slate-900">
              {hospitals.length}
            </p>
          </div>
        </div>
      </div>

      {/* Category Report */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Feedback by Category
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Category
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Count
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Percentage
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Distribution
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((cat) => (
                <tr
                  key={cat.category}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-3.5 pr-4 font-medium text-slate-900">
                    {cat.category}
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-slate-600">
                    {cat.count}
                  </td>
                  <td className="py-3.5 pr-4 text-sm font-semibold text-slate-700">
                    {cat.percentage}%
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Reports */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Available Reports
        </h2>
        <div className="space-y-3">
          {REPORTS.map((report) => {
            const isDownloaded = downloadedIds.has(report.id);
            return (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50/70"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{report.title}</h3>
                    <p className="text-sm text-slate-500">{report.description}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {report.date} ·{" "}
                      <span className="font-medium text-emerald-600">
                        {report.format}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(report.id, report.onDownload)}
                  className={`ml-4 shrink-0 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isDownloaded
                      ? "bg-emerald-600 text-white border border-emerald-600 shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-600"
                  }`}
                >
                  {isDownloaded ? (
                    <>
                      <CheckCircle size={13} />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <Download size={13} />
                      Download
                    </>
                  )
                  }
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
