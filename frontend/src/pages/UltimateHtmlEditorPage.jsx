import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import invitationService from '../services/invitation.service'
import authService from '../services/auth.service'
import { useToast } from '../context/ToastContext'

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
    music_autoplay: true
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

    // 4. Inject Styles & Listeners
    try {
      const style = doc.createElement('style')
      style.textContent = `
          [data-editable] {
            cursor: text !important;
            transition: all 0.2s;
            position: relative;
            z-index: 50; /* Ensure it floats above simple backgrounds */
            pointer-events: auto !important; /* Force interaction */
            min-height: 1em; /* Ensure empty fields are clickable */
            min-width: 20px;
            display: inline-block; /* Ensure layout triggers */
          }
          [data-editable]:hover {
            outline: 2px dashed #a855f7 !important; /* Pulse dashed for visibility */
            background: rgba(168, 85, 247, 0.1);
            z-index: 100 !important;
            box-shadow: 0 0 10px rgba(168, 85, 247, 0.2);
          }
          [data-editable]:focus {
            outline: 2px solid #f59e0b !important; /* Amber/Yellow for Active Edit */
            background: rgba(251, 191, 36, 0.1);
            z-index: 1000 !important;
            min-width: 10px;
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
          }
          /* Ensure Ladipage layers don't block us */
          .ladi-overlay {
            pointer-events: none !important;
          }
        `
      doc.head.appendChild(style)

      // Attach Listeners
      const editableElements = doc.querySelectorAll('[data-editable]')
      console.log(`Found ${editableElements.length} editable elements in iframe`)

      editableElements.forEach(el => {
        const fieldId = el.getAttribute('data-editable')

        // Click to edit
        const activateEdit = (e) => {
          e.stopPropagation() // Stop bubbling
          // Don't toggle if already true (prevents cursor jump)
          if (el.contentEditable !== 'true') {
            e.preventDefault()
            el.contentEditable = 'true'
            el.focus()

            // Log for debugging
            console.log(`Activated edit for: ${fieldId}`)

            // Notify parent
            window.parent.postMessage({
              type: 'FOCUS_FIELD',
              id: fieldId
            }, '*');
          }
        }

        el.addEventListener('click', activateEdit)
        // Also listen for dblclick just in case single click is swallowed
        el.addEventListener('dblclick', activateEdit)

        // Blur to save
        el.addEventListener('blur', () => {
          if (el.isContentEditable) {
            el.contentEditable = 'false'
            // Use innerText but fall back to textContent if weird
            const newContent = el.innerText
            // Send update to parent logic
            setCustomFieldData(prev => ({ ...prev, [fieldId]: newContent }))
          }
        })

        // Input Listener for Real-time Height Adjustment or sync (optional)
        el.addEventListener('input', () => {
          // Optional: visual feedback
        })
      })

      // 5. Global Key Listener for Undo/Redo inside Iframe
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
      })

    } catch (err) {
      console.error("Iframe setup error", err)
    }

    // Restore Scroll
    try {
      if (scrollX || scrollY) win.scrollTo(scrollX, scrollY)
    } catch (e) { }

  }, [previewHtml])


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

    // 2b. Scan background images with data-image-editable
    const bgEditableEls = doc.querySelectorAll('[data-image-editable]')
    bgEditableEls.forEach((el) => {
      // IGNORE invalid tags and extension junk
      if (['style', 'script', 'head', 'meta', 'link', 'title'].includes(el.tagName.toLowerCase())) return
      if (el.id && (el.id.includes('eJOY') || el.id.includes('extension'))) return

      const attrId = el.getAttribute('data-image-editable')

      // Filter out SECTION elements to avoid duplicates
      if (attrId.toUpperCase().includes('SECTION')) return

      let bgUrl = ''

      // Check if this is a Ladipage element
      const isLadipage = el.classList.contains('ladi-element') || el.querySelector('.ladi-image-background') !== null

      if (isLadipage) {
        // Try to find the image URL from Child (Inline Style override)
        const bgChild = el.querySelector('.ladi-image-background')
        if (bgChild && bgChild.style.backgroundImage) {
          const match = bgChild.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)
          if (match) bgUrl = match[1]
        }

        // CRITICAL FIX: 
        // 1. If no inline URL found, SKIP adding it here. Let 2c (CSS Scan) find it with the CSS URL.
        // This prevents "broken image" placeholders from showing up.
        if (!bgUrl) return

        // 2. Use the element's HTML ID as the Map Key if available.
        // This ensures that if 2c finds #IMAGE1 later, it sees it's already added and won't duplicate.
        // (The tool might have named it 'gallery_12' in attrId, but CSS knows it as 'IMAGE1')
        const mapKey = el.id || attrId

        imageMap.set(mapKey, {
          id: mapKey,
          originalSrc: bgUrl,
          currentSrc: bgUrl,
          alt: el.getAttribute('alt') || mapKey.replace(/_/g, ' '),
          className: el.className || '',
          type: 'ladi-background',
          isManaged: true
        })
        return;
      }

      // Standard Background Image Logic
      if (el.style.backgroundImage) {
        const match = el.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)
        if (match) bgUrl = match[1]
      }

      // Similarly, if standard element has no background image, it's not useful to list it
      if (!bgUrl) return

      imageMap.set(attrId, {
        id: attrId,
        originalSrc: bgUrl,
        currentSrc: bgUrl,
        alt: attrId.replace(/_/g, ' '),
        className: el.className || '',
        type: 'background',
        isManaged: true
      })
    })

    // 2c. LADIPAGE SUPPORT: Scan #IMAGE elements defined in CSS
    const styleTags = doc.querySelectorAll('style')
    styleTags.forEach(style => {
      const cssContent = style.innerHTML
      // Relaxed Regex: Just find #IMAGE... with a background image URL inside its block
      // Matches: #IMAGE1 ... { ... dist ... background ... url(...) }
      const ladiRegex = /#(IMAGE\w+)[^{]*\{[\s\S]*?background(?:-image)?:\s*url\(['"]?([^'"\)]+)['"]?\)/gi

      let match
      while ((match = ladiRegex.exec(cssContent)) !== null) {
        const id = match[1]
        const url = match[2]

        // Skip data URIs (svg icons) and chrome extensions
        if (url.startsWith('data:') || url.startsWith('chrome-extension:')) continue

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
      }
    })

    // 2d. Scan ALL remaining img tags (Fallback for un-managed images)
    const allImgs = doc.querySelectorAll('img')
    allImgs.forEach((img, idx) => {
      // Skip if already captured via data-editable
      if (img.hasAttribute('data-editable')) return

      // FILTER JUNK IMAGES
      const src = img.getAttribute('src') || ''
      if (!src || src.startsWith('data:') || src.startsWith('chrome-extension:') || src.includes('extension')) return
      if (img.id && img.id.includes('eJOY')) return
      if (img.className && typeof img.className === 'string' && img.className.includes('extension')) return

      // Generate an ID if not present
      let id = img.id || ''
      if (!id) {
        // Try to derive from class
        if (img.className && typeof img.className === 'string') id = img.className.split(' ')[0]
        // Try to derive from alt
        if (!id && img.alt) id = img.alt.replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase()
        // Fallback to index
        if (!id) id = `image_auto_${idx + 1}`
      }

      // Ensure ID is unique
      let originalId = id
      let counter = 1
      while (imageMap.has(id)) {
        id = `${originalId}_${counter}`
        counter++
      }

      imageMap.set(id, {
        id: id,
        originalSrc: src,
        currentSrc: src,
        alt: img.getAttribute('alt') || `Ảnh ${idx + 1}`,
        className: img.className || '',
        index: idx, // Keep index for fallback replacement
        type: 'img',
        isManaged: false
      })
    })

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
    // Skip auto-save if invitation not loaded yet
    if (!invitation || loading) return

    // Skip if data hasn't changed
    const currentData = JSON.stringify({ formData, imageData, customFieldData, htmlCode })
    if (currentData === lastSavedData) return

    // Clear previous timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    // Set new timer for auto-save after 3 seconds of inactivity (increased from 2s)
    const timer = setTimeout(async () => {
      try {
        console.log('🔄 Auto-saving...')

        // Compress HTML
        const compressedHtml = htmlCode
          .replace(/\s+/g, ' ')
          .replace(/>\s+</g, '><')
          .trim()

        // Auto-save without blocking UI (don't use setSaving)
        await invitationService.update(invitation.id, {
          ...formData,
          html_content: compressedHtml,
          image_data: JSON.stringify(imageData),
          custom_field_data: JSON.stringify(customFieldData),
          status: invitation.status // Keep current status
        })

        setLastSavedData(currentData)
        console.log('✅ Auto-saved successfully')
      } catch (error) {
        console.error('❌ Auto-save failed:', error)
        // Don't show error toast for auto-save failures to avoid annoying user
      }
    }, 3000) // 3 seconds delay (increased for better UX)

    setAutoSaveTimer(timer)

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [formData, imageData, customFieldData, htmlCode, invitation, loading])

  const loadInvitation = async () => {
    try {
      setLoading(true)

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

        // Handle html_content - if null or empty, use empty string
        const htmlContent = res.data.html_content || ''
        setHtmlCode(htmlContent)

        // If html_content is empty but we have a template, try to load template HTML
        if (!htmlContent && res.data.template_id) {
          console.warn('⚠️ Invitation has no HTML content, this may cause editing issues')
          toast.warning('Thiệp mời chưa có nội dung HTML. Vui lòng liên hệ admin.')
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
          music_autoplay: res.data.music_autoplay !== undefined ? res.data.music_autoplay : true
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

  const updatePreview = () => {
    let html = htmlCode

    // 1. Text Replacements (Regex is fine/faster for placeholders)
    Object.keys(debouncedFormData).forEach(key => {
      const value = debouncedFormData[key]
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

    // 2. DOM Replacements (Text & Images) - Using DOMParser for safe & correct HTML manipulation
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      let hasChanges = false

      // 2a. Update Custom Text Fields (NON-DESTRUCTIVE MODE)
      Object.keys(debouncedCustomFieldData).forEach(key => {
        const val = debouncedCustomFieldData[key]
        if (val === undefined) return

        const els = doc.querySelectorAll(`[data-editable="${key}"]`)
        els.forEach(el => {
          // SAFETY CHECK: If element contains critical structure (Images, Sections), be very careful.

          // Convert newlines to <br> for proper rendering
          const htmlContent = val ? val.replace(/\n/g, '<br/>') : '';

          // 1. Find the best block-level container
          let targetEl = el.querySelector('h1, h2, h3, h4, h5, h6, p, ul, ol');

          // 2. If no block found, look for inline wrappers or use self
          if (!targetEl) targetEl = el.querySelector('span, b, strong, i, em, mark, small') || el;

          // 3. DEEP DRILL: Check if the target has a SINGLE styling child (span, b, etc.)
          // Many editors wrap text in a <span> for font-size/color. We must update the SPAN to keep style.
          if (targetEl.children.length === 1) {
            const innerNode = targetEl.children[0];
            if (['SPAN', 'B', 'STRONG', 'I', 'EM', 'MARK', 'SMALL'].includes(innerNode.tagName)) {
              targetEl = innerNode;
            }
          }

          // 4. Update Logic with Safety Checks
          // Do not update if target contains structure
          if (targetEl.querySelector('img, div, section, video, iframe, table')) {
            return; // Abort to protect layout
          }

          // Also abort if we are falling back to 'el' but 'el' is a complex wrapper
          if (targetEl === el && el.querySelectorAll('div').length > 1) {
            return;
          }

          // Apply Update
          targetEl.innerHTML = htmlContent;
        })
      })

      // 2b. Image Replacements

      templateAnalysis.images.forEach(img => {
        if (debouncedImageData[img.id]) {
          const newSrc = debouncedImageData[img.id]
          hasChanges = true

          if (img.type === 'ladi-background') {
            // For Ladipage, we need to find #IMAGE_ID > .ladi-image > .ladi-image-background
            const container = doc.getElementById(img.id)
            if (container) {
              // Try standard Ladipage structure
              let bgEl = container.querySelector('.ladi-image-background')

              // Fallback: If not found, look for any direct child with class starting with ladi-image
              if (!bgEl) {
                bgEl = container.querySelector('[class*="ladi-image-background"]')
              }

              if (bgEl) {
                // Apply inline style WITH !important to override CSS
                bgEl.style.setProperty('background-image', `url('${newSrc}')`, 'important')
              }
            } else {
              // Fallback using querySelector for ID if getElementById fails (rare)
              const bgEl = doc.querySelector(`#${img.id} .ladi-image-background`)
              if (bgEl) {
                bgEl.style.setProperty('background-image', `url('${newSrc}')`, 'important')
              }
            }
          }
          else if (img.type === 'background') {
            // Find elements with data-image-editable
            const elements = doc.querySelectorAll(`[data-image-editable="${img.id}"]`)
            elements.forEach(el => {
              el.style.backgroundImage = `url('${newSrc}')`
            })
          } else {
            // Try finding by data-editable first
            let imgEl = doc.querySelector(`img[data-editable="${img.id}"]`)

            // Fallback: Try finding by ID
            if (!imgEl) {
              imgEl = doc.getElementById(img.id)
              if (imgEl && imgEl.tagName !== 'IMG') imgEl = null
            }

            // Fallback: Try finding by Src match (if unique and not found by ID)
            if (!imgEl && img.originalSrc) {
              // This is risky if multiple images share src, but helpful for legacy format
              const allImgs = doc.querySelectorAll('img')
              for (let el of allImgs) {
                // Compare logical paths
                if (el.getAttribute('src') === img.originalSrc) {
                  imgEl = el
                  break
                }
              }
            }

            // Fallback: Use index from analysis if strictly fallback mode (no data-editable found in analysis)
            // Note: templateAnalysis defines 'index' only when it falls back to scanning all images
            if (!imgEl && typeof img.index === 'number') {
              const allImgs = doc.querySelectorAll('img')
              if (allImgs[img.index]) {
                imgEl = allImgs[img.index]
              }
            }

            if (imgEl) {
              imgEl.src = newSrc
              // Ensure we update attribute for consistency
              imgEl.setAttribute('src', newSrc)
            }
          }
        }
      })

      // Music Player Injection (Appending to Body)
      if (debouncedFormData.music_url) {
        // ... (Music Player Code logic matches previous string injection, but via DOM)
        // Ideally we inject HTML string. Since doc.body is available:
        const musicPlayer = `
                <div id="music-player" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
                  <audio id="background-music" ${debouncedFormData.music_autoplay ? 'autoplay' : ''} loop>
                    <source src="${debouncedFormData.music_url}" type="audio/mpeg">
                  </audio>
                  <button id="music-toggle" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                    <svg id="play-icon" style="display: ${debouncedFormData.music_autoplay ? 'none' : 'block'}; width: 24px; height: 24px;" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    <svg id="pause-icon" style="display: ${debouncedFormData.music_autoplay ? 'block' : 'none'}; width: 24px; height: 24px;" fill="white" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
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
        // Inject Music Player at end of body
        const tempDiv = doc.createElement('div');
        tempDiv.innerHTML = musicPlayer;
        while (tempDiv.firstChild) {
          doc.body.appendChild(tempDiv.firstChild);
        }
      } // End of music conditional block

      // Serialize back to HTML string (Add DOCTYPE for Standards Mode)
      html = '<!DOCTYPE html>' + doc.documentElement.outerHTML

    } catch (e) {
      console.error("DOM Processing Error", e)
    }

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

    setFormData(prev => {
      const newData = { ...prev, [name]: value }
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
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageData(prev => ({
          ...prev,
          [imageId]: reader.result
        }))
        toast.success('✅ Đã tải ảnh lên!')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error('❌ Không thể tải ảnh lên!')
    }
  }

  const handleSaveAndExit = async () => {
    if (!invitation) return

    try {
      setSaving(true)

      // Compress HTML by removing unnecessary whitespace
      const compressedHtml = htmlCode
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/>\s+</g, '><')  // Remove spaces between tags
        .trim()

      await invitationService.update(invitation.id, {
        ...formData,
        html_content: compressedHtml,
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
    if (!invitation) return

    try {
      setSaving(true)

      // Compress HTML by removing unnecessary whitespace
      const compressedHtml = htmlCode
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/>\s+</g, '><')  // Remove spaces between tags
        .trim()

      await invitationService.update(invitation.id, {
        ...formData,
        html_content: compressedHtml,
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData),
        status: invitation.status // Keep current status (published/draft)
      })
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
    if (!invitation) return

    if (!formData.groom_name || !formData.bride_name) {
      toast.warning('⚠️ Vui lòng nhập tên chú rể và cô dâu!')
      return
    }

    // Show confirmation modal
    setShowPublishConfirm(true)
  }

  const confirmPublish = async () => {
    setShowPublishConfirm(false)

    try {
      setSaving(true)

      // Compress HTML by removing unnecessary whitespace
      const compressedHtml = htmlCode
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/>\s+</g, '><')  // Remove spaces between tags
        .trim()

      // Update invitation
      const updateResponse = await invitationService.update(invitation.id, {
        ...formData,
        html_content: compressedHtml,
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData),
        status: 'published'
      })

      // Publish
      await invitationService.publish(invitation.id)

      // Get updated invitation with new slug
      const updatedInvitation = updateResponse.data || invitation
      const newSlug = updatedInvitation.slug || invitation.slug

      toast.success('🎉 Đã xuất bản thiệp mời!')
      setTimeout(() => {
        navigate(`/invitation/${newSlug}`)
      }, 1500)
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
    if (!invitation) return

    try {
      setSaving(true)

      // Compress HTML by removing unnecessary whitespace
      const compressedHtml = htmlCode
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/>\s+</g, '><')  // Remove spaces between tags
        .trim()

      // Update and get new slug
      const updateResponse = await invitationService.update(invitation.id, {
        ...formData,
        html_content: compressedHtml,
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData),
        status: invitation.status // Keep current status
      })

      // Get updated slug from response
      const updatedInvitation = updateResponse.data || invitation
      const newSlug = updatedInvitation.slug || invitation.slug

      toast.success('✅ Đã lưu! Đang mở xem trước...')

      setTimeout(() => {
        window.open(`/invitation/${newSlug}`, '_blank')
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
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{invitation?.title || 'Chỉnh sửa thiệp'}</h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-gray-500 font-medium">Auto-saving...</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAndExit}
            disabled={saving}
            className="px-4 py-1.5 rounded-full bg-blue-500 text-white text-xs font-bold uppercase hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu & Quay lại'}
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
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tên Chú Rể</label>
                    <input
                      name="groom_name"
                      value={formData.groom_name}
                      onChange={handleChange}
                      className="w-full bg-transparent text-lg font-serif font-bold text-gray-900 dark:text-white outline-none placeholder-gray-300"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tên Cô Dâu</label>
                    <input
                      name="bride_name"
                      value={formData.bride_name}
                      onChange={handleChange}
                      className="w-full bg-transparent text-lg font-serif font-bold text-gray-900 dark:text-white outline-none placeholder-gray-300"
                      placeholder="Lê Thị B"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TAB: IMAGES */}
            <div className={`${(isMobile && activeMobileTab !== 'images') ? 'hidden' : 'block'} space-y-6 animate-fade-in`}>
              {/* Desktop only header for images section */}
              <div className="hidden md:block">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-pink-600">image</span> Thư viện ảnh
                </h3>
              </div>

              {templateAnalysis.images.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">Không tìm thấy ảnh chỉnh sửa được trong mẫu này.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {templateAnalysis.images.map(img => (
                    <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100">
                      <img src={imageData[img.id] || img.originalSrc} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <label htmlFor={`upload-${img.id}`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                        <span className="material-symbols-outlined text-white text-2xl mb-1">cloud_upload</span>
                        <span className="text-[10px] text-white font-bold uppercase tracking-wider">Thay ảnh</span>
                      </label>
                      <input type="file" id={`upload-${img.id}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(img.id, e.target.files[0])} />
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-[10px] text-white truncate">{img.alt || 'Image'}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
            <div className="flex-1 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-black rounded-md text-[10px] text-gray-500 font-mono shadow-sm">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                {window.location.origin}/invitation/{invitation?.slug}
              </div>
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
            onClick={handleSaveAndExit}
            disabled={saving}
            className="flex flex-col items-center gap-1 text-blue-400 active:text-blue-300 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-2xl">save</span>
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
    </div>
  )
}

export default UltimateHtmlEditorPage

// Custom CSS for react-datepicker
const style = document.createElement('style')
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
if (typeof document !== 'undefined') {
  document.head.appendChild(style)
}