"use client";

import { AvatarField } from "@/components/avatar-field";
import { Button, Card, FieldError, Input, Label } from "@/components/ui";
import { donatePath } from "@/lib/urls";
import type { SafeUser } from "@/lib/user";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SettingsPanel({ user, appUrl }: { user: SafeUser; appUrl: string }) {
  const router = useRouter();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileOk, setProfileOk] = useState(false);
  const [passwordOk, setPasswordOk] = useState(false);
  const [pending, setPending] = useState(false);
  const donateUrl = `${appUrl}${donatePath(user.slug)}`;

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setProfileError(null);
    setProfileOk(false);
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        slug: form.get("slug"),
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setProfileError(data.error || "Не вдалося зберегти");
      return;
    }
    setProfileOk(true);
    router.refresh();
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setPasswordError(null);
    setPasswordOk(false);
    const form = new FormData(event.currentTarget);
    const next = String(form.get("next") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (next !== confirm) {
      setPending(false);
      setPasswordError("Паролі не збігаються");
      return;
    }
    const res = await fetch("/api/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current: form.get("current"),
        next: form.get("next"),
        confirm: form.get("confirm"),
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setPasswordError(data.error || "Не вдалося змінити пароль");
      return;
    }
    setPasswordOk(true);
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <h2 className="text-sm font-medium">Профіль</h2>
        <p className="mt-1 text-sm text-zinc-500">Імʼя, email і адреса сторінки донатів.</p>
        <div className="mt-4">
          <AvatarField avatar={user.avatarUrl} fallback={user.twitchAvatar} name={user.name} />
        </div>
        <form onSubmit={saveProfile} className="mt-4 space-y-3">
          <div>
            <Label htmlFor="name">Імʼя</Label>
            <Input id="name" name="name" defaultValue={user.name} required minLength={2} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={user.email} required />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={user.slug} required />
            <p className="mt-1.5 font-mono text-xs text-zinc-400">{donateUrl}</p>
          </div>
          <FieldError>{profileError}</FieldError>
          {profileOk ? <p className="text-sm text-emerald-600">Збережено</p> : null}
          <Button type="submit" disabled={pending}>
            Зберегти профіль
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-medium">Пароль</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {user.hasPassword ? "Зміна пароля з підтвердженням." : "Для акаунта Google можна задати пароль окремо."}
        </p>
        <form onSubmit={changePassword} className="mt-4 space-y-3">
          {user.hasPassword ? (
            <div>
              <Label htmlFor="current">Поточний</Label>
              <Input id="current" name="current" type="password" required />
            </div>
          ) : null}
          <div>
            <Label htmlFor="next">Новий пароль</Label>
            <Input id="next" name="next" type="password" required minLength={8} />
          </div>
          <div>
            <Label htmlFor="confirm">Підтвердження пароля</Label>
            <Input id="confirm" name="confirm" type="password" required minLength={8} />
          </div>
          <FieldError>{passwordError}</FieldError>
          {passwordOk ? <p className="text-sm text-emerald-600">Пароль оновлено</p> : null}
          <Button type="submit" disabled={pending}>
            {user.hasPassword ? "Змінити пароль" : "Встановити пароль"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
