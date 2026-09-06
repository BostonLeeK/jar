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
  const [pageListed, setPageListed] = useState(user.pageListed);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const donateUrl = `${appUrl}${donatePath(user.slug)}`;
  const canDelete = deleteSlug.trim() === user.slug && (!user.hasPassword || deletePassword.length > 0);

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
        pageListed,
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

  async function deleteAccount() {
    if (!canDelete || deleting) {
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    const res = await fetch("/api/settings/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: deleteSlug,
        password: deletePassword,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setDeleting(false);
      setDeleteError(data.error || "Не вдалося видалити акаунт");
      return;
    }
    router.push("/");
    router.refresh();
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
          <label className="flex items-start gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={!pageListed}
              onChange={(event) => setPageListed(!event.target.checked)}
            />
            <span>
              Ховати з головної
              <span className="mt-0.5 block text-xs text-zinc-400">
                Сторінка /d/{user.slug} лишається відкритою, просто не буде в блоці учасників.
              </span>
            </span>
          </label>
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

      <Card className="border-red-100 p-5 lg:col-span-2">
        <h2 className="text-sm font-medium text-red-600">Видалити акаунт</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Сторінка /d/{user.slug}, донати, віджети, файли і підключення зникнуть без відновлення.
        </p>
        {deleteOpen ? (
          <div className="mt-4 max-w-md space-y-3">
            <div>
              <Label htmlFor="delete-slug">Введи slug {user.slug}</Label>
              <Input
                id="delete-slug"
                value={deleteSlug}
                onChange={(event) => setDeleteSlug(event.target.value)}
                autoComplete="off"
              />
            </div>
            {user.hasPassword ? (
              <div>
                <Label htmlFor="delete-password">Поточний пароль</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                />
              </div>
            ) : null}
            <FieldError>{deleteError}</FieldError>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="danger" disabled={!canDelete || deleting} onClick={deleteAccount}>
                {deleting ? "Видаляю…" : "Видалити назавжди"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={deleting}
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteSlug("");
                  setDeletePassword("");
                  setDeleteError(null);
                }}
              >
                Скасувати
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="danger" className="mt-4" onClick={() => setDeleteOpen(true)}>
            Видалити акаунт
          </Button>
        )}
      </Card>
    </div>
  );
}
