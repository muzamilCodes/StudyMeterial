import { BookOpen, CircleHelp, Download, FileText, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SubjectCard({
  name,
  notes,
  papers,
  videos,
  quizzes
}: {
  name: string;
  notes: number;
  papers: number;
  videos: number;
  quizzes: number;
}) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Subject</p>
            <h3 className="text-xl font-semibold text-slate-900">{name}</h3>
          </div>
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-500">
              <FileText className="h-4 w-4" /> Total Notes
            </div>
            <p className="mt-2 text-lg font-semibold">{notes}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Download className="h-4 w-4" /> Papers
            </div>
            <p className="mt-2 text-lg font-semibold">{papers}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-500">
              <PlayCircle className="h-4 w-4" /> Videos
            </div>
            <p className="mt-2 text-lg font-semibold">{videos}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-500">
              <CircleHelp className="h-4 w-4" /> MCQ Quiz
            </div>
            <p className="mt-2 text-lg font-semibold">{quizzes}</p>
          </div>
        </div>
        <Button className="w-full">Download Button</Button>
      </CardContent>
    </Card>
  );
}
