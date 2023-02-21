/* eslint-disable consistent-return */
import { useEffect, useRef, useState } from 'react';

export default function useDraggable({
  bounds,
  onDragStart,
  onDragEnd,
}: {
  bounds: { top: number; left: number; bottom: number; right: number };
  onDragStart?: (event: MouseEvent) => void;
  onDragEnd?: (event: MouseEvent) => void;
}) {
  const draggableRef = useRef<HTMLDivElement>(null);
  const draggableHandleRef = useRef<HTMLDivElement>(null);
  const [mouseDownPos, setMouseDownPos] = useState<null | { x: number; y: number }>(null);
  const dragStartRef = useRef();

  useEffect(() => {
    if (!draggableHandleRef.current) {
      return;
    }
    const el = draggableHandleRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = e.currentTarget!.getBoundingClientRect();
      setMouseDownPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      dragStartRef.current = setTimeout(() => {
        onDragStart?.(e);
      }, 100);
    };

    el.addEventListener('mousedown', handleMouseDown);

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onDragStart]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const draggable = draggableRef.current;
      if (!draggable || !mouseDownPos) return;

      const { height, width } = draggable.getBoundingClientRect();

      draggable.style.left = `${Math.min(bounds.right - width, Math.max(bounds.left, e.clientX - mouseDownPos.x))}px`;
      draggable.style.top = `${Math.min(bounds.bottom - height, Math.max(bounds.top, e.clientY - mouseDownPos.y))}px`;
    };
    const handleMouseUp = (e: MouseEvent) => {
      setMouseDownPos(null);
      clearTimeout(dragStartRef.current);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      onDragEnd?.(e);
    };

    if (mouseDownPos) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [bounds.bottom, bounds.left, bounds.right, bounds.top, mouseDownPos, onDragEnd]);

  return {
    draggableRef,
    draggableHandleRef,
  };
}
