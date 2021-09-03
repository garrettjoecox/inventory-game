/* eslint-disable consistent-return */
import { useEffect, useRef, useState } from 'react';

export default function useDraggable({
  bounds,
}: {
  bounds: { top: number; left: number; bottom: number; right: number };
}) {
  const draggableRef = useRef<HTMLDivElement>(null);
  const draggableHandleRef = useRef<HTMLDivElement>(null);
  const [mouseDownPos, setMouseDownPos] = useState<null | { x: number; y: number }>(null);

  useEffect(() => {
    if (!draggableHandleRef.current) {
      return;
    }
    const el = draggableHandleRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = e.currentTarget!.getBoundingClientRect();
      setMouseDownPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    el.addEventListener('mousedown', handleMouseDown);

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const draggable = draggableRef.current;
      if (!draggable || !mouseDownPos) return;

      const { height, width } = draggable.getBoundingClientRect();

      draggable.style.left = `${Math.min(bounds.right - width, Math.max(bounds.left, e.clientX - mouseDownPos.x))}px`;
      draggable.style.top = `${Math.min(bounds.bottom - height, Math.max(bounds.top, e.clientY - mouseDownPos.y))}px`;
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
  }, [bounds.bottom, bounds.left, bounds.right, bounds.top, mouseDownPos]);

  return {
    draggableRef,
    draggableHandleRef,
  };
}
