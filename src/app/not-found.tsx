import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main-content" className="container-page grid min-h-[70vh] place-items-center">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]"><Compass /></span>
        <p className="eyebrow mt-5">404 · Off the map</p>
        <h1 className="mt-2 text-4xl font-black">This path has no instructions.</h1>
        <p className="muted mt-3">Return to your dashboard and continue forging your C skills.</p>
        <Link href="/dashboard" className="btn btn-primary mt-6">Go to dashboard</Link>
      </div>
    </main>
  );
}
