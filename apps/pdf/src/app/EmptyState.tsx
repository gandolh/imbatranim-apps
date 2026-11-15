/** The welcome screen shown before a document is open. */
import type { JSX } from "react";
import { FilePen, FolderOpen, Search, List, TextCursorInput, Loader2 } from "lucide-react";
import { Button } from "@imbatranim/ui";

export interface EmptyStateProps {
  onOpenClick: () => void;
  error: string | null;
  loading: boolean;
}

export function EmptyState({ onOpenClick, error, loading }: EmptyStateProps): JSX.Element {
  return (
    <div className="bg-surface-container-low text-on-surface-variant flex h-full flex-col items-center justify-center gap-[8px] overflow-y-auto p-[24px] text-center">
      <FilePen size={40} strokeWidth={1} />
      <h1 className="text-on-surface font-ui text-lead m-0 font-semibold">PDF</h1>
      <p className="font-ui text-control m-0 max-w-[320px]">
        Read, search, mark up, fill in, sign and rearrange your PDFs. Everything runs on-device.
      </p>
      <Button
        variant="primary"
        size="sm"
        className="text-control max-[600px]:h-target h-[32px] gap-[8px] px-[12px] font-semibold"
        onClick={onOpenClick}
        disabled={loading}
      >
        {loading ? <Loader2 size={16} className="motion-safe:animate-spin" /> : <FolderOpen size={16} />}
        {loading ? "Opening…" : "Open a PDF"}
      </Button>
      <p className="font-ui text-control m-0">or drop a file anywhere on this window</p>

      {error && <p className="text-error font-ui text-control m-0 max-w-[320px]">{error}</p>}

      <ul className="font-ui text-control mt-[8px] flex list-none flex-col gap-[6px] p-0">
        <li className="flex items-center gap-[8px]">
          <Search size={16} />
          <span>Full-text search with jump-to-match</span>
        </li>
        <li className="flex items-center gap-[8px]">
          <List size={16} />
          <span>Thumbnails &amp; outline navigation</span>
        </li>
        <li className="flex items-center gap-[8px]">
          <TextCursorInput size={16} />
          <span>Selectable, copyable text</span>
        </li>
      </ul>
    </div>
  );
}
