import { AlertTriangle } from "lucide-react";

export function ErrorState({
  message = "Something went wrong.",
  retry
}: {
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="card flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center" role="alert">
      <span className="grid size-10 place-items-center rounded-full bg-rose-500/10 text-[rgb(var(--danger))]">
        <AlertTriangle size={20} />
      </span>
      <p className="max-w-md text-sm font-semibold">{message}</p>
      {retry && <button type="button" className="btn btn-secondary" onClick={retry}>Try again</button>}
    </div>
  );
}
