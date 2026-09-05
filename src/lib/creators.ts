import { prisma } from "@/lib/prisma";
import { pageAvatar } from "@/lib/user";

export const LANDING_CREATOR_LIMIT = 8;

export async function getLandingCreators() {
  const listed = { pageListed: true };
  const [count, rows] = await Promise.all([
    prisma.user.count({ where: listed }),
    prisma.user.findMany({
      where: listed,
      take: LANDING_CREATOR_LIMIT,
      orderBy: [{ pageViews: "desc" }, { createdAt: "desc" }],
      select: {
        name: true,
        slug: true,
        pageTitle: true,
        pageBio: true,
        pageTheme: true,
        pageCoverUrl: true,
        avatarUrl: true,
        twitchAvatar: true,
      },
    }),
  ]);

  return {
    count,
    creators: rows.map((user) => ({
      name: user.pageTitle || user.name,
      slug: user.slug,
      bio: user.pageBio,
      themeId: user.pageTheme,
      cover: user.pageCoverUrl,
      avatar: pageAvatar(user),
    })),
  };
}

export type LandingCreator = Awaited<ReturnType<typeof getLandingCreators>>["creators"][number];

export function uaPeople(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return "учасник";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "учасники";
  }
  return "учасників";
}
