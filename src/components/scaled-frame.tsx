"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export function ScaledFrame({
  width,
  height,
  children,
}: {
  width: number;
  height?: number;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [contentH, setContentH] = useState(height ?? 1);

  useLayoutEffect(() => {
    const node = box.current;
    const frame = inner.current;
    if (!node) {
      return;
    }
    const update = () => {
      setScale(node.clientWidth / width);
      if (!height && frame) {
        setContentH(Math.max(frame.scrollHeight, 1));
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    if (frame) {
      observer.observe(frame);
    }
    return () => observer.disconnect();
  }, [width, height]);

  const frameH = height ?? contentH;

  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ height: frameH * (scale || 0) }}>
      <div
        ref={inner}
        className="origin-top-left"
        style={{ width, height: height ?? "auto", transform: scale ? `scale(${scale})` : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
