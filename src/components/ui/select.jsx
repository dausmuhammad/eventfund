"use client";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import { useIsMobile } from "@/components/shared/use-is-mobile";
import { Drawer, DrawerContent, DrawerTrigger } from "./drawer";
import { Button } from "./button";

const MobileSelectContext = createContext(null);
const triggerStyle =
  "flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-input-border bg-slate-50/60 px-3.5 py-3 text-left text-base font-normal transition-colors hover:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 data-[state=open]:border-primary aria-invalid:border-danger disabled:opacity-60 md:text-sm";
function collectOptions(children) {
  const options = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === SelectItem)
      options.push({ value: child.props.value, label: child.props.children });
    else options.push(...collectOptions(child.props.children));
  });
  return options;
}
export function Select({
  children,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled,
  ...props
}) {
  const mobile = useIsMobile();
  const [localValue, setLocalValue] = useState(defaultValue || "");
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("Pilih opsi");
  const listId = useId();
  if (!mobile)
    return (
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        name={name}
        disabled={disabled}
        {...props}
      >
        {children}
      </SelectPrimitive.Root>
    );
  const selected = value === undefined ? localValue : value;
  function choose(next) {
    setLocalValue(next);
    setOpen(false);
    onValueChange?.(next);
  }
  return (
    <MobileSelectContext.Provider
      value={{
        value: selected,
        options: collectOptions(children),
        choose,
        disabled,
        label,
        setLabel,
        listId,
      }}
    >
      <Drawer open={open} onOpenChange={setOpen}>
        {name && (
          <input
            type="hidden"
            name={name}
            value={selected}
            disabled={disabled}
          />
        )}
        {children}
      </Drawer>
    </MobileSelectContext.Provider>
  );
}
export function SelectValue({ placeholder, ...props }) {
  const mobile = useContext(MobileSelectContext);
  if (mobile)
    return (
      <span className="min-w-0 flex-1">
        {mobile.options.find((option) => option.value === mobile.value)
          ?.label || placeholder}
      </span>
    );
  return <SelectPrimitive.Value placeholder={placeholder} {...props} />;
}
export function SelectTrigger({ className, children, ...props }) {
  const mobile = useContext(MobileSelectContext);
  if (mobile)
    return (
      <DrawerTrigger asChild>
        <Button
          type="button"
          role="combobox"
          variant="outline"
          aria-controls={mobile.listId}
          disabled={mobile.disabled}
          className={cn(triggerStyle, className)}
          {...props}
          onClick={(event) => {
            mobile.setLabel(
              props["aria-label"] ||
                event.currentTarget.labels?.[0]?.textContent.trim() ||
                "Pilih opsi",
            );
            props.onClick?.(event);
          }}
        >
          {children}
          <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0" />
        </Button>
      </DrawerTrigger>
    );
  return (
    <SelectPrimitive.Trigger className={cn(triggerStyle, className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}
export function SelectContent({ children, ...props }) {
  const mobile = useContext(MobileSelectContext);
  const list = useRef(null);
  if (mobile)
    return (
      <DrawerContent
        title={mobile.label}
        description="Pilih salah satu opsi di bawah."
        closeLabel="Tutup pilihan"
        onOpenAutoFocus={(event) => {
          const option =
            list.current?.querySelector(
              '[aria-selected="true"]:not(:disabled)',
            ) || list.current?.querySelector('[role="option"]:not(:disabled)');
          if (option) {
            event.preventDefault();
            option.focus();
          }
        }}
      >
        <div
          ref={list}
          id={mobile.listId}
          role="listbox"
          aria-label={mobile.label}
          className="space-y-1"
          onKeyDown={(event) => {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
              return;
            const options = [
              ...event.currentTarget.querySelectorAll(
                '[role="option"]:not(:disabled)',
              ),
            ];
            if (!options.length) return;
            event.preventDefault();
            const index = options.indexOf(document.activeElement);
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? options.length - 1
                  : (index +
                      (event.key === "ArrowDown" ? 1 : -1) +
                      options.length) %
                    options.length;
            options[next].focus();
          }}
        >
          {children}
        </div>
      </DrawerContent>
    );
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        sideOffset={5}
        className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-lg border border-border bg-white p-1 shadow-lg"
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}
export function SelectItem({ children, className, value, disabled, ...props }) {
  const mobile = useContext(MobileSelectContext);
  if (mobile)
    return (
      <Button
        type="button"
        role="option"
        aria-selected={mobile.value === value}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        variant="ghost"
        className={cn(
          "min-h-13 w-full justify-between gap-3 px-4 py-3 text-left text-base font-normal aria-selected:bg-blue-50 aria-selected:text-primary",
          className,
        )}
        onClick={() => mobile.choose(value)}
      >
        {children}
        {mobile.value === value && (
          <CheckIcon className="size-5 shrink-0" aria-hidden="true" />
        )}
      </Button>
    );
  return (
    <SelectPrimitive.Item
      value={value}
      disabled={disabled}
      className={cn(
        "relative flex min-h-11 cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm outline-none focus:bg-blue-50 focus:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="absolute left-2">
        <CheckIcon aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
