"use client";

import React, { useRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  motion,
  motionValue,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

const DEFAULT_SIZE = 40;
const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;

export interface DockProps extends VariantProps<typeof dockVariants> {
  className?: string;
  iconSize?: number;
  iconMagnification?: number;
  iconDistance?: number;
  children: React.ReactNode;
}

const dockVariants = cva(
  "mx-auto flex h-[58px] w-max gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md shadow-lg supports-[backdrop-filter]:bg-white/10",
);

const DockContext = React.createContext<{
  mouseX: MotionValue<number>;
  size: number;
  magnification: number;
  distance: number;
}>({
  mouseX: motionValue(Infinity),
  size: DEFAULT_SIZE,
  magnification: DEFAULT_MAGNIFICATION,
  distance: DEFAULT_DISTANCE,
});

function Dock({
  className,
  children,
  iconSize = DEFAULT_SIZE,
  iconMagnification = DEFAULT_MAGNIFICATION,
  iconDistance = DEFAULT_DISTANCE,
  ...props
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <DockContext.Provider
      value={{
        mouseX,
        size: iconSize,
        magnification: iconMagnification,
        distance: iconDistance,
      }}
    >
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(dockVariants(), className)}
        {...props}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

export interface DockIconProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

function DockIcon({ className, children, ...props }: DockIconProps) {
  const { mouseX, size, magnification, distance } = React.useContext(DockContext);
  const ref = useRef<HTMLDivElement>(null);

  const distanceCalc = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [size, magnification, size],
  );

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className={cn(
        "flex aspect-square cursor-pointer items-center justify-center rounded-full",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

Dock.displayName = "Dock";
DockIcon.displayName = "DockIcon";

export { Dock, DockIcon, dockVariants };
