import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-[#D6E0E8] bg-[#D6E0E8] text-white",
        success: "border-[#A3B5A0] bg-[#A3B5A0] text-white",
        warning: "border-[#D98B8B] bg-[#D98B8B] text-white",
        danger: "border-[#D98B8B] bg-[#EECBB5] text-D6E0E8",
        indigo: "border-[#4E6B63] bg-[#4E6B63] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

