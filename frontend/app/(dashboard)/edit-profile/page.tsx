"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      setName(s.name ?? "Muzamil Ahmad");
      setEmail(s.email ?? "student@studymaterial.edu");
      setGrade(s.grade ?? "11th");
      setStream(s.stream ?? "Medical");
      setBio(s.bio ?? "Class 11th Medical Aspirant");
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
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (confirmText.trim().toLowerCase() !== "delete") {
      setDeleteError("Please type 'DELETE' to confirm account deletion.");
      return;
    }

    setIsDeleting(true);

    try {
      // Call Express/MongoDB backend endpoint to permanently delete user document
      if (email) {
        await fetch(apiUrl("/api/auth/delete-account"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
      }
    } catch (err) {
      console.error("Backend account deletion notice:", err);
    }

    // Permanently invalidate account in localStorage & clear sessions
    deleteAccountData(email);
    setIsDeleting(false);
    router.push("/login?deleted=true");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-6 md:p-8 text-white shadow-premium">
        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 rounded-2xl border-2 border-white/40 overflow-hidden shadow-xl shrink-0 bg-white/10">
            {avatar ? (
              <img src={avatar} alt="Profile Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-black text-3xl text-white">
                {name ? name[0] : "S"}
              </div>
            )}
          </div>
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-1">Student Settings</Badge>
            <h2 className="text-3xl font-extrabold">{name || "Student Profile"}</h2>
            <p className="text-sm text-blue-100/90">
              Update avatar picture, student identity, class stream, and account security.
            </p>
          </div>
        </div>
      </div>

      {savedMsg && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 p-4 text-white font-medium shadow-lg animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">Profile updated successfully! Refreshing dashboard...</p>
        </div>
      )}

      {/* Edit Profile Form */}
      <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl space-y-6">
        
        {/* Profile Avatar Selection Section */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <Label className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-blue-600" />
            Choose Profile Picture / Avatar
          </Label>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {AVATAR_PRESETS.map((presetUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAvatar(presetUrl);
                  setCustomAvatarUrl("");
                }}
                className={`relative h-14 w-14 rounded-2xl overflow-hidden border-2 transition-all ${
                  avatar === presetUrl 
                    ? "border-blue-600 ring-4 ring-blue-100 scale-105" 
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <img src={presetUrl} alt={`Avatar ${idx + 1}`} className="h-full w-full object-cover" />
                {avatar === presetUrl && (
                  <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
              </button>
            ))}

            {/* Custom file upload button */}
            <label className="flex h-14 px-4 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 transition cursor-pointer text-xs font-bold">
              <Upload className="h-4 w-4 text-blue-600" />
              <span>Upload Image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="pt-2 max-w-md">
            <Label className="text-xs font-bold text-slate-500">Or Paste Image URL:</Label>
            <Input
              value={customAvatarUrl}
              onChange={(e) => {
                setCustomAvatarUrl(e.target.value);
                if (e.target.value.trim() !== "") {
                  setAvatar(e.target.value);
                }
              }}
              placeholder="https://example.com/avatar.png"
              className="h-10 rounded-xl mt-1 text-xs"
            />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label className="font-bold text-slate-800">Student Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-11 rounded-xl" />
            </div>

            <div className="grid gap-2">
              <Label className="font-bold text-slate-800">Email Address</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-xl" />
            </div>

            <div className="grid gap-2">
              <Label className="font-bold text-slate-800">Selected Class</Label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as Grade)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900"
              >
                <option value="10th">10th Class</option>
                <option value="11th">11th Class</option>
                <option value="12th">12th Class</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label className="font-bold text-slate-800">Selected Stream</Label>
              <select
                value={stream}
                disabled={grade === "10th"}
                onChange={(e) => setStream(e.target.value as Stream)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
              >
                {grade === "10th" ? (
                  <option value="General">General (All 10th Subjects)</option>
                ) : (
                  <>
                    <option value="Medical">Medical (Biology, Physics, Chemistry, English)</option>
                    <option value="Non-Medical">Non-Medical (Physics, Chemistry, Mathematics, English)</option>
                    <option value="Commerce">Commerce (Accountancy, Business Studies, Economics, English)</option>
                    <option value="Arts">Arts (History, Political Science, Sociology, English)</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label className="font-bold text-slate-800">Short Bio</Label>
              <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short profile summary..." className="h-11 rounded-xl" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-premium">
              <Save className="mr-2 h-4 w-4" /> Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone: Logout & Permanent Account Deletion */}
      <Card className="rounded-[2.5rem] border-rose-200 bg-rose-50/30 p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 text-white rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-rose-950">Danger Zone & Account Management</h3>
              <p className="text-xs text-rose-700 font-medium">Log out of your current session or permanently delete your student profile.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-rose-200/60 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-800">Session Logout</p>
              <p className="text-xs text-slate-500">Sign out of this browser. You can log back in anytime.</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="rounded-xl border-rose-300 text-rose-700 hover:bg-rose-600 hover:text-white font-bold">
              <LogOut className="mr-2 h-4 w-4" /> Logout Account
            </Button>
          </div>

          <div className="pt-4 border-t border-rose-200/60 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-rose-900">Permanently Delete Account</p>
              <p className="text-xs text-rose-700">Permanently remove all your saved notes history, quiz results, and credentials so you can never log in with this account again.</p>
            </div>
            <Button onClick={() => setShowDeleteModal(true)} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Account Permanently
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl space-y-4 border border-rose-100">
            <div className="flex justify-between items-start border-b pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-extrabold text-base text-slate-900">Delete Account Permanently</h3>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              This action <strong>cannot be undone</strong>. All your student data will be purged, and this email (<strong>{email}</strong>) will be blocked from logging into the platform again.
            </p>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Type <span className="text-rose-600 font-extrabold">DELETE</span> to confirm:</Label>
              <Input
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setDeleteError("");
                }}
                placeholder="DELETE"
                className="rounded-xl h-11 border-slate-300"
              />
              {deleteError && <p className="text-xs text-rose-600 font-bold">{deleteError}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => setShowDeleteModal(false)} variant="outline" className="flex-1 rounded-xl font-bold">
                Cancel
              </Button>
              <Button onClick={handleDeleteAccount} disabled={isDeleting} className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md">
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
