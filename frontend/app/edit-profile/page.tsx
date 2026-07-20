import { SiteShell } from "@/components/site-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EditProfilePage() {
  return (
    <SiteShell title="Edit Profile" description="Update student identity, contact details, class and stream settings.">
      <Card>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input placeholder="Student Name" />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" placeholder="student@example.com" />
          </div>
          <div className="grid gap-2">
            <Label>Class</Label>
            <Input placeholder="11th" />
          </div>
          <div className="grid gap-2">
            <Label>Stream</Label>
            <Input placeholder="Medical" />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Bio</Label>
            <Input placeholder="Short profile bio" />
          </div>
          <Button className="md:col-span-2 w-full">Save Profile</Button>
        </CardContent>
      </Card>
    </SiteShell>
  );
}
