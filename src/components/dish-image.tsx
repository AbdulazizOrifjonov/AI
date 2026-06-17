import { cn } from "@/lib/utils";
import { dishImageUrl, type Dish } from "@/lib/dishes-data";
import { useRef, useState } from "react";

type Props = {
  dish: Dish;
  className?: string;
  width?: number;
  height?: number;
  rounded?: boolean;
};

export function DishImage({
  dish,
  className,
  width = 600,
  height = 400,
  rounded = false,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const url = dishImageUrl(dish, width, height);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleRef = (node: HTMLImageElement | null) => {
    imgRef.current = node;
    if (node && node.complete && node.naturalWidth > 0) {
      setLoaded(true);
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-accent to-primary/10",
        rounded && "rounded-xl",
        className
      )}
    >
      {!loaded && !errored && (
        <div className="absolute inset-0 overflow-hidden bg-muted">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            style={{ animation: "shimmer-sweep 1.5s ease-in-out infinite" }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">
            {dish.emoji}
          </div>
        </div>
      )}
      {errored ? (
        <div className="absolute inset-0 grid place-items-center text-6xl">
          {dish.emoji}
        </div>
      ) : (
        <img
          ref={handleRef}
          src={url}
          alt={dish.name}
          loading="lazy"
          decoding="async"
          width={width}
          height={height}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
