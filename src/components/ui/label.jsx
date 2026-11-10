"use client";
import * as LabelPrimitive from "@radix-ui/react-label";
export function Label(props) {
  return (
    <LabelPrimitive.Root
      className="mb-2 block text-sm font-semibold"
      {...props}
    />
  );
}
