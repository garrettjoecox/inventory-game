/* eslint-disable consistent-return */
import { useEffect, useRef, useState } from 'react';

export default function useResizeable({ minHeight, minWidth }: { minHeight: number; minWidth: number }) {
  const resizeableRef = useRef<HTMLDivElement>(null);
  const resizeableHandleRef = useRef<HTMLDivElement>(null);
  const [mouseDownPos, setMouseDownPos] = useState<null | { x: number; y: number }>(null);

  useEffect(() => {
    if (!resizeableHandleRef.current) {
      return;
    }
    const el = resizeableHandleRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = e.currentTarget!.getBoundingClientRect();
      setMouseDownPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    el.addEventListener('mousedown', handleMouseDown);

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
    };
  }, [resizeableHandleRef]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const resizeable = resizeableRef.current;
      if (!resizeable || !mouseDownPos) return;

      const { x, y } = resizeable.getBoundingClientRect();

      resizeable.style.maxWidth = `${Math.max(minWidth, e.clientX - x + mouseDownPos.x)}px`;
      resizeable.style.maxHeight = `${Math.max(minHeight, e.clientY - y + mouseDownPos.y)}px`;
      resizeable.style.width = resizeable.style.maxWidth;
      resizeable.style.height = resizeable.style.maxHeight;
    };
    const handleMouseUp = () => {
      setMouseDownPos(null);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };

    if (mouseDownPos) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [minHeight, minWidth, mouseDownPos]);

  return {
    resizeableRef,
    resizeableHandleRef,
  };
}
