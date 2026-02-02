"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

export function AnimatedTestimonials({
  testimonials,
  autoplay = false,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, testimonials.length]);

  // Deterministic rotate per index so server and client match (avoids hydration mismatch)
  const ROTATES = [-10, -7, -3, 4, 6, 8, -4, 5, -6, 2];
  const getRotate = (index: number) => ROTATES[index % ROTATES.length];

  return (
    <div className="mx-auto max-w-sm px-4 py-12 font-sans antialiased md:max-w-4xl md:px-8 md:py-16 lg:px-12">
      <div className="relative grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: getRotate(index),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : getRotate(index),
                    zIndex: isActive(index)
                      ? 40
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: getRotate(index),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-col justify-between py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{
                y: 20,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -20,
                opacity: 0,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              className="space-y-2"
            >
              <h3 className="text-2xl font-bold text-foreground">
                {testimonials[active].name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {testimonials[active].designation}
              </p>
              <motion.p className="mt-8 text-lg text-muted-foreground leading-relaxed">
                {testimonials[active].quote.split(" ").map((word, index) => (
                  <motion.span
                    key={`${active}-${index}`}
                    initial={{
                      filter: "blur(10px)",
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                      delay: 0.02 * index,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              type="button"
              onClick={handlePrev}
              className="group/button flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted transition-colors hover:bg-muted/80"
              aria-label="Önceki referans"
            >
              <ArrowLeft className="h-5 w-5 text-foreground transition-transform duration-300 group-hover/button:rotate-12" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="group/button flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted transition-colors hover:bg-muted/80"
              aria-label="Sonraki referans"
            >
              <ArrowRight className="h-5 w-5 text-foreground transition-transform duration-300 group-hover/button:-rotate-12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
