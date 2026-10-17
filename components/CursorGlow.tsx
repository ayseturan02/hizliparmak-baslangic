"use client";

import { useEffect } from "react";

export default function CursorGlow() {
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return;

    const move = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
      document.documentElement.classList.add("has-glow-cursor");
    };
    const leave = () => document.documentElement.classList.remove("has-glow-cursor");
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-glow-cursor");
    };
  }, []);

  return <div className="cursor-orb" aria-hidden="true"><span /></div>;
}
