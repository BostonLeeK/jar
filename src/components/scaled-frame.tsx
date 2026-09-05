"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export function ScaledFrame({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const node = box.current;
    if (!node) {
      return;
    }
    const update = () => setScale(node.clientWidth / width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ height: height * (scale || 0) }}>
      <div className="origin-top-left" style={{ width, height, transform: scale ? `scale(${scale})` : undefined }}>
        {children}
      </div>
    </div>
  );
}
