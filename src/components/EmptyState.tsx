import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex min-h-44 flex-col items-center justify-center gap-3 p-6 text-center">
      <span className="grid size-11 place-items-center rounded-2xl bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]">
        <Icon size={21} />
      </span>
      <div>
        <h2 className="font-black">{title}</h2>
        <p className="muted mt-1 max-w-md text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
