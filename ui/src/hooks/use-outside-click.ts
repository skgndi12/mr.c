import { useEffect, useRef } from 'react';

interface UseOutsideClickProps {
  ref: React.RefObject<HTMLElement>;
  handler?: (e: Event) => void;
}

export function useOutsideClick({ ref, handler }: UseOutsideClickProps) {
  const stateRef = useRef({
    isPointerDown: false,
  });

  const state = stateRef.current;

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (isValidEvent(event, ref)) {
        state.isPointerDown = true;
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (state.isPointerDown && handler && isValidEvent(event, ref)) {
        state.isPointerDown = false;
        handler(event);
      }
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointerup', onPointerUp, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointerup', onPointerUp, true);
    };
  }, [handler, ref, state]);
}

function isValidEvent(event: Event, ref: React.RefObject<HTMLElement>) {
  const target = event.target;
  return target instanceof Node && !ref.current?.contains(target);
}
