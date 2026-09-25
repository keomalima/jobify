import { Link } from "react-router";

export default function DashboardPage() {
  // TODO(practice-4): Load GET /offers with useQuery using ["offers"].
  // Render loading/error/empty/success states; derive status counts from actual data.
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="pr-14 text-2xl font-semibold tracking-tight">Your job search</h1>
      <p className="mt-2 text-sm text-muted-foreground">Keep your opportunities and next steps in one place.</p>
      <section className="mt-8 rounded-xl border border-border bg-card p-8 shadow-sm">
        <h2 className="text-lg font-semibold">Track an opportunity</h2>
        <p className="mt-2 text-sm text-muted-foreground">Save the role and company, then follow your application progress.</p>
        <Link to="/new-offer" className="button-primary mt-6 inline-block">+ Add application</Link>
      </section>
    </div>
  );
}
