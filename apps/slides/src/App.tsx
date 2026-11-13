import { Download, FilePlus2, FileWarning, Loader2, Presentation } from "lucide-react";
import { Button } from "@imbatranim/ui";
import type { KitAppProps } from "@imbatranim-office/shared";
import { Editor } from "./editor/Editor";
import { useDeckFile } from "./shell/useDeckFile";

/**
 * Slides: opens a .pptx, draws it with its own renderer, edits it, and saves
 * it by patching the package in place (corpus/wiki/slides.md). The desktop
 * renders this component in the window, with its own React and kit.
 */
export function App(_props: KitAppProps) {
  const doc = useDeckFile();
  const { state } = doc;

  let body;
  if (state.kind === "open") {
    body = (
      <Editor
        key={state.store.id}
        store={state.store}
        file={{
          name: doc.name,
          saving: doc.saving,
          save: () => void doc.save(),
          saveAs: () => void doc.saveAs(),
          newDeck: () => void doc.newDeck(),
          open: () => void doc.open(),
          download: doc.download,
          setBeforeSave: doc.setBeforeSave,
        }}
      />
    );
  } else if (state.kind === "empty") {
    body = (
      <div className="bg-surface-container-low text-on-surface-variant flex h-full flex-col items-center justify-center gap-[8px] p-[24px] text-center">
        <Presentation size={40} strokeWidth={1} />
        <h3 className="font-display text-headline text-on-surface m-0 font-bold">Nothing open</h3>
        <div className="flex gap-[8px]">
          <Button
            size="sm"
            variant="primary"
            className="text-control h-[32px] gap-[8px] px-[12px] font-semibold"
            onClick={() => void doc.open()}
          >
            Open a presentation
          </Button>
          <Button
            size="sm"
            variant="default"
            className="text-control border-outline bg-surface-container-lowest h-[32px] gap-[8px] px-[12px] font-semibold"
            onClick={() => void doc.newDeck()}
          >
            <FilePlus2 size={12} />
            New presentation
          </Button>
        </div>
      </div>
    );
  } else if (state.kind === "loading") {
    body = (
      <div className="bg-surface-container-low text-on-surface-variant font-ui text-control flex h-full items-center justify-center gap-[8px]">
        <Loader2 size={16} className="motion-safe:animate-spin" />
        Opening {state.name}…
      </div>
    );
  } else {
    body = (
      <div className="bg-surface-container-low text-on-surface-variant flex h-full flex-col items-center justify-center gap-[8px] p-[24px] text-center">
        <FileWarning size={40} strokeWidth={1} className="text-error" />
        <span className="font-ui text-on-surface text-control font-semibold">{state.name}</span>
        <span className="font-ui text-control max-w-[320px]">{state.message}</span>
        <div className="flex gap-[8px]">
          <Button
            size="sm"
            variant="primary"
            className="text-control h-[32px] gap-[8px] px-[12px] font-semibold"
            onClick={() => void doc.open()}
          >
            Open a .pptx instead
          </Button>
          {state.kind === "failed" && doc.download && (
            <Button
              size="sm"
              variant="default"
              className="text-control border-outline bg-surface-container-lowest h-[32px] gap-[8px] px-[12px] font-semibold"
              onClick={doc.download}
            >
              <Download size={12} />
              Download
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest font-ui text-on-surface text-body flex h-full min-h-0 flex-col">
      {body}
      {doc.dialogs}
    </div>
  );
}
