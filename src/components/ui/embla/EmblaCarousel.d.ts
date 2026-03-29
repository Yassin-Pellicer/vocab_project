import type { EmblaOptionsType } from "embla-carousel";
import type { JSX, Key, ReactNode } from "react";

export type EmblaCarouselProps<T = unknown> = {
  slides?: T[];
  options?: EmblaOptionsType;
  renderSlide?: (slide: T, index: number) => ReactNode;
  getSlideKey?: (slide: T, index: number) => Key;
  className?: string;
  slideClassName?: string;
  showControls?: boolean;
};

declare const EmblaCarousel: <T = unknown>(
  props: EmblaCarouselProps<T>,
) => JSX.Element;

export default EmblaCarousel;
