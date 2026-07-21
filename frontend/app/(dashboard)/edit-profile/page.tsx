"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoredSession, saveSession, type StudentSession } from "@/lib/session";
import { User, CheckCircle2, Save } from "lucide-react";
import { type Grade, type Stream } from "@/lib/platform-data";

export default function EditProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<StudentSession | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState<Grade>("11th");
  const [stream, setStream] = useState<Stream>("Medical");
  const [bio, setBio] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);
    if (s) {
      setName(s.name ?? "Muzamil Ahmad");
      setEmail(s.email ?? "student@studymaterial.edu");
      setGrade(s.grade ?? "11th");
      setStream(s.stream ?? "Medical");
      setBio(s.bio ?? "Class 11th Medical Aspirant");
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const updated: StudentSession = {
      ...session,
      name,
      email,
      grade,
      stream: grade === "10th" ? "General" : stream,
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-6 md:p-8 text-white shadow-premium">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white font-extrabold text-2xl shadow-lg backdrop-blur-md">
            {name ? name[0] : "M"}
          </div>
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-1">Student Settings</Badge>
            <h2 className="text-3xl font-extrabold">Edit Profile</h2>
            <p className="text-sm text-blue-100/90">
              Update student name, email, class, stream, and bio details.
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
      <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl">
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
    </div>
  );
}
