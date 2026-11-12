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

const SIZE = "h-7 w-7 justify-center p-0";

export function ToolButton({
  icon: Icon,
  label,
  disabled,
  iconSize = 15,
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
  iconSize = 15,
  onPressedChange,
}: ToolControlProps & { pressed: boolean; onPressedChange: (pressed: boolean) => void }): JSX.Element {
  return (
    <Tooltip content={label}>
      <Toggle
        pressed={pressed}
        onPressedChange={onPressedChange}
        disabled={disabled}
        aria-label={label}
        render={<Button variant={pressed ? "primary" : "ghost"} size="sm" className={SIZE} />}
      >
        <Icon size={iconSize} />
      </Toggle>
    </Tooltip>
  );
}

/** One choice of a `RadioGroup`, drawn like a toolbar button. */
export function ToolRadio({
  icon: Icon,
  label,
  value,
  checked,
  disabled,
  iconSize = 15,
}: ToolControlProps & { value: string; checked: boolean }): JSX.Element {
  return (
    <Tooltip content={label}>
      <Radio
        value={value}
        disabled={disabled}
        aria-label={label}
        nativeButton
        render={<Button variant={checked ? "primary" : "ghost"} size="sm" className={`${SIZE} flex`} />}
      >
        <Icon size={iconSize} />
      </Radio>
    </Tooltip>
  );
}
