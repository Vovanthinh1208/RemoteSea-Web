import { Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FullPageLoader } from "@/components/ui/spinner";

export const RootLayout = () => {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Without this, a screen-reader user clicking a nav link gets no indication
  // navigation happened — focus stays wherever it was on the old page. Skipped
  // on the very first render (pathname's initial value) so we don't steal focus
  // from the URL bar / whatever the browser already focused on page load.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [pathname]);

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
      <Navbar />
      <main className="flex-1" id="main-content" ref={mainRef} tabIndex={-1}>
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
