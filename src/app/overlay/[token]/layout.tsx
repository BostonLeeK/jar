export default function OverlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html{scrollbar-gutter:auto}html,body{background:transparent!important;overflow:hidden}`}</style>
      {children}
    </>
  );
}
