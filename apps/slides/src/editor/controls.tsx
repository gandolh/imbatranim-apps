import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button, Toggle, Tooltip, cn } from "@imbatranim/ui";
import { FOCUS_RING, SELECTED, TOOL, keepFocus } from "./controlStyles.ts";

/** Bars' controls: 32 px on a desktop, the 44 px target on a phone. */
const BAR = "h-[32px] max-[600px]:h-target rounded-control border-transparent text-on-surface";
const QUIET =
  "bg-transparent hover:border-transparent hover:bg-surface-container-high active:bg-surface-container-highest";
const SQUARE = "w-[32px] max-[600px]:w-target justify-center p-0";
const LABELLED = "gap-[8px] px-[12px] text-control font-semibold";
/** Download and Present: labelled, on the lowest surface with the outline edge. */
const EDGED = "border-outline bg-surface-container-lowest hover:border-outline hover:bg-surface-container-high";
type BarButtonProps = Omit<ComponentProps<typeof Button>, "variant" | "size"> & {
  /** The tooltip; an icon-only button also takes it as its name. */
  label: string;
  shortcut?: string;
  /** Shows the label beside the icon. */
  labelled?: boolean;
  edged?: boolean;
  /** On/off: a Toggle with the soft pressed look. */
  pressed?: boolean;
  menu?: boolean;
  keep?: boolean;
  children?: ReactNode;
};

/** A bar button: an icon, or an icon and its label, with its tooltip. */
export function BarButton({
  label,
  shortcut,
  labelled,
  edged,
  pressed,
  menu,
  keep,
  className,
  children,
  ...rest
}: BarButtonProps) {
  const classes = cn(BAR, QUIET, labelled ? LABELLED : SQUARE, edged && EDGED, SELECTED, FOCUS_RING, className);
  const body = (
    <>
      {children}
      {labelled && <span>{label}</span>}
      {menu && <ChevronDown size={12} aria-hidden className="text-on-surface-variant" />}
    </>
  );
  const name = labelled ? undefined : label;
  return (
    <Tooltip content={shortcut ? `${label} (${shortcut})` : label}>
      {pressed === undefined ? (
        <Button
          variant="ghost"
          size="sm"
          className={classes}
          aria-label={name}
          aria-haspopup={menu ? "menu" : undefined}
          onMouseDown={keep ? keepFocus : undefined}
          {...rest}
        >
          {body}
        </Button>
      ) : (
        <Toggle
          pressed={pressed}
          aria-label={name}
          disabled={rest.disabled}
          onMouseDown={keep ? keepFocus : undefined}
          onClick={rest.onClick}
          render={<Button variant="ghost" size="sm" className={classes} />}
        >
          {body}
        </Toggle>
      )}
    </Tooltip>
  );
}

export const BarSeparator = () => <div aria-hidden className="bg-outline-variant mx-[4px] h-[20px] w-px shrink-0" />;

type ToolProps = Omit<ComponentProps<typeof Button>, "variant" | "size"> & {
  label: string;
  shortcut?: string;
  /** Icon only: the label is the name and the tooltip. */
  iconOnly?: boolean;
  pressed?: boolean;
  menu?: boolean;
  keep?: boolean;
  danger?: boolean;
  icon?: ReactNode;
};

/** One tool of an inspector group. */
export const Tool = forwardRef<HTMLButtonElement, ToolProps>(function Tool(
  { label, shortcut, iconOnly, pressed, menu, keep, danger, icon, className, ...rest },
  ref,
) {
  const classes = cn(
    TOOL,
    iconOnly && "w-[32px] max-[600px]:w-target justify-center px-0",
    danger && "text-error [&_svg]:text-error",
    SELECTED,
    FOCUS_RING,
    className,
  );
  const body = (
    <>
      {icon}
      {!iconOnly && <span className="truncate">{label}</span>}
      {menu && <ChevronDown size={12} aria-hidden />}
    </>
  );
  const control =
    pressed === undefined ? (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={classes}
        aria-label={iconOnly ? label : undefined}
        aria-haspopup={menu ? "menu" : undefined}
        onMouseDown={keep ? keepFocus : undefined}
        {...rest}
      >
        {body}
      </Button>
    ) : (
      <Toggle
        pressed={pressed}
        aria-label={iconOnly ? label : undefined}
        disabled={rest.disabled}
        onMouseDown={keep ? keepFocus : undefined}
        onClick={rest.onClick}
        render={<Button ref={ref} variant="ghost" size="sm" className={classes} />}
      >
        {body}
      </Toggle>
    );
  return iconOnly || shortcut ? (
    <Tooltip content={shortcut ? `${label} (${shortcut})` : label}>{control}</Tooltip>
  ) : (
    control
  );
});
