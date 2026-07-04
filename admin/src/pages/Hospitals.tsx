import { useState, useEffect, useCallback } from "react";
import { adminHospitalsApi } from "../lib/api";
import type { Hospital } from "../lib/api";
import { X, Star, Save, Trash2, Edit2, Plus, Building, Link, ImageIcon } from "lucide-react";

const PRESET_IMAGES = [
  { label: "Modern Clinic", url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800" },
  { label: "Patient Room", url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800" },
  { label: "Wellness Reception", url: "https://images.unsplash.com/photo-1538108149393-cebb47cbdc12?auto=format&fit=crop&q=80&w=800" },
  { label: "Exterior View", url: "https://images.unsplash.com/photo-1587351021759-3e566b3db4f1?auto=format&fit=crop&q=80&w=800" },
];

type ImageMode = "preset" | "url";

export default function Hospitals() {
  const [hospitalsList, setHospitalsList] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospitalId, setEditingHospitalId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(5.0);
  const [imageMode, setImageMode] = useState<ImageMode>("preset");
  const [presetImage, setPresetImage] = useState(PRESET_IMAGES[0].url);
  const [customUrl, setCustomUrl] = useState("");

  const getFinalImage = () => imageMode === "preset" ? presetImage : customUrl;

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadHospitals = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await adminHospitalsApi.getAll();
      setHospitalsList(list);
    } catch (err) {
      console.error("Failed to load hospitals list:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);
    
  const resetImageState = () => {
    setImageMode("preset");
    setPresetImage(PRESET_IMAGES[0].url);
    setCustomUrl("");
  };

  const handleOpenAdd = () => {
    setEditingHospitalId(null);
    setName("");
    setAddress("");
    setDescription("");
    setRating(5.0);
    resetImageState();
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Hospital) => {
    setEditingHospitalId(h.id);
    setName(h.name);
    setAddress(h.address);
    setDescription(h.description);
    setRating(h.rating);
    resetImageState();
    const isPreset = PRESET_IMAGES.some(p => p.url === h.image);
    if (isPreset) {
      setImageMode("preset");
      setPresetImage(h.image);
    } else {
      setImageMode("url");
      setCustomUrl(h.image);
    }
    setErrors({});
    setIsModalOpen(true);
  };


  const handleOpenDelete = (h: Hospital) => {
    setHospitalToDelete(h);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (hospitalToDelete) {
      try {
        await adminHospitalsApi.delete(hospitalToDelete.id);
        await loadHospitals();
        setIsDeleteModalOpen(false);
        setHospitalToDelete(null);
      } catch (err) {
        console.error("Failed to delete hospital:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Hospital name is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (imageMode === "url" && !customUrl.trim()) newErrors.image = "Image URL is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const hospitalData = {
      name,
      address,
      description,
      rating: Number(rating),
      image: getFinalImage(),
    };

    try {
      if (editingHospitalId) {
        await adminHospitalsApi.update(editingHospitalId, hospitalData);
      } else {
        await adminHospitalsApi.create(hospitalData);
      }
      await loadHospitals();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to submit hospital:", err);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospitals</h1>
          <p className="text-slate-500">
            Manage healthcare facilities on the platform
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadHospitals}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
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
          <button
            onClick={handleOpenAdd}
            className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus size={18} />
            Add Hospital
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          Loading hospital facilities...
        </div>
      ) : hospitalsList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 font-medium">
          No hospital facilities registered yet. Click "Add Hospital" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {hospitalsList.map((hospital) => (
            <div
              key={hospital.id}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-200">
                  <img
                    src={hospital.image}
                    alt={hospital.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1587351021759-3e566b3db4f1?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 text-lg leading-snug">
                      {hospital.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold text-amber-800">
                        {hospital.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-slate-400 font-medium">
                    {hospital.address}
                  </p>
                  <p className="mb-4 text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {hospital.description}
                  </p>
                </div>
              </div>
              
              <div className="px-5 pb-5 pt-0">
                <div className="flex gap-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => handleOpenEdit(hospital)}
                    className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleOpenDelete(hospital)}
                    className="flex-1 rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Hospital Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-scale-in border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building className="text-emerald-500" size={22} />
                {editingHospitalId ? "Edit Hospital Facility" : "Add Hospital Facility"}
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
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hope Wellness Medical Center"
                  className={`w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    errors.name ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200"
                  }`}
                />
                {errors.name && <p className="mt-1 text-xs font-semibold text-red-500">{errors.name}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 500 Health Avenue, Cityville"
                  className={`w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    errors.address ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200"
                  }`}
                />
                {errors.address && <p className="mt-1 text-xs font-semibold text-red-500">{errors.address}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the medical services, specialties, and approach..."
                  rows={3}
                  className={`w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    errors.description ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200"
                  }`}
                />
                {errors.description && <p className="mt-1 text-xs font-semibold text-red-500">{errors.description}</p>}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Rating Selection ({rating.toFixed(1)} / 5.0)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded border border-amber-200 shrink-0">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-amber-800">{rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Image Picker */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Facility Image
                </label>

                {/* Mode Tabs */}
                <div className="mb-3 flex rounded-lg border border-slate-200 overflow-hidden text-xs font-semibold">
                  {(["preset", "url"] as ImageMode[]).map((mode) => {
                    const icons = { preset: <ImageIcon size={13} />, url: <Link size={13} /> };
                    const labels = { preset: "Presets", url: "URL" };
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setImageMode(mode)}
                        className={`flex flex-1 items-center justify-center gap-1.5 py-2 transition-colors cursor-pointer ${
                          imageMode === mode
                            ? "bg-emerald-500 text-white"
                            : "bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {icons[mode]} {labels[mode]}
                      </button>
                    );
                  })}
                </div>

                {/* Preset Grid */}
                {imageMode === "preset" && (
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setPresetImage(preset.url)}
                        className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          presetImage === preset.url
                            ? "border-emerald-500 ring-2 ring-emerald-500/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/30 flex items-end justify-center pb-1">
                          <span className="text-[9px] text-white font-semibold text-center leading-tight px-1">
                            {preset.label}
                          </span>
                        </div>
                        {presetImage === preset.url && (
                          <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom URL */}
                {imageMode === "url" && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://example.com/hospital-image.jpg"
                      className={`w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                        errors.image ? "border-red-300" : "border-slate-200"
                      }`}
                    />
                    {customUrl && (
                      <img
                        src={customUrl}
                        alt="Preview"
                        className="h-28 w-full rounded-lg object-cover border border-slate-200"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                  </div>
                )}

                {errors.image && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.image}</p>}
              </div>

              {/* Form Footer Action Buttons */}
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
                  {editingHospitalId ? "Save Changes" : "Create Facility"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && hospitalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-in border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100 border-solid">
                <Trash2 size={24} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">
                Remove Hospital Facility?
              </h3>
              <p className="mb-6 text-sm text-slate-500 leading-relaxed">
                Are you sure you want to remove <span className="font-semibold text-slate-800">{hospitalToDelete.name}</span>? This action cannot be undone and will permanently delete the facility.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setHospitalToDelete(null);
                  }}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 shadow-sm cursor-pointer"
                >
                  Delete Facility
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
