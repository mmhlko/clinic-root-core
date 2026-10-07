import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewRatingProps {
  rating: number;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ReviewRating({
  rating,
  showValue = true,
  size = "sm",
  className,
}: ReviewRatingProps) {
  const value = Number.isFinite(rating)
    ? Math.min(5, Math.max(0, rating))
    : 0;

  return (
    <div
      role="img"
      aria-label={`Оценка ${value} из 5`}
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon
            key={index}
            className={cn(
              size === "sm" ? "size-3.5" : "size-4",
              index < value
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/30",
            )}
          />
        ))}
      </span>

      {showValue && (
        <span className="text-xs tabular-nums text-muted-foreground">
          {value}/5
        </span>
      )}
    </div>
  );
}
