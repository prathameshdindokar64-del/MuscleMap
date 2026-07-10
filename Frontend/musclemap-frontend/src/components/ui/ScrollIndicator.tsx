import { useEffect, useState } from 'react'

/** Intro scroll hint that hides after first user scroll. */
export function ScrollIndicator() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hide = () => setVisible(false)
    window.addEventListener('scroll', hide, { once: true })
    return () => window.removeEventListener('scroll', hide)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-5 left-1/2 z-20 -translate-x-1/2 text-center text-sm text-slate-400">
      <div className="animate-bounce text-lg text-teal-500">↓</div>
      <p>Scroll to explore</p>
    </div>
  )
}
