"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { updateProfileAction, changePasswordAction, deleteAccountAction } from "@/app/actions/settings";

type SettingsPageClientProps = {
  fullName: string;
  email: string;
};

export const SettingsPageClient = ({ fullName, email }: SettingsPageClientProps) => {
  const [name, setName] = useState(fullName);
  const [password, setPassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    const formData = new FormData();
    formData.set("full_name", name);
    const result = await updateProfileAction(formData);
    if (result?.error) {
      setProfileError(result.error);
      setSavingProfile(false);
      return;
    }
    setSavingProfile(false);
  };

  const handlePasswordSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordError(null);
    const formData = new FormData();
    formData.set("password", password);
    const result = await changePasswordAction(formData);
    if (result?.error) {
      setPasswordError(result.error);
      setSavingPassword(false);
      return;
    }
    setPassword("");
    setSavingPassword(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteAccountAction();
    if (result?.error) {
      setDeleteError(result.error);
      setDeleting(false);
      return;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="font-pixel text-[11px] sm:text-[13px] md:text-[16px] uppercase tracking-[0.05em] text-ink">
        [ SETTINGS.EXE ]
      </div>

      <div className="grid gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="mb-3 font-retro text-2xl uppercase tracking-[0.1em] text-muted">
            [ LEVEL 01 ] — Profile
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input id="settings-email" label="Email" value={email} disabled />
            <Input
              id="settings-name"
              label="Full Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {profileError ? <div className="font-retro text-lg text-accent">{profileError}</div> : null}
            <Button type="submit" variant="primary" disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Update Profile"}
            </Button>
          </form>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="mb-3 font-retro text-2xl uppercase tracking-[0.1em] text-muted">
            [ LEVEL 02 ] — Password
          </div>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <Input
              id="settings-password"
              label="New Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {passwordError ? <div className="font-retro text-lg text-accent">{passwordError}</div> : null}
            <Button type="submit" variant="primary" disabled={savingPassword}>
              {savingPassword ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </Card>

        <Card className="border-accent p-4 sm:p-6">
          <div className="mb-3 font-retro text-2xl uppercase tracking-[0.1em] text-accent">
            [ DANGER ZONE ]
          </div>
          <div className="mb-3 font-body text-sm sm:text-base text-muted">
            Deleting your account removes all clients, sections, and entries.
          </div>
          {deleteError ? <div className="font-retro text-lg text-accent">{deleteError}</div> : null}
          <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
            Delete Account
          </Button>
        </Card>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account" className="max-w-md">
        <div className="font-retro text-xl text-accent">Are you sure? This cannot be undone.</div>
        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleDeleteAccount} disabled={deleting}>
            {deleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
