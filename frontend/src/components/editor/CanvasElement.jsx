import React, { useState, useRef, useEffect } from 'react'

const CanvasElement = ({ 
  element, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onUpdateComplete,
  onDelete,
  onDuplicate,
  zoom,
  snapValue,
  canvasSettings,
  onContextMenu
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(element.content || '')
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 })
  const [resizeHandle, setResizeHandle] = useState(null)
  const [rotateStart, setRotateStart] = useState({ angle: 0, centerX: 0, centerY: 0, startAngle: 0 })
  
  const elementRef = useRef(null)
  const textInputRef = useRef(null)

  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus()
      textInputRef.current.select()
    }
  }, [isEditing])

  // Handle global mouse events for dragging, resizing, rotating
  useEffect(() => {
    const handleMouseMove = (e) => {
      const scale = zoom / 100

      if (isDragging) {
        const deltaX = (e.clientX - dragStart.x) / scale
        const deltaY = (e.clientY - dragStart.y) / scale
        
        let newX = dragStart.elementX + deltaX
        let newY = dragStart.elementY + deltaY
        
        // Apply snap to grid
        newX = snapValue(newX)
        newY = snapValue(newY)
        
        // Constrain to canvas bounds
        newX = Math.max(0, Math.min(newX, canvasSettings.width - (element.width || 0)))
        newY = Math.max(0, Math.min(newY, canvasSettings.height - (element.height || 0)))
        
        onUpdate({ x: newX, y: newY })
      } else if (isResizing && resizeHandle) {
        const deltaX = (e.clientX - resizeStart.x) / scale
        const deltaY = (e.clientY - resizeStart.y) / scale
        
        let newWidth = resizeStart.width
        let newHeight = resizeStart.height
        let newX = resizeStart.elementX
        let newY = resizeStart.elementY

        // Calculate new dimensions based on handle
        if (resizeHandle.includes('e')) {
          newWidth = Math.max(20, resizeStart.width + deltaX)
        }
        if (resizeHandle.includes('w')) {
          const widthChange = resizeStart.width - Math.max(20, resizeStart.width - deltaX)
          newWidth = resizeStart.width - widthChange
          newX = resizeStart.elementX + widthChange
        }
        if (resizeHandle.includes('s')) {
          newHeight = Math.max(20, resizeStart.height + deltaY)
        }
        if (resizeHandle.includes('n')) {
          const heightChange = resizeStart.height - Math.max(20, resizeStart.height - deltaY)
          newHeight = resizeStart.height - heightChange
          newY = resizeStart.elementY + heightChange
        }

        // Maintain aspect ratio for images if shift is pressed
        if (element.type === 'image' && e.shiftKey && element.originalWidth && element.originalHeight) {
          const aspectRatio = element.originalWidth / element.originalHeight
          if (resizeHandle.includes('e') || resizeHandle.includes('w')) {
            newHeight = newWidth / aspectRatio
          } else {
            newWidth = newHeight * aspectRatio
          }
        }

        // Maintain aspect ratio for shapes on corner resize
        if (element.type === 'shape' && e.shiftKey && (resizeHandle === 'nw' || resizeHandle === 'ne' || resizeHandle === 'sw' || resizeHandle === 'se')) {
          const size = Math.max(newWidth, newHeight)
          newWidth = size
          newHeight = size
        }

        onUpdate({ 
          width: Math.round(newWidth), 
          height: Math.round(newHeight),
          x: Math.round(newX),
          y: Math.round(newY)
        })
      } else if (isRotating) {
        const centerX = element.x + (element.width || 0) / 2
        const centerY = element.y + (element.height || 0) / 2
        
        // Calculate angle from center to mouse position
        const angle = Math.atan2(
          e.clientY / scale - centerY,
          e.clientX / scale - centerX
        ) * (180 / Math.PI)
        
        // Calculate rotation relative to start
        let newRotation = angle - rotateStart.startAngle + rotateStart.angle
        
        // Snap to 15 degree increments if shift is pressed
        if (e.shiftKey) {
          newRotation = Math.round(newRotation / 15) * 15
        }
        
        // Normalize to 0-360
        while (newRotation < 0) newRotation += 360
        while (newRotation >= 360) newRotation -= 360
        
        onUpdate({ rotation: Math.round(newRotation) })
      }
    }

    const handleMouseUp = () => {
      if (isDragging || isResizing || isRotating) {
        onUpdateComplete({})
      }
      setIsDragging(false)
      setIsResizing(false)
      setIsRotating(false)
      setResizeHandle(null)
    }

    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, isRotating, dragStart, resizeStart, rotateStart, resizeHandle, element, zoom, snapValue, canvasSettings, onUpdate, onUpdateComplete])

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    if (element.type === 'text' && !element.locked) {
      setIsEditing(true)
      setEditValue(element.content || '')
    }
  }

  const handleTextChange = (e) => {
    setEditValue(e.target.value)
  }

  const handleTextBlur = () => {
    setIsEditing(false)
    // If text is completely empty after blur, set to empty string (will show placeholder)
    // User can still see and select the text box
    const newContent = editValue.trim()
    // Only update if content actually changed
    if (newContent !== element.content) {
      onUpdateComplete({ content: newContent })
    }
  }

  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextBlur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(element.content || '')
    }
  }

  const onDragStart = (e) => {
    if (element.locked || isEditing) return
    
    // Right click - show context menu
    if (e.button === 2) {
      e.preventDefault()
      e.stopPropagation()
      if (onContextMenu && element.type === 'text') {
        onContextMenu(e, element)
      }
      return
    }
    
    e.stopPropagation()
    const scale = zoom / 100
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: element.x,
      elementY: element.y
    })
  }

  const onResizeStart = (e, handle) => {
    if (element.locked) return
    
    e.stopPropagation()
    const scale = zoom / 100
    
    setIsResizing(true)
    setResizeHandle(handle)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width || 0,
      height: element.height || 0,
      elementX: element.x,
      elementY: element.y
    })
  }

  const onRotateStart = (e) => {
    if (element.locked) return
    
    e.stopPropagation()
    const scale = zoom / 100
    
    const centerX = element.x + (element.width || 0) / 2
    const centerY = element.y + (element.height || 0) / 2
    
    const startAngle = Math.atan2(
      e.clientY / scale - centerY,
      e.clientX / scale - centerX
    ) * (180 / Math.PI)
    
    setIsRotating(true)
    setRotateStart({
      angle: element.rotation || 0,
      centerX,
      centerY,
      startAngle
    })
  }

  const renderElement = () => {
    if (!element.visible) return null

    switch (element.type) {
      case 'text':
        if (isEditing) {
          return (
            <textarea
              ref={textInputRef}
              value={editValue}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              onKeyDown={handleTextKeyDown}
              className="w-full h-full resize-none border-2 border-primary rounded px-2 py-1 focus:outline-none"
              style={{
                fontSize: `${element.fontSize}px`,
                fontFamily: element.fontFamily,
                color: element.color,
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                textAlign: element.textAlign,
                textDecoration: element.textDecoration,
                lineHeight: element.lineHeight,
                letterSpacing: `${element.letterSpacing}px`,
                background: 'transparent'
              }}
            />
          )
        }

        // Build text shadow CSS
        let textShadow = 'none'
        if (element.textShadow?.enabled) {
          const s = element.textShadow
          const shadowColor = `${s.color}${Math.round((s.opacity || 0.5) * 255).toString(16).padStart(2, '0')}`
          textShadow = `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${shadowColor}`
        }

        // Build text stroke CSS
        let textStroke = 'none'
        if (element.textOutline?.enabled) {
          const o = element.textOutline
          const outlineColor = `${o.color}${Math.round((o.opacity || 1) * 255).toString(16).padStart(2, '0')}`
          textStroke = `${o.width}px ${outlineColor}`
        }

        // Build background style
        let backgroundStyle = {}
        if (element.textBackground?.enabled) {
          const bg = element.textBackground
          const bgColor = `${bg.color}${Math.round((bg.opacity || 0.8) * 255).toString(16).padStart(2, '0')}`
          backgroundStyle = {
            backgroundColor: bgColor,
            padding: `${bg.padding}px`,
            borderRadius: `${bg.borderRadius}px`,
            display: 'inline-block'
          }
        }

        // Build gradient text if enabled
        let textStyle = {
          fontSize: `${element.fontSize}px`,
          fontFamily: element.fontFamily,
          color: element.color,
          fontWeight: element.fontWeight,
          fontStyle: element.fontStyle,
          textAlign: element.textAlign,
          textDecoration: element.textDecoration,
          lineHeight: element.lineHeight,
          letterSpacing: `${element.letterSpacing}px`,
          textShadow,
          WebkitTextStroke: textStroke,
          ...backgroundStyle
        }

        // Add gradient text effect if enabled
        if (element.gradientText?.enabled) {
          textStyle = {
            ...textStyle,
            background: element.gradientText.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }
        }

        // Add glow effect if enabled
        if (element.glowEffect?.enabled) {
          const glowColor = element.glowEffect.color || element.color
          textStyle.textShadow = `0 0 ${element.glowEffect.blur || 10}px ${glowColor}, 0 0 ${(element.glowEffect.blur || 10) * 2}px ${glowColor}`
        }

        // Show placeholder if empty but keep normal styling when editing
        const displayContent = element.content || 'Nhấn để chỉnh sửa'
        // Only consider it placeholder if content is truly empty or just whitespace
        const isPlaceholder = !element.content || element.content.trim() === ''
        
        // Only apply placeholder style when NOT editing AND content is actually empty
        if (isPlaceholder && !isEditing) {
          textStyle = {
            ...textStyle,
            opacity: 0.5,
            fontStyle: 'italic',
            color: '#999999'
          }
        }

        return (
          <div
            className="w-full h-full whitespace-pre-wrap break-words"
            style={textStyle}
          >
            {displayContent}
          </div>
        )

      case 'image':
        // Build box shadow CSS
        let boxShadow = 'none'
        if (element.shadow?.enabled) {
          const s = element.shadow
          const shadowColor = `${s.color}${Math.round((s.opacity || 0.3) * 255).toString(16).padStart(2, '0')}`
          boxShadow = `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${shadowColor}`
        }

        // Build border style
        const borderStyle = element.borderWidth > 0 
          ? `${element.borderWidth}px solid ${element.borderColor || '#000000'}`
          : 'none'

        // Wrapper for padding
        const hasPadding = (element.padding || 0) > 0
        
        if (hasPadding) {
          return (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{
                padding: `${element.padding}px`,
                backgroundColor: 'transparent'
              }}
            >
              <img
                src={element.url}
                alt="Element"
                className="w-full h-full object-cover pointer-events-none"
                style={{
                  transform: `scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
                  borderRadius: `${element.borderRadius || 0}px`,
                  border: borderStyle,
                  boxShadow,
                  filter: element.filter || 'none'
                }}
                draggable={false}
              />
            </div>
          )
        }

        return (
          <img
            src={element.url}
            alt="Element"
            className="w-full h-full object-cover pointer-events-none"
            style={{
              transform: `scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
              borderRadius: `${element.borderRadius || 0}px`,
              border: borderStyle,
              boxShadow,
              filter: element.filter || 'none'
            }}
            draggable={false}
          />
        )

      case 'music':
        // Create 3D gradient background based on icon type
        const iconGradients = {
          'music_note': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'library_music': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          'album': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          'headphones': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          'speaker': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          'volume_up': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
          'radio': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          'piano': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
          'graphic_eq': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          'audiotrack': 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
          'queue_music': 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
          'mic': 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)'
        }

        const gradient = element.backgroundColor?.includes('gradient') 
          ? element.backgroundColor 
          : iconGradients[element.icon] || element.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

        return (
          <div 
            className="w-full h-full flex items-center justify-center pointer-events-none relative overflow-hidden group"
            style={{
              background: gradient,
              borderRadius: `${element.borderRadius || 30}px`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.3), 0 1px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
              transform: 'translateZ(0)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Shine effect */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)',
                borderRadius: `${element.borderRadius || 30}px`
              }}
            />
            
            {/* Icon with 3D effect */}
            <span 
              className="material-symbols-outlined relative z-10"
              style={{ 
                color: element.iconColor || '#ffffff',
                fontSize: `${Math.min(element.width, element.height) * 0.5}px`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                fontWeight: '300'
              }}
            >
              {element.icon || 'music_note'}
            </span>

            {/* Bottom highlight */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
                borderRadius: `0 0 ${element.borderRadius || 30}px ${element.borderRadius || 30}px`
              }}
            />
          </div>
        )

      case 'shape':
        const shapeStyles = {
          width: '100%',
          height: '100%',
          backgroundColor: element.fill,
          border: element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.stroke}` : 'none'
        }

        switch (element.shapeType) {
          case 'rectangle':
            return <div style={{ ...shapeStyles, borderRadius: `${element.borderRadius || 0}px` }} />
          case 'circle':
            return <div style={{ ...shapeStyles, borderRadius: '50%' }} />
          case 'triangle':
            return (
              <div style={{ 
                width: 0, 
                height: 0,
                borderLeft: `${element.width / 2}px solid transparent`,
                borderRight: `${element.width / 2}px solid transparent`,
                borderBottom: `${element.height}px solid ${element.fill}`,
                margin: '0 auto'
              }} />
            )
          default:
            return <div style={shapeStyles} />
        }

      default:
        return null
    }
  }

  if (!element.visible) return null

  return (
    <div
      ref={elementRef}
      data-element-id={element.id}
      data-animation={element.animation || 'none'}
      className={`absolute select-none ${element.locked ? 'cursor-not-allowed' : 'cursor-move'} ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${element.className || ''}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: element.width ? `${element.width}px` : 'auto',
        height: element.height ? `${element.height}px` : 'auto',
        minWidth: element.type === 'text' ? '50px' : undefined,
        minHeight: element.type === 'text' ? '30px' : undefined,
        transform: `rotate(${element.rotation || 0}deg)`,
        transformOrigin: 'center center',
        opacity: element.opacity || 1,
        zIndex: element.zIndex || 0,
        pointerEvents: element.locked ? 'none' : 'auto',
        animation: element.continuousAnimation && element.continuousAnimation !== 'none' 
          ? `${element.continuousAnimation} 2s ease-in-out infinite` 
          : undefined
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (!element.locked) {
          onSelect(e)
        }
      }}
      onDoubleClick={handleDoubleClick}
      onMouseDown={onDragStart}
      onContextMenu={(e) => {
        e.preventDefault()
        if (onContextMenu && element.type === 'text') {
          onContextMenu(e, element)
        }
      }}
    >
      {renderElement()}
      
      {isSelected && !isEditing && !element.locked && (
        <>
          {/* Resize handles */}
          <div 
            className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-nw-resize hover:scale-125 transition-transform"
            style={{ left: '-6px', top: '-6px' }}
            onMouseDown={(e) => onResizeStart(e, 'nw')}
          />
          <div 
            className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-ne-resize hover:scale-125 transition-transform"
            style={{ right: '-6px', top: '-6px' }}
            onMouseDown={(e) => onResizeStart(e, 'ne')}
          />
          <div 
            className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-sw-resize hover:scale-125 transition-transform"
            style={{ left: '-6px', bottom: '-6px' }}
            onMouseDown={(e) => onResizeStart(e, 'sw')}
          />
          <div 
            className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-se-resize hover:scale-125 transition-transform"
            style={{ right: '-6px', bottom: '-6px' }}
            onMouseDown={(e) => onResizeStart(e, 'se')}
          />
          
          {/* Edge resize handles */}
          <div 
            className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-n-resize hover:scale-125 transition-transform"
            style={{ left: '50%', top: '-6px', transform: 'translateX(-50%)' }}
            onMouseDown={(e) => onResizeStart(e, 'n')}
          />
          <div 
            className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-s-resize hover:scale-125 transition-transform"
            style={{ left: '50%', bottom: '-6px', transform: 'translateX(-50%)' }}
            onMouseDown={(e) => onResizeStart(e, 's')}
          />
          <div 
            className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-w-resize hover:scale-125 transition-transform"
            style={{ left: '-6px', top: '50%', transform: 'translateY(-50%)' }}
            onMouseDown={(e) => onResizeStart(e, 'w')}
          />
          <div 
            className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-e-resize hover:scale-125 transition-transform"
            style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)' }}
            onMouseDown={(e) => onResizeStart(e, 'e')}
          />
          
          {/* Rotate handle */}
          <div 
            className="absolute w-6 h-6 bg-white border-2 border-primary rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center hover:scale-110 transition-transform"
            style={{ left: '50%', top: '-32px', transform: 'translateX(-50%)' }}
            onMouseDown={onRotateStart}
          >
            <span className="material-symbols-outlined text-[14px] text-primary">refresh</span>
          </div>
          
          {/* Rotation indicator line */}
          <div 
            className="absolute w-0.5 bg-primary"
            style={{ 
              left: '50%', 
              top: '-26px', 
              height: '20px',
              transform: 'translateX(-50%)'
            }}
          />
        </>
      )}
    </div>
  )
}

export default CanvasElement
