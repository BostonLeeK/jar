import { cn } from "@/lib/cn";
import { uaPeople, type LandingCreator } from "@/lib/creators";
import { getPageTheme, headingClass } from "@/lib/themes";
import { donatePath } from "@/lib/urls";
import Link from "next/link";

function Face({
  name,
  avatar,
  className,
}: {
  name: string;
  avatar: string | null;
  className?: string;
}) {
  if (avatar) {
    return <img src={avatar} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center text-[11px] font-medium text-zinc-600",
        className,
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function CreatorProof({ count, creators }: { count: number; creators: LandingCreator[] }) {
  if (count === 0) {
    return null;
  }
  return (
    <a href="#creators" className="mt-8 inline-flex items-center gap-3 text-sm text-zinc-500 hover:text-zinc-900">
      <span className="flex -space-x-2">
        {creators.slice(0, 5).map((item) => (
          <span
            key={item.slug}
            className="h-8 w-8 overflow-hidden rounded-full bg-zinc-200 ring-2 ring-white"
          >
            <Face name={item.name} avatar={item.avatar} />
          </span>
        ))}
      </span>
      <span>
        {count.toLocaleString("uk-UA")} {uaPeople(count)} вже на Jar
      </span>
    </a>
  );
}

function CreatorCard({ creator }: { creator: LandingCreator }) {
  const theme = getPageTheme(creator.themeId);
  return (
    <Link
      href={donatePath(creator.slug)}
      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-44 overflow-hidden" style={{ background: theme.background, color: theme.text }}>
        {creator.cover ? (
          <div className="absolute inset-y-0 right-0 w-1/2">
            <img src={creator.cover} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="absolute inset-0" style={{ background: theme.veil }} />
        <div className="relative flex h-full flex-col justify-end p-4">
          <div className="mb-3 h-10 w-10 overflow-hidden rounded-full bg-white/15 ring-2 ring-white/25">
            <Face
              name={creator.name}
              avatar={creator.avatar}
              className={theme.tone === "dark" ? "text-white" : "text-zinc-700"}
            />
          </div>
          <p className={cn("truncate text-lg leading-tight", headingClass(theme))}>{creator.name}</p>
          <p className="mt-1 truncate text-xs" style={{ color: theme.muted }}>
            /d/{creator.slug}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function CreatorGallery({
  count,
  creators,
  startHref,
}: {
  count: number;
  creators: LandingCreator[];
  startHref: string;
}) {
  return (
    <section id="creators" className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Учасники</h2>
          <p className="mt-3 max-w-2xl text-zinc-500">
            {count === 0
              ? "Сторінки з’являться тут, щойно хтось підключить Банку."
              : `${count.toLocaleString("uk-UA")} ${uaPeople(count)} приймають донати. Зайди на сторінку і підтримай.`}
          </p>
        </div>
        {count > 0 ? (
          <p className="text-sm text-zinc-400">
            {count.toLocaleString("uk-UA")} {uaPeople(count)}
          </p>
        ) : null}
      </div>
      {creators.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {creators.map((creator) => (
            <CreatorCard key={creator.slug} creator={creator} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
          <p className="text-sm text-zinc-500">Стань першим учасником.</p>
          <Link
            href={startHref}
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-zinc-800 hover:shadow-sm"
          >
            Почати безкоштовно
          </Link>
        </div>
      )}
    </section>
  );
}
