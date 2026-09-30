import { NavLink, Outlet } from "react-router";

export function AppLayout() {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-border bg-card p-5 md:min-h-screen md:border-r md:border-b-0">
        <div className="mb-6 flex items-center gap-3 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white" aria-hidden="true">J</span>
          JobTracker
        </div>
        <nav aria-label="Main navigation" className="flex gap-2 md:flex-col">
          {[{ to: "/dashboard", label: "Dashboard" }, { to: "/new-offer", label: "Add application" }].map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? "bg-brand-50 text-brand-800 dark:bg-brand-900 dark:text-brand-100" : "text-muted-foreground hover:bg-surface"}`
            }>{label}</NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0"><Outlet /></main>
    </div>
  );
}
