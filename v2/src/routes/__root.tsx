import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { SiteHeader } from "~/components/SiteHeader";
import { SiteFooter } from "~/components/SiteFooter";
import "~/styles.css";

const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  ),
});

export default Route;
