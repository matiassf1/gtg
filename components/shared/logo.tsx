import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "text-2xl w-10 h-10",
  md: "text-4xl w-16 h-16",
  lg: "text-6xl w-24 h-24",
  xl: "text-8xl w-36 h-36",
};

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2 border-primary font-black text-primary",
        "shadow-[0_0_20px_rgba(57,255,20,0.4)]",
        sizes[size],
        className
      )}
    >
      G
    </div>
  );
}
