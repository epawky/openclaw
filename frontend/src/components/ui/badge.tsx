import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[color-mix(in_srgb,var(--cartex-teal)_15%,transparent)] text-cartex-teal',
        secondary: 'bg-[color-mix(in_srgb,var(--cartex-border)_50%,transparent)] text-cartex-muted',
        success: 'bg-[color-mix(in_srgb,var(--cartex-success)_15%,transparent)] text-cartex-success',
        warning: 'bg-[color-mix(in_srgb,var(--cartex-warning)_15%,transparent)] text-cartex-warning',
        danger: 'bg-[color-mix(in_srgb,var(--cartex-danger)_15%,transparent)] text-cartex-danger',
        outline: 'border border-current bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
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
