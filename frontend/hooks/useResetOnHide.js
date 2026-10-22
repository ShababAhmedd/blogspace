"use client";

import { useLayoutEffect, useRef } from "react";

// Next.js keeps visited pages mounted but hidden (React Activity), so their state
// survives navigation. `reset` runs when the page is hidden, so stale messages
// and typed passwords are gone by the next visit.
export default function useResetOnHide(reset) {
  const resetRef = useRef(reset);

  useLayoutEffect(() => {
    resetRef.current = reset;
  });

  useLayoutEffect(() => () => resetRef.current(), []);
}
