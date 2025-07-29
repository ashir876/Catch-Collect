import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  isIntersecting: boolean;
  ref: (node: Element | null) => void;
  reset: () => void;
}

const useInfiniteScroll = (
  onIntersect: () => void,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn => {
  const { threshold = 0.1, rootMargin = '0px', enabled = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [node, setNode] = useState<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const reset = useCallback(() => {
    setIsIntersecting(false);
  }, []);

  const ref = useCallback((node: Element | null) => {
    setNode(node);
  }, []);

  useEffect(() => {
    if (!enabled || !node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current = observer;
    observer.observe(node);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [node, onIntersect, threshold, rootMargin, enabled]);

  return { isIntersecting, ref, reset };
};

export default useInfiniteScroll; 