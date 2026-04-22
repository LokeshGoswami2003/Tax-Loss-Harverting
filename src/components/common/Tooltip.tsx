import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export const Tooltip = ({ content, children }: TooltipProps) => {
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const bubbleRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top');
  const [style, setStyle] = useState<CSSProperties | undefined>(undefined);

  const position = () => {
    const wrapper = wrapperRef.current;
    const bubble = bubbleRef.current;
    if (!wrapper || !bubble) return;

    const margin = 8;
    const offset = 10;
    const trigger = wrapper.getBoundingClientRect();

    // Measure bubble with existing max-width so we can clamp precisely.
    const bubbleWidth = bubble.offsetWidth;
    const bubbleHeight = bubble.offsetHeight;

    const preferredTop = trigger.top - bubbleHeight - offset;
    const preferredBottom = trigger.bottom + offset;

    let nextPlacement: 'top' | 'bottom' = 'top';
    if (preferredTop < margin && preferredBottom + bubbleHeight <= window.innerHeight - margin) {
      nextPlacement = 'bottom';
    } else if (preferredTop >= margin) {
      nextPlacement = 'top';
    } else {
      // Neither fits perfectly; choose the side with more room.
      const spaceAbove = trigger.top - margin;
      const spaceBelow = window.innerHeight - margin - trigger.bottom;
      nextPlacement = spaceBelow >= spaceAbove ? 'bottom' : 'top';
    }

    let top = nextPlacement === 'top' ? preferredTop : preferredBottom;
    // Clamp vertically so the bubble never leaves the viewport.
    top = Math.max(margin, Math.min(window.innerHeight - bubbleHeight - margin, top));

    let left = trigger.left + trigger.width / 2 - bubbleWidth / 2;
    // Clamp horizontally.
    left = Math.max(margin, Math.min(window.innerWidth - bubbleWidth - margin, left));

    setPlacement(nextPlacement);
    setStyle({ top: `${top}px`, left: `${left}px` });
  };

  useLayoutEffect(() => {
    if (!open) return;
    // Next frame ensures layout is stable before measuring.
    const id = window.requestAnimationFrame(position);
    return () => window.cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, content]);

  useEffect(() => {
    if (!open) return;

    const onResize = () => position();
    const onScroll = () => position();

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <span
      className={styles.wrapper}
      ref={wrapperRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span className={styles.trigger}>{children}</span>
      <span
        className={`${styles.bubble} ${open ? styles.open : ''}`}
        data-placement={placement}
        role="tooltip"
        ref={bubbleRef}
        style={style}
      >
        {content}
      </span>
    </span>
  );
};
