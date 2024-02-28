import { useState, useEffect } from "react";
import { PiStarFourFill } from "react-icons/pi";

interface Position {
  x: number;
  y: number;
}

interface Star {
  id: number;
  position: { x: number; y: number };
  color: string;
  size: string;
  animation: string;
}

interface GlowPoint {
  id: number;
  position: { x: number; y: number };
}

const config = {
  starAnimationDuration: 1500,
  minimumTimeBetweenStars: 250,
  minimumDistanceBetweenStars: 75,
  glowDuration: 75,
  maximumGlowPointSpacing: 10,
  colors: ["249 146 253", "252 254 255"],
  sizes: ["1.4rem", "1rem", "0.6rem"],
  animations: ["fall-1", "fall-2", "fall-3"],
};

const originPosition = { x: 0, y: 0 };
const last = {
  starTimestamp: new Date().getTime(),
  starPosition: originPosition,
  mousePosition: originPosition,
};

export default function App() {
  const [stars, setStars] = useState<Star[]>([]);
  const [glowPoints, setGlowPoints] = useState<GlowPoint[]>([]);

  useEffect(() => {
    const handleOnMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0,
        clientY = 0;
      if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      const mousePosition: Position = { x: clientX, y: clientY };
      adjustLastMousePosition(mousePosition);

      const now = new Date().getTime();
      const hasMovedFarEnough =
        calcDistance(last.starPosition, mousePosition) >=
        config.minimumDistanceBetweenStars;
      const hasBeenLongEnough =
        calcElapsedTime(last.starTimestamp, now) >
        config.minimumTimeBetweenStars;

      if (hasMovedFarEnough || hasBeenLongEnough) {
        createStar(mousePosition);
        updateLastStar(mousePosition, now);
      }

      createGlow(last.mousePosition, mousePosition);
      updateLastMousePosition(mousePosition);
    };

    window.addEventListener("mousemove", handleOnMove);
    window.addEventListener("touchmove", (e: TouchEvent) => handleOnMove(e));

    return () => {
      window.removeEventListener("mousemove", handleOnMove);
      window.removeEventListener("touchmove", (e: TouchEvent) =>
        handleOnMove(e)
      );
    };
  }, []);

  const createStar = (position: Position) => {
    const newStar: Star = {
      id: Math.random(),
      position,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      size: config.sizes[Math.floor(Math.random() * config.sizes.length)],
      animation:
        config.animations[Math.floor(Math.random() * config.animations.length)],
    };
    setStars((prevStars) => [...prevStars, newStar]);

    setTimeout(() => {
      setStars((prevStars) =>
        prevStars.filter((star) => star.id !== newStar.id)
      );
    }, config.starAnimationDuration);
  };

  const createGlowPoint = (position: Position) => {
    const newGlowPoint: GlowPoint = {
      id: Math.random(),
      position,
    };
    setGlowPoints((prevGlowPoints) => [...prevGlowPoints, newGlowPoint]);

    setTimeout(() => {
      setGlowPoints((prevGlowPoints) =>
        prevGlowPoints.filter((glow) => glow.id !== newGlowPoint.id)
      );
    }, config.glowDuration);
  };

  const createGlow = (last: Position, current: Position) => {
    const distance = calcDistance(last, current),
      quantity = Math.max(
        Math.floor(distance / config.maximumGlowPointSpacing),
        1
      );
    const dx = (current.x - last.x) / quantity,
      dy = (current.y - last.y) / quantity;

    Array.from({ length: quantity }).forEach((_, index) => {
      const x = last.x + dx * index,
        y = last.y + dy * index;
      createGlowPoint({ x, y });
    });
  };

  const calcDistance = (a: Position, b: Position): number => {
    const diffX = b.x - a.x;
    const diffY = b.y - a.y;
    return Math.sqrt(diffX * diffX + diffY * diffY);
  };

  const calcElapsedTime = (start: number, end: number): number => end - start;

  const adjustLastMousePosition = (position: Position) => {
    if (last.mousePosition.x === 0 && last.mousePosition.y === 0) {
      last.mousePosition = position;
    }
  };

  const updateLastStar = (position: Position, now: number) => {
    last.starTimestamp = now;
    last.starPosition = position;
  };

  const updateLastMousePosition = (position: Position) => {
    last.mousePosition = position;
  };

  return (
    <div>
      {stars.map((star) => (
        <PiStarFourFill
          key={star.id}
          style={{
            position: "absolute",
            left: star.position.x,
            top: star.position.y,
            fontSize: star.size,
            color: `rgb(${star.color})`,
            animationName: star.animation,
            animationDuration: `${config.starAnimationDuration}ms`,
            zIndex: 2,
          }}
        />
      ))}
      {glowPoints.map((glow) => (
        <div
          key={glow.id}
          className="glow-point"
          style={{
            left: glow.position.x,
            top: glow.position.y,
          }}
        ></div>
      ))}
    </div>
  );
}
