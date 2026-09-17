import { useEffect, useRef, useState } from 'react';

/**
 * 元素滚入视口时触发一次的显隐开关。
 *
 * 为什么不用「加载时直接放 CSS 动画」：Hero 占满整个首屏（100dvh），
 * 页面其余部分在加载那一刻全在屏幕外，等用户滚下来动画早就播完了 ——
 * 等于没有。所以必须等它真的进了视口再放。
 *
 * 只触发一次：来回滚动时反复重播会很吵。
 */
export function useReveal<T extends HTMLElement>(rootMargin = '-10% 0px') {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (revealed) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setRevealed(true);
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed, rootMargin]);

  return { ref, revealed };
}
