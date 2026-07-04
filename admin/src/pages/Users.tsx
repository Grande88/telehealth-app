import { useState, useEffect } from "react";
import { adminUsersApi } from "../lib/api";
import type { User } from "../lib/api";
import { X, UserPlus, Edit2, Trash2, Save, User as UserIcon, Search } from "lucide-react";

export default function Users() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  // Load users from Firestore on mount
  useEffect(() => {
    adminUsersApi.getAll()
      .then((data) => setUsersList(data))
      .catch((err) => console.error("Failed to load users", err));
  }, []);

  // Add / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"patient" | "admin">("patient");
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split("T")[0]);
  const [feedbackCount, setFeedbackCount] = useState(0);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const patients = usersList.filter((u) => u.role === "patient");
  const admins = usersList.filter((u) => u.role === "admin");

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setName("");
    setEmail("");
    setPhone("");
    setRole("patient");
    setJoinDate(new Date().toISOString().split("T")[0]);
    setFeedbackCount(0);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUserId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone ?? "");
    setRole(u.role);
    setJoinDate(u.joinDate);
    setFeedbackCount(u.feedbackCount);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (u: User) => {
    setUserToDelete(u);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await adminUsersApi.delete(userToDelete.id);
        setUsersList((prev) => prev.filter((u) => u.id !== userToDelete.id));
      } catch (err) {
        console.error("Failed to delete user", err);
      }
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) newErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Please enter a valid email address";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const userData = {
      name,
      email,
      phone: phone.trim() || undefined,
      role,
      joinDate,
      feedbackCount,
    };

    if (editingUserId) {
      try {
        const updated = await adminUsersApi.update(editingUserId, userData);
        setUsersList((prev) => prev.map((u) => (u.id === editingUserId ? updated : u)));
      } catch (err) {
        console.error("Failed to update user", err);
      }
    } else {
      try {
        const created = await adminUsersApi.create(userData);
        setUsersList((prev) => [...prev, created]);
      } catch (err) {
        console.error("Failed to create user", err);
      }
    }

    setIsModalOpen(false);
  };

  const initials = (n: string) =>
    n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">
            {usersList.length} total users — {patients.length} patients,{" "}
            {admins.length} admins
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-52"
            />
          </div>
          <button
            onClick={handleOpenAdd}
            className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <UserPlus size={17} />
            Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Phone
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Joined
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Feedback
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {initials(user.name)}
                        </div>
                        <span className="font-medium text-slate-900">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          user.role === "admin"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {user.phone ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                        {user.feedbackCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenDelete(user)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-scale-in border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserIcon className="text-emerald-500" size={22} />
                {editingUserId ? "Edit User Account" : "Add New User"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className={`w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    errors.name
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                      : "border-slate-200"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs font-semibold text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jane@example.com"
                  className={`w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    errors.email
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                      : "border-slate-200"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs font-semibold text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Phone{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 234 567 8900"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Role
                </label>
                <div className="flex gap-3">
                  {(["patient", "admin"] as const).map((r) => (
                    <label
                      key={r}
                      className={`flex flex-1 cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-all ${
                        role === r
                          ? r === "admin"
                            ? "border-purple-400 bg-purple-50 ring-2 ring-purple-400/20"
                            : "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-400/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r}
                        checked={role === r}
                        onChange={() => setRole(r)}
                        className="sr-only"
                      />
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          role === r
                            ? r === "admin"
                              ? "border-purple-500"
                              : "border-emerald-500"
                            : "border-slate-300"
                        }`}
                      >
                        {role === r && (
                          <div
                            className={`h-2 w-2 rounded-full ${
                              r === "admin" ? "bg-purple-500" : "bg-emerald-500"
                            }`}
                          />
                        )}
                      </div>
                      <span
                        className={`text-sm font-semibold capitalize ${
                          role === r
                            ? r === "admin"
                              ? "text-purple-700"
                              : "text-emerald-700"
                            : "text-slate-600"
                        }`}
                      >
                        {r}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Join Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Join Date
                </label>
                <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Feedback Count */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Feedback Count
                </label>
                <input
                  type="number"
                  min={0}
                  value={feedbackCount}
                  onChange={(e) => setFeedbackCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save size={16} />
                  {editingUserId ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-in border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
                <Trash2 size={24} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">
                Delete User Account?
              </h3>
              <p className="mb-6 text-sm text-slate-500 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800">
                  {userToDelete.name}
                </span>
                's account? This action cannot be undone and all associated data
                will be permanently removed.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                  }}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 shadow-sm cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
