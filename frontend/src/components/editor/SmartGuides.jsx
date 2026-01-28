import React from 'react'

const SmartGuides = ({ guides, canvasSettings, zoom }) => {
  if (!guides || guides.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 999 }}>
      {guides.map((guide, index) => {
        if (guide.type === 'vertical') {
          return (
            <div
              key={`guide-${index}`}
              className="absolute top-0 bottom-0 w-px bg-primary"
              style={{
                left: `${guide.position}px`,
                height: `${canvasSettings.height}px`
              }}
            >
              {guide.label && (
                <div className="absolute top-1/2 -translate-y-1/2 left-2 bg-primary text-white text-xs px-1 rounded">
                  {guide.label}
                </div>
              )}
            </div>
          )
        } else if (guide.type === 'horizontal') {
          return (
            <div
              key={`guide-${index}`}
              className="absolute left-0 right-0 h-px bg-primary"
              style={{
                top: `${guide.position}px`,
                width: `${canvasSettings.width}px`
              }}
            >
              {guide.label && (
                <div className="absolute left-1/2 -translate-x-1/2 top-2 bg-primary text-white text-xs px-1 rounded">
                  {guide.label}
                </div>
              )}
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

export default SmartGuides
