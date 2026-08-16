import React, { useEffect, useMemo, useState } from 'react';

function isTouchLike() {
  return typeof window !== 'undefined' && ((navigator?.maxTouchPoints ?? 0) > 0 || (window.matchMedia?.('(pointer: coarse)').matches ?? false));
}

export function FullscreenShell({ children }) {
  const [viewport, setViewport] = useState(() => ({
    width: window.visualViewport?.width ?? window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  }));
  const touchLike = useMemo(isTouchLike, []);
  const portraitBlocked = touchLike && viewport.height > viewport.width;

  useEffect(() => {
    window.__chronoOrientationBlocked = portraitBlocked;
    document.body.dataset.chronoOrientationBlocked = portraitBlocked ? 'true' : 'false';
    window.dispatchEvent(new CustomEvent('chrono:orientation-block', { detail: { blocked: portraitBlocked } }));
    return () => {
      window.__chronoOrientationBlocked = false;
      delete document.body.dataset.chronoOrientationBlocked;
    };
  }, [portraitBlocked]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vv = window.visualViewport;
        const width = Math.round(vv?.width ?? window.innerWidth);
        const height = Math.round(vv?.height ?? window.innerHeight);
        setViewport((v) => v.width === width && v.height === height ? v : { width, height });
      });
    };
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });
    window.visualViewport?.addEventListener('resize', update, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);

  return (
    <main className="fullscreen-shell" style={{ '--vvw': `${viewport.width}px`, '--vvh': `${viewport.height}px` }}>
      {children}
      {portraitBlocked && (
        <div className="rotate-overlay" role="dialog" aria-modal="true" aria-label="Rotate device">
          <div className="rotate-card">
            <div className="rotate-icon">↻</div>
            <h1>Rotate to landscape</h1>
            <p>Chrono Defense is designed for horizontal play on phones and tablets. Your battle is suspended while the device is vertical.</p>
          </div>
        </div>
      )}
    </main>
  );
}
