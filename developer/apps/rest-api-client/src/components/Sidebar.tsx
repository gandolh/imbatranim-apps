import { ScrollArea, cn } from "@imbatranim/ui";
import { Clock, Folder, Trash2 } from "lucide-react";
import type { HistoryEntry, RestClientData, SavedRequest } from "../types";
import { statusToken } from "../lib/ui";

interface SidebarProps {
  data: RestClientData;
  onOpenSaved: (req: SavedRequest) => void;
  onDeleteSaved: (id: string) => void;
  onOpenHistory: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
}

export function Sidebar({ data, onOpenSaved, onDeleteSaved, onOpenHistory, onClearHistory }: SidebarProps) {
  return (
    <aside className="border-outline-variant bg-surface-container-low flex w-56 shrink-0 flex-col border-r">
      <ScrollArea className="min-h-0 flex-1">
        <Section icon="folder" label="Collections">
          {data.collections.length === 0 ? (
            <Empty>No saved requests</Empty>
          ) : (
            data.collections.map((req) => (
              <div key={req.id} className="group flex items-center gap-1 pr-1">
                <button
                  type="button"
                  onClick={() => onOpenSaved(req)}
                  className="hover:bg-surface-container focus-visible:ring-primary flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset"
                >
                  <span className="text-secondary text-tiny shrink-0 font-mono font-semibold">{req.method}</span>
                  <span className="text-on-surface text-control truncate">{req.name || req.url}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSaved(req.id)}
                  title="Delete"
                  className="text-on-surface-variant hover:text-error focus-visible:ring-primary shrink-0 opacity-0 outline-none group-hover:opacity-100 focus-visible:ring-2 focus-visible:ring-inset"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </Section>

        <Section
          icon="clock"
          label="History"
          action={
            data.history.length > 0 ? (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-on-surface-variant hover:text-error font-ui focus-visible:ring-primary text-tiny outline-none focus-visible:ring-2 focus-visible:ring-inset"
                title="Clear history"
              >
                Clear
              </button>
            ) : null
          }
        >
          {data.history.length === 0 ? (
            <Empty>Nothing sent yet</Empty>
          ) : (
            data.history.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onOpenHistory(entry)}
                className="hover:bg-surface-container focus-visible:ring-primary flex w-full items-center gap-1.5 px-2 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset"
              >
                <span className={cn("text-tiny shrink-0 font-mono font-semibold", statusToken(entry.status))}>
                  {entry.status || "—"}
                </span>
                <span className="text-secondary text-tiny shrink-0 font-mono">{entry.method}</span>
                <span className="text-on-surface-variant text-label min-w-0 flex-1 truncate">{entry.url}</span>
                {entry.elapsedMs !== undefined && (
                  <span className="text-on-surface-variant text-tiny shrink-0 font-mono">{entry.elapsedMs}ms</span>
                )}
              </button>
            ))
          )}
        </Section>
      </ScrollArea>
    </aside>
  );
}

function Section({
  icon,
  label,
  action,
  children,
}: {
  icon: "folder" | "clock";
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="text-on-surface-variant font-ui text-label flex items-center gap-1.5 px-2 py-1.5 font-semibold tracking-wider uppercase">
        {icon === "folder" ? <Folder size={12} /> : <Clock size={12} />}
        {label}
        <span className="flex-1" />
        {action}
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-on-surface-variant text-label px-2 py-1 italic">{children}</p>;
}
