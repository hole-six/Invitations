import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import templateService from '../services/template.service'
import invitationService from '../services/invitation.service'
import mediaService from '../services/media.service'
import validateTemplate from '../utils/validateTemplate'
import fixTemplatePositions from '../utils/fixTemplatePositions'
import { useToast } from '../context/ToastContext'
import EditorHeader from '../components/editor/EditorHeader'
import PublishModal from '../components/editor/PublishModal'
import LeftToolbar from '../components/editor/LeftToolbar'
import CanvasArea from '../components/editor/CanvasArea'
import CanvasElement from '../components/editor/CanvasElement'
import PropertiesPanel from '../components/editor/PropertiesPanel'
import LayerPanel from '../components/editor/LayerPanel'
import AlignmentTools from '../components/editor/AlignmentTools'
import SmartGuides from '../components/editor/SmartGuides'
import ImageUploadPanel from '../components/editor/ImageUploadPanel'
import StockPanel from '../components/editor/StockPanel'
import BackgroundPanel from '../components/editor/BackgroundPanel'
import MusicPanel from '../components/editor/MusicPanel'
import UtilitiesPanel from '../components/editor/UtilitiesPanel'
import TemplatePanel from '../components/editor/TemplatePanel'
import EffectsPanel from '../components/editor/EffectsPanel'

const EditorPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const hasLoadedRef = useRef(false) // Prevent multiple loads
  
  const [template, setTemplate] = useState(null)
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('text')
  const [selectedElement, setSelectedElement] = useState(null)
  const [selectedElements, setSelectedElements] = useState([])
  const [elements, setElements] = useState([])
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [smartGuides, setSmartGuides] = useState([])
  const [isMultiSelecting, setIsMultiSelecting] = useState(false)
  const [canvasSettings, setCanvasSettings] = useState({
    width: 450,
    height: 630,
    background: '#ffffff',
    backgroundImage: null,
    pages: 1 // Number of pages
  })
  
  // Advanced template features
  const [customFonts, setCustomFonts] = useState([])
  const [globalStyles, setGlobalStyles] = useState('')
  
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  
  const [formData, setFormData] = useState({
    title: 'Thiệp Cưới Của Tôi',
    groom_name: '',
    bride_name: '',
    event_date: '',
    event_location: '',
    event_address: '',
    music_url: '',
    music_autoplay: false
  })

  // History management
  const saveToHistory = useCallback((newElements) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newElements)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setElements(JSON.parse(JSON.stringify(history[historyIndex - 1])))
      setSelectedElement(null)
    }
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setElements(JSON.parse(JSON.stringify(history[historyIndex + 1])))
      setSelectedElement(null)
    }
  }, [historyIndex, history])

  useEffect(() => {
    loadEditor()
  }, []) // Empty dependency array - only run once on mount

  useEffect(() => {
    // Initialize history with first state
    if (elements.length > 0 && history.length === 0) {
      saveToHistory(elements)
    }
  }, [elements, history.length])

  // Load custom fonts
  useEffect(() => {
    // Remove old custom fonts
    document.querySelectorAll('link[data-custom-font]').forEach(el => el.remove())
    
    // Add new custom fonts
    if (customFonts && customFonts.length > 0) {
      customFonts.forEach(fontUrl => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = fontUrl
        link.setAttribute('data-custom-font', 'true')
        document.head.appendChild(link)
      })
    }
    
    return () => {
      // Cleanup on unmount
      document.querySelectorAll('link[data-custom-font]').forEach(el => el.remove())
    }
  }, [customFonts])

  // Load global styles
  useEffect(() => {
    // Remove old custom styles
    document.querySelectorAll('style[data-custom-style]').forEach(el => el.remove())
    
    // Add new custom styles
    if (globalStyles) {
      const style = document.createElement('style')
      style.setAttribute('data-custom-style', 'true')
      style.textContent = globalStyles
      document.head.appendChild(style)
    }
    
    return () => {
      // Cleanup on unmount
      document.querySelectorAll('style[data-custom-style]').forEach(el => el.remove())
    }
  }, [globalStyles])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault()
        redo()
      }
      // Select All: Ctrl+A
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault()
        setSelectedElements(elements.filter(el => !el.locked))
        setSelectedElement(null)
      }
      // Deselect: Escape
      if (e.key === 'Escape') {
        setSelectedElement(null)
        setSelectedElements([])
      }
      // Delete: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault()
        if (selectedElements.length > 0) {
          deleteMultipleElements(selectedElements.map(el => el.id))
        } else if (selectedElement) {
          deleteElement(selectedElement.id)
        }
      }
      // Duplicate: Ctrl+D
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        if (selectedElements.length > 0) {
          duplicateMultipleElements(selectedElements.map(el => el.id))
        } else if (selectedElement) {
          duplicateElement(selectedElement.id)
        }
      }
      // Group: Ctrl+G
      if (e.ctrlKey && e.key === 'g' && !e.shiftKey) {
        e.preventDefault()
        if (selectedElements.length > 1) {
          groupElements(selectedElements.map(el => el.id))
        }
      }
      // Ungroup: Ctrl+Shift+G
      if (e.ctrlKey && e.shiftKey && e.key === 'g') {
        e.preventDefault()
        if (selectedElement?.type === 'group') {
          ungroupElement(selectedElement.id)
        }
      }
      // Arrow keys for movement
      if ((selectedElement || selectedElements.length > 0) && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const direction = {
          'ArrowUp': { x: 0, y: -step },
          'ArrowDown': { x: 0, y: step },
          'ArrowLeft': { x: -step, y: 0 },
          'ArrowRight': { x: step, y: 0 }
        }[e.key]
        
        if (selectedElements.length > 0) {
          moveMultipleElements(selectedElements.map(el => el.id), direction)
        } else if (selectedElement) {
          updateElement(selectedElement.id, {
            x: selectedElement.x + direction.x,
            y: selectedElement.y + direction.y
          })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElement, selectedElements, elements, undo, redo])

  const loadEditor = async () => {
    // Prevent multiple loads
    if (hasLoadedRef.current) {
      console.log('⏭️ Skipping load - already loaded')
      return
    }
    
    try {
      setLoading(true)
      hasLoadedRef.current = true // Mark as loaded
      
      const invitationId = searchParams.get('invitationId')
      const templateId = searchParams.get('template') // Legacy support

      console.log('🔍 Loading editor with:', { invitationId, templateId })

      // NEW FLOW: Load invitation by ID (Master-Instance pattern)
      if (invitationId) {
        console.log('📝 Loading invitation from API...')
        const res = await invitationService.getById(invitationId)
        console.log('✅ Loaded invitation:', res.data)
        
        // Check if this is an HTML template
        if (res.data.html_content || res.data.template_type === 'html') {
          console.log('🌐 This is an HTML template, redirecting to HTML editor...')
          toast.info('Đang chuyển sang HTML editor...')
          setTimeout(() => {
            navigate(`/html-editor?invitationId=${invitationId}`)
          }, 500)
          return
        }
        
        setInvitation(res.data)
        setFormData({
          title: res.data.title,
          groom_name: res.data.groom_name || '',
          bride_name: res.data.bride_name || '',
          event_date: res.data.event_date || '',
          event_location: res.data.event_location || '',
          event_address: res.data.event_address || '',
          music_url: res.data.music_url || '',
          music_autoplay: res.data.music_autoplay || false
        })
        
        if (res.data.design_data) {
          // Parse design_data if it's a string
          const designData = typeof res.data.design_data === 'string' 
            ? JSON.parse(res.data.design_data)
            : res.data.design_data
          
          const loadedElements = designData.elements || []
          const loadedCanvas = designData.canvas || canvasSettings
          
          // Load custom fonts if provided
          if (designData.fonts) {
            console.log('🔤 Loading custom fonts:', designData.fonts)
            setCustomFonts(designData.fonts)
          }
          
          // Load global styles if provided
          if (designData.globalStyles) {
            console.log('🎨 Loading global styles')
            setGlobalStyles(designData.globalStyles)
          }
          
          console.log('🎨 Setting canvas:', loadedCanvas)
          console.log('📋 Setting elements:', loadedElements.length, 'items')
          
          setElements(loadedElements)
          setCanvasSettings(loadedCanvas)
          
          if (loadedElements.length > 0) {
            setTimeout(() => {
              setHistory([loadedElements])
              setHistoryIndex(0)
            }, 100)
          }
        }
      } 
      // LEGACY FLOW: Load template (old behavior for backward compatibility)
      else if (templateId) {
        // Try to load from sessionStorage first (for premium templates)
        const storedTemplate = sessionStorage.getItem('selectedTemplate')
        console.log('📦 Stored template:', storedTemplate ? 'Found' : 'Not found')
        
        if (storedTemplate) {
          try {
            const templateData = JSON.parse(storedTemplate)
            console.log('✅ Loaded template from storage:', templateData.name)
            console.log('📐 Canvas settings:', templateData.designData?.canvas)
            console.log('📝 Elements count:', templateData.designData?.elements?.length)
            
            // Validate template data
            const validatedTemplate = validateTemplate(templateData)
            if (!validatedTemplate) {
              console.error('❌ Template validation failed')
              return
            }
            
            // Fix positions to fit within canvas
            const fixedTemplate = fixTemplatePositions(validatedTemplate)
            console.log('🔧 Fixed template positions')
            
            setTemplate(fixedTemplate)
            
            if (fixedTemplate.designData) {
              const loadedElements = fixedTemplate.designData.elements || []
              const loadedCanvas = fixedTemplate.designData.canvas || canvasSettings
              
              // Load custom fonts if provided
              if (fixedTemplate.designData.fonts) {
                console.log('🔤 Loading custom fonts:', fixedTemplate.designData.fonts)
                setCustomFonts(fixedTemplate.designData.fonts)
              }
              
              // Load global styles if provided
              if (fixedTemplate.designData.globalStyles) {
                console.log('🎨 Loading global styles')
                setGlobalStyles(fixedTemplate.designData.globalStyles)
              }
              
              console.log('🎨 Setting canvas:', loadedCanvas)
              console.log('📋 Setting elements:', loadedElements.length, 'items')
              console.log('🔍 First 3 elements:', loadedElements.slice(0, 3))
              
              // Set elements and canvas
              setElements(loadedElements)
              setCanvasSettings(loadedCanvas)
              
              console.log('✅ State updated - elements should render now')
              
              // Add to history after a short delay to ensure state is updated
              setTimeout(() => {
                if (loadedElements.length > 0) {
                  setHistory([loadedElements])
                  setHistoryIndex(0)
                  console.log('📚 History initialized')
                }
              }, 100)
            }
            
            // DON'T clear sessionStorage immediately - wait until component unmounts
            // This prevents issues with React StrictMode double-rendering
          } catch (e) {
            console.error('❌ Failed to parse stored template:', e)
          }
        } else {
          // Load from API
          console.log('🌐 Loading template from API...')
          try {
            const res = await templateService.getById(templateId)
            console.log('✅ Loaded template from API:', res.data)
            setTemplate(res.data)
            
            if (res.data.design_data) {
              // Parse design_data if it's a string
              const designData = typeof res.data.design_data === 'string' 
                ? JSON.parse(res.data.design_data)
                : res.data.design_data
              
              const loadedElements = designData.elements || []
              const loadedCanvas = designData.canvas || canvasSettings
              
              // Load custom fonts if provided
              if (designData.fonts) {
                console.log('🔤 Loading custom fonts:', designData.fonts)
                setCustomFonts(designData.fonts)
              }
              
              // Load global styles if provided
              if (designData.globalStyles) {
                console.log('🎨 Loading global styles')
                setGlobalStyles(designData.globalStyles)
              }
              
              setElements(loadedElements)
              setCanvasSettings(loadedCanvas)
              
              if (loadedElements.length > 0) {
                setTimeout(() => {
                  setHistory([loadedElements])
                  setHistoryIndex(0)
                }, 100)
              }
            }
          } catch (apiError) {
            console.error('❌ Failed to load template from API:', apiError)
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to load editor:', error)
    } finally {
      setLoading(false)
    }
  }

  // Clear sessionStorage when component unmounts
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('selectedTemplate')
    }
  }, [])

  // Debug: Log when elements change
  useEffect(() => {
    console.log('🔄 Elements state changed:', elements.length, 'items')
    if (elements.length > 0) {
      console.log('📝 Elements:', elements.map(e => ({ id: e.id, type: e.type, x: e.x, y: e.y })))
    }
  }, [elements])

  // Debug: Log when canvas settings change
  useEffect(() => {
    console.log('🎨 Canvas settings changed:', canvasSettings)
  }, [canvasSettings])

  const handleSave = async (publish = false) => {
    // Only save if we have an invitation (not a template)
    if (!invitation) {
      console.warn('⚠️ No invitation to save')
      return
    }

    try {
      setSaving(true)
      // IMPORTANT: canvas must come FIRST, then elements
      // Include fonts and globalStyles if they exist
      const designData = { 
        canvas: canvasSettings, 
        elements,
        ...(customFonts.length > 0 && { fonts: customFonts }),
        ...(globalStyles && { globalStyles })
      }
      const payload = {
        ...formData,
        design_data: designData,
        status: publish ? 'published' : 'draft'
      }

      console.log('💾 Saving invitation:', invitation.id)
      const response = await invitationService.update(invitation.id, payload)
      
      if (publish && response.data) {
        await invitationService.publish(response.data.id)
        toast.success('✅ Đã xuất bản thiệp mời!')
      } else {
        console.log('✅ Saved successfully')
      }
      
      setInvitation(response.data)
    } catch (error) {
      console.error('❌ Save failed:', error)
      toast.error('❌ Lưu thất bại! Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    setIsPreviewMode(true)
  }

  const handlePublish = async (publishData) => {
    if (!invitation) return

    try {
      setSaving(true)
      // IMPORTANT: canvas must come FIRST, then elements
      // Include fonts and globalStyles if they exist
      const designData = { 
        canvas: canvasSettings, 
        elements,
        ...(customFonts.length > 0 && { fonts: customFonts }),
        ...(globalStyles && { globalStyles })
      }
      const payload = {
        ...formData,
        ...publishData,
        design_data: designData,
        status: 'published'
      }

      console.log('📤 Publishing invitation:', invitation.id)
      const response = await invitationService.update(invitation.id, payload)
      await invitationService.publish(response.data.id)
      
      setInvitation(response.data)
      toast.success('🎉 Đã xuất bản thiệp mời thành công!')
      
      // Show public URL
      const publicUrl = `https://${publishData.slug}.yourdomain.com`
      setTimeout(() => {
        toast.info(`🔗 URL công khai: ${publicUrl}`)
      }, 1000)
    } catch (error) {
      console.error('❌ Publish failed:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!invitation) return // Only auto-save if we have an invitation
    
    const autoSaveInterval = setInterval(() => {
      console.log('🔄 Auto-saving...')
      handleSave(false)
    }, 30000) // 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [invitation, elements, canvasSettings, formData])

  // ESC key to exit preview mode
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isPreviewMode) {
        setIsPreviewMode(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isPreviewMode])


  const addTextElement = () => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: '', // Empty by default, will show placeholder
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      textDecoration: 'none',
      lineHeight: 1.2,
      letterSpacing: 0,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: elements.length
    }
    const newElements = [...elements, newElement]
    setElements(newElements)
    setSelectedElement(newElement)
    saveToHistory(newElements)
  }

  const addImageElement = async (file) => {
    try {
      // Use DataURL instead of uploading to server (temporary solution)
      const reader = new FileReader()
      reader.onload = (e) => {
        // Load image to get dimensions
        const img = new Image()
        img.onload = () => {
          const maxWidth = 300
          const maxHeight = 300
          let width = img.width
          let height = img.height
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = width * ratio
            height = height * ratio
          }
          
          const newElement = {
            id: `image-${Date.now()}`,
            type: 'image',
            url: e.target.result, // Use DataURL directly
            x: 50,
            y: 50,
            width,
            height,
            originalWidth: img.width,
            originalHeight: img.height,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            zIndex: elements.length,
            flipX: false,
            flipY: false,
            borderRadius: 0,
            filter: 'none'
          }
          const newElements = [...elements, newElement]
          setElements(newElements)
          setSelectedElement(newElement)
          saveToHistory(newElements)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Image load failed:', error)
      alert('Không thể tải ảnh! Vui lòng thử lại.')
    }
  }

  const addMusicElement = (musicData) => {
    const newElement = {
      id: `music-${Date.now()}`,
      type: 'music',
      title: musicData.title,
      artist: musicData.artist,
      duration: musicData.duration,
      url: musicData.url,
      x: 50,
      y: 50,
      width: 60,
      height: 60,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: elements.length,
      backgroundColor: '#e91e63',
      iconColor: '#ffffff',
      icon: 'music_note', // Default icon
      borderRadius: 30, // Circular by default
      showText: false // Don't show text on canvas
    }
    const newElements = [...elements, newElement]
    setElements(newElements)
    setSelectedElement(newElement)
    saveToHistory(newElements)
  }

  const addShapeElement = (shapeType) => {
    const newElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: '#e91e63',
      stroke: '#000000',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: elements.length,
      borderRadius: shapeType === 'rectangle' ? 0 : undefined
    }
    const newElements = [...elements, newElement]
    setElements(newElements)
    setSelectedElement(newElement)
    saveToHistory(newElements)
  }

  const updateElement = (id, updates, addToHistory = true) => {
    const newElements = elements.map(el => el.id === id ? { ...el, ...updates } : el)
    setElements(newElements)
    if (selectedElement?.id === id) {
      setSelectedElement({ ...selectedElement, ...updates })
    }
    if (addToHistory) {
      saveToHistory(newElements)
    }
  }

  const deleteElement = (id) => {
    const newElements = elements.filter(el => el.id !== id)
    setElements(newElements)
    if (selectedElement?.id === id) {
      setSelectedElement(null)
    }
    saveToHistory(newElements)
  }

  const duplicateElement = (id) => {
    const element = elements.find(el => el.id === id)
    if (!element) return
    
    const newElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: `${element.type}-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: elements.length
    }
    const newElements = [...elements, newElement]
    setElements(newElements)
    setSelectedElement(newElement)
    saveToHistory(newElements)
  }

  const toggleElementVisibility = (id) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, visible: !el.visible } : el
    )
    setElements(newElements)
    saveToHistory(newElements)
  }

  const toggleElementLock = (id) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, locked: !el.locked } : el
    )
    setElements(newElements)
    if (selectedElement?.id === id && newElements.find(el => el.id === id).locked) {
      setSelectedElement(null)
    }
    saveToHistory(newElements)
  }

  const moveElement = (id, direction) => {
    const element = elements.find(el => el.id === id)
    if (!element) return

    const step = 10
    const updates = {}
    
    if (direction === 'up') updates.y = element.y - step
    else if (direction === 'down') updates.y = element.y + step
    else if (direction === 'left') updates.x = element.x - step
    else if (direction === 'right') updates.x = element.x + step
    
    updateElement(id, updates)
  }

  const moveLayer = (id, direction) => {
    const index = elements.findIndex(el => el.id === id)
    if (index === -1) return

    const newElements = [...elements]
    
    if (direction === 'up' && index < elements.length - 1) {
      // Swap with next element
      [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]]
    } else if (direction === 'down' && index > 0) {
      // Swap with previous element
      [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]]
    } else if (direction === 'top') {
      // Move to top
      const element = newElements.splice(index, 1)[0]
      newElements.push(element)
    } else if (direction === 'bottom') {
      // Move to bottom
      const element = newElements.splice(index, 1)[0]
      newElements.unshift(element)
    }
    
    // Update z-index
    newElements.forEach((el, idx) => {
      el.zIndex = idx
    })
    
    setElements(newElements)
    saveToHistory(newElements)
  }

  // Multi-select functions
  const toggleElementSelection = (element, ctrlKey) => {
    if (element.locked) return
    
    if (ctrlKey) {
      // Add/remove from selection
      const isSelected = selectedElements.some(el => el.id === element.id)
      if (isSelected) {
        setSelectedElements(selectedElements.filter(el => el.id !== element.id))
      } else {
        setSelectedElements([...selectedElements, element])
      }
      setSelectedElement(null)
    } else {
      // Single select
      if (selectedElements.length > 0) {
        setSelectedElements([])
      }
      setSelectedElement(element)
    }
  }

  const deleteMultipleElements = (ids) => {
    const newElements = elements.filter(el => !ids.includes(el.id))
    setElements(newElements)
    setSelectedElements([])
    setSelectedElement(null)
    saveToHistory(newElements)
  }

  const duplicateMultipleElements = (ids) => {
    const elementsToDuplicate = elements.filter(el => ids.includes(el.id))
    const newElements = elementsToDuplicate.map(el => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `${el.type}-${Date.now()}-${Math.random()}`,
      x: el.x + 20,
      y: el.y + 20,
      zIndex: elements.length + elementsToDuplicate.indexOf(el)
    }))
    const updatedElements = [...elements, ...newElements]
    setElements(updatedElements)
    setSelectedElements(newElements)
    setSelectedElement(null)
    saveToHistory(updatedElements)
  }

  const moveMultipleElements = (ids, direction) => {
    const newElements = elements.map(el => {
      if (ids.includes(el.id)) {
        return {
          ...el,
          x: el.x + direction.x,
          y: el.y + direction.y
        }
      }
      return el
    })
    setElements(newElements)
    setSelectedElements(selectedElements.map(el => ({
      ...el,
      x: el.x + direction.x,
      y: el.y + direction.y
    })))
  }

  // Alignment functions
  const alignElements = (alignType) => {
    if (selectedElements.length < 2) return

    const newElements = [...elements]
    const selectedIds = selectedElements.map(el => el.id)
    
    // Calculate bounds
    const bounds = {
      left: Math.min(...selectedElements.map(el => el.x)),
      right: Math.max(...selectedElements.map(el => el.x + (el.width || 0))),
      top: Math.min(...selectedElements.map(el => el.y)),
      bottom: Math.max(...selectedElements.map(el => el.y + (el.height || 0))),
      centerX: 0,
      centerY: 0
    }
    bounds.centerX = (bounds.left + bounds.right) / 2
    bounds.centerY = (bounds.top + bounds.bottom) / 2

    newElements.forEach(el => {
      if (selectedIds.includes(el.id)) {
        switch (alignType) {
          case 'left':
            el.x = bounds.left
            break
          case 'center':
            el.x = bounds.centerX - (el.width || 0) / 2
            break
          case 'right':
            el.x = bounds.right - (el.width || 0)
            break
          case 'top':
            el.y = bounds.top
            break
          case 'middle':
            el.y = bounds.centerY - (el.height || 0) / 2
            break
          case 'bottom':
            el.y = bounds.bottom - (el.height || 0)
            break
        }
      }
    })

    setElements(newElements)
    setSelectedElements(newElements.filter(el => selectedIds.includes(el.id)))
    saveToHistory(newElements)
  }

  const distributeElements = (distributeType) => {
    if (selectedElements.length < 3) return

    const newElements = [...elements]
    const selectedIds = selectedElements.map(el => el.id)
    const sorted = [...selectedElements]

    if (distributeType === 'horizontal') {
      sorted.sort((a, b) => a.x - b.x)
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      const totalSpace = (last.x + (last.width || 0)) - first.x
      const elementsTotalWidth = sorted.reduce((sum, el) => sum + (el.width || 0), 0)
      const gap = (totalSpace - elementsTotalWidth) / (sorted.length - 1)
      
      let currentX = first.x + (first.width || 0) + gap
      for (let i = 1; i < sorted.length - 1; i++) {
        const el = newElements.find(e => e.id === sorted[i].id)
        if (el) {
          el.x = currentX
          currentX += (el.width || 0) + gap
        }
      }
    } else if (distributeType === 'vertical') {
      sorted.sort((a, b) => a.y - b.y)
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      const totalSpace = (last.y + (last.height || 0)) - first.y
      const elementsTotalHeight = sorted.reduce((sum, el) => sum + (el.height || 0), 0)
      const gap = (totalSpace - elementsTotalHeight) / (sorted.length - 1)
      
      let currentY = first.y + (first.height || 0) + gap
      for (let i = 1; i < sorted.length - 1; i++) {
        const el = newElements.find(e => e.id === sorted[i].id)
        if (el) {
          el.y = currentY
          currentY += (el.height || 0) + gap
        }
      }
    }

    setElements(newElements)
    setSelectedElements(newElements.filter(el => selectedIds.includes(el.id)))
    saveToHistory(newElements)
  }

  // Grouping functions
  const groupElements = (ids) => {
    if (ids.length < 2) return

    const elementsToGroup = elements.filter(el => ids.includes(el.id))
    const bounds = {
      left: Math.min(...elementsToGroup.map(el => el.x)),
      top: Math.min(...elementsToGroup.map(el => el.y)),
      right: Math.max(...elementsToGroup.map(el => el.x + (el.width || 0))),
      bottom: Math.max(...elementsToGroup.map(el => el.y + (el.height || 0)))
    }

    const group = {
      id: `group-${Date.now()}`,
      type: 'group',
      x: bounds.left,
      y: bounds.top,
      width: bounds.right - bounds.left,
      height: bounds.bottom - bounds.top,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: Math.max(...elementsToGroup.map(el => el.zIndex || 0)),
      children: elementsToGroup.map(el => ({
        ...el,
        x: el.x - bounds.left,
        y: el.y - bounds.top
      }))
    }

    const newElements = elements.filter(el => !ids.includes(el.id))
    newElements.push(group)
    
    setElements(newElements)
    setSelectedElements([])
    setSelectedElement(group)
    saveToHistory(newElements)
  }

  const ungroupElement = (groupId) => {
    const group = elements.find(el => el.id === groupId && el.type === 'group')
    if (!group) return

    const ungroupedElements = group.children.map(el => ({
      ...el,
      x: el.x + group.x,
      y: el.y + group.y,
      zIndex: group.zIndex
    }))

    const newElements = elements.filter(el => el.id !== groupId)
    newElements.push(...ungroupedElements)
    
    setElements(newElements)
    setSelectedElements(ungroupedElements)
    setSelectedElement(null)
    saveToHistory(newElements)
  }

  // Smart guides
  const calculateSmartGuides = (movingElement) => {
    const guides = []
    const threshold = 5
    const otherElements = elements.filter(el => el.id !== movingElement.id && el.visible)

    otherElements.forEach(el => {
      // Vertical alignment
      if (Math.abs(el.x - movingElement.x) < threshold) {
        guides.push({ type: 'vertical', position: el.x, label: 'Left' })
      }
      if (Math.abs((el.x + (el.width || 0) / 2) - (movingElement.x + (movingElement.width || 0) / 2)) < threshold) {
        guides.push({ type: 'vertical', position: el.x + (el.width || 0) / 2, label: 'Center' })
      }
      if (Math.abs((el.x + (el.width || 0)) - (movingElement.x + (movingElement.width || 0))) < threshold) {
        guides.push({ type: 'vertical', position: el.x + (el.width || 0), label: 'Right' })
      }

      // Horizontal alignment
      if (Math.abs(el.y - movingElement.y) < threshold) {
        guides.push({ type: 'horizontal', position: el.y, label: 'Top' })
      }
      if (Math.abs((el.y + (el.height || 0) / 2) - (movingElement.y + (movingElement.height || 0) / 2)) < threshold) {
        guides.push({ type: 'horizontal', position: el.y + (el.height || 0) / 2, label: 'Middle' })
      }
      if (Math.abs((el.y + (el.height || 0)) - (movingElement.y + (movingElement.height || 0))) < threshold) {
        guides.push({ type: 'horizontal', position: el.y + (el.height || 0), label: 'Bottom' })
      }
    })

    // Canvas center guides
    if (Math.abs((canvasSettings.width / 2) - (movingElement.x + (movingElement.width || 0) / 2)) < threshold) {
      guides.push({ type: 'vertical', position: canvasSettings.width / 2, label: 'Canvas Center' })
    }
    if (Math.abs((canvasSettings.height / 2) - (movingElement.y + (movingElement.height || 0) / 2)) < threshold) {
      guides.push({ type: 'horizontal', position: canvasSettings.height / 2, label: 'Canvas Center' })
    }

    setSmartGuides(guides)
  }

  // Page management functions
  const addPage = () => {
    const newPages = canvasSettings.pages + 1
    setCanvasSettings({
      ...canvasSettings,
      pages: newPages,
      height: 630 * newPages
    })
  }

  const removePage = () => {
    if (canvasSettings.pages > 1) {
      const newPages = canvasSettings.pages - 1
      setCanvasSettings({
        ...canvasSettings,
        pages: newPages,
        height: 630 * newPages
      })
    }
  }

  const scrollToPage = (pageIndex) => {
    if (containerRef.current) {
      const pageHeight = 630
      const targetY = pageHeight * pageIndex
      containerRef.current.scrollTo({
        top: targetY,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Đang tải editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 h-screen flex flex-col overflow-hidden">
      {/* Preview Mode Overlay */}
      {isPreviewMode && (
        <div className="fixed inset-0 z-[9998] bg-gray-100 dark:bg-gray-900 flex flex-col">
          {/* Preview Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white">visibility</span>
              </div>
              <div>
                <h2 className="text-gray-900 dark:text-white font-bold text-lg">Xem Trước</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Nhấn ESC để thoát</p>
              </div>
            </div>
            <button
              onClick={() => setIsPreviewMode(false)}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">close</span>
              Đóng
            </button>
          </div>
          
          {/* Preview Canvas - Normal Scroll */}
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-8">
            <div className="flex justify-center">
              <div 
                style={{
                  width: `${canvasSettings.width}px`,
                  minHeight: `${canvasSettings.height}px`,
                  background: canvasSettings.background,
                  backgroundImage: canvasSettings.backgroundImage ? `url(${canvasSettings.backgroundImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                className="shadow-2xl relative border border-gray-300 dark:border-gray-700"
              >
                {elements
                  .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                  .map(element => {
                    if (!element.visible) return null
                    
                    return (
                      <div
                        key={element.id}
                        style={{
                          position: 'absolute',
                          left: `${element.x}px`,
                          top: `${element.y}px`,
                          width: element.width ? `${element.width}px` : 'auto',
                          height: element.height ? `${element.height}px` : 'auto',
                          transform: `rotate(${element.rotation || 0}deg)`,
                          opacity: element.opacity || 1,
                          zIndex: element.zIndex || 0,
                          pointerEvents: 'none'
                        }}
                      >
                        {/* Text Element */}
                        {element.type === 'text' && (
                          <div
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
                              textShadow: element.textShadow,
                              WebkitTextStroke: element.stroke ? `${element.strokeWidth}px ${element.strokeColor}` : 'none',
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}
                          >
                            {element.content || 'Text'}
                          </div>
                        )}

                        {/* Image Element */}
                        {element.type === 'image' && (
                          <img
                            src={element.url}
                            alt=""
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: `${element.borderRadius || 0}px`,
                              border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
                              boxShadow: element.boxShadow,
                              filter: element.filter,
                              transform: `scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`
                            }}
                          />
                        )}

                        {/* Shape Element */}
                        {element.type === 'shape' && (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: element.fill,
                              border: element.stroke ? `${element.strokeWidth}px solid ${element.stroke}` : 'none',
                              borderRadius: element.shapeType === 'circle' ? '50%' : `${element.borderRadius || 0}px`,
                              boxShadow: element.boxShadow
                            }}
                          />
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <PublishModal
          invitation={invitation}
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublish}
        />
      )}

      <EditorHeader 
        formData={formData}
        invitation={invitation}
        saving={saving}
        onSave={handleSave}
        onBack={() => navigate('/management')}
        onPreview={handlePreview}
        onPublish={() => setShowPublishModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftToolbar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddText={addTextElement}
        />

        {/* Slide-out panels next to sidebar */}
        {activeTab === 'image' && (
          <div className="animate-slide-in-left">
            <ImageUploadPanel
              onAddImage={addImageElement}
              onClose={() => setActiveTab('text')}
            />
          </div>
        )}
        
        {activeTab === 'sticker' && (
          <div className="animate-slide-in-left">
            <StockPanel
              onAddImage={addImageElement}
              onClose={() => setActiveTab('text')}
            />
          </div>
        )}

        {activeTab === 'background' && (
          <div className="animate-slide-in-left">
            <BackgroundPanel
              canvasSettings={canvasSettings}
              setCanvasSettings={setCanvasSettings}
              onClose={() => setActiveTab('text')}
            />
          </div>
        )}

        {activeTab === 'music' && (
          <div className="animate-slide-in-left">
            <MusicPanel
              formData={formData}
              setFormData={setFormData}
              onAddMusic={addMusicElement}
              onClose={() => setActiveTab('text')}
            />
          </div>
        )}

        {activeTab === 'template' && (
          <div className="animate-slide-in-left">
            <UtilitiesPanel
              onClose={() => setActiveTab('text')}
            />
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="animate-slide-in-left">
            <EffectsPanel
              selectedElement={selectedElement}
              updateElement={updateElement}
              onClose={() => setActiveTab('text')}
            />
          </div>
        )}

        <CanvasArea
          canvasRef={canvasRef}
          containerRef={containerRef}
          canvasSettings={canvasSettings}
          setCanvasSettings={setCanvasSettings}
          elements={elements}
          selectedElement={selectedElement}
          selectedElements={selectedElements}
          setSelectedElement={setSelectedElement}
          toggleElementSelection={toggleElementSelection}
          updateElement={updateElement}
          deleteElement={deleteElement}
          duplicateElement={duplicateElement}
          undo={undo}
          redo={redo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          smartGuides={smartGuides}
          setSmartGuides={setSmartGuides}
          calculateSmartGuides={calculateSmartGuides}
        />

        <AlignmentTools
          selectedElements={selectedElements}
          onAlign={alignElements}
          onDistribute={distributeElements}
        />

        {activeTab === 'layers' ? (
          <aside className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shrink-0 z-10 overflow-y-auto">
            <LayerPanel
              elements={elements}
              selectedElement={selectedElement}
              onSelect={setSelectedElement}
              onDelete={deleteElement}
              onToggleVisibility={toggleElementVisibility}
              onToggleLock={toggleElementLock}
              onMoveLayer={moveLayer}
            />
          </aside>
        ) : (
          <PropertiesPanel
            selectedElement={selectedElement}
            updateElement={updateElement}
            deleteElement={deleteElement}
            duplicateElement={duplicateElement}
            moveLayer={moveLayer}
            formData={formData}
            setFormData={setFormData}
            canvasSettings={canvasSettings}
            setCanvasSettings={setCanvasSettings}
          />
        )}
      </div>
    </div>
  )
}

export default EditorPage
