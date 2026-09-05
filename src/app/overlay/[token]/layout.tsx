import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function OverlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html{scrollbar-gutter:auto}html,body{background:transparent!important;overflow:hidden;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}`}</style>
      {children}
    </>
  );
}
