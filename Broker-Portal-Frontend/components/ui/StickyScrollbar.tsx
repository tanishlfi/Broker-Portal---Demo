"use client";

import { useEffect, useRef } from "react";

/**
 * StickyScrollbar
 *
 * Renders a phantom scrollbar fixed to the bottom of the viewport that stays
 * visible while the user scrolls vertically through a long page. It mirrors
 * the horizontal scroll position of the element pointed to by `scrollRef`.
 *
 * Usage:
 *   const tableRef = useRef<HTMLDivElement>(null);
 *   ...
 *   <div ref={tableRef} style={{ overflowX: "auto" }}>...</div>
 *   <StickyScrollbar scrollRef={tableRef} />
 */
interface StickyScrollbarProps {
  /** Ref to the element whose horizontal scroll this bar controls */
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export default function StickyScrollbar({ scrollRef }: StickyScrollbarProps) {
  const phantomRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  useEffect(() => {
    const table = scrollRef.current;
    const phantom = phantomRef.current;
    const inner = innerRef.current;
    if (!table || !phantom || !inner) return;

    // Position the phantom scrollbar to match the table's position and width
    const updatePosition = () => {
      const rect = table.getBoundingClientRect();
      const hasHorizontalScroll = table.scrollWidth > table.clientWidth;
      
      if (hasHorizontalScroll) {
        phantom.style.display = 'block';
        phantom.style.left = `${rect.left}px`;
        phantom.style.width = `${rect.width}px`;
        inner.style.width = `${table.scrollWidth}px`;
      } else {
        phantom.style.display = 'none';
      }
    };

    // Initial positioning
    updatePosition();

    // Update on scroll and resize
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    const ro = new ResizeObserver(updatePosition);
    ro.observe(table);

    // Sync scroll: phantom → table
    const onPhantomScroll = () => {
      if (syncing.current) return;
      syncing.current = true;
      table.scrollLeft = phantom.scrollLeft;
      syncing.current = false;
    };

    // Sync scroll: table → phantom
    const onTableScroll = () => {
      if (syncing.current) return;
      syncing.current = true;
      phantom.scrollLeft = table.scrollLeft;
      syncing.current = false;
    };

    phantom.addEventListener("scroll", onPhantomScroll);
    table.addEventListener("scroll", onTableScroll);

    return () => {
      phantom.removeEventListener("scroll", onPhantomScroll);
      table.removeEventListener("scroll", onTableScroll);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      ro.disconnect();
    };
  }, [scrollRef]);

  return (
    <div
      ref={phantomRef}
      style={{
        position: "fixed",
        bottom: 0,
        overflowX: "auto",
        overflowY: "hidden",
        height: "17px", // Standard scrollbar height
        zIndex: 1000,
        background: "transparent",
        pointerEvents: "auto",
      }}
    >
      {/* Phantom inner — same width as the real table scroll width */}
      <div ref={innerRef} style={{ height: "1px" }} />
    </div>
  );
}
