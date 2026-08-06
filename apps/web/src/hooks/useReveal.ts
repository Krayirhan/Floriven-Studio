import { useEffect, useRef } from "react";

export function useReveal(staggerDelay = 80) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = el.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const index = Array.from(children).indexOf(target);
            target.style.transitionDelay = `${index * staggerDelay}ms`;
            target.classList.add("revealVisible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [staggerDelay]);

  return ref;
}
