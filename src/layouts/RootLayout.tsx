import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FullPageLoader } from "@/components/ui/spinner";

export const RootLayout = () => {
  const { pathname } = useLocation();

  return (
    <>
      <Navbar />
      <main className="flex-1">
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
