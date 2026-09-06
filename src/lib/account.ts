import type { User } from "@prisma/client";
import { removeAlertUserFiles } from "@/lib/alert-media";
import { removeAvatarFiles } from "@/lib/avatar";
import { removeCoverFiles } from "@/lib/cover";
import { decrypt } from "@/lib/crypto";
import { clearMonoWebhook } from "@/lib/mono";
import { prisma } from "@/lib/prisma";
import { deleteEventSub } from "@/lib/twitch-eventsub";

export async function deleteUserAccount(user: User) {
  if (user.twitchId) {
    await deleteEventSub(user.twitchId).catch(() => undefined);
  }
  if (user.monoTokenEnc) {
    await clearMonoWebhook(decrypt(user.monoTokenEnc)).catch(() => undefined);
  }
  await Promise.all([
    removeAvatarFiles(user.id),
    removeCoverFiles(user.id),
    removeAlertUserFiles(user.id),
  ]);
  await prisma.user.delete({ where: { id: user.id } });
}