
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import invitationService from '../services/invitation.service'
import authService from '../services/auth.service'
import { useToast } from '../context/ToastContext'
import mediaService from '../services/media.service'
import MediaLibraryModal from '../components/MediaLibraryModal'


// Custom debounce hook for smooth preview
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const UltimateHtmlEditorPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [selectedImageId, setSelectedImageId] = useState(null)

  // Mobile Responsive State
  const [activeMobileTab, setActiveMobileTab] = useState('preview')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // HISTORY MANAGEMENT
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const isUndoRedoAction = useRef(false) // Flag to prevent pushing history during undo/redo

  const [htmlCode, setHtmlCode] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [imageData, setImageData] = useState({})
  const [customFieldData, setCustomFieldData] = useState({})

  const [formData, setFormData] = useState({
    title: '',
    groom_name: '',
    bride_name: '',
    event_date: '',
    event_time: '14:00',
    event_location: '',
    event_address: '',
    music_url: '',
    music_autoplay: true,
    slug: '', // Use slug instead of subdomain
    visibility: 'private' // Add visibility field (public/private/password)
  })

  // Debounce Hooks
  const debouncedFormData = useDebounce(formData, 500)
  const debouncedImageData = useDebounce(imageData, 500)
  const debouncedCustomFieldData = useDebounce(customFieldData, 500)

  // Push to history when state stabilizes
  useEffect(() => {
    // Skip if this effect update was caused by undo/redo itself
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false
      return
    }

    // Initial Load Guard
    if (!invitation) return

    const currentState = {
      formData: debouncedFormData,
      imageData: debouncedImageData,
      customFieldData: debouncedCustomFieldData
    }

    // Get current head
    const currentHead = history[historyIndex]

    // Only push if different (JSON compare is safe here)
    if (JSON.stringify(currentHead) !== JSON.stringify(currentState)) {
      console.log("📸 Saving History Snapshot", historyIndex + 1)
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(currentState)

      // Limit history size to 50
      if (newHistory.length > 50) newHistory.shift()

      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [debouncedFormData, debouncedImageData, debouncedCustomFieldData, invitation])

  const performUndo = useCallback(() => {
    if (historyIndex > 0) {
      console.log("↺ Undoing...")
      isUndoRedoAction.current = true // Set flag to ignore next debounce update
      const prevState = history[historyIndex - 1]
      setHistoryIndex(prev => prev - 1)

      setFormData(prevState.formData)
      setImageData(prevState.imageData)
      setCustomFieldData(prevState.customFieldData)

      // Force Iframe Refresh
      if (lastRenderedHtmlRef.current) lastRenderedHtmlRef.current = ''
    }
  }, [history, historyIndex])

  const performRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      console.log("↻ Redoing...")
      isUndoRedoAction.current = true
      const nextState = history[historyIndex + 1]
      setHistoryIndex(prev => prev + 1)

      setFormData(nextState.formData)
      setImageData(nextState.imageData)
      setCustomFieldData(nextState.customFieldData)

      // Force Iframe Refresh
      if (lastRenderedHtmlRef.current) lastRenderedHtmlRef.current = ''
    }
  }, [history, historyIndex])

  // Keyboard Shortcuts (Main Window)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          performRedo()
        } else {
          performUndo()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        performRedo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [performUndo, performRedo])

  // Ref for preview iframe
  const iframeRef = useRef(null)
  const lastRenderedHtmlRef = useRef('')

  // WYSIWYG Editor - Direct Edit Only (No Drag & Drop)
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !previewHtml) return

    const doc = iframe.contentDocument || iframe.contentWindow.document
    const win = iframe.contentWindow
    if (!doc || !win) return

    // 1. Check if user is currently editing (User Interaction Shield)
    // If they are typing, we DO NOT want to re-render the iframe, 
    // because that would kill their focus and cursor position.
    // The visual update will happen naturally when they Blur/Click away.
    if (doc.activeElement &&
      (doc.activeElement.getAttribute('contenteditable') === 'true' ||
        doc.activeElement.tagName === 'INPUT' ||
        doc.activeElement.tagName === 'TEXTAREA')) {
      // Only skip if the content is functionally different to avoid stale locks?
      // Ideally we just skip. The user is "busy".
      return
    }

    // 2. Diff Check: Don't re-render if content is identical
    if (previewHtml === lastRenderedHtmlRef.current) {
      return
    }

    // 3. Render Procedure
    const scrollX = win.scrollX || 0
    const scrollY = win.scrollY || 0

    doc.open()
    doc.write(previewHtml)
    doc.close()

    // Update Ref
    lastRenderedHtmlRef.current = previewHtml

    // Define functions first (before calling them)
    const injectViewportAndStyles = () => {
      // Inject viewport meta tag if not exists
      const injectViewport = () => {
        if (doc.querySelector('meta[name="viewport"]')) return; // Already exists
        const viewport = doc.createElement('meta')
        viewport.name = 'viewport'
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
        doc.head.insertBefore(viewport, doc.head.firstChild)
      }

      injectViewport()

      const injectStyles = () => {
        if (doc.getElementById('editor-styles')) return; // Already exists
        const style = doc.createElement('style')
        style.id = 'editor-styles'
        style.textContent = `
            /* Ensure iframe content is fully visible */
            html, body {
              width: 100% !important;
              min-height: 100vh !important;
              overflow-x: hidden !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            /* Fix for templates with fixed height containers */
            body > div:first-child,
            body > section:first-child,
            #root,
            #app,
            #__next,
            .app,
            .container-fluid,
            [class*="container"] {
              width: 100% !important;
              min-height: auto !important;
              height: auto !important;
              max-width: 100% !important;
              transform: none !important;
              scale: 1 !important;
            }

            /* Unset specific height constraints that might clip content */
            [class*="h-[calc(100vh"],
            [class*="min-h-screen"],
            [class*="h-screen"] {
              height: auto !important;
              min-height: 100vh !important;
              overflow: visible !important;
            }
            
            /* Remove any transform/scale that might shrink content */
            * {
              transform: none !important;
              scale: 1 !important;
            }
            
            /* Ensure all sections are visible */
            section, div[class*="section"] {
              width: 100% !important;
              min-height: auto !important;
            }
            
            [data-editable] {
              cursor: text !important;
              outline: 1px dashed transparent;
            }
            [data-editable]:hover {
              outline: 2px dashed #a855f7 !important;
              background: rgba(168, 85, 247, 0.05);
            }
            [data-editable]:focus {
              outline: 2px solid #f59e0b !important;
              background: rgba(251, 191, 36, 0.05);
            }
          `
        doc.head.appendChild(style)
      }

      injectStyles()

      // Force layout recalculation for React-based templates
      if (doc.body) {
        // Remove any inline styles that might constrain size
        doc.body.style.width = '100%'
        doc.body.style.minHeight = '100vh'
        doc.body.style.height = 'auto'

        // Find and fix root containers
        const rootContainers = doc.querySelectorAll('#root, #app, #__next, .app, [class*="App"], body > div:first-child')
        rootContainers.forEach(el => {
          el.style.width = '100%'
          el.style.minHeight = '100vh'
          el.style.height = 'auto'
          el.style.transform = 'none'
          el.style.scale = '1'
        })
      }
    }

    const setupEventListeners = () => {
      const observer = new MutationObserver((mutations) => {
        if (!doc.getElementById('editor-styles')) {
          console.log(' styles lost, re-injecting...')
          const injectStyles = () => {
            if (doc.getElementById('editor-styles')) return;
            const style = doc.createElement('style')
            style.id = 'editor-styles'
            style.textContent = `
              [data-editable] { cursor: text !important; outline: 1px dashed transparent; }
              [data-editable]:hover { outline: 2px dashed #a855f7 !important; background: rgba(168, 85, 247, 0.05); }
              [data-editable]:focus { outline: 2px solid #f59e0b !important; background: rgba(251, 191, 36, 0.05); }
            `
            doc.head.appendChild(style)
          }
          injectStyles()
        }
      })
      observer.observe(doc.head, { childList: true })

      // EVENT DELEGATION: Listen on Body to handle dynamic DOM replacements
      const handleInteraction = (e) => {
        const el = e.target.closest('[data-editable]')
        if (!el) return

        const fieldId = el.getAttribute('data-editable')

        if (e.type === 'click' || e.type === 'dblclick') {
          e.stopPropagation()
          if (el.contentEditable !== 'true') {
            e.preventDefault()
            el.contentEditable = 'true'
            el.focus()
            console.log(`Activated edit for: ${fieldId} (via ${e.type})`)

            window.parent.postMessage({
              type: 'FOCUS_FIELD',
              id: fieldId
            }, '*');
          }
        }

        if (e.type === 'focusout' || e.type === 'blur') {
          if (el.isContentEditable) {
            el.contentEditable = 'false'
            const newContent = el.innerText
            setCustomFieldData(prev => ({ ...prev, [fieldId]: newContent }))
          }
        }
      }

      doc.body.removeEventListener('click', handleInteraction)
      doc.body.removeEventListener('dblclick', handleInteraction)
      doc.body.removeEventListener('focusout', handleInteraction)

      doc.body.addEventListener('click', handleInteraction)
      doc.body.addEventListener('dblclick', handleInteraction)
      doc.body.addEventListener('focusout', handleInteraction)

      // Global Key Listener for Undo/Redo inside Iframe
      doc.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y')) {
          e.preventDefault();
          window.parent.postMessage({
            type: 'KEY_COMMAND',
            key: e.key,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            shiftKey: e.shiftKey
          }, '*');
        }
      });
    };

    // Wait for DOM to be fully loaded before injecting styles
    const waitForBody = () => {
      if (!doc || !doc.body) {
        setTimeout(waitForBody, 10)
        return
      }

      // Inject styles & listeners after body is ready
      try {
        injectViewportAndStyles()
        setupEventListeners()
      } catch (error) {
        console.warn('Failed to setup iframe:', error)
      }
    }

    waitForBody()


    // Restore Scroll
    try {
      if (scrollX || scrollY) {
        setTimeout(() => {
          if (win && typeof win.scrollTo === 'function') {
            win.scrollTo(scrollX, scrollY)
          }
        }, 50)
      }
    } catch (e) {
      console.warn('Could not restore scroll position:', e)
    }

  }, [previewHtml]);


  // (Removed Duplicate State Declarations - They are now moved to top for history access)

  // Function to scroll preview to specific field
  const scrollPreviewToField = useCallback((fieldName) => {
    if (!iframeRef.current) return

    try {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document
      if (!iframeDoc) return

      let element = null

      // 1. Try predefined selector map
      const selectorMap = {
        'title': '[data-field="title"], h1, .title',
        'groom_name': '[data-field="groom_name"], .groom-name, .groom',
        'bride_name': '[data-field="bride_name"], .bride-name, .bride',
        'event_date': '[data-field="event_date"], .event-date, .date',
        'event_time': '[data-field="event_time"], .event-time, .time',
        'event_location': '[data-field="event_location"], .event-location, .location',
        'event_address': '[data-field="event_address"], .event-address, .address'
      }

      if (selectorMap[fieldName]) {
        const selectors = selectorMap[fieldName].split(', ')
        for (const sel of selectors) {
          element = iframeDoc.querySelector(sel)
          if (element) break
        }
      }

      // 2. If not found, try data-editable attribute (Generated by Mapper Tool)
      if (!element) {
        element = iframeDoc.querySelector(`[data-editable="${fieldName}"]`)
      }

      // 3. Try data-image-editable attribute
      if (!element) {
        element = iframeDoc.querySelector(`[data-image-editable="${fieldName}"]`)
      }

      // 4. Try scanning for ID match (Direct match or case-insensitive)
      if (!element) {
        element = iframeDoc.getElementById(fieldName)
      }

      // 5. Try partial ID match or class match for images
      if (!element) {
        // Try finding any element that might relate to this ID
        // e.g. fieldName="image_1" -> id="IMAGE1" or id="image1"
        const normalizedId = fieldName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
        const allElements = iframeDoc.querySelectorAll('[id]')
        for (let el of allElements) {
          const elId = el.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
          if (elId === normalizedId) {
            element = el
            break
          }
        }
      }

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })

        // Add highlight effect
        const originalTransition = element.style.transition
        const originalOutline = element.style.outline
        const originalBoxShadow = element.style.boxShadow
        const originalTransform = element.style.transform

        element.style.transition = 'all 0.5s ease'
        element.style.outline = '4px solid #f59e0b'
        element.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.5)'
        element.style.transform = 'scale(1.02)'
        element.style.zIndex = '9999'
        element.style.position = 'relative'

        setTimeout(() => {
          element.style.outline = originalOutline
          element.style.boxShadow = originalBoxShadow
          element.style.transform = originalTransform
          element.style.zIndex = ''
          element.style.position = ''

          setTimeout(() => {
            element.style.transition = originalTransition
          }, 500)
        }, 1500)
      }
    } catch (error) {
      console.log('Could not scroll preview:', error)
    }
  }, [])

  // Phân tích template using DOMParser for accuracy
  const templateAnalysis = useMemo(() => {
    if (!htmlCode) return { placeholders: [], images: [], customFields: [] }

    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlCode, 'text/html')

    // 1. Text Placeholders (Regex is still best for {{mustache}})
    const placeholderRegex = /\{\{([a-z_]+)\}\}/gi
    const matches = [...htmlCode.matchAll(placeholderRegex)]
    const placeholders = [...new Set(matches.map(m => m[1]))]

    // 2. Images Analysis
    const imageMap = new Map() // Use Map to prevent duplicates

    // 2a. Scan images with data-editable
    const editableImgs = doc.querySelectorAll('img[data-editable]')
    editableImgs.forEach((img, idx) => {
      const id = img.getAttribute('data-editable')
      imageMap.set(id, {
        id: id,
        originalSrc: img.getAttribute('src') || '',
        currentSrc: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || id.replace(/_/g, ' '),
        className: img.className || '',
        type: 'img',
        isManaged: true
      })
    })

    // 2b. PRE-SCAN CSS: Identify background images defined in style blocks
    // This allows us to link elements with data-image-editable to their CSS-defined URLs
    const cssBgMap = {}
    const styleTags = doc.querySelectorAll('style')
    styleTags.forEach(style => {
      const cssContent = style.innerHTML
      // Regex to find #IMAGE... defined in CSS with a background image
      const ladiRegex = /#(IMAGE\w+)[^{]*\{[\s\S]*?background(?:-image)?:\s*url\(['"]?([^'"\)]+)['"]?\)/gi
      let match
      while ((match = ladiRegex.exec(cssContent)) !== null) {
        const id = match[1]
        const url = match[2]
        if (url.startsWith('data:') || url.startsWith('chrome-extension:')) continue

        const element = doc.getElementById(id);
        if (!element || !element.hasAttribute('data-image-editable')) {
          continue; // Skip if element doesn't exist or isn't editable
        }
        cssBgMap[id] = url
      }
    })

    // 2c. Scan background images with data-image-editable (Managed Backgrounds)
    const bgEditableEls = doc.querySelectorAll('[data-image-editable]')
    bgEditableEls.forEach((el) => {
      // IGNORE invalid tags and extension junk
      if (['style', 'script', 'head', 'meta', 'link', 'title'].includes(el.tagName.toLowerCase())) return
      if (el.id && (el.id.includes('eJOY') || el.id.includes('extension'))) return

      const attrId = el.getAttribute('data-image-editable')

      // Filter out SECTION elements to avoid duplicates
      if (attrId.toUpperCase().includes('SECTION')) return

      let bgUrl = ''

      // Try 1: Ladipage element (Inline Style override)
      const isLadipage = el.classList.contains('ladi-element') || el.querySelector('.ladi-image-background') !== null
      if (isLadipage) {
        const bgChild = el.querySelector('.ladi-image-background')
        if (bgChild && bgChild.style.backgroundImage) {
          const match = bgChild.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)
          if (match) bgUrl = match[1]
        }
      }

      // Try 2: Standard Inline Style
      if (!bgUrl && el.style.backgroundImage) {
        const match = el.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)
        if (match) bgUrl = match[1]
      }

      // Try 3: Fallback to CSS Pre-scan
      // This bridges the gap where an element has data-image-editable but its image is in CSS
      if (!bgUrl && el.id && cssBgMap[el.id]) {
        bgUrl = cssBgMap[el.id]
        // Mark as consumed so we don't add it again in step 2d
        delete cssBgMap[el.id]
      }

      // CRITICAL: If element has data-image-editable, ALWAYS add it to the list
      // Even if no URL is found yet - user should be able to upload an image for it
      // Use empty string as placeholder if no URL found
      if (!bgUrl) {
        bgUrl = '' // Empty placeholder - will be replaced when user uploads
      }

      // Use the Custom Name (attrId) as the key
      imageMap.set(attrId, {
        id: attrId,
        htmlId: el.id, // Store HTML ID for DOM lookup
        originalSrc: bgUrl,
        currentSrc: bgUrl,
        alt: attrId.replace(/_/g, ' '),
        className: el.className || '',
        type: isLadipage ? 'ladi-background' : 'background',
        isManaged: true
      })
    })



    // 2d. Add remaining CSS images that weren't managed (didn't have data-image-editable)
    Object.keys(cssBgMap).forEach(id => {
      const url = cssBgMap[id]
      if (!imageMap.has(id)) {
        imageMap.set(id, {
          id: id,
          originalSrc: url,
          currentSrc: url,
          alt: 'Ladipage Image ' + id,
          className: 'ladi-image-element',
          type: 'ladi-background',
          isManaged: false
        })
      }
    })

    // 2d. ENHANCED: Scan ALL img tags and auto-detect editable images
    const allImgs = doc.querySelectorAll('img')
    allImgs.forEach((img, idx) => {
      // Skip if already captured via data-editable
      if (img.hasAttribute('data-editable')) return

      // FILTER JUNK IMAGES
      const src = img.getAttribute('src') || ''
      if (!src || src.startsWith('data:') || src.startsWith('chrome-extension:') || src.includes('extension')) return
      if (img.id && img.id.includes('eJOY')) return
      if (img.className && typeof img.className === 'string' && img.className.includes('extension')) return

      // Skip very small images (likely icons or decorations)
      if (img.width && img.height && (img.width < 50 || img.height < 50)) return

      // Generate an ID if not present
      let id = img.id || ''
      if (!id) {
        // Try to derive from class
        if (img.className && typeof img.className === 'string') {
          const classList = img.className.split(' ')
          id = classList.find(cls => cls.match(/^[a-zA-Z]/)) || classList[0]
        }
        // Try to derive from alt
        if (!id && img.alt) id = img.alt.replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase()
        // Try to derive from src filename
        if (!id && src) {
          const filename = src.split('/').pop().split('.')[0]
          if (filename && filename.length > 0) id = filename
        }
        // Fallback to index
        if (!id) id = `image_${idx + 1}`
      }

      // Clean up ID
      id = id.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()

      // Ensure ID is unique
      let originalId = id
      let counter = 1
      while (imageMap.has(id)) {
        id = `${originalId}_${counter}`
        counter++
      }

      // Auto-add data-editable attribute for future reference
      img.setAttribute('data-editable', id)

      imageMap.set(id, {
        id: id,
        originalSrc: src,
        currentSrc: src,
        alt: img.getAttribute('alt') || `Ảnh ${idx + 1}`,
        className: img.className || '',
        index: idx, // Keep index for fallback replacement
        type: 'img',
        isManaged: true, // Now managed after auto-detection
        autoDetected: true // Flag to indicate this was auto-detected
      })
    })

    // 2e. ENHANCED: Auto-detect background images in CSS without data-image-editable
    const allElements = doc.querySelectorAll('*')
    allElements.forEach((el, idx) => {
      // Skip if already processed or invalid
      if (el.hasAttribute('data-image-editable')) return
      if (['style', 'script', 'head', 'meta', 'link', 'title', 'img'].includes(el.tagName.toLowerCase())) return
      if (el.id && (el.id.includes('eJOY') || el.id.includes('extension'))) return

      // Check for background image in inline style
      let bgUrl = ''
      if (el.style.backgroundImage) {
        const match = el.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)
        if (match) {
          bgUrl = match[1]
          if (bgUrl.startsWith('data:') || bgUrl.startsWith('chrome-extension:')) return
        }
      }

      // Check computed style for background image
      if (!bgUrl && window.getComputedStyle) {
        try {
          const computedStyle = window.getComputedStyle(el)
          if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
            const match = computedStyle.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)
            if (match) {
              bgUrl = match[1]
              if (bgUrl.startsWith('data:') || bgUrl.startsWith('chrome-extension:')) return
            }
          }
        } catch (e) {
          // Ignore computed style errors
        }
      }

      if (bgUrl) {
        // Generate ID for background image
        let id = el.id || ''
        if (!id) {
          if (el.className && typeof el.className === 'string') {
            const classList = el.className.split(' ')
            id = classList.find(cls => cls.match(/^[a-zA-Z]/)) || classList[0]
          }
          if (!id) {
            const filename = bgUrl.split('/').pop().split('.')[0]
            if (filename && filename.length > 0) id = `bg_${filename}`
          }
          if (!id) id = `background_${idx + 1}`
        }

        // Clean up ID
        id = id.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()

        // Ensure ID is unique
        let originalId = id
        let counter = 1
        while (imageMap.has(id)) {
          id = `${originalId}_${counter}`
          counter++
        }

        // Auto-add data-image-editable attribute
        el.setAttribute('data-image-editable', id)

        const isLadipage = el.classList.contains('ladi-element') || el.querySelector('.ladi-image-background') !== null

        imageMap.set(id, {
          id: id,
          htmlId: el.id,
          originalSrc: bgUrl,
          currentSrc: bgUrl,
          alt: id.replace(/_/g, ' '),
          className: el.className || '',
          type: isLadipage ? 'ladi-background' : 'background',
          isManaged: true,
          autoDetected: true
        })
      }
    })
    //   if (img.className && typeof img.className === 'string' && img.className.includes('extension')) return

    //   // Generate an ID if not present
    //   let id = img.id || ''
    //   if (!id) {
    //     // Try to derive from class
    //     if (img.className && typeof img.className === 'string') id = img.className.split(' ')[0]
    //     // Try to derive from alt
    //     if (!id && img.alt) id = img.alt.replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase()
    //     // Fallback to index
    //     if (!id) id = `image_auto_${idx + 1}`
    //   }

    //   // Ensure ID is unique
    //   let originalId = id
    //   let counter = 1
    //   while (imageMap.has(id)) {
    //     id = `${originalId}_${counter}`
    //     counter++
    //   }

    //   imageMap.set(id, {
    //     id: id,
    //     originalSrc: src,
    //     currentSrc: src,
    //     alt: img.getAttribute('alt') || `Ảnh ${idx + 1}`,
    //     className: img.className || '',
    //     index: idx, // Keep index for fallback replacement
    //     type: 'img',
    //     isManaged: false
    //   })
    // })

    const images = Array.from(imageMap.values())

    // 3. Custom Text Fields (data-editable on non-img tags)
    const customFields = []

    // Map to track content for deduplication (Shadow Layer Handling)
    const contentToIdMap = new Map();

    const editableTexts = doc.querySelectorAll('[data-editable]:not(img)')
    editableTexts.forEach((el, idx) => {
      let id = el.getAttribute('data-editable')

      // FILTER STRUCTURAL ELEMENTS (User Friendly Filter)
      // Ignore containers like Sections, Boxes, Shapes, Groups which contain raw HTML
      if (/^(Section|Box|Shape|Group|Line|Item|Overlay|Container)/i.test(id)) return

      // Ignore elements with too much HTML content (likely a wrapper)
      if (el.children.length > 5 || el.innerHTML.length > 2000) return

      // Ignore if it looks like an SVG or Code block
      if (el.tagName === 'SVG' || el.tagName === 'PATH' || el.tagName === 'STYLE' || el.tagName === 'SCRIPT') return

      // SMART VALUE EXTRACTION: Get clean text, ignoring HTML tags
      let cleanValue = (el.innerText || '').trim()

      // FIX: Filter out NON-TEXT elements (Decorations, Lines, Empty Boxes, Layout Containers)
      if (!cleanValue) return

      // FIX 2a: STRUCTURAL SAFETY CHECK
      // If element contains media (Image, SVG) or layout (Iframe), it is a CONTAINER.
      if (el.querySelector('img, svg, iframe, video, canvas')) return;

      // Also check for Ladipage specific background image classes or overlays to screen out decoration containers
      if (el.querySelector('.ladi-image, .ladi-image-background, .ladi-overlay')) return;

      // FIX 2c: FORM SAFETY CHECK (Crucial for RSVP sections)
      // If element contains form controls (Input, Button, etc.), it is a functional wrapper.
      if (el.querySelector('input, select, textarea, button, form')) return;

      // FIX 2b: PREVENT PARENT CONTAINERS (Aggregation Issue)
      // LEAF NODE POLICY: If it has ANY block-level children, it is a wrapper -> SKIP IT.
      // We rely on the inner elements (H3, P, etc.) being picked up individually.
      const hasBlockChildren = Array.from(el.children).some(c =>
        ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'LI', 'TABLE', 'SECTION', 'FORM', 'BLOCKQUOTE'].includes(c.tagName)
      )

      if (hasBlockChildren) return;

      // Allow up to 3 children only if they are inline (br, b, span, icon)
      // But if we passed the block check, we are mostly safe.
      if (el.children.length > 5) return

      // SHADOW LAYER & DUPLICATE DETECTION
      // If we saw this exact text content before, REUSE the ID.
      // This ensures editing one instance updates all identical instances (Shadows, Etc.)
      if (cleanValue.length > 4 && contentToIdMap.has(cleanValue)) {
        // Reuse ID
        const existingId = contentToIdMap.get(cleanValue);
        el.setAttribute('data-editable', existingId); // Update DOM to match
        return; // Don't add a new field to sidebar, just link DOM
      }

      // Store primarily mapped ID
      if (cleanValue.length > 4) {
        contentToIdMap.set(cleanValue, id);
      }

      customFields.push({
        id: id,
        label: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: cleanValue, // Always use clean text
        type: 'text'
      })
    })

    return { placeholders, images, customFields }
  }, [htmlCode])

  // (Removed Duplicate State Declarations - Moved to top)

  // AUTO-SAVE: State for auto-save functionality

  // AUTO-SAVE: State for auto-save functionality
  const [autoSaveTimer, setAutoSaveTimer] = useState(null)
  const [lastSavedData, setLastSavedData] = useState(null)
  const [isUserEditing, setIsUserEditing] = useState(false) // Track if user is actively editing
  const editingTimerRef = useRef(null) // Timer for editing state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false) // Track unsaved changes

  // (Removed Duplicate Debounce hooks - Moved to top)

  useEffect(() => {
    loadInvitation()
  }, [])

  useEffect(() => {
    // Don't update preview if user is actively editing to prevent focus loss
    if (!isUserEditing) {
      updatePreview()
    }
  }, [debouncedFormData, debouncedImageData, debouncedCustomFieldData, htmlCode, isUserEditing])

  // Update preview when user stops editing
  useEffect(() => {
    if (!isUserEditing) {
      updatePreview()
    }
  }, [isUserEditing])

  // AUTO-SAVE: Debounced auto-save when data changes
  useEffect(() => {
    // Skip auto-save if invitation not loaded yet or in preview mode
    if ((!invitation && !searchParams.get('previewMode')) || loading) return

    // Skip if data hasn't changed
    const currentData = JSON.stringify({ formData, imageData, customFieldData, htmlCode })
    if (currentData === lastSavedData) {
      setHasUnsavedChanges(false)
      return
    }

    // Mark as having unsaved changes
    setHasUnsavedChanges(true)

    // Clear previous timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    // Set new timer for auto-save after 5 minutes (300 seconds) of inactivity
    const timer = setTimeout(async () => {
      try {
        console.log('🔄 Auto-saving...')

        // Compress HTML
        const compressedHtml = htmlCode
          .replace(/\s+/g, ' ')
          .replace(/>\s+</g, '><')
          .trim()

        // Auto-save without blocking UI (don't use setSaving)
        await invitationService.update(invitation.uuid, {
          ...formData,
          event_date: formData.event_date || null, // Fix: Send null if empty to avoid SQL error
          html_content: compressedHtml, // Invitation uses html_content
          image_data: JSON.stringify(imageData),
          custom_field_data: JSON.stringify(customFieldData),
          status: invitation.status // Keep current status
        })

        setLastSavedData(currentData)
        setHasUnsavedChanges(false)
        console.log('✅ Auto-saved successfully')
        toast.success('✅ Đã tự động lưu')
      } catch (error) {
        console.error('❌ Auto-save failed:', error)
        // Don't show error toast for auto-save failures to avoid annoying user
      }
    }, 300000) // 5 minutes delay (300 seconds)

    setAutoSaveTimer(timer)

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [formData, imageData, customFieldData, htmlCode, invitation, loading])

  const loadInvitation = async () => {
    try {
      setLoading(true)

      const isPreviewMode = searchParams.get('previewMode') === 'true'

      if (isPreviewMode) {
        console.log('🚀 Entering Ultimate Editor PREVIEW MODE')
        const previewHtml = sessionStorage.getItem('ultimate_preview_html')
        const previewTemplateData = JSON.parse(sessionStorage.getItem('ultimate_preview_template') || '{}')

        if (!previewHtml) {
          toast.error('Không tìm thấy dữ liệu preview')
          navigate('/dashboard/templates')
          return
        }

        setHtmlCode(previewHtml)
        setInvitation({
          id: 'preview',
          uuid: 'preview',
          title: previewTemplateData.name || 'Preview Template',
          status: 'preview'
        })

        const loadedFormData = {
          title: previewTemplateData.name || 'Wedding Invitation',
          groom_name: 'Nguyễn Văn A',
          bride_name: 'Trần Thị B',
          event_date: new Date().toISOString().split('T')[0],
          event_time: '18:00',
          event_location: 'Melisa Center',
          event_address: '85 Thoại Ngọc Hầu, Hòa Thạnh, Tân Phú, TP. HCM',
          music_url: '',
          music_autoplay: true,
          slug: 'preview-slug',
          visibility: 'private'
        }

        setFormData(loadedFormData)
        setImageData({})
        setCustomFieldData({})

        const initialData = JSON.stringify({
          formData: loadedFormData,
          imageData: {},
          customFieldData: {},
          htmlCode: previewHtml
        })
        setLastSavedData(initialData)
        return
      }

      // Check if user is authenticated before making request
      if (!authService.isAuthenticated()) {
        toast.error('Vui lòng đăng nhập để tiếp tục')
        navigate('/login')
        return
      }

      const invitationId = searchParams.get('invitationId')

      if (invitationId) {
        const res = await invitationService.getById(invitationId)
        setInvitation(res.data)

        console.log('📦 Loaded invitation:', res.data);
        console.log('📄 html_content from API:', res.data.html_content?.substring(0, 100) || 'EMPTY');

        // Handle html_content - Invitation uses html_content (not html_template)
        const htmlContent = res.data.html_content || ''
        setHtmlCode(htmlContent)

        console.log('✅ Set htmlCode length:', htmlContent.length);

        // If html_content is empty but we have a template, try to load template HTML
        if (!htmlContent && res.data.template_id) {
          console.warn('⚠️ Invitation has no HTML content, attempting to load from template...')

          try {
            // Import template service
            const templateService = (await import('../services/template.service')).default
            const templateRes = await templateService.getById(res.data.template_id)

            let templateHtml = templateRes.data?.html_template; // Template uses html_template

            // Fallback to designData if html_template is empty
            if (!templateHtml && templateRes.data?.design_data) {
              try {
                const designData = typeof templateRes.data.design_data === 'string'
                  ? JSON.parse(templateRes.data.design_data)
                  : templateRes.data.design_data;

                if (designData?.html) {
                  console.log('📄 Using HTML from template designData');
                  templateHtml = designData.html;
                }
              } catch (parseErr) {
                console.error('Failed to parse design_data:', parseErr);
              }
            }

            if (templateHtml) {
              console.log('✅ Loaded HTML from template:', templateRes.data.name)
              setHtmlCode(templateHtml)

              // Auto-save the HTML to the invitation
              try {
                // Include multiple fields - Invitation uses html_content
                await invitationService.update(invitationId, {
                  html_content: templateHtml, // Invitation uses html_content
                  title: res.data.title,
                  status: res.data.status || 'draft'
                })
                console.log('✅ Saved template HTML to invitation')
                toast.success('✅ Đã tải nội dung từ template')
              } catch (saveErr) {
                console.error('Failed to save template HTML:', saveErr)
              }
            } else {
              console.warn('⚠️ Template has no HTML content')
              toast.warning('Template không có nội dung HTML. Vui lòng liên hệ admin để thêm nội dung cho template này.')
            }
          } catch (templateErr) {
            console.error('Failed to load template:', templateErr)
            toast.error('Không thể tải template. Vui lòng liên hệ admin.')
          }
        }

        const loadedFormData = {
          title: res.data.title || '',
          groom_name: res.data.groom_name || '',
          bride_name: res.data.bride_name || '',
          event_date: res.data.event_date ? res.data.event_date.split('T')[0] : '',
          event_time: res.data.event_time || '14:00',
          event_location: res.data.event_location || '',
          event_address: res.data.event_address || '',
          music_url: res.data.music_url || '',
          music_autoplay: res.data.music_autoplay !== undefined ? res.data.music_autoplay : true,
          slug: res.data.slug || '', // Load slug from backend
          visibility: res.data.visibility || 'private' // Load visibility from backend
        }

        setFormData(loadedFormData)

        if (res.data.image_data) {
          try {
            setImageData(JSON.parse(res.data.image_data))
          } catch (e) {
            console.error('Failed to parse image_data:', e)
          }
        }

        if (res.data.custom_field_data) {
          try {
            setCustomFieldData(JSON.parse(res.data.custom_field_data))
          } catch (e) {
            console.error('Failed to parse custom_field_data:', e)
          }
        }

        // IMPORTANT: Set lastSavedData to prevent auto-save from running immediately
        const initialData = JSON.stringify({
          formData: loadedFormData,
          imageData: res.data.image_data ? JSON.parse(res.data.image_data) : {},
          customFieldData: res.data.custom_field_data ? JSON.parse(res.data.custom_field_data) : {},
          htmlCode: htmlContent
        })
        setLastSavedData(initialData)
      }
    } catch (error) {
      console.error('Failed to load invitation:', error)

      // Check if it's an authentication error
      if (error.message && error.message.includes('Unauthorized')) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        // Clear auth state and redirect to login
        authService.logout()
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      } else {
        toast.error('Không thể tải thiệp mời: ' + (error.message || 'Lỗi không xác định'))
      }
    } finally {
      setLoading(false)
    }
  }

  // Helper to compile HTML with current data (Synchronous)
  const compileHtml = (templateHtml, currentFormData, currentImageData, currentCustomFieldData) => {
    let html = templateHtml || ''

    // 1. Text Replacements (Regex is fine/faster for placeholders)
    Object.keys(currentFormData).forEach(key => {
      const value = currentFormData[key]
      if (value && key !== 'music_url' && key !== 'music_autoplay') {
        if (key === 'event_date') {
          const date = new Date(value)
          // Check validity
          if (!isNaN(date.getTime())) {
            const formatted = date.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
            html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), formatted)
          } else {
            html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
          }
        } else {
          html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
        }
      }
    })

    // 2. DOM Replacements (Text & Images)
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // 2a. Update Custom Text Fields
      Object.keys(currentCustomFieldData).forEach(key => {
        const val = currentCustomFieldData[key]
        if (val === undefined) return

        const els = doc.querySelectorAll(`[data-editable="${key}"]`)
        els.forEach(el => {
          const htmlContent = val ? val.replace(/\n/g, '<br/>') : '';

          let targetEl = el.querySelector('h1, h2, h3, h4, h5, h6, p, ul, ol, div');
          if (!targetEl) targetEl = el.querySelector('span, b, strong, i, em, mark, small') || el;

          if (targetEl.children.length === 1) {
            const innerNode = targetEl.children[0];
            if (['SPAN', 'B', 'STRONG', 'I', 'EM', 'MARK', 'SMALL'].includes(innerNode.tagName)) {
              targetEl = innerNode;
            }
          }

          if (targetEl.querySelector('img, div, section, video, iframe, table')) return;
          if (targetEl === el && el.querySelectorAll('div').length > 1) return;

          targetEl.innerHTML = htmlContent;
        })
      })

      // 2b. Image Replacements
      templateAnalysis.images.forEach(img => {
        if (currentImageData[img.id]) {
          const newSrc = currentImageData[img.id]

          if (img.type === 'ladi-background') {
            // Use htmlId for DOM lookup if available (e.g., IMAGE11), otherwise fall back to img.id
            const lookupId = img.htmlId || img.id
            const container = doc.getElementById(lookupId)
            if (container) {
              let bgEl = container.querySelector('.ladi-image-background')
              if (!bgEl) bgEl = container.querySelector('[class*="ladi-image-background"]')
              if (bgEl) bgEl.style.setProperty('background-image', `url('${newSrc}')`, 'important')
            } else {
              const bgEl = doc.querySelector(`#${lookupId} .ladi-image-background`)
              if (bgEl) bgEl.style.setProperty('background-image', `url('${newSrc}')`, 'important')
            }
          }
          else if (img.type === 'background') {
            const elements = doc.querySelectorAll(`[data-image-editable="${img.id}"]`)
            elements.forEach(el => {
              el.style.backgroundImage = `url('${newSrc}')`
            })
          } else {
            let imgEl = doc.querySelector(`img[data-editable="${img.id}"]`)
            if (!imgEl) {
              imgEl = doc.getElementById(img.id)
              if (imgEl && imgEl.tagName !== 'IMG') imgEl = null
            }
            if (!imgEl && img.originalSrc) {
              const allImgs = doc.querySelectorAll('img')
              for (let el of allImgs) {
                if (el.getAttribute('src') === img.originalSrc) {
                  imgEl = el
                  break
                }
              }
            }
            if (!imgEl && typeof img.index === 'number') {
              const allImgs = doc.querySelectorAll('img')
              if (allImgs[img.index]) imgEl = allImgs[img.index]
            }

            if (imgEl) {
              imgEl.src = newSrc
              imgEl.setAttribute('src', newSrc)

              // Album tiles use anchor href as the source for lightbox; keep href synced.
              const albumLink = imgEl.closest('a.js-album-trigger')
              if (albumLink) {
                albumLink.setAttribute('href', newSrc)
              }
            }
          }
        }
      })

      // Music Player Injection
      if (currentFormData.music_url) {
        const musicPlayer = `
                <div id="music-player" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
                  <audio id="background-music" ${currentFormData.music_autoplay ? 'autoplay' : ''} loop>
                    <source src="${currentFormData.music_url}" type="audio/mpeg">
                  </audio>
                  <button id="music-toggle" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                    <svg id="play-icon" style="display: ${currentFormData.music_autoplay ? 'none' : 'block'}; width: 24px; height: 24px;" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    <svg id="pause-icon" style="display: ${currentFormData.music_autoplay ? 'block' : 'none'}; width: 24px; height: 24px;" fill="white" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                  </button>
                </div>
                <script>
                  (function() {
                    var audio = document.getElementById('background-music');
                    var toggle = document.getElementById('music-toggle');
                    var playIcon = document.getElementById('play-icon');
                    var pauseIcon = document.getElementById('pause-icon');

                    if(toggle && audio) {
                        toggle.addEventListener('click', function() {
                          if (audio.paused) {
                            audio.play().catch(e => console.log('Play error', e));
                            if(playIcon) playIcon.style.display = 'none';
                            if(pauseIcon) pauseIcon.style.display = 'block';
                          } else {
                            audio.pause();
                            if(playIcon) playIcon.style.display = 'block';
                            if(pauseIcon) pauseIcon.style.display = 'none';
                          }
                        });
                    }
                  })();
                </script>
              `
        const tempDiv = doc.createElement('div');
        tempDiv.innerHTML = musicPlayer;
        while (tempDiv.firstChild) {
          doc.body.appendChild(tempDiv.firstChild);
        }
      }

      html = '<!DOCTYPE html>' + doc.documentElement.outerHTML
    } catch (e) {
      console.error("Compile HTML Error", e)
    }
    return html
  }


  const updatePreview = () => {
    const html = compileHtml(htmlCode, debouncedFormData, debouncedImageData, debouncedCustomFieldData)
    setPreviewHtml(html)
  }

  // LISTEN FOR MESSAGES FROM IFRA (Direct Edit)
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data) return;

      if (event.data.type === 'UPDATE_CONTENT') {
        const { id, content } = event.data;
        setCustomFieldData(prev => ({
          ...prev,
          [id]: content
        }));
      }

      if (event.data.type === 'KEY_COMMAND') {
        const { key, ctrlKey, metaKey, shiftKey } = event.data;

        if ((ctrlKey || metaKey) && key === 'z') {
          if (shiftKey) {
            performRedo()
          } else {
            performUndo()
          }
        }
        if ((ctrlKey || metaKey) && key === 'y') {
          performRedo()
        }
      }

      if (event.data.type === 'FOCUS_FIELD') {
        // Highlight sidebar input
        const sidebarInput = document.getElementById(`field-${event.data.id}`);
        if (sidebarInput) {
          sidebarInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          sidebarInput.focus();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target
    console.log('📝 Input changed:', name, '=', value)

    // Mark user as editing
    setIsUserEditing(true)

    // Clear previous timer
    if (editingTimerRef.current) {
      clearTimeout(editingTimerRef.current)
    }

    // Special handling for slug field - sanitize input
    let sanitizedValue = value
    if (name === 'slug') {
      // Simple sanitization: lowercase and replace spaces with hyphens
      sanitizedValue = value
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphen
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: sanitizedValue }
      console.log('📝 New formData:', newData)
      return newData
    })

    // Clear editing flag after 1 second of inactivity
    editingTimerRef.current = setTimeout(() => {
      setIsUserEditing(false)
    }, 1000)
  }

  const handleCustomFieldChange = (fieldId, value) => {
    // Mark user as editing
    setIsUserEditing(true)

    // Clear previous timer
    if (editingTimerRef.current) {
      clearTimeout(editingTimerRef.current)
    }

    setCustomFieldData(prev => ({ ...prev, [fieldId]: value }))

    // Clear editing flag after 1 second of inactivity
    editingTimerRef.current = setTimeout(() => {
      setIsUserEditing(false)
    }, 1000)
  }

  const handleImageUpload = async (imageId, file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 5MB!')
      return
    }

    try {
      console.log('🚀 Uploading image to S3:', file.name)
      const uploadResult = await mediaService.upload(file)

      setImageData(prev => ({
        ...prev,
        [imageId]: uploadResult.final_url || uploadResult.url
      }))
      toast.success('✅ Đã tải ảnh lên!')
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error('❌ Không thể tải ảnh lên!')
    }
  }

  const handleOpenMediaLibrary = (imageId) => {
    setSelectedImageId(imageId)
    setShowMediaLibrary(true)
  }

  const handleSelectFromLibrary = (image) => {
    if (selectedImageId) {
      setImageData(prev => ({
        ...prev,
        [selectedImageId]: image.url
      }))
      toast.success('✅ Đã chọn ảnh từ thư viện!')
    }
  }

  // Generate subdomain URL with random suffix
  const generateSubdomainUrl = (subdomain) => {
    if (!subdomain) return ''
    // Generate 2 random uppercase characters
    const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase()
    return `${window.location.origin}/invitation/${subdomain}-${randomSuffix}`
  }

  const handleSaveAndExit = async () => {
    if (searchParams.get('previewMode') === 'true') {
      toast.info('Đây là chế độ xem trước, không thể lưu.')
      return
    }
    if (!invitation) return

    try {
      setSaving(true)

      // COMPILE HTML with CURRENT state (not debounced) to capture latest edits
      let cleanHtml = compileHtml(htmlCode, formData, imageData, customFieldData)

      // Remove editor-styles
      cleanHtml = cleanHtml.replace(/<style[^>]*id=["']editor-styles["'][^>]*>[\s\S]*?<\/style>/gi, '')

      // Compress HTML
      const compressedHtml = cleanHtml
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/>\s+</g, '><')  // Remove spaces between tags
        .trim()

      await invitationService.update(invitation.uuid, {
        ...formData,
        event_date: formData.event_date || null, // Fix: Send null if empty
        html_content: compressedHtml, // Invitation uses html_content
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData),
        status: invitation.status // Keep current status
      })

      toast.success('✅ Đã lưu thành công!')

      // Redirect to management page
      setTimeout(() => {
        navigate('/management')
      }, 500)
    } catch (error) {
      console.error('Save failed:', error)
      if (error.message && error.message.includes('max_allowed_packet')) {
        toast.error('❌ Nội dung quá lớn! Vui lòng liên hệ admin để tăng giới hạn.')
      } else {
        toast.error('❌ Lưu thất bại!')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (searchParams.get('previewMode') === 'true') {
      toast.info('Đây là chế độ xem trước, không thể lưu.')
      return
    }
    if (!invitation) return

    try {
      setSaving(true)

      // COMPILE HTML with CURRENT state
      let cleanHtml = compileHtml(htmlCode, formData, imageData, customFieldData)

      // Remove editor-styles
      cleanHtml = cleanHtml.replace(/<style[^>]*id=["']editor-styles["'][^>]*>[\s\S]*?<\/style>/gi, '')

      // Compress HTML
      const compressedHtml = cleanHtml
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/>\s+</g, '><')  // Remove spaces between tags
        .trim()

      await invitationService.update(invitation.uuid, {
        ...formData,
        event_date: formData.event_date || null, // Fix: Send null if empty
        html_content: compressedHtml, // Invitation uses html_content
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData),
        status: invitation.status // Keep current status (published/draft)
      })

      // Update lastSavedData and clear unsaved changes flag
      const currentData = JSON.stringify({ formData, imageData, customFieldData, htmlCode })
      setLastSavedData(currentData)
      setHasUnsavedChanges(false)

      toast.success('✅ Đã lưu thành công!')
    } catch (error) {
      console.error('Save failed:', error)
      if (error.message && error.message.includes('max_allowed_packet')) {
        toast.error('❌ Nội dung quá lớn! Vui lòng liên hệ admin để tăng giới hạn.')
      } else {
        toast.error('❌ Lưu thất bại!')
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (searchParams.get('previewMode') === 'true') {
      toast.info('Đây là chế độ xem trước, không thể xuất bản.')
      return
    }
    if (!invitation) return

    // Auto-save before publishing if there are unsaved changes
    if (hasUnsavedChanges) {
      toast.info('💾 Đang lưu thay đổi trước khi xuất bản...')
      await handleSave()
    }

    // Show confirmation modal
    setShowPublishConfirm(true)
  }

  const confirmPublish = async () => {
    if (searchParams.get('previewMode') === 'true') {
      toast.info('Đây là chế độ xem trước, không thể xuất bản.')
      return
    }
    setShowPublishConfirm(false)

    try {
      setSaving(true)

      // COMPILE HTML with CURRENT state
      let cleanHtml = compileHtml(htmlCode, formData, imageData, customFieldData)

      // Remove editor-styles
      cleanHtml = cleanHtml.replace(/<style[^>]*id=["']editor-styles["'][^>]*>[\s\S]*?<\/style>/gi, '')

      // Compress HTML
      const compressedHtml = cleanHtml
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/>\s+</g, '><')  // Remove spaces between tags
        .trim()

      // Update invitation with published status AND public visibility
      // CRITICAL FIX: Backend checks 'visibility' field, not just 'status'
      // Database has TWO fields: status (draft/published) and visibility (public/private/password)
      const updateResponse = await invitationService.update(invitation.uuid, {
        ...formData,
        event_date: formData.event_date || null,
        html_content: compressedHtml,
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData),
        status: 'published', // Set lifecycle status
        visibility: 'public' // Set access control - REQUIRED for public view!
      })

      toast.success('✅ Đã xuất bản thiệp mời!')

      // Get slug for public URL
      const slug = formData.slug || invitation.slug
      if (slug) {
        toast.info(`🔗 Link thiệp: ${window.location.origin}/invitation/${slug}`)
      }
    } catch (error) {
      console.error('Publish failed:', error)
      if (error.message && error.message.includes('max_allowed_packet')) {
        toast.error('❌ Nội dung quá lớn! Vui lòng liên hệ admin để tăng giới hạn.')
      } else {
        toast.error('❌ Xuất bản thất bại!')
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async () => {
    if (searchParams.get('previewMode') === 'true') {
      // In preview mode, just open the same page or do nothing since we are already in an editor preview
      toast.info('Bạn đang ở chế độ xem trước của Ultimate Editor.')
      return
    }
    if (!invitation) return

    // Auto-save before preview if there are unsaved changes
    if (hasUnsavedChanges) {
      toast.info('💾 Đang lưu thay đổi trước khi xem trước...')
      await handleSave()
    }

    try {
      setSaving(true)

      // COMPILE HTML with CURRENT state
      let cleanHtml = compileHtml(htmlCode, formData, imageData, customFieldData)

      // Remove editor-styles
      cleanHtml = cleanHtml.replace(/<style[^>]*id=["']editor-styles["'][^>]*>[\s\S]*?<\/style>/gi, '')

      // Compress HTML
      const compressedHtml = cleanHtml
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/>\s+</g, '><')  // Remove spaces between tags
        .trim()

      // Update and get subdomain
      console.log('📤 Sending update with subdomain:', formData.subdomain)
      const updateResponse = await invitationService.update(invitation.uuid, {
        ...formData,
        event_date: formData.event_date || null, // Fix: Send null if empty
        html_content: compressedHtml, // Invitation uses html_content
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData),
        status: invitation.status // Keep current status
      })

      console.log('📥 Update response:', updateResponse)

      // Get slug for preview
      const slug = formData.slug || invitation.slug

      console.log('🔗 Opening preview with slug:', slug)

      toast.success('✅ Đã lưu! Đang mở xem trước...')

      setTimeout(() => {
        window.open(`/invitation/${slug}`, '_blank')
        setSaving(false)
      }, 500)
    } catch (error) {
      console.error('Save before preview failed:', error)
      if (error.message && error.message.includes('max_allowed_packet')) {
        toast.error('❌ Nội dung quá lớn! Vui lòng liên hệ admin để tăng giới hạn.')
      } else {
        toast.error('❌ Không thể lưu. Vui lòng thử lại!')
      }
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black overflow-hidden flex flex-col">

      {/* DESKTOP HEADER (Hidden on Mobile) */}
      <header className="hidden md:flex bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 items-center justify-between px-6 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/management')} className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              {searchParams.get('previewMode') === 'true' ? 'Ultimate Preview Mode' : (invitation?.title || 'Chỉnh sửa thiệp')}
            </h2>
            <div className="flex items-center gap-2">
              {searchParams.get('previewMode') === 'true' ? (
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800">PREVIEW ONLY</span>
              ) : hasUnsavedChanges ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                  <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">Chưa lưu • Tự động lưu sau 5 phút</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Đã lưu</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-full bg-gray-800 text-white text-xs font-bold uppercase hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button
            onClick={() => navigate('/management')}
            className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase hover:bg-gray-200 transition-colors"
          >
            Quay lại
          </button>
          <button onClick={handlePreview} className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase hover:bg-gray-200 transition-colors">Xem thử</button>
          <button onClick={handlePublish} disabled={saving} className="px-5 py-1.5 rounded-full bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50">
            {saving ? 'Đang xuất bản...' : 'Xuất bản'}
          </button>
        </div>
      </header>

      {/* MOBILE TITLE BAR (Floating) */}
      {/* MOBILE TITLE BAR (Fixed Top) */}
      <div className="md:hidden fixed top-0 left-0 w-full z-30 px-4 pt- safe-top bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between h-[60px]">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/management')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
            <button onClick={performUndo} disabled={historyIndex <= 0} className="w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-30 active:bg-white dark:active:bg-black transition-colors">
              <span className="material-symbols-outlined text-sm text-gray-600 dark:text-gray-300">undo</span>
            </button>
            <button onClick={performRedo} disabled={historyIndex >= history.length - 1} className="w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-30 active:bg-white dark:active:bg-black transition-colors">
              <span className="material-symbols-outlined text-sm text-gray-600 dark:text-gray-300">redo</span>
            </button>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900 dark:text-white truncate max-w-[100px]">Studio Mode</span>

        <button onClick={handleSave} disabled={saving} className={`w-8 h-8 flex items-center justify-center rounded-full ${saving ? 'bg-gray-200' : 'bg-black dark:bg-white'}`}>
          {saving ? (
            <svg className="w-4 h-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          ) : (
            <svg className="w-4 h-4 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          )}
        </button>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative pt-[60px] md:pt-0">

        {/* 1. EDITING PANEL (Desktop: Left Splite | Mobile: Bottom Sheet) */}
        <div className={`
                    absolute md:relative z-20 
                    w-full md:w-[400px] lg:w-[450px] flex-shrink-0 
                    bg-white dark:bg-gray-900 
                    transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                    shadow-2xl md:shadow-none border-r border-gray-200 dark:border-gray-800
                    ${isMobile
            ? (activeMobileTab !== 'preview' ? 'bottom-0 h-[60vh] rounded-t-3xl' : '-bottom-[100%] h-[60vh]')
            : 'h-full inset-y-0 left-0'
          }
                `}>
          {/* Mobile Drag Handle */}
          <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={() => setActiveMobileTab('preview')}>
            <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          </div>

          {/* Content Scroll Area */}
          <div className="h-full overflow-y-auto p-6 pb-24 md:pb-6 custom-scrollbar">

            {/* TAB: INFO FORM */}
            <div className={`${(isMobile && activeMobileTab !== 'info') ? 'hidden' : 'block'} space-y-8 animate-fade-in`}>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600">edit_note</span> Thông tin
                </h3>
                <div className="space-y-4">
                  {/* Slug Input - Editable */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                      URL Thiệp (Slug)
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="vd: dam-cuoi-cua-chung-toi"
                      className="w-full bg-white dark:bg-gray-900 text-sm font-mono font-medium text-gray-900 dark:text-white px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">
                      💡 Chỉ dùng chữ thường, số, và dấu gạch ngang (-). VD: dam-cuoi-2026
                    </p>
                    {formData.slug && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">✨ URL thiệp của bạn:</p>
                        <code className="text-xs text-blue-800 dark:text-blue-300 break-all block">
                          {window.location.origin}/invitation/{formData.slug}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* TAB: IMAGES */}
            <div className={`${(isMobile && activeMobileTab !== 'images') ? 'hidden' : 'block'} space-y-4 animate-fade-in`}>
              {/* Desktop only header for images section */}
              <div className="hidden md:block">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-pink-600">image</span> Thư viện ảnh
                </h3>
              </div>

              {templateAnalysis.images.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">Không tìm thấy ảnh chỉnh sửa được trong mẫu này.</p>
              ) : (
                <>
                  {/* Auto-detection Info */}
                  {templateAnalysis.images.some(img => img.autoDetected) && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-green-600 text-[18px]">auto_detect_voice</span>
                        <span className="text-sm font-semibold text-green-900 dark:text-green-100">Tự động phát hiện ảnh</span>
                      </div>
                      <p className="text-xs text-green-800 dark:text-green-200">
                        Hệ thống đã tự động phát hiện {templateAnalysis.images.filter(img => img.autoDetected).length} ảnh có thể chỉnh sửa trong template này.
                      </p>
                    </div>
                  )}

                  {/* Storage Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">cloud_upload</span>
                      <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">Free</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Kéo thả hoặc nhấn vào đây để tải lên file. Có thể tải lên tối đa 15 ảnh cùng một lúc.
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        Đã tải: <span className="font-semibold text-gray-900 dark:text-white">0/{templateAnalysis.images.length}</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Còn lại: <span className="font-semibold text-gray-900 dark:text-white">{templateAnalysis.images.length}</span>
                      </span>
                    </div>
                  </div>

                  {/* Image Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {templateAnalysis.images.map(img => (
                      <div key={img.id} className="relative">
                        <div className="group relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary bg-gray-50 dark:bg-gray-800 transition-all">
                          <img
                            src={imageData[img.id] || img.originalSrc}
                            className="w-full h-full object-cover"
                            alt={img.alt || 'Image'}
                          />
                          <label
                            htmlFor={`upload-${img.id}`}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                          >
                            <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                              <span className="material-symbols-outlined text-blue-600 text-[24px]">cloud_upload</span>
                            </div>
                            <span className="text-xs text-white font-semibold">Hãy chọn ảnh bạn muốn thay thế</span>
                            <span className="text-[10px] text-white/80 mt-1">Kéo thả hoặc click để chọn file</span>
                          </label>
                          <input
                            type="file"
                            id={`upload-${img.id}`}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(img.id, e.target.files[0])}
                          />
                          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-[10px] text-white truncate font-medium">{img.alt || 'Image'}</p>
                            {img.autoDetected && (
                              <span className="text-[8px] text-green-300 font-bold">Auto-detected</span>
                            )}
                          </div>

                          {/* Type Badge */}
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 rounded text-[8px] font-bold ${img.type === 'img' ? 'bg-blue-500/90 text-white' :
                              img.type === 'ladi-background' ? 'bg-purple-500/90 text-white' :
                                'bg-green-500/90 text-white'
                              }`}>
                              {img.type === 'img' ? 'IMG' :
                                img.type === 'ladi-background' ? 'LADI' : 'BG'}
                            </span>
                          </div>
                        </div>

                        {/* Button: Chọn từ thư viện */}
                        <button
                          onClick={() => handleOpenMediaLibrary(img.id)}
                          className="mt-2 w-full px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">photo_library</span>
                          Chọn từ thư viện
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[18px] text-gray-600 dark:text-gray-400 mt-0.5">
                        info
                      </span>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <p className="font-semibold mb-1">Mẹo:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Hỗ trợ: JPG, PNG, GIF, WebP</li>
                          <li>Kích thước tối đa: 10MB/ảnh</li>
                          <li>Ảnh nên có tỉ lệ giống mẫu gốc</li>
                          <li>Click vào ảnh để thay thế</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Always visible on Desktop: Instructions */}
            <div className="hidden md:block mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
              <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm mb-2">💡 Tips Pro</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Click trực tiếp vào chữ trên màn hình xem trước để sửa nhanh. Ảnh nên có tỉ lệ (vuông/dọc) giống với mẫu gốc để đẹp nhất.
              </p>
            </div>
          </div>
        </div>

        {/* 2. PREVIEW AREA */}
        <div className="flex-1 bg-gray-200 dark:bg-stone-950 relative overflow-hidden flex flex-col items-center justify-center p-0" onClick={() => isMobile && setActiveMobileTab('preview')}>

          {/* Desktop Toolbar (Optional Visual Cue) */}
          <div className="hidden md:flex w-full h-10 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
          </div>

          {/* Iframe Container */}
          <div className="w-full h-full relative">
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0 bg-white"
              title="Invitation Preview"
              // On Desktop: Full Width. On Mobile: Full Width.
              // We remove the intentional phone frame on Desktop.
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* 3. MOBILE BOTTOM NAVIGATION */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/90 backdrop-blur-xl rounded-full shadow-2xl z-50 transition-transform duration-300">
          <button
            onClick={() => setActiveMobileTab('info')}
            className={`flex flex-col items-center gap-1 ${activeMobileTab === 'info' ? 'text-white' : 'text-gray-500'}`}
          >
            <span className={`material-symbols-outlined text-2xl transition-all ${activeMobileTab === 'info' ? '-translate-y-1' : ''}`}>edit_note</span>
          </button>

          <div className="w-px h-6 bg-gray-700"></div>

          <button
            onClick={() => setActiveMobileTab('images')}
            className={`flex flex-col items-center gap-1 ${activeMobileTab === 'images' ? 'text-white' : 'text-gray-500'}`}
          >
            <span className={`material-symbols-outlined text-2xl transition-all ${activeMobileTab === 'images' ? '-translate-y-1' : ''}`}>image</span>
          </button>

          <div className="w-px h-6 bg-gray-700"></div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex flex-col items-center gap-1 text-blue-400 active:text-blue-300 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-2xl">save</span>
          </button>

          <div className="w-px h-6 bg-gray-700"></div>

          <button
            onClick={() => navigate('/management')}
            className="flex flex-col items-center gap-1 text-gray-500 active:text-white"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>

          <div className="w-px h-6 bg-gray-700"></div>

          <button
            onClick={handlePreview}
            className="flex flex-col items-center gap-1 text-gray-500 active:text-white"
          >
            <span className="material-symbols-outlined text-2xl">visibility</span>
          </button>

          <div className="w-px h-6 bg-gray-700"></div>

          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex flex-col items-center gap-1 text-green-400 active:text-green-300 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-2xl">publish</span>
          </button>
        </div>

        {/* Mobile Backdrop for Drawer */}
        {isMobile && activeMobileTab !== 'preview' && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 animate-fade-in"
            onClick={() => setActiveMobileTab('preview')}
          />
        )}
      </div>

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            {/* Icon & Title */}
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Xác nhận xuất bản
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Bạn có chắc chắn muốn xuất bản thiệp mời này?<br />
                Sau khi xuất bản, thiệp sẽ được công khai và mọi người có thể xem.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmPublish}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Xuất bản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibraryModal
          onSelectImage={handleSelectFromLibrary}
          onClose={() => setShowMediaLibrary(false)}
          currentImageId={selectedImageId}
        />
      )}

    </div>
  )
}

export default UltimateHtmlEditorPage

// Custom CSS for react-datepicker
if (typeof document !== 'undefined' && !document.getElementById('react-datepicker-styles')) {
  const style = document.createElement('style')
  style.id = 'react-datepicker-styles'
  style.textContent = `
    /* Custom DatePicker Styles */
    .react-datepicker {
      font-family: inherit;
      border: 2px solid #e7e5e4;
      border-radius: 1rem;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    }
    
    .react-datepicker__header {
      background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
      border-bottom: none;
      border-radius: 0.875rem 0.875rem 0 0;
      padding: 1rem;
    }
    
    .react-datepicker__current-month,
    .react-datepicker-time__header {
      color: white;
      font-weight: 700;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
    
    .react-datepicker__day-name {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 600;
      font-size: 0.875rem;
      width: 2.5rem;
      line-height: 2.5rem;
      margin: 0.166rem;
    }
    
    .react-datepicker__day {
      width: 2.5rem;
      line-height: 2.5rem;
      margin: 0.166rem;
      border-radius: 0.75rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .react-datepicker__day:hover {
      background: #fef3c7;
      color: #92400e;
      transform: scale(1.1);
    }
    
    .react-datepicker__day--selected,
    .react-datepicker__day--keyboard-selected {
      background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
      color: white;
      font-weight: 700;
      transform: scale(1.1);
    }
    
    .react-datepicker__day--today {
      font-weight: 700;
      color: #f59e0b;
      border: 2px solid #fbbf24;
    }
    
    .react-datepicker__navigation {
      top: 1.25rem;
    }
    
    .react-datepicker__navigation-icon::before {
      border-color: white;
      border-width: 2px 2px 0 0;
    }
    
    .react-datepicker__time-container {
      border-left: 2px solid #e7e5e4;
    }
    
    .react-datepicker__time-list-item {
      padding: 0.5rem 1rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .react-datepicker__time-list-item:hover {
      background: #f3e8ff !important;
      color: #6b21a8;
    }
    
    .react-datepicker__time-list-item--selected {
      background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%) !important;
      color: white !important;
      font-weight: 700;
    }
    
    .react-datepicker__triangle {
      display: none;
    }
    
    /* Dark mode support */
    .dark .react-datepicker {
      background: #1c1917;
      border-color: #44403c;
    }
    
    .dark .react-datepicker__header {
      background: linear-gradient(135deg, #d97706 0%, #ea580c 100%);
    }
    
    .dark .react-datepicker__day {
      color: #e7e5e4;
    }
    
    .dark .react-datepicker__day:hover {
      background: #44403c;
      color: #fbbf24;
    }
    
    .dark .react-datepicker__time-container {
      border-left-color: #44403c;
    }
    
    .dark .react-datepicker__time-list-item {
      color: #e7e5e4;
    }
  `

  // Safely append to head
  try {
    document.head.appendChild(style)
  } catch (error) {
    console.warn('Could not inject DatePicker styles:', error)
  }
}