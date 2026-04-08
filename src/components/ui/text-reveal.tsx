import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  mode?: "word" | "char" | "line";
}

export const TextReveal = ({ children, className = "", delay = 0, mode = "word" }: TextRevealProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const items = mode === "char" ? children.split("") : mode === "word" ? children.split(" ") : [children];

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap", className)}>
      {items.map((item, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.4, delay: delay + i * (mode === "char" ? 0.03 : 0.08), ease: "easeOut" }}
          className="inline-block"
        >
          {item}{mode !== "line" && mode !== "char" ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
};

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer = ({ children, className = "", staggerDelay = 0.1 }: StaggerContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 24, scale: 0.96 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
    }}
    className={className}
  >
    {children}
  </motion.div>
);
