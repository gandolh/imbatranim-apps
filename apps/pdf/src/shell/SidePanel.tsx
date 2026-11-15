/**
 * The left panel: the Thumbnails, Outline and Forms tabs, each named in full,
 * icon over label. 200 px wide on a desktop (`w-pdf-navigator`); on a phone
 * the same tabs fill the Pages sheet.
 *
 * The frame (this module: its width and the tab row) is on screen from the
 * first frame, so the page's fitted width does not change when the panel
 * fills in. The panels are lazy chunks, mounted once the first page is drawn
 * (`painted`): the thumbnail rail painting its canvases before the page is what
 * made norPDF's first page slower than PDF Viewer's.
 *
 * ── PART B SEAM ────────────────────────────────────────────────────────────
 * `extraTabs` appends tabs to the rail — Part B passes its **Forms** panel here
 * as `{ id: 'forms', label: 'Forms', icon: <lucide component>, render: () =>
 * <FormsPanel/> }`. The active tab id is the controller's `panelTab`, so Part B
 * can switch to its tab programmatically via `setPanelTab('forms')`.
 */
import { Suspense } from "react";
import type { ComponentType, JSX, ReactNode } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Tab, Tabs, TabsList, TabsPanel } from "@imbatranim/ui";
import { useReader } from "../app/context";
import type { PanelTab } from "../app/types";
import { OutlinePanel, ThumbnailsPanel } from "../lazy";

export interface SidePanelTab {
  id: PanelTab;
  label: string;
  icon: ComponentType<{ size?: number }>;
  render: () => ReactNode;
}

export interface SidePanelProps {
  /** PART B appends tabs (e.g. Forms) here. */
  extraTabs?: SidePanelTab[];
  /** Drawn inside the phone's Pages sheet: full width, no edge. */
  inSheet?: boolean;
}

export function SidePanel({ extraTabs = [], inSheet = false }: SidePanelProps): JSX.Element {
  const { panelTab, setPanelTab, painted } = useReader();

  const tabs: SidePanelTab[] = [
    {
      id: "thumbnails",
      label: "Thumbnails",
      icon: LayoutGrid,
      render: () => <ThumbnailsPanel />,
    },
    {
      id: "outline",
      label: "Outline",
      icon: List,
      render: () => <OutlinePanel />,
    },
    ...extraTabs,
  ];

  const active = tabs.find((t) => t.id === panelTab) ?? tabs[0];

  return (
    <aside
      className={
        inSheet
          ? "-mx-[16px] flex h-full min-h-0 flex-col"
          : "border-outline-variant bg-surface-container-low w-pdf-navigator flex shrink-0 flex-col border-r"
      }
      aria-label="Document navigation"
    >
      <Tabs
        className="flex min-h-0 flex-1 flex-col"
        value={active?.id}
        onValueChange={(next) => setPanelTab(next as PanelTab)}
      >
        <TabsList className="border-outline-variant flex border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                className={({ active: isActive }) =>
                  "font-ui text-label focus-visible:ring-primary max-[600px]:min-h-target -mb-px flex min-w-0 flex-1 flex-col items-center justify-center gap-[2px] border-b-2 py-[8px] font-semibold focus-visible:ring-2 focus-visible:ring-inset " +
                  (isActive
                    ? "text-on-surface border-primary [&_svg]:text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high border-transparent")
                }
              >
                <Icon size={16} />
                <span className="truncate">{tab.label}</span>
              </Tab>
            );
          })}
        </TabsList>
        <TabsPanel
          value={active?.id}
          className="focus-visible:ring-primary min-h-0 flex-1 overflow-auto focus-visible:ring-2 focus-visible:ring-inset"
          data-panel-scroll
        >
          {painted && <Suspense fallback={null}>{active?.render()}</Suspense>}
        </TabsPanel>
      </Tabs>
    </aside>
  );
}
