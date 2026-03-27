import { useState, useRef, useCallback } from 'react'
import './InsightCard.css'

export function InsightCard({ insights }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef(null)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const scrollLeft = el.scrollLeft
    const cardWidth = el.firstChild?.offsetWidth || 1
    const gap = 12
    const idx = Math.round(scrollLeft / (cardWidth + gap))
    setActiveIndex(idx)
  }, [])

  if (!insights?.length) return null

  return (
    <div className="insight-section animate-fade-in-up">
      <div className="insight-carousel" ref={scrollRef} onScroll={handleScroll}>
        {insights.map((insight) => (
          <div key={insight.id} className="insight-card card" style={{ borderLeftColor: insight.color }}>
            <div className="insight-card-icon">{insight.icon}</div>
            <div className="insight-card-content">
              <div className="insight-card-title">{insight.title}</div>
              <div className="insight-card-desc">{insight.description}</div>
            </div>
          </div>
        ))}
      </div>
      {insights.length > 1 && (
        <div className="insight-dots">
          {insights.map((_, i) => (
            <span key={i} className={`insight-dot ${i === activeIndex ? 'active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  )
}
