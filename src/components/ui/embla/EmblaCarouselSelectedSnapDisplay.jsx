import React, { useCallback, useEffect, useState } from 'react'

const getSnapList = (emblaApi) => {
  if (!emblaApi) return []
  if (typeof emblaApi.scrollSnapList === 'function') return emblaApi.scrollSnapList()
  if (typeof emblaApi.snapList === 'function') return emblaApi.snapList()
  return []
}

const getSelectedSnap = (emblaApi) => {
  if (!emblaApi) return 0
  if (typeof emblaApi.selectedScrollSnap === 'function') return emblaApi.selectedScrollSnap()
  if (typeof emblaApi.selectedSnap === 'function') return emblaApi.selectedSnap()
  return 0
}

export const useSelectedSnapDisplay = (emblaApi) => {
  const [selectedSnap, setSelectedSnap] = useState(0)
  const [snapCount, setSnapCount] = useState(0)

  const updateScrollSnapState = useCallback((emblaApi) => {
    setSnapCount(getSnapList(emblaApi).length)
    setSelectedSnap(getSelectedSnap(emblaApi))
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    updateScrollSnapState(emblaApi)
    emblaApi.on('select', updateScrollSnapState)
    emblaApi.on('reinit', updateScrollSnapState)
    return () => {
      emblaApi.off('select', updateScrollSnapState)
      emblaApi.off('reinit', updateScrollSnapState)
    }
  }, [emblaApi, updateScrollSnapState])

  return {
    selectedSnap,
    snapCount
  }
}

export const SelectedSnapDisplay = (props) => {
  const { selectedSnap, snapCount } = props

  return (
    <div className="embla__selected-snap-display">
      {selectedSnap + 1} / {snapCount}
    </div>
  )
}
