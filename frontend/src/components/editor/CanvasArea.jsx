import React, { useState, useRef, useEffect } from 'react'
import CanvasElement from './CanvasElement'
import SmartGuides from './SmartGuides'
import TextContextMenu from './TextContextMenu'

const CanvasArea = ({ 
  canvasRef,
  containerRef,
  canvasSettings,
  setCanvasSettings,
  elements, 
  selectedElement,
  selectedElements = [],
  setSelectedElement,
  toggleElementSelection,
  updateElement,
  deleteElement,
  duplicateElement,
  undo,
  redo,
  canUndo,
  canRedo,
  smartGuides = [],
  setSmartGuides,
  calculateSmartGuides
}) => {
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(false)
  const [showRulers, setShowRulers] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)

  const handleZoomIn = () => setZoom(Math.min(zoom + 10, 200))
  const handleZoomOut = () => setZoom(Math.max(zoom - 10, 25))
  const handleZoomReset = () => setZoom(100)
  const handleZoomFit = () => {
    if (!containerRef.current) return
    const container = containerRef.current
    const containerWidth = container.clientWidth - 64
    const containerHeight = container.clientHeight - 64
    const scaleX = containerWidth / canvasSettings.width
    const scaleY = containerHeight / canvasSettings.height
    const scale = Math.min(scaleX, scaleY, 1) * 100
    setZoom(Math.round(scale))
  }

  const handleIncreaseHeight = () => {
    setCanvasSettings({
      ...canvasSettings,
      height: canvasSettings.height + 630
    })
  }

  const handleDecreaseHeight = () => {
    if (canvasSettings.height > 630) {
      setCanvasSettings({
        ...canvasSettings,
        height: canvasSettings.height - 630
      })
    }
  }

  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget || e.target.classList.contains('canvas-wrapper')) {
      setSelectedElement(null)
      if (setSmartGuides) setSmartGuides([])
      setContextMenu(null)
    }
  }

  const handleContextMenu = (e, element) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      element
    })
  }

  const handleContextMenuAction = (action) => {
    if (!contextMenu?.element) return
    
    switch (action) {
      case 'font':
        // Open font picker in properties panel
        setSelectedElement(contextMenu.element)
        break
      case 'spacing':
        // Open spacing controls
        setSelectedElement(contextMenu.element)
        break
      case 'outline':
        // Open outline controls
        setSelectedElement(contextMenu.element)
        break
      case 'shadow':
        // Open shadow controls
        setSelectedElement(contextMenu.element)
        break
      case 'link':
        // Open link dialog
        const url = prompt('Nhập URL:', contextMenu.element.link || '')
        if (url !== null) {
          updateElement(contextMenu.element.id, { link: url })
        }
        break
      case 'animation':
        // Open animation controls
        setSelectedElement(contextMenu.element)
        break
      case 'transition':
        // Open transition controls
        setSelectedElement(contextMenu.element)
        break
      case 'duplicate':
        duplicateElement(contextMenu.element.id)
        break
      case 'delete':
        deleteElement(contextMenu.element.id)
        break
    }
    
    setContextMenu(null)
  }

  const snapValue = (value, gridSize = 10) => {
    if (!snapToGrid) return value
    return Math.round(value / gridSize) * gridSize
  }

  // Keyboard shortcuts for canvas operations
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle grid: G
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowGrid(!showGrid)
      }
      // Toggle snap: Shift+G
      if (e.key === 'G' && e.shiftKey) {
        e.preventDefault()
        setSnapToGrid(!snapToGrid)
      }
      // Zoom in: +
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      }
      // Zoom out: -
      if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        handleZoomOut()
      }
      // Zoom reset: 0
      if (e.key === '0') {
        e.preventDefault()
        handleZoomReset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showGrid, snapToGrid])

  return (
    <section className="flex-1 bg-gray-100 dark:bg-gray-900 relative overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleZoomOut}
            className="size-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Thu nhỏ"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
            {zoom}%
          </span>
          <button 
            onClick={handleZoomIn}
            className="size-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Phóng to"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button 
            onClick={handleZoomReset}
            className="ml-2 px-3 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Đặt lại 100%"
          >
            100%
          </button>
          <button 
            onClick={handleZoomFit}
            className="px-3 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Vừa màn hình"
          >
            Vừa khung
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Hoàn tác (Ctrl+Z)"
          >
            <span className="material-symbols-outlined text-[18px]">undo</span>
            Hoàn tác
          </button>
          <button 
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Làm lại (Ctrl+Y)"
          >
            <span className="material-symbols-outlined text-[18px]">redo</span>
            Làm lại
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1.5 text-sm font-medium rounded flex items-center gap-1 transition-colors ${
              showGrid 
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Hiện/Ẩn lưới"
          >
            <span className="material-symbols-outlined text-[18px]">grid_on</span>
            Lưới
          </button>
          <button 
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-3 py-1.5 text-sm font-medium rounded flex items-center gap-1 transition-colors ${
              snapToGrid 
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Bật/Tắt snap to grid"
          >
            <span className="material-symbols-outlined text-[18px]">grid_4x4</span>
            Snap
          </button>
          <button 
            onClick={() => setShowRulers(!showRulers)}
            className={`px-3 py-1.5 text-sm font-medium rounded flex items-center gap-1 transition-colors ${
              showRulers 
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Hiện/Ẩn thước"
          >
            <span className="material-symbols-outlined text-[18px]">straighten</span>
            Thước
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-8 canvas-wrapper"
        onClick={handleCanvasClick}
      >
        <div className="min-h-full flex items-start justify-center">
          <div
            ref={canvasRef}
            className="relative bg-white shadow-2xl my-8"
            style={{
              width: `${canvasSettings.width}px`,
              height: `${canvasSettings.height}px`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              background: canvasSettings.background,
              backgroundImage: canvasSettings.backgroundImage 
                ? canvasSettings.backgroundImage
                : showGrid 
                ? `
                  repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(0,0,0,0.05) 9px, rgba(0,0,0,0.05) 10px),
                  repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(0,0,0,0.05) 9px, rgba(0,0,0,0.05) 10px)
                `
                : 'none',
              backgroundSize: canvasSettings.backgroundImage ? 'cover' : '10px 10px',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
          {/* Smart Guides */}
          {smartGuides && smartGuides.length > 0 && (
            <SmartGuides 
              guides={smartGuides} 
              canvasSettings={canvasSettings}
              zoom={zoom}
            />
          )}

          {/* Render elements sorted by zIndex */}
          {(() => {
            console.log('🎨 Rendering elements:', elements.length, 'items')
            console.log('📊 Elements data:', elements)
            return [...elements]
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map((element) => {
                const isSelected = selectedElement?.id === element.id || 
                                  selectedElements.some(el => el.id === element.id)
                
                console.log('🔷 Rendering element:', element.id, element.type, `at (${element.x}, ${element.y})`)
                
                return (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={(e) => {
                      if (!element.locked) {
                        if (toggleElementSelection) {
                          toggleElementSelection(element, e?.ctrlKey || e?.metaKey)
                        } else {
                          setSelectedElement(element)
                        }
                      }
                    }}
                    onUpdate={(updates) => {
                      updateElement(element.id, updates, false)
                      if (calculateSmartGuides) {
                        calculateSmartGuides({ ...element, ...updates })
                      }
                    }}
                    onUpdateComplete={(updates) => {
                      updateElement(element.id, updates, true)
                      if (setSmartGuides) setSmartGuides([])
                    }}
                    onDelete={() => deleteElement(element.id)}
                    onDuplicate={() => duplicateElement(element.id)}
                    zoom={zoom}
                    snapValue={snapValue}
                    canvasSettings={canvasSettings}
                    onContextMenu={handleContextMenu}
                  />
                )
              })
          })()}
          </div>
        </div>
      </div>

      {/* Canvas Height Control - Floating in the middle of canvas area */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-40 z-50 pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-2xl border-2 border-gray-300 dark:border-gray-600 pointer-events-auto">
          <button 
            onClick={handleDecreaseHeight}
            disabled={canvasSettings.height <= 630}
            className="size-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Giảm chiều cao (-630px)"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
          
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Chiều cao:</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
              {canvasSettings.height} px
            </span>
          </div>
          
          <button 
            onClick={handleIncreaseHeight}
            className="size-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Tăng chiều cao (+630px)"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <TextContextMenu
          position={contextMenu}
          element={contextMenu.element}
          onClose={() => setContextMenu(null)}
          onAction={handleContextMenuAction}
        />
      )}

      {/* Quick Actions for Selected Element - Moved to bottom left */}
      {(selectedElement || selectedElements.length > 0) && !selectedElement?.locked && (
        <div className="absolute bottom-36 left-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 flex items-center gap-2 z-40">
          {selectedElement && (
            <>
              <button 
                onClick={() => updateElement(selectedElement.id, { x: selectedElement.x, y: selectedElement.y - 10 })}
                className="size-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Di chuyển lên (↑)"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
              </button>
              <button 
                onClick={() => updateElement(selectedElement.id, { x: selectedElement.x, y: selectedElement.y + 10 })}
                className="size-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Di chuyển xuống (↓)"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
              </button>
              <button 
                onClick={() => updateElement(selectedElement.id, { x: selectedElement.x - 10, y: selectedElement.y })}
                className="size-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Di chuyển trái (←)"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <button 
                onClick={() => updateElement(selectedElement.id, { x: selectedElement.x + 10, y: selectedElement.y })}
                className="size-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Di chuyển phải (→)"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <button 
                onClick={() => duplicateElement(selectedElement.id)}
                className="size-8 flex items-center justify-center rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 transition-colors"
                title="Nhân bản (Ctrl+D)"
              >
                <span className="material-symbols-outlined text-[20px]">content_copy</span>
              </button>
              <button 
                onClick={() => deleteElement(selectedElement.id)}
                className="size-8 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                title="Xóa (Delete)"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </>
          )}
          {selectedElements.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {selectedElements.length} đã chọn
            </span>
          )}
        </div>
      )}

      {/* Info Bar */}
      <div className="h-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 text-xs text-gray-600 dark:text-gray-400 shrink-0">
        <div className="flex items-center gap-4">
          <span>Canvas: {canvasSettings.width} × {canvasSettings.height}px</span>
          {selectedElement && (
            <>
              <span className="text-gray-400">|</span>
              <span>
                Vị trí: {Math.round(selectedElement.x)}, {Math.round(selectedElement.y)}
              </span>
              {(selectedElement.width || selectedElement.height) && (
                <span>
                  Kích thước: {Math.round(selectedElement.width || 0)} × {Math.round(selectedElement.height || 0)}px
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>{elements.length} phần tử</span>
          {selectedElement && (
            <>
              <span className="text-gray-400">|</span>
              <span className="text-primary font-medium">{selectedElement.type}</span>
            </>
          )}
        </div>
      </div>

      {/* Image Thumbnails Bar - Only show when there are images */}
      {elements.filter(el => el.type === 'image' && el.visible).length > 0 && (
        <div className="h-28 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center px-4 gap-3 overflow-x-auto shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Thay ảnh nhanh:
            </span>
            
            {elements
              .filter(el => el.type === 'image' && el.visible)
              .map((imageElement, index) => (
                <div
                  key={imageElement.id}
                  onClick={() => {
                    setSelectedElement(imageElement)
                    // Scroll to image position on canvas
                    if (containerRef?.current) {
                      const scrollContainer = containerRef.current
                      const imageY = imageElement.y
                      // Calculate scroll position considering zoom and padding
                      const targetScroll = imageY - 150
                      scrollContainer.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                      })
                    }
                  }}
                  className={`flex-shrink-0 w-16 h-20 rounded-lg border-2 cursor-pointer transition-all relative group overflow-hidden ${
                    selectedElement?.id === imageElement.id
                      ? 'border-primary shadow-lg ring-2 ring-primary/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                  }`}
                  title={`Ảnh ${index + 1} - Vị trí: ${Math.round(imageElement.x)}, ${Math.round(imageElement.y)}`}
                >
                  {/* Image thumbnail */}
                  <img
                    src={imageElement.url}
                    alt={`Ảnh ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      transform: `rotate(${imageElement.rotation || 0}deg) scaleX(${imageElement.flipX ? -1 : 1}) scaleY(${imageElement.flipY ? -1 : 1})`,
                      filter: imageElement.filter || 'none'
                    }}
                  />
                  
                  {/* Image number badge */}
                  <div className="absolute top-1 left-1 size-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                    {index + 1}
                  </div>
                  
                  {/* Position info on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] py-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                    Y: {Math.round(imageElement.y)}px
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default CanvasArea
