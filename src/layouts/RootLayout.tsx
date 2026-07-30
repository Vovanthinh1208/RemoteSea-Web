import { Suspense, useEffect, useRef } from "react";
import {
  Outlet,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FullPageLoader } from "@/components/ui/spinner";
import { OfflineBanner } from "@/components/shared/OfflineBanner";

export const RootLayout = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const mainRef = useRef<HTMLElement>(null);

  // Without this, a screen-reader user clicking a nav link gets no indication
  // navigation happened — focus stays wherever it was on the old page. Skipped
  // on the very first render (pathname's initial value) so we don't steal focus
  // from the URL bar / whatever the browser already focused on page load.
  //
  // preventScroll matters: a bare focus() scrolls the element into view, which
  // silently destroyed the browser's scroll restoration on Back/Forward — going
  // back from a job detail dumped you at the top of the board instead of where
  // you left off. New (PUSH/REPLACE) navigations still start at the top, now
  // done explicitly instead of as a focus side effect.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (navigationType !== "POP") window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, navigationType]);

  return (
    <>
      {/* Visually hidden until focused — lets keyboard users bypass the navbar's
          ~7-9 tab stops on every single page instead of tabbing through it every time. */}
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-8 focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        href="#main-content"
      >
        Skip to main content
      </a>
      <OfflineBanner />
      <Navbar />
      <main
        className="flex-1"
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
      >
        {/* Scoped so a crash on one page doesn't take the whole shell (nav/footer) down,
            and resets when the route changes so navigating away recovers automatically.
            Suspense is scoped here too — not at the router root — so a lazy route chunk
            loading only replaces the page body, not the whole nav/footer shell. */}
        <ErrorBoundary resetKey={pathname} scoped>
          <Suspense fallback={<FullPageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
};
