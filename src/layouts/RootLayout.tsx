import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const RootLayout = () => {
  const { pathname } = useLocation();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Scoped so a crash on one page doesn't take the whole shell (nav/footer) down,
            and resets when the route changes so navigating away recovers automatically. */}
        <ErrorBoundary resetKey={pathname} scoped>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
};
