"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { 
  getStoredSession, 
  saveSession, 
  clearSession, 
  deleteAccountData, 
  AVATAR_PRESETS, 
  type StudentSession 
} from "@/lib/session";
import { apiUrl } from "@/lib/api";
import { User, CheckCircle2, Save, LogOut, Trash2, AlertTriangle, X, Upload, Image as ImageIcon } from "lucide-react";
import { type Grade, type Stream } from "@/lib/platform-data";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function EditProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<StudentSession | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState<Grade>("11th");
  const [stream, setStream] = useState<Stream>("Medical");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);
    if (s) {
      setName(s.name ?? "Student");
      setEmail(s.email ?? "student@studymaterial.com");
      setGrade(s.grade ?? "11th");
      setStream(s.stream ?? "Medical");
      setBio(s.bio ?? "Class 11th Medical Student");
      setAvatar(s.avatar ?? AVATAR_PRESETS[0]);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const selectedAvatar = customAvatarUrl.trim() !== "" ? customAvatarUrl : avatar;

    const updated: StudentSession = {
      ...session,
      name,
      email,
      grade,
      stream: grade === "10th" ? "General" : stream,
      avatar: selectedAvatar,
      bio
    };

    setSession(updated);
    saveSession(updated);
    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      window.location.reload();
    }, 1000);
  };

  const handleLogout = () => {
    clearSession();
    router.push("/register");
  };

  const handleDeleteAccount = async () => {
    if (confirmText.trim().toLowerCase() !== "delete") {
      setDeleteError("Please type 'DELETE' to confirm deletion.");
      return;
    }

    setIsDeleting(true);

    try {
      const token = localStorage.getItem("study-material-token");
      const response = await fetch(apiUrl("/api/auth/delete-account"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setDeleteError(data?.message ?? "Server could not delete the account. Please sign in again and retry.");
        setIsDeleting(false);
        return;
      }
    } catch (err) {
      console.error("Account deletion API trace:", err);
      setDeleteError("Unable to reach the backend server. Account was not deleted.");
      setIsDeleting(false);
      return;
    }

    deleteAccountData(email);
    setIsDeleting(false);
    router.push("/register?deleted=true");
  };

  return (
    <SiteShell
      title="Student Profile Settings"
      description="Manage your personal credentials, profile avatar, class stream selection, and security settings."
    >
      <div className="space-y-8 max-w-4xl">
        
        {savedMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Profile details updated successfully! Reloading...</span>
          </div>
        )}

        {/* EDIT PROFILE FORM */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs space-y-6">
          
          {/* Avatar selection */}
          <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
            <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              Choose Profile Picture / Avatar
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              {AVATAR_PRESETS.map((presetUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAvatar(presetUrl);
                    setCustomAvatarUrl("");
                  }}
                  className={`relative h-12 w-12 rounded-2xl overflow-hidden border-2 transition-all ${
                    avatar === presetUrl 
                      ? "border-blue-600 ring-4 ring-blue-100 dark:ring-blue-950 scale-105" 
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <img src={presetUrl} alt={`Avatar ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}

              <label className="flex h-12 px-4 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-xs font-bold">
                <Upload className="h-4 w-4 text-blue-600" />
                <span>Upload File</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-800 dark:text-slate-200">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-10 rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-800 dark:text-slate-200">Email Address</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10 rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-800 dark:text-slate-200">Current Class</Label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as Grade)}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="10th">10th Class</option>
                  <option value="11th">11th Class</option>
                  <option value="12th">12th Class</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-800 dark:text-slate-200">Academic Stream</Label>
                <select
                  value={stream}
                  disabled={grade === "10th"}
                  onChange={(e) => setStream(e.target.value as Stream)}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-bold text-slate-800 dark:text-slate-200 disabled:opacity-50"
                >
                  <option value="Medical">Medical</option>
                  <option value="Non-Medical">Non-Medical</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="font-bold text-slate-800 dark:text-slate-200">Profile Bio</Label>
                <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short profile description..." className="h-10 rounded-xl" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-md hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* DANGER ZONE */}
        <div className="rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950 dark:text-rose-200">Danger Zone & Account Actions</h3>
              <p className="text-xs text-rose-700 dark:text-rose-400">Logout or permanently delete student account.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Session Logout</p>
              <p className="text-[11px] text-slate-500">Sign out from this device.</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-rose-300 dark:border-rose-800 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition flex items-center gap-1.5"
            >
              <LogOut className="h-4 w-4" /> Logout Session
            </button>
          </div>
        </div>

      </div>
    </SiteShell>
  );
}
