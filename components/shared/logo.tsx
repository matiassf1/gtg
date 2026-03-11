import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES: Record<string, number> = {
  sm:  40,
  md:  80,
  lg: 160,
  xl: 200,
};

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  withGlow?: boolean;
  withAnimation?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  withGlow = true,
  withAnimation = false,
  className,
}: LogoProps) {
  const dim = SIZES[size];

  return (
    <Image
      src="/logo-gtg.png"
      alt="Club GTG"
      width={dim}
      height={dim}
      className={cn("select-none shrink-0", withAnimation && "animate-fade-in", className)}
      style={withGlow ? { filter: "drop-shadow(0 0 20px rgba(57, 255, 20, 0.3))" } : undefined}
    />
  );
}
