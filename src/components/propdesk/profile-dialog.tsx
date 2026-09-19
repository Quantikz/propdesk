import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeskStore } from "@/lib/propdesk/store";

export function ProfileDialog() {
  const open = useDeskStore((s) => s.profileOpen);
  const force = useDeskStore((s) => s.profileForce);
  const email = useDeskStore((s) => s.email);
  const accountId = useDeskStore((s) => s.accountId);
  const closeProfile = useDeskStore((s) => s.closeProfile);
  const saveProfile = useDeskStore((s) => s.saveProfile);
  const [localEmail, setLocalEmail] = useState(email);
  const [localAccount, setLocalAccount] = useState(accountId);

  useEffect(() => {
    if (open) {
      setLocalEmail(email);
      setLocalAccount(accountId);
    }
  }, [open, email, accountId]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeProfile()}>
      <DialogContent>
        <DialogTitle className="pr-10 text-lg font-semibold">Trader profile</DialogTitle>
        <DialogDescription className="mt-1 mb-4 text-[13px] leading-relaxed text-muted">
          Optional. Saved on this device for when tickets exist. Not required for FAQ.
        </DialogDescription>
        <div className="grid gap-3">
          <div>
            <Label htmlFor="profEmail">Email</Label>
            <Input
              id="profEmail"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="profAccount">Account / login ID</Label>
            <Input
              id="profAccount"
              placeholder="Account ID"
              value={localAccount}
              onChange={(e) => setLocalAccount(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={closeProfile}>
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => saveProfile(localEmail, localAccount)}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
