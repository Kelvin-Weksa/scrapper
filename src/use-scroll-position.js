import React from 'react'

const isBrowser = typeof window !== `undefined`
function getScrollPosition({ element, useWindow }) {
  if (!isBrowser) return { x: 0, y: 0 }
  const target = element ? element.current : document.body
  const position = target.getBoundingClientRect()
  return useWindow
    ? { x: window.scrollX, y: window.scrollY }
    : { x: position.left, y: position.top }
}

export function useScrollPosition(effect, element , useWindow, wait) {
  const position = React.useRef(getScrollPosition({ useWindow }))
  let throttleTimeout = React.useRef ( null );

  React.useLayoutEffect(() => {
    const callBack = () => {
      const currPos = getScrollPosition({ element, useWindow })
      effect({ prevPos: position.current, currPos })
      position.current = currPos
      throttleTimeout.current = null
    }

    if (!isBrowser) {
      return
    }
    const handleScroll = () => {
      if (wait) {
        if (throttleTimeout.current === null) {
          throttleTimeout.current = setTimeout(callBack, wait)
        }
      } else {
        callBack()
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  })
}
useScrollPosition.defaultProps = {
  deps: [],
  element: false,
  useWindow: false,
  wait: null,
}
