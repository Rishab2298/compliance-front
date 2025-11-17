import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/ThemeContext"

function Skeleton({
  className,
  ...props
}) {
  const { isDarkMode } = useTheme()

  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md",
        isDarkMode ? "bg-slate-700/50" : "bg-gray-200",
        className
      )}
      {...props} />
  );
}

export { Skeleton }
