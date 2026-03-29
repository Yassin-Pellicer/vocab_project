import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import {
  NextButton,
  PrevButton,
  usePrevNextButtons
} from './EmblaCarouselArrowButtons'
import {
  SelectedSnapDisplay,
  useSelectedSnapDisplay
} from './EmblaCarouselSelectedSnapDisplay'

const EmblaCarousel = (props) => {
  const {
    slides = [],
    options,
    renderSlide,
    getSlideKey,
    className = '',
    slideClassName = 'basis-[280px] min-w-0 shrink-0 pr-3',
    showControls = true
  } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  const { selectedSnap, snapCount } = useSelectedSnapDisplay(emblaApi)

  const defaultRenderSlide = (slide, index) => (
    <div className="rounded-xl border border-border bg-card p-4 text-sm text-card-foreground shadow-sm">
      {typeof slide === 'string' || typeof slide === 'number'
        ? slide
        : `Slide ${index + 1}`}
    </div>
  )

  const resolveSlideKey = (slide, index) => {
    if (typeof getSlideKey === 'function') return getSlideKey(slide, index)
    if (slide && typeof slide === 'object') {
      if (slide.uuid) return slide.uuid
      if (slide.id) return slide.id
    }
    return `embla-slide-${index}`
  }

  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div className={slideClassName} key={resolveSlideKey(slide, index)}>
              {typeof renderSlide === 'function'
                ? renderSlide(slide, index)
                : defaultRenderSlide(slide, index)}
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-popover text-popover-foreground shadow-sm disabled:opacity-50"
            />
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-popover text-popover-foreground shadow-sm disabled:opacity-50"
            />
          </div>

          <SelectedSnapDisplay
            selectedSnap={selectedSnap}
            snapCount={snapCount}
          />
        </div>
      )}
    </div>
  )
}

export default EmblaCarousel
