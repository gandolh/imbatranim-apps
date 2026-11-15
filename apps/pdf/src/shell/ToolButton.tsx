/**
 * A compact icon control used across the reader console. Wraps the OS `Button`
 * (ghost / primary) with a `Tooltip`, so every toolbar affordance stays in the
 * OS design language. `icon` is a lucide-react component.
 *
 * Three shapes: `ToolButton` runs an action, `ToolToggle` is on or off, and
 * `ToolRadio` is one choice of a `RadioGroup`.
 */
import type { ComponentType, JSX } from "react";
import { Button, Radio, Toggle, Tooltip } from "@imbatranim/ui";

interface ToolControlProps {
  icon: ComponentType<{ size?: number }>;
  label: string;
  disabled?: boolean;
  iconSize?: number;
}

/** 32 px on a desktop and the 44 px target on a phone, quiet until hovered, with the accent ring. */
const SIZE =
  "h-[32px] w-[32px] max-[600px]:h-target max-[600px]:w-target justify-center p-0 rounded-control border-transparent text-on-surface hover:border-transparent hover:bg-surface-container-high active:bg-surface-container-highest focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-inset";
/** Pressed or chosen: the soft accent with an accent edge, never the strong fill. */
const ON =
  "border-primary bg-primary-container text-on-primary-container hover:border-primary hover:bg-primary-container";

export function ToolButton({
  icon: Icon,
  label,
  disabled,
  iconSize = 16,
  onClick,
}: ToolControlProps & { onClick?: () => void }): JSX.Element {
  return (
    <Tooltip content={label}>
      <Button variant="ghost" size="sm" className={SIZE} onClick={onClick} disabled={disabled} aria-label={label}>
        <Icon size={iconSize} />
      </Button>
    </Tooltip>
  );
}

/** An on/off control: `aria-pressed`, drawn with the primary look while on. */
export function ToolToggle({
  icon: Icon,
  label,
  pressed,
  disabled,
  iconSize = 16,
  onPressedChange,
}: ToolControlProps & { pressed: boolean; onPressedChange: (pressed: boolean) => void }): JSX.Element {
  return (
    <Tooltip content={label}>
      <Toggle
        pressed={pressed}
        onPressedChange={onPressedChange}
        disabled={disabled}
        aria-label={label}
        render={<Button variant="ghost" size="sm" className={`${SIZE} ${pressed ? ON : ""}`} />}
      >
        <Icon size={iconSize} />
      </Toggle>
    </Tooltip>
  );
}

/** One choice of a `RadioGroup`, drawn like a toolbar button, or as a labelled row of a panel. */
export function ToolRadio({
  icon: Icon,
  label,
  value,
  checked,
  disabled,
  iconSize = 16,
  text,
}: ToolControlProps & { value: string; checked: boolean; text?: string }): JSX.Element {
  const shape = text
    ? `${SIZE} flex w-full max-[600px]:w-full justify-start gap-[8px] px-[8px] text-control font-normal [&_svg]:text-on-surface-variant`
    : `${SIZE} flex`;
  const radio = (
    <Radio
      value={value}
      disabled={disabled}
      aria-label={label}
      nativeButton
      render={<Button variant="ghost" size="sm" className={`${shape} ${checked ? ON : ""}`} />}
    >
      <Icon size={iconSize} />
      {text && <span className="truncate">{text}</span>}
    </Radio>
  );
  return text ? radio : <Tooltip content={label}>{radio}</Tooltip>;
}
