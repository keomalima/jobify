import { useState } from "react";
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { OfferForm } from "../components/forms/OfferForm";

export default function RegisterOfferPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // TODO(practice-4): Once the offers query exists, verify that saving refreshes it.
  // Keep this page responsible for the dialog; keep API submission in OfferForm.
  function handleSuccess() {
    setIsOpen(false);
    setSaved(true);
  }

  return (
    <>
      <header className="border-b border-border bg-card px-6 py-6 pr-20">
        <p className="text-sm text-muted-foreground">Applications / New application</p>
      </header>
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Track your next opportunity</h1>
        <p className="mt-2 text-sm text-muted-foreground">Keep the company, role, and application progress together.</p>
        {saved && <p role="status" className="mt-6 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800 dark:border-brand-800 dark:bg-brand-900 dark:text-brand-100">Application saved successfully.</p>}
        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">Your job search</span>
          <h2 className="mt-3 text-lg font-semibold">Add an application</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Select a company you already track, or add a new one while saving the role. You can start with a saved opportunity and update its status later.</p>
          <button type="button" className="button-primary mt-6" onClick={() => { setSaved(false); setIsOpen(true); }}>+ Add application</button>
        </section>
      </div>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-[60]">
        <DialogBackdrop className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-8">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="w-full max-w-xl rounded-xl border border-border bg-card p-5 text-foreground shadow-xl sm:p-8">
              <DialogTitle className="text-xl font-semibold">Add application</DialogTitle>
              <Description className="mt-2 text-sm text-muted-foreground">Start with the company and role. Optional details can wait.</Description>
              {/* TODO(practice-7): Prevent dismissal during submission and confirm before discarding dirty fields. */}
              <OfferForm onSuccess={handleSuccess} onCancel={() => setIsOpen(false)} />
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
