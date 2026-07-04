import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminFeedbackApi, adminHospitalsApi, adminUsersApi, adminNotificationsApi } from "../lib/api";
import type { Feedback, Hospital, User } from "../lib/api";
import { ArrowLeft, User as UserIcon, Building, Calendar, Star, MessageSquare, Shield, CheckCircle, Save, FileText, Trash2 } from "lucide-react";

export default function FeedbackDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [patient, setPatient] = useState<User | null>(null);
  
  const [response, setResponse] = useState("");
  const [notes, setNotes] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [feedbacks, hospitalsList, usersList] = await Promise.all([
        adminFeedbackApi.getAll(),
        adminHospitalsApi.getAll(),
        adminUsersApi.getAll(),
      ]);

      const foundFeedback = feedbacks.find((f) => f.id === id);
      if (foundFeedback) {
        setFeedback(foundFeedback);
        setResponse(foundFeedback.adminResponse || "");
        setNotes(foundFeedback.adminNotes || "");

        const foundHospital = hospitalsList.find((h) => h.id === foundFeedback.hospitalId);
        if (foundHospital) setHospital(foundHospital);

        const foundUser = usersList.find((u) => u.id === foundFeedback.userId);
        if (foundUser) setPatient(foundUser);
      }
    } catch (err) {
      console.error("Error loading feedback details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading feedback details...
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Feedback not found</h2>
        <button
          onClick={() => navigate("/feedback")}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
        >
          <ArrowLeft size={16} /> Back to Feedback
        </button>
      </div>
    );
  }

  const handleMarkReviewed = async () => {
    try {
      const updates = { status: "reviewed" as const };
      await adminFeedbackApi.update(feedback.id, updates);
      setFeedback({ ...feedback, ...updates });
      showSaveNotification();
    } catch (err) {
      console.error("Failed to mark reviewed:", err);
    }
  };

  const handleStatusChange = async (status: "pending" | "reviewed" | "resolved") => {
    try {
      const updates = { status };
      await adminFeedbackApi.update(feedback.id, updates);
      setFeedback({ ...feedback, ...updates });
      showSaveNotification();
    } catch (err) {
      console.error("Failed to change status:", err);
    }
  };

  const handleCategoryChange = async (category: string) => {
    try {
      const updates = { category };
      await adminFeedbackApi.update(feedback.id, updates);
      setFeedback({ ...feedback, ...updates });
      showSaveNotification();
    } catch (err) {
      console.error("Failed to change category:", err);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await adminFeedbackApi.delete(feedback.id);
      navigate("/feedback");
    } catch (err) {
      console.error("Failed to delete feedback:", err);
      setIsDeleting(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) return;
    try {
      const updates = { adminResponse: response, status: "resolved" as const };
      await adminFeedbackApi.update(feedback.id, updates);
      
      // Create a notification for the patient in Firestore
      await adminNotificationsApi.create({
        userId: feedback.userId,
        title: "Feedback Resolved",
        message: `Your feedback for ${hospital?.name || "the hospital"} was resolved with response: "${response}"`,
        type: "success"
      });

      setFeedback({ ...feedback, ...updates });
      setIsEditing(false);
      showSaveNotification();
    } catch (err) {
      console.error("Failed to submit response:", err);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      const updates = { adminNotes: notes };
      await adminFeedbackApi.update(feedback.id, updates);
      setFeedback({ ...feedback, ...updates });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save admin notes:", err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const showSaveNotification = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    reviewed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    resolved: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header & Back Action */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/feedback")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Feedback Details</h1>
              
              <select
                value={feedback.status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer ${statusColors[feedback.status]}`}
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">ID: {feedback.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {isSaved && (
            <div className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md animate-fade-in transition-all">
              Changes saved!
            </div>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete
          </button>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowDeleteModal(false)}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Feedback?</h3>
                <p className="text-sm text-slate-500 mb-6">This action cannot be undone. The feedback will be permanently removed.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button onClick={handleDelete} disabled={isDeleting} className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60">
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Comment Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <MessageSquare className="text-slate-500" size={20} />
                Patient Feedback
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Category:</span>
                <select
                  value={feedback.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                >
                  {["Cleanliness", "Wait Time", "Staff", "Communication", "Billing", "General"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={22}
                    className={i < feedback.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-500">
                Rating: {feedback.rating} / 5
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <Calendar size={14} />
                {new Date(feedback.date).toLocaleString()}
              </span>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
              <p className="text-slate-700 italic leading-relaxed">
                "{feedback.comment}"
              </p>
            </div>

            {/* Quick Actions (Pending State) */}
            {feedback.status === "pending" && (
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                  onClick={handleMarkReviewed}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                >
                  <CheckCircle size={16} />
                  Mark as Reviewed
                </button>
              </div>
            )}
          </div>

          {/* Admin Response Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 border-b border-slate-100 pb-4">
              <Shield className="text-slate-500" size={20} />
              Official Response
            </h2>

            {feedback.adminResponse && !isEditing ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-emerald-50/50 p-4 border border-emerald-100">
                  <p className="text-sm font-semibold text-emerald-800 mb-1">Admin replied:</p>
                  <p className="text-slate-700 leading-relaxed">{feedback.adminResponse}</p>
                </div>
                <button
                  onClick={() => {
                    setResponse(feedback.adminResponse || "");
                    setIsEditing(true);
                  }}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Edit Response
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <p className="text-sm text-slate-500">
                  Submit an official reply. This will mark the feedback status as <span className="font-semibold text-blue-600">resolved</span>.
                </p>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write your response to the patient here..."
                  className="w-full h-32 rounded-lg border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                  >
                    {isEditing ? "Save Changes" : "Send Response"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Info Sidebar (Hospital & Patient Info) */}
        <div className="space-y-6">
          {/* Hospital Details Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 border-b border-slate-100 pb-3">
              <Building size={18} className="text-slate-400" />
              Hospital Information
            </h3>
            {hospital ? (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800">{hospital.name}</h4>
                <p className="text-sm text-slate-600">{hospital.address}</p>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium text-slate-700">
                    {hospital.rating} Overall Rating
                  </span>
                </div>
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                  {hospital.description}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Unknown hospital</p>
            )}
          </div>

          {/* Patient Details Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 border-b border-slate-100 pb-3">
              <UserIcon size={18} className="text-slate-400" />
              Patient Profile
            </h3>
            {patient ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Name</p>
                  <p className="font-semibold text-slate-800">{patient.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-slate-700">{patient.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-slate-700">{patient.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Joined Platform</p>
                  <p className="text-slate-700">{new Date(patient.joinDate).toLocaleDateString()}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Feedback:</span>
                    <span className="font-semibold text-slate-800">{patient.feedbackCount}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Anonymous Patient</p>
            )}
          </div>

          {/* Internal Admin Notes Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 border-b border-slate-100 pb-3">
              <FileText size={18} className="text-slate-400" />
              Internal Admin Notes
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              These notes are private and only visible to admin staff.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this issue..."
              className="w-full h-24 rounded-lg border border-slate-200 p-2 text-xs focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all duration-200 ${
                notesSaved
                  ? "bg-emerald-600 border border-emerald-600 text-white shadow-sm"
                  : isSavingNotes
                  ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                  : "border border-emerald-500 bg-white text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600"
              }`}
            >
              {notesSaved ? (
                <>
                  <CheckCircle size={14} className="animate-scale-in" />
                  Notes Saved!
                </>
              ) : isSavingNotes ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Private Notes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
