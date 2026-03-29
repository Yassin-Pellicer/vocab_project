import React, { useCallback, useEffect, useState } from 'react'

const canScrollPrev = (emblaApi) => {
  if (!emblaApi) return false
  if (typeof emblaApi.canScrollPrev === 'function') return emblaApi.canScrollPrev()
  if (typeof emblaApi.canGoToPrev === 'function') return emblaApi.canGoToPrev()
  return false
}

const canScrollNext = (emblaApi) => {
  if (!emblaApi) return false
  if (typeof emblaApi.canScrollNext === 'function') return emblaApi.canScrollNext()
  if (typeof emblaApi.canGoToNext === 'function') return emblaApi.canGoToNext()
  return false
}

const scrollPrev = (emblaApi) => {
  if (!emblaApi) return
  if (typeof emblaApi.scrollPrev === 'function') {
    emblaApi.scrollPrev()
    return
  }
  if (typeof emblaApi.goToPrev === 'function') {
    emblaApi.goToPrev()
  }
}

const scrollNext = (emblaApi) => {
  if (!emblaApi) return
  if (typeof emblaApi.scrollNext === 'function') {
    emblaApi.scrollNext()
    return
  }
  if (typeof emblaApi.goToNext === 'function') {
    emblaApi.goToNext()
  }
}

export const usePrevNextButtons = (emblaApi) => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return
    scrollPrev(emblaApi)
  }, [emblaApi])

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return
    scrollNext(emblaApi)
  }, [emblaApi])

  const onSelect = useCallback((emblaApi) => {
    setPrevBtnDisabled(!canScrollPrev(emblaApi))
    setNextBtnDisabled(!canScrollNext(emblaApi))
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onSelect(emblaApi)
    emblaApi.on('reinit', onSelect).on('select', onSelect)
    return () => {
      emblaApi.off('reinit', onSelect)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  }
}

export const PrevButton = (props) => {
  const { children, disabled, className = '', ...restProps } = props

  return (
    <button
      className={[
        'embla__button embla__button--prev',
        disabled ? 'embla__button--disabled' : '',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      type="button"
      disabled={disabled}
      {...restProps}
    >
      <svg className="embla__button__svg size-4 shrink-0" viewBox="0 0 532 532">
        <path
          fill="currentColor"
          d="M355.66 11.354c13.793-13.805 36.208-13.805 50.001 0 13.785 13.804 13.785 36.238 0 50.034L201.22 266l204.442 204.61c13.785 13.805 13.785 36.239 0 50.044-13.793 13.796-36.208 13.796-50.002 0a5994246.277 5994246.277 0 0 0-229.332-229.454 35.065 35.065 0 0 1-10.326-25.126c0-9.2 3.393-18.26 10.326-25.2C172.192 194.973 332.731 34.31 355.66 11.354Z"
        />
      </svg>
      {children}
    </button>
  )
}

export const NextButton = (props) => {
  const { children, disabled, className = '', ...restProps } = props

  return (
    <button
      className={[
        'embla__button embla__button--next',
        disabled ? 'embla__button--disabled' : '',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      type="button"
      disabled={disabled}
      {...restProps}
    >
      <svg className="embla__button__svg size-4 shrink-0" viewBox="0 0 532 532">
        <path
          fill="currentColor"
          d="M176.34 520.646c-13.793 13.805-36.208 13.805-50.001 0-13.785-13.804-13.785-36.238 0-50.034L330.78 266 126.34 61.391c-13.785-13.805-13.785-36.239 0-50.044 13.793-13.796 36.208-13.796 50.002 0 22.928 22.947 206.395 206.507 229.332 229.454a35.065 35.065 0 0 1 10.326 25.126c0 9.2-3.393 18.26-10.326 25.2-45.865 45.901-206.404 206.564-229.332 229.52Z"
        />
      </svg>
      {children}
    </button>
  )
}
