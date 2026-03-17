
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import invitationService from '../services/invitation.service'
import authService from '../services/auth.service'
import { useToast } from '../context/ToastContext'
import mediaService from '../services/media.service'
import MediaLibraryModal from '../components/MediaLibraryModal'


// Custom debounce hook 
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
  const isUndoRedoAction = useRef(false)

  const [htmlCode, setHtmlCode] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [imageData, setImageData] = useState({})
  const [customFieldData, setCustomFieldData] = useState({})
  const [mapData, setMapData] = useState({})
  const [userLocation, setUserLocation] = useState(null)
  const [addressSuggestions, setAddressSuggestions] = useState({})
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [expandedFields, setExpandedFields] = useState(new Set())

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
    slug: '',
    visibility: 'private'
  })

  // Debounce Hooks
  const debouncedFormData = useDebounce(formData, 500)
  const debouncedImageData = useDebounce(imageData, 500)
  const debouncedCustomFieldData = useDebounce(customFieldData, 500)
  const debouncedMapData = useDebounce(mapData, 500)

  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false
      return
    }

    // Initial Load Guard
    if (!invitation) return

    const currentState = {
      formData: debouncedFormData,
      imageData: debouncedImageData,
      customFieldData: debouncedCustomFieldData,
      mapData: debouncedMapData
    }

    const currentHead = history[historyIndex]

    // Only push if different 
    if (JSON.stringify(currentHead) !== JSON.stringify(currentState)) {
      console.log("📸 Saving History Snapshot", historyIndex + 1)
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(currentState)
      if (newHistory.length > 50) newHistory.shift()
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [debouncedFormData, debouncedImageData, debouncedCustomFieldData, debouncedMapData, invitation])

  const performUndo = useCallback(() => {
    if (historyIndex > 0) {
      console.log("↺ Undoing...")
      isUndoRedoAction.current = true
      const prevState = history[historyIndex - 1]
      setHistoryIndex(prev => prev - 1)

      setFormData(prevState.formData)
      setImageData(prevState.imageData)
      setCustomFieldData(prevState.customFieldData)
      setMapData(prevState.mapData || {})
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
      setMapData(nextState.mapData || {})
      if (lastRenderedHtmlRef.current) lastRenderedHtmlRef.current = ''
    }
  }, [history, historyIndex])

  // Keyboard Shortcuts 
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

  // Handle messages from Iframe
  useEffect(() => {
    const handleMessage = (e) => {
      if (!e.data) return

      if (e.data.type === 'FOCUS_FIELD') {
        const { id, tab } = e.data
        if (id) {
          if (tab === 'maps' && isMobile) {
            setActiveMobileTab('maps')
          } else if (tab && !isMobile) {
            setActiveMobileTab(tab)
          }
          // Mark as expanded/active (Show only one at a time as requested)
          setExpandedFields(new Set([id]))
        } else {
          // Clear selection if id is null/empty
          setExpandedFields(new Set())
        }

        // Use a slight delay to ensure UI transition completes
        setTimeout(() => {
          const sidebarEl = document.querySelector(`.sidebar-field-${id}`)
          if (sidebarEl) {
            sidebarEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
            sidebarEl.classList.add('highlight-sidebar-field')
            // If it's an input or textarea, focus it
            const input = sidebarEl.querySelector('input, textarea')
            if (input) input.focus()

            setTimeout(() => sidebarEl.classList.remove('highlight-sidebar-field'), 2000)
          }
        }, 300)
      }

      if (e.data.type === 'UPDATE_CONTENT') {
        const { id, content } = e.data
        setCustomFieldData(prev => ({ ...prev, [id]: content }))
      }

      if (e.data.type === 'KEY_COMMAND') {
        const { key, ctrlKey, metaKey, shiftKey } = e.data
        if ((ctrlKey || metaKey) && key === 'z') {
          if (shiftKey) performRedo()
          else performUndo()
        }
        if ((ctrlKey || metaKey) && key === 'y') performRedo()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [performUndo, performRedo])

  const iframeRef = useRef(null)
  const lastRenderedHtmlRef = useRef('')

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !previewHtml) return

    const doc = iframe.contentDocument || iframe.contentWindow.document
    const win = iframe.contentWindow
    if (!doc || !win) return

    if (doc.activeElement &&
      (doc.activeElement.getAttribute('contenteditable') === 'true' ||
        doc.activeElement.tagName === 'INPUT' ||
        doc.activeElement.tagName === 'TEXTAREA')) {
      return
    }

    if (previewHtml === lastRenderedHtmlRef.current) {
      return
    }

    const scrollX = win.scrollX || 0
    const scrollY = win.scrollY || 0

    doc.open()
    doc.write(previewHtml)
    doc.close()

    lastRenderedHtmlRef.current = previewHtml

    const injectViewportAndStyles = () => {
      const injectViewport = () => {
        if (doc.querySelector('meta[name="viewport"]')) return;
        const viewport = doc.createElement('meta')
        viewport.name = 'viewport'
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
        doc.head.insertBefore(viewport, doc.head.firstChild)
      }

      injectViewport()

      const injectStyles = () => {
        if (doc.getElementById('editor-styles')) return;
        const style = doc.createElement('style')
        style.id = 'editor-styles'
        style.textContent = `
          [data-editable] { cursor: text; outline: 1px dashed transparent; transition: outline 0.2s, background 0.2s; }
          [data-editable]:hover { outline: 2px dashed #a855f7 !important; background: rgba(168, 85, 247, 0.05) !important; }
          [data-editable]:focus { outline: 2px solid #f59e0b !important; background: rgba(251, 191, 36, 0.05) !important; }
          
          [data-image-editable], [data-edit-map], [data-edit-map-href] { cursor: pointer; outline: 1px dashed transparent; transition: outline 0.2s; }
          [data-image-editable]:hover, [data-edit-map]:hover, [data-edit-map-href]:hover { outline: 2px dashed #a855f7 !important; box-shadow: 0 0 10px rgba(168, 85, 247, 0.3) !important; }
        `
        doc.head.appendChild(style)
      }

      injectStyles()
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
              [data-editable] { cursor: text; outline: 1px dashed transparent; transition: outline 0.2s, background 0.2s; }
              [data-editable]:hover { outline: 2px dashed #a855f7 !important; background: rgba(168, 85, 247, 0.05) !important; }
              [data-editable]:focus { outline: 2px solid #f59e0b !important; background: rgba(251, 191, 36, 0.05) !important; }
            `
            doc.head.appendChild(style)
          }
          injectStyles()
        }
      })
      observer.observe(doc.head, { childList: true })

      const handleInteraction = (e) => {
        const el = e.target.closest('[data-editable], [data-image-editable], [data-edit-map], [data-edit-map-href]')
        if (!el) return

        const fieldId = el.getAttribute('data-editable')
        const imageId = el.getAttribute('data-image-editable')
        const mapId = el.getAttribute('data-edit-map') || el.getAttribute('data-edit-map-href')

        if (e.type === 'click' || e.type === 'dblclick') {
          if (!el) {
            // Clicked on background/non-editable area
            window.parent.postMessage({ type: 'FOCUS_FIELD', id: null }, '*');
            return
          }

          e.stopPropagation()

          if (fieldId && !imageId && !mapId) {
            if (el.contentEditable !== 'true') {
              e.preventDefault()
              el.contentEditable = 'true'
              el.focus()
              window.parent.postMessage({ type: 'FOCUS_FIELD', id: fieldId, tab: 'info' }, '*');
            }
          } else if (imageId) {
            e.preventDefault()
            window.parent.postMessage({ type: 'FOCUS_FIELD', id: imageId, tab: 'images' }, '*');
          } else if (mapId) {
            e.preventDefault()
            window.parent.postMessage({ type: 'FOCUS_FIELD', id: mapId, tab: 'maps' }, '*');
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

    const waitForBody = () => {
      if (!doc || !doc.body) {
        setTimeout(waitForBody, 10)
        return
      }

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

  // Function to scroll preview to specific field
  const scrollPreviewToField = useCallback((fieldName) => {
    if (!iframeRef.current) return

    try {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document
      if (!iframeDoc) return

      let element = null

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

      if (!element) {
        element = iframeDoc.querySelector(`[data-editable="${fieldName}"]`)
      }

      if (!element) {
        element = iframeDoc.querySelector(`[data-image-editable="${fieldName}"]`)
      }

      if (!element) {
        element = iframeDoc.querySelector(`[data-edit-map="${fieldName}"]`) ||
          iframeDoc.querySelector(`[data-edit-map-href="${fieldName}"]`)
      }

      if (!element) {
        element = iframeDoc.getElementById(fieldName)
      }

      if (!element) {
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

  const templateAnalysis = useMemo(() => {
    if (!htmlCode) return { placeholders: [], images: [], customFields: [], maps: [] }

    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlCode, 'text/html')

    const placeholderRegex = /\{\{([a-z_]+)\}\}/gi
    const matches = [...htmlCode.matchAll(placeholderRegex)]
    const placeholders = [...new Set(matches.map(m => m[1]))]

    const imageMap = new Map()

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

    const cssBgMap = {}
    const styleTags = doc.querySelectorAll('style')
    styleTags.forEach(style => {
      const cssContent = style.innerHTML
      const ladiRegex = /#(IMAGE\w+)[^{]*\{[\s\S]*?background(?:-image)?:\s*url\(['"]?([^'"\)]+)['"]?\)/gi
      let match
      while ((match = ladiRegex.exec(cssContent)) !== null) {
        const id = match[1]
        const url = match[2]
        if (url.startsWith('data:') || url.startsWith('chrome-extension:')) continue

        const element = doc.getElementById(id);
        if (!element || !element.hasAttribute('data-image-editable')) {
          continue;
        }
        cssBgMap[id] = url
      }
    })

    const bgEditableEls = doc.querySelectorAll('[data-image-editable]')
    bgEditableEls.forEach((el) => {
      if (['style', 'script', 'head', 'meta', 'link', 'title'].includes(el.tagName.toLowerCase())) return
      if (el.id && (el.id.includes('eJOY') || el.id.includes('extension'))) return

      const attrId = el.getAttribute('data-image-editable')

      if (attrId.toUpperCase().includes('SECTION')) return

      let bgUrl = ''

      const isLadipage = el.classList.contains('ladi-element') || el.querySelector('.ladi-image-background') !== null
      if (isLadipage) {
        const bgChild = el.querySelector('.ladi-image-background')
        if (bgChild && bgChild.style.backgroundImage) {
          const match = bgChild.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)
          if (match) bgUrl = match[1]
        }
      }

      if (!bgUrl && el.style.backgroundImage) {
        const match = el.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)
        if (match) bgUrl = match[1]
      }

      if (!bgUrl && el.id && cssBgMap[el.id]) {
        bgUrl = cssBgMap[el.id]
        delete cssBgMap[el.id]
      }

      if (!bgUrl) {
        bgUrl = ''
      }

      imageMap.set(attrId, {
        id: attrId,
        htmlId: el.id,
        originalSrc: bgUrl,
        currentSrc: bgUrl,
        alt: attrId.replace(/_/g, ' '),
        className: el.className || '',
        type: isLadipage ? 'ladi-background' : 'background',
        isManaged: true
      })
    })

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

    const allImgs = doc.querySelectorAll('img')
    allImgs.forEach((img, idx) => {
      if (img.hasAttribute('data-editable')) return

      const src = img.getAttribute('src') || ''
      if (!src || src.startsWith('data:') || src.startsWith('chrome-extension:') || src.includes('extension')) return
      if (img.id && img.id.includes('eJOY')) return
      if (img.className && typeof img.className === 'string' && img.className.includes('extension')) return

      if (img.width && img.height && (img.width < 50 || img.height < 50)) return

      let id = img.id || ''
      if (!id) {
        if (img.className && typeof img.className === 'string') {
          const classList = img.className.split(' ')
          id = classList.find(cls => cls.match(/^[a-zA-Z]/)) || classList[0]
        }
        if (!id && img.alt) id = img.alt.replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase()
        if (!id && src) {
          const filename = src.split('/').pop().split('.')[0]
          if (filename && filename.length > 0) id = filename
        }
        if (!id) id = `image_${idx + 1}`
      }

      id = id.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()

      let originalId = id
      let counter = 1
      while (imageMap.has(id)) {
        id = `${originalId}_${counter}`
        counter++
      }

      img.setAttribute('data-editable', id)

      imageMap.set(id, {
        id: id,
        originalSrc: src,
        currentSrc: src,
        alt: img.getAttribute('alt') || `Ảnh ${idx + 1}`,
        className: img.className || '',
        index: idx,
        type: 'img',
        isManaged: true,
        autoDetected: true
      })
    })

    const allElements = doc.querySelectorAll('*')
    allElements.forEach((el, idx) => {
      if (el.hasAttribute('data-image-editable')) return
      if (['style', 'script', 'head', 'meta', 'link', 'title', 'img'].includes(el.tagName.toLowerCase())) return
      if (el.id && (el.id.includes('eJOY') || el.id.includes('extension'))) return

      let bgUrl = ''
      if (el.style.backgroundImage) {
        const match = el.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)
        if (match) {
          bgUrl = match[1]
          if (bgUrl.startsWith('data:') || bgUrl.startsWith('chrome-extension:')) return
        }
      }

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
        }
      }

      if (bgUrl) {
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

        id = id.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()

        let originalId = id
        let counter = 1
        while (imageMap.has(id)) {
          id = `${originalId}_${counter}`
          counter++
        }

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

    const images = Array.from(imageMap.values())

    const customFields = []

    const contentToIdMap = new Map();

    const editableTexts = doc.querySelectorAll('[data-editable]:not(img)')
    editableTexts.forEach((el, idx) => {
      let id = el.getAttribute('data-editable')
      if (/^(Section|Box|Shape|Group|Line|Item|Overlay|Container)/i.test(id)) return

      if (el.children.length > 5 || el.innerHTML.length > 2000) return
      if (el.tagName === 'SVG' || el.tagName === 'PATH' || el.tagName === 'STYLE' || el.tagName === 'SCRIPT') return

      let cleanValue = (el.innerText || '').trim()

      if (!cleanValue) return

      if (el.querySelector('img, svg, iframe, video, canvas')) return;
      if (el.querySelector('.ladi-image, .ladi-image-background, .ladi-overlay')) return;
      if (el.querySelector('input, select, textarea, button, form')) return;

      const hasBlockChildren = Array.from(el.children).some(c =>
        ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'LI', 'TABLE', 'SECTION', 'FORM', 'BLOCKQUOTE'].includes(c.tagName)
      )

      if (hasBlockChildren) return;

      if (el.children.length > 5) return

      if (cleanValue.length > 4 && contentToIdMap.has(cleanValue)) {
        const existingId = contentToIdMap.get(cleanValue);
        el.setAttribute('data-editable', existingId);
        return;
      }

      // Store primarily mapped ID
      if (cleanValue.length > 4) {
        contentToIdMap.set(cleanValue, id);
      }

      customFields.push({
        id: id,
        label: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: cleanValue,
        type: 'text'
      })
    })

    const maps = []
    const mapLinks = doc.querySelectorAll('a[href*="maps.google.com"], a[href*="goo.gl/maps"], a[data-edit-map-href]')
    mapLinks.forEach((a, idx) => {
      const id = a.getAttribute('data-edit-map-href') || `map_link_${idx + 1}`
      if (!maps.find(m => m.id === id)) {
        maps.push({
          id: id,
          type: 'link',
          originalHref: a.getAttribute('href'),
          label: a.innerText.trim() || `Link bản đồ ${idx + 1}`,
          isManaged: true
        })
      }
    })

    const mapIframes = doc.querySelectorAll('iframe[src*="google.com/maps"], iframe[data-edit-map]')
    mapIframes.forEach((iframe, idx) => {
      const id = iframe.getAttribute('data-edit-map') || `map_iframe_${idx + 1}`
      if (!maps.find(m => m.id === id)) {
        maps.push({
          id: id,
          type: 'iframe',
          originalSrc: iframe.getAttribute('src'),
          label: `Bản đồ nhúng ${idx + 1}`,
          isManaged: true
        })
      }
    })

    return { placeholders, images, customFields, maps }
  }, [htmlCode])

  // Auto-populate custom fields with template defaults if not already set
  useEffect(() => {
    if (!loading && templateAnalysis.customFields.length > 0) {
      const missingFields = templateAnalysis.customFields.filter(
        field => customFieldData[field.id] === undefined && field.value
      )

      if (missingFields.length > 0) {
        setCustomFieldData(prev => {
          const updated = { ...prev }
          missingFields.forEach(field => {
            if (updated[field.id] === undefined) {
              updated[field.id] = field.value
            }
          })
          return updated
        })
      }
    }
  }, [templateAnalysis.customFields, loading])


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            const data = await response.json()
            const city = data.address.city || data.address.town || data.address.village || data.address.state || ''
            setUserLocation({ lat: latitude, lon: longitude, city })
          } catch (err) {
            console.error('Failed to get city from coords:', err)
            setUserLocation({ lat: latitude, lon: longitude, city: '' })
          }
        },
        (error) => console.warn('Geolocation error:', error)
      )
    }
  }, [])

  const [autoSaveTimer, setAutoSaveTimer] = useState(null)
  const [lastSavedData, setLastSavedData] = useState(null)
  const [isUserEditing, setIsUserEditing] = useState(false)
  const editingTimerRef = useRef(null)
  const suggestionTimerRef = useRef(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)


  useEffect(() => {
    loadInvitation()
  }, [])

  useEffect(() => {
    if (!isUserEditing) {
      updatePreview()
    }
  }, [debouncedFormData, debouncedImageData, debouncedCustomFieldData, debouncedMapData, htmlCode, isUserEditing])

  // Update preview when user stops editing
  useEffect(() => {
    if (!isUserEditing) {
      updatePreview()
    }
  }, [isUserEditing])

  // AUTO-SAVE: Debounced auto-save when data changes
  useEffect(() => {
    if ((!invitation && !searchParams.get('previewMode')) || loading) return

    const currentData = JSON.stringify({ formData, imageData, customFieldData, mapData, htmlCode })
    if (currentData === lastSavedData) {
      setHasUnsavedChanges(false)
      return
    }

    setHasUnsavedChanges(true)

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    // Set new timer for auto-save after 5 minutes (300 seconds) of inactivity
    const timer = setTimeout(async () => {
      try {

        const compressedHtml = htmlCode
          .replace(/\s+/g, ' ')
          .replace(/>\s+</g, '><')
          .trim()

        await invitationService.update(invitation.uuid, {
          ...formData,
          event_date: formData.event_date || null,
          html_content: compressedHtml,
          image_data: JSON.stringify(imageData),
          custom_field_data: JSON.stringify(customFieldData),
          map_data: JSON.stringify(mapData),
          status: invitation.status
        })

        setLastSavedData(currentData)
        setHasUnsavedChanges(false)
        toast.success('✅ Đã tự động lưu')
      } catch (error) {
        console.error('❌ Auto-save failed:', error)
      }
    }, 300000)

    setAutoSaveTimer(timer)

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [formData, imageData, customFieldData, mapData, htmlCode, invitation, loading])

  const loadInvitation = async () => {
    try {
      setLoading(true)

      const isPreviewMode = searchParams.get('previewMode') === 'true'

      if (isPreviewMode) {
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

        const htmlContent = res.data.html_content || ''
        setHtmlCode(htmlContent)

        if (!htmlContent && res.data.template_id) {
          console.warn('⚠️ Invitation has no HTML content, attempting to load from template...')

          try {
            const templateService = (await import('../services/template.service')).default
            const templateRes = await templateService.getById(res.data.template_id)

            let templateHtml = templateRes.data?.html_template;

            if (!templateHtml && templateRes.data?.design_data) {
              try {
                const designData = typeof templateRes.data.design_data === 'string'
                  ? JSON.parse(templateRes.data.design_data)
                  : templateRes.data.design_data;

                if (designData?.html) {
                  templateHtml = designData.html;
                }
              } catch (parseErr) {
                console.error('Failed to parse design_data:', parseErr);
              }
            }

            if (templateHtml) {
              console.log('✅ Loaded HTML from template:', templateRes.data.name)
              setHtmlCode(templateHtml)

              try {
                await invitationService.update(invitationId, {
                  html_content: templateHtml,
                  title: res.data.title,
                  status: res.data.status || 'draft'
                })
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
          slug: res.data.slug || '',
          visibility: res.data.visibility || 'private'
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

        if (res.data.map_data) {
          try {
            setMapData(JSON.parse(res.data.map_data))
          } catch (e) {
            console.error('Failed to parse map_data:', e)
          }
        }

        const initialData = JSON.stringify({
          formData: loadedFormData,
          imageData: res.data.image_data ? JSON.parse(res.data.image_data) : {},
          customFieldData: res.data.custom_field_data ? JSON.parse(res.data.custom_field_data) : {},
          mapData: res.data.map_data ? JSON.parse(res.data.map_data) : {},
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
  const compileHtml = (templateHtml, currentFormData, currentImageData, currentCustomFieldData, currentMapData = {}, options = { isPreview: false }) => {
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
        const newSrc = currentImageData[img.id]
        const lookupId = img.htmlId || img.id

        if (img.type === 'ladi-background') {
          const container = doc.getElementById(lookupId)
          if (container) {
            // Tag container for interaction/scroll
            if (options.isPreview) container.setAttribute('data-image-editable', img.id)

            let bgEl = container.querySelector('.ladi-image-background')
            if (!bgEl) bgEl = container.querySelector('[class*="ladi-image-background"]')
            if (bgEl && newSrc) bgEl.style.setProperty('background-image', `url('${newSrc}')`, 'important')
          } else {
            const bgEl = doc.querySelector(`#${lookupId} .ladi-image-background`)
            if (bgEl) {
              if (options.isPreview) bgEl.setAttribute('data-image-editable', img.id)
              if (newSrc) bgEl.style.setProperty('background-image', `url('${newSrc}')`, 'important')
            }
          }
        }
        else if (img.type === 'background') {
          const elements = doc.querySelectorAll(`[data-image-editable="${img.id}"]`)
          elements.forEach(el => {
            if (newSrc) el.style.backgroundImage = `url('${newSrc}')`
          })
        } else {
          let imgEl = doc.querySelector(`img[data-editable="${img.id}"]`) || doc.querySelector(`img[data-image-editable="${img.id}"]`)
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
            // Always tag for interaction and scrolling in preview
            if (options.isPreview && !imgEl.hasAttribute('data-image-editable')) {
              imgEl.setAttribute('data-image-editable', img.id)
            }
            if (newSrc) {
              imgEl.src = newSrc
              imgEl.setAttribute('src', newSrc)
            }
          }
        }
      })

      // 2c. Map Replacements
      templateAnalysis.maps.forEach(map => {
        const data = currentMapData[map.id]
        if (data) {
          let newUrl = ''
          const address = data.address || ''
          const lat = data.lat
          const lng = data.lng

          if (lat && lng) {
            newUrl = map.type === 'link'
              ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
              : `https://maps.google.com/maps?q=${lat},${lng}&output=embed`
          } else if (address) {
            newUrl = map.type === 'link'
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
              : `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
          }

          if (newUrl) {
            if (map.type === 'link') {
              const els = doc.querySelectorAll(`a[data-edit-map-href="${map.id}"]`)
              if (els.length > 0) {
                els.forEach(el => el.href = newUrl)
              } else {
                const allLinks = doc.querySelectorAll('a')
                allLinks.forEach(el => {
                  if (el.getAttribute('href') === map.originalHref) el.href = newUrl
                })
              }
            } else {
              const els = doc.querySelectorAll(`iframe[data-edit-map="${map.id}"]`)
              if (els.length > 0) {
                els.forEach(el => el.src = newUrl)
              } else {
                const allIframes = doc.querySelectorAll('iframe')
                allIframes.forEach(el => {
                  if (el.getAttribute('src') === map.originalSrc) el.src = newUrl
                })
              }
            }
          }
        }
      })

      // 2d. Add Click Catchers for Iframes (Maps) - Only in Preview
      if (options.isPreview) {
        const allIframes = doc.querySelectorAll('iframe')
        allIframes.forEach(iframe => {
          const mapId = iframe.getAttribute('data-edit-map') ||
            (iframe.src.includes('google.com/maps') ? 'wedding-map' : null) // Fallback for auto-detection

          if (mapId) {
            const wrapper = doc.createElement('div')
            wrapper.className = 'map-editor-wrapper'
            wrapper.style.position = 'relative'
            wrapper.style.width = iframe.getAttribute('width') || '100%'
            wrapper.style.height = iframe.getAttribute('height') || (iframe.style.height || '450px')
            wrapper.style.display = iframe.style.display || 'block'

            iframe.parentNode.insertBefore(wrapper, iframe)
            wrapper.appendChild(iframe)

            const overlay = doc.createElement('div')
            overlay.setAttribute('data-edit-map', mapId)
            overlay.className = 'map-click-catcher'
            overlay.style.position = 'absolute'
            overlay.style.top = '0'
            overlay.style.left = '0'
            overlay.style.width = '100%'
            overlay.style.height = '100%'
            overlay.style.zIndex = '1000'
            overlay.style.cursor = 'pointer'
            overlay.style.backgroundColor = 'rgba(168, 85, 247, 0)' // Transparent but exists

            wrapper.appendChild(overlay)
          }
        })
      }

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
                            toggle.style.transform = 'scale(0.9)';
                      setTimeout(function() { toggle.style.transform = 'scale(1)'; }, 100);
                    });

                    // Scroll To Element Helper
                    var style = document.createElement('style');
                    style.textContent = ' @keyframes editor-ping { 0% { outline: 4px solid #a855f7; outline-offset: 0; } 50% { outline: 10px solid #a855f7; outline-offset: 15px; } 100% { outline: 4px solid #a855f7; outline-offset: 0; } } .editor-highlight-active { animation: editor-ping 0.6s ease-in-out 3 !important; z-index: 99999 !important; position: relative !important; outline: 4px solid #a855f7 !important; border-radius: 4px !important; }';
                    document.head.appendChild(style);

                    window.addEventListener('message', function(e) {
                      if (e.data.type === 'SCROLL_TO') {
                        var id = e.data.id;
                        var el = document.querySelector('[data-editable="' + id + '"]') || 
                                 document.querySelector('[data-image-editable="' + id + '"]') ||
                                 document.querySelector('[data-edit-map="' + id + '"]') ||
                                 document.getElementById(id);
                        
                        // Fallback: search by class or partial match
                        if (!el) {
                           el = document.querySelector('.' + id) || 
                                document.querySelector('[id*="' + id + '"]') ||
                                document.querySelector('[class*="' + id + '"]');
                        }

                        if (el) {
                          // Force a scroll even if close
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          
                          // High-visibility flash
                          el.classList.add('editor-highlight-active');
                          setTimeout(function() {
                            el.classList.remove('editor-highlight-active');
                          }, 3000);
                        } else {
                          console.warn('Scroll target not found:', id);
                        }
                      }
                    });
                  })();
                </script>
              `
        doc.body.insertAdjacentHTML('beforeend', musicPlayer)
      } else {
        // Even if no music, inject the scroll listener
        const scrollScript = `
          <script>
            (function() {
              var style = document.createElement('style');
              style.textContent = ' @keyframes editor-ping { 0% { outline: 4px solid #a855f7; outline-offset: 0; } 50% { outline: 10px solid #a855f7; outline-offset: 15px; } 100% { outline: 4px solid #a855f7; outline-offset: 0; } } .editor-highlight-active { animation: editor-ping 0.6s ease-in-out 3 !important; z-index: 99999 !important; position: relative !important; outline: 4px solid #a855f7 !important; border-radius: 4px !important; }';
              document.head.appendChild(style);

              window.addEventListener('message', function(e) {
                if (e.data.type === 'SCROLL_TO') {
                  var id = e.data.id;
                  var el = document.querySelector('[data-editable="' + id + '"]') || 
                           document.querySelector('[data-image-editable="' + id + '"]') ||
                           document.querySelector('[data-edit-map="' + id + '"]') ||
                           document.getElementById(id);
                  
                  // Fallback
                  if (!el) {
                     el = document.querySelector('.' + id) || 
                          document.querySelector('[id*="' + id + '"]') ||
                          document.querySelector('[class*="' + id + '"]');
                  }

                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('editor-highlight-active');
                    setTimeout(function() {
                      el.classList.remove('editor-highlight-active');
                    }, 3000);
                  } else {
                    console.warn('Scroll target not found:', id);
                  }
                }
              });
            })();
          </script>
        `
        doc.body.insertAdjacentHTML('beforeend', scrollScript)
      }

      html = '<!DOCTYPE html>' + doc.documentElement.outerHTML
    } catch (e) {
      console.error("Compile HTML Error", e)
    }
    return html
  }


  const updatePreview = () => {
    const html = compileHtml(htmlCode, debouncedFormData, debouncedImageData, debouncedCustomFieldData, mapData, { isPreview: true })
    setPreviewHtml(html)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setIsUserEditing(true)

    if (editingTimerRef.current) {
      clearTimeout(editingTimerRef.current)
    }

    let sanitizedValue = value
    if (name === 'slug') {
      sanitizedValue = value
        .toLowerCase()
        .replace(/\s+/g, '-') 
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9-]/g, '-') 
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') 
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

  const handleScrollToPreviewElement = (id) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'SCROLL_TO', id }, '*')
    }
  }

  const handleMapChange = (mapId, field, value) => {
    // Mark user as editing
    setIsUserEditing(true)
    if (editingTimerRef.current) clearTimeout(editingTimerRef.current)

    setMapData(prev => ({
      ...prev,
      [mapId]: {
        ...(prev[mapId] || {}),
        [field]: value
      }
    }))

    // Fetch suggestions if field is address (debounced)
    if (field === 'address') {
      if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current)

      if (value.length > 2) {
        suggestionTimerRef.current = setTimeout(() => {
          fetchMapSuggestions(mapId, value)
        }, 500)
      } else {
        setAddressSuggestions(prev => ({ ...prev, [mapId]: [] }))
      }
    }

    editingTimerRef.current = setTimeout(() => {
      setIsUserEditing(false)
    }, 1000)
  }

  const fetchMapSuggestions = async (mapId, query) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`)
      const data = await response.json()
      const suggestions = data.map(item => ({
        label: item.display_name,
        lat: item.lat,
        lng: item.lon,
        address: item.display_name
      }))
      setAddressSuggestions(prev => ({ ...prev, [mapId]: suggestions }))
      setSelectedSuggestionIndex(-1)
    } catch (error) {
      console.error('Error fetching map suggestions:', error)
    }
  }

  const handleAddressKeyDown = (e, mapId) => {
    const suggestions = addressSuggestions[mapId] || []
    if (suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
        e.preventDefault()
        handleSelectSuggestion(mapId, suggestions[selectedSuggestionIndex])
      }
    } else if (e.key === 'Escape') {
      setAddressSuggestions(prev => ({ ...prev, [mapId]: [] }))
      setSelectedSuggestionIndex(-1)
    }
  }

  const handleSelectSuggestion = (mapId, suggestion) => {
    setMapData(prev => ({
      ...prev,
      [mapId]: {
        ...(prev[mapId] || {}),
        address: suggestion.label,
        lat: parseFloat(suggestion.lat).toFixed(6),
        lng: parseFloat(suggestion.lng).toFixed(6)
      }
    }))
    setAddressSuggestions(prev => ({ ...prev, [mapId]: [] }))
    setSelectedSuggestionIndex(-1)
    updatePreview()
    toast.success('📍 Đã cập nhật địa chỉ và tọa độ!')
  }

  const handleCheckLocation = (mapId) => {
    const data = mapData[mapId] || {}
    let query = ''
    if (data.lat && data.lng) {
      query = `${data.lat},${data.lng}`
    } else {
      query = data.address || ''
    }

    if (query) {
      // Clear suggestions when checking
      setAddressSuggestions(prev => ({ ...prev, [mapId]: [] }))
      setSelectedSuggestionIndex(-1)
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank')
    } else {
      toast.info('Vui lòng nhập địa chỉ hoặc tọa độ để kiểm tra.')
    }
  }

  const handleUseCurrentLocation = (mapId) => {
    if (userLocation) {
      handleMapChange(mapId, 'lat', userLocation.lat)
      handleMapChange(mapId, 'lng', userLocation.lng)
      toast.info(`📍 Đã lấy tọa độ tại ${userLocation.city || 'vị trí của bạn'}`)
    } else {
      toast.error('Không tìm thấy tọa độ hiện tại. Vui lòng bật quyền truy cập vị trí.')
    }
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

  const generateSubdomainUrl = (subdomain) => {
    if (!subdomain) return ''
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

      let cleanHtml = compileHtml(htmlCode, formData, imageData, customFieldData, mapData)

      // Remove editor-styles
      cleanHtml = cleanHtml.replace(/<style[^>]*id=["']editor-styles["'][^>]*>[\s\S]*?<\/style>/gi, '')

      // Compress HTML
      const compressedHtml = cleanHtml
        .replace(/\s+/g, ' ')  
        .replace(/>\s+</g, '><') 
        .trim()

      await invitationService.update(invitation.uuid, {
        ...formData,
        event_date: formData.event_date || null, 
        html_content: compressedHtml, 
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData),
        status: invitation.status 
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
      let cleanHtml = compileHtml(htmlCode, formData, imageData, customFieldData, mapData)

      // Remove editor-styles
      cleanHtml = cleanHtml.replace(/<style[^>]*id=["']editor-styles["'][^>]*>[\s\S]*?<\/style>/gi, '')

      // Compress HTML
      const compressedHtml = cleanHtml
        .replace(/\s+/g, ' ')  
        .replace(/>\s+</g, '><')  
        .trim()

      await invitationService.update(invitation.uuid, {
        ...formData,
        event_date: formData.event_date || null,
        html_content: compressedHtml,
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData),
        map_data: JSON.stringify(mapData),
        status: invitation.status
      })

      const currentData = JSON.stringify({ formData, imageData, customFieldData, mapData, htmlCode })
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

      let cleanHtml = compileHtml(htmlCode, formData, imageData, customFieldData, mapData)
      cleanHtml = cleanHtml.replace(/<style[^>]*id=["']editor-styles["'][^>]*>[\s\S]*?<\/style>/gi, '')

      const compressedHtml = cleanHtml
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim()

      const updateResponse = await invitationService.update(invitation.uuid, {
        ...formData,
        event_date: formData.event_date || null,
        html_content: compressedHtml,
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData),
        map_data: JSON.stringify(mapData),
        status: 'published',
        visibility: 'public'
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
      toast.info('Bạn đang ở chế độ xem trước của Ultimate Editor.')
      return
    }
    if (!invitation) return

    if (hasUnsavedChanges) {
      toast.info('💾 Đang lưu thay đổi trước khi xem trước...')
      await handleSave()
    }

    try {
      setSaving(true)

      let cleanHtml = compileHtml(htmlCode, formData, imageData, customFieldData, mapData)
      cleanHtml = cleanHtml.replace(/<style[^>]*id=["']editor-styles["'][^>]*>[\s\S]*?<\/style>/gi, '')

      // Compress HTML
      const compressedHtml = cleanHtml
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim()

      const updateResponse = await invitationService.update(invitation.uuid, {
        ...formData,
        event_date: formData.event_date || null,
        html_content: compressedHtml,
        image_data: JSON.stringify(imageData),
        custom_field_data: JSON.stringify(customFieldData),
        status: invitation.status
      })

      // Get slug for preview
      const slug = formData.slug || invitation.slug

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
    <div className="h-screen bg-stone-50 dark:bg-black overflow-hidden flex flex-col">

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

        {/* 1. EDITING PANEL */}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600">edit_note</span> Thông tin
                  </div>
                  {isMobile && (
                    <button onClick={() => setActiveMobileTab('preview')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
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

                  {/* Map placeholders and custom fields */}
                  {templateAnalysis.placeholders.map(field => {
                    const isExpanded = expandedFields.has(field)
                    if (!isExpanded) return null

                    return (
                      <div key={field} className={`p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 sidebar-field-${field} animate-fade-in`}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                          {field.replace(/_/g, ' ')}
                        </label>
                        {field === 'event_date' ? (
                          <DatePicker
                            selected={formData.event_date ? new Date(formData.event_date) : null}
                            onChange={(date) => handleChange({ target: { name: 'event_date', value: date } })}
                            dateFormat="dd/MM/yyyy"
                            className="w-full bg-white dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-white px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none transition-all"
                            placeholderText="Chọn ngày"
                          />
                        ) : (
                          <input
                            type="text"
                            name={field}
                            value={formData[field] || ''}
                            onChange={handleChange}
                            placeholder={`Nhập ${field.replace(/_/g, ' ')}...`}
                            className="w-full bg-white dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-white px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none transition-all"
                          />
                        )}
                      </div>
                    )
                  })}

                  {templateAnalysis.customFields.map(field => {
                    const isExpanded = expandedFields.has(field.id)
                    if (!isExpanded) return null

                    return (
                      <div key={field.id} className={`p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 sidebar-field-${field.id} animate-fade-in`}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                          Vùng soạn thảo ({field.id})
                        </label>
                        <textarea
                          value={customFieldData[field.id] !== undefined ? customFieldData[field.id] : field.value}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          placeholder="Nhập nội dung văn bản..."
                          rows={3}
                          className="w-full bg-white dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-white px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none transition-all resize-none"
                        />
                      </div>
                    )
                  })}

                </div>
              </div>
            </div>

            {/* TAB: IMAGES */}
            <div className={`${(isMobile && activeMobileTab !== 'images') ? 'hidden' : 'block'} space-y-4 animate-fade-in`}>
              {/* Desktop only header for images section */}
              <div className="mt-4 mb-4 flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-pink-600">image</span> Thư viện ảnh
                </h3>
                {isMobile && (
                  <button onClick={() => setActiveMobileTab('preview')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
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
                      <div key={img.id} className={`relative sidebar-field-${img.id}`}>
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

                        {/* Button Group */}
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleOpenMediaLibrary(img.id)}
                            className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">photo_library</span>
                            Thay ảnh
                          </button>
                          <button
                            onClick={() => handleScrollToPreviewElement(img.id)}
                            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[11px] font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                            title="Xem vị trí ảnh trên thiệp"
                          >
                            <span className="material-symbols-outlined text-[16px]">location_searching</span>
                            Vị trí
                          </button>
                        </div>
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

            {/* TAB: MAPS */}
            {templateAnalysis.maps.length > 0 && (activeMobileTab === 'maps' || Array.from(expandedFields).some(id => templateAnalysis.maps.some(m => m.id === id))) && (
              <div className={`${(isMobile && activeMobileTab !== 'maps') ? 'hidden' : 'block'} space-y-4 animate-fade-in`}>
                <div className="mt-4 mb-4 flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600">map</span> Bản đồ & Địa điểm
                  </h3>
                  {isMobile && (
                    <button onClick={() => setActiveMobileTab('preview')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {templateAnalysis.maps.map(map => {
                    const isExpanded = expandedFields.has(map.id)
                    if (!isExpanded) return null

                    return (
                      <div key={map.id} className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4 sidebar-field-${map.id} animate-fade-in`}>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                            {map.label}
                          </label>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">
                            {map.type === 'link' ? 'LINK' : 'IFRAME'}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {/* Address Input */}
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Địa chỉ hiển thị</label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  value={mapData[map.id]?.address || ''}
                                  onChange={(e) => handleMapChange(map.id, 'address', e.target.value)}
                                  onKeyDown={(e) => handleAddressKeyDown(e, map.id)}
                                  placeholder="Nhập địa chỉ (vd: 116 Lê Duẩn...)"
                                  className="w-full bg-white dark:bg-gray-900 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none transition-all pr-10"
                                />
                                {userLocation?.city && !mapData[map.id]?.address?.includes(userLocation.city) && !addressSuggestions[map.id]?.length && (
                                  <button
                                    onClick={() => handleMapChange(map.id, 'address', (mapData[map.id]?.address || '') + ' ' + userLocation.city)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-md font-bold hover:bg-purple-100 transition-colors"
                                  >
                                    + {userLocation.city}
                                  </button>
                                )}

                                {/* Suggestions Dropdown */}
                                {addressSuggestions[map.id]?.length > 0 && (
                                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[100] overflow-hidden animate-fade-in">
                                    {addressSuggestions[map.id].map((suggestion, sIdx) => (
                                      <button
                                        key={sIdx}
                                        onClick={() => handleSelectSuggestion(map.id, suggestion)}
                                        onMouseEnter={() => setSelectedSuggestionIndex(sIdx)}
                                        className={`w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors flex items-start gap-2 ${selectedSuggestionIndex === sIdx ? 'bg-purple-50 dark:bg-purple-900/40 border-l-2 border-l-purple-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                      >
                                        <span className="material-symbols-outlined text-[16px] text-gray-400 mt-0.5">location_on</span>
                                        <span>{suggestion.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {addressSuggestions[map.id]?.length > 0 && (
                                <button
                                  onClick={() => {
                                    setAddressSuggestions(prev => ({ ...prev, [map.id]: [] }))
                                    setSelectedSuggestionIndex(-1)
                                  }}
                                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20"
                                >
                                  Xong
                                </button>
                              )}
                            </div>
                            {userLocation?.city && (
                              <p className="text-[9px] text-gray-500 mt-1 italic">
                                📍 Gợi ý: Bạn đang ở {userLocation.city}. Thêm thành phố để bản đồ chính xác hơn.
                              </p>
                            )}
                          </div>

                          {/* Coordinates */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Kinh độ (Lat)</label>
                              <input
                                type="text"
                                value={mapData[map.id]?.lat || ''}
                                onChange={(e) => handleMapChange(map.id, 'lat', e.target.value)}
                                placeholder="vd: 10.123"
                                className="w-full bg-white dark:bg-gray-900 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Vĩ độ (Lng)</label>
                              <input
                                type="text"
                                value={mapData[map.id]?.lng || ''}
                                onChange={(e) => handleMapChange(map.id, 'lng', e.target.value)}
                                placeholder="vd: 106.123"
                                className="w-full bg-white dark:bg-gray-900 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleUseCurrentLocation(map.id)}
                              className="w-full py-2 flex items-center justify-center gap-2 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">location_on</span>
                              Vị trí của tôi
                            </button>
                            <button
                              onClick={() => handleCheckLocation(map.id)}
                              className="w-full py-2 flex items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                            >
                              <span className="material-symbols-outlined text-[18px]">search</span>
                              Kiểm tra vị trí
                            </button>
                          </div>

                          <p className="text-[9px] text-gray-400 text-center leading-relaxed">
                            Hệ thống sẽ ưu tiên Tọa Độ nếu có. Nếu không có tọa độ, hệ thống sẽ tìm kiếm theo Địa Chỉ.
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

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
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* 3. MOBILE BOTTOM NAVIGATION */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/90 backdrop-blur-xl rounded-full shadow-2xl z-50 transition-transform duration-300">
          <button
            onClick={() => {
              if (activeMobileTab === 'info') {
                setActiveMobileTab('preview')
              } else {
                setActiveMobileTab('info')
                const allFieldIds = [
                  ...templateAnalysis.placeholders,
                  ...templateAnalysis.customFields.map(f => f.id)
                ]
                setExpandedFields(new Set(allFieldIds))
              }
            }}
            className={`flex flex-col items-center gap-1 ${activeMobileTab === 'info' ? 'text-white' : 'text-gray-500'}`}
          >
            <span className={`material-symbols-outlined text-2xl transition-all ${activeMobileTab === 'info' ? '-translate-y-1' : ''}`}>edit_note</span>
          </button>

          <div className="w-px h-6 bg-gray-700"></div>

          <button
            onClick={() => {
              if (activeMobileTab === 'images') {
                setActiveMobileTab('preview')
              } else {
                setActiveMobileTab('images')
                const allImageIds = templateAnalysis.images.map(img => img.id)
                setExpandedFields(prev => new Set([...prev, ...allImageIds]))
              }
            }}
            className={`flex flex-col items-center gap-1 ${activeMobileTab === 'images' ? 'text-white' : 'text-gray-500'}`}
          >
            <span className={`material-symbols-outlined text-2xl transition-all ${activeMobileTab === 'images' ? '-translate-y-1' : ''}`}>image</span>
          </button>

          {templateAnalysis.maps.length > 0 && (
            <>
              <div className="w-px h-6 bg-gray-700"></div>
              <button
                onClick={() => {
                  if (activeMobileTab === 'maps') {
                    setActiveMobileTab('preview')
                  } else {
                    setActiveMobileTab('maps')
                    const allMapIds = templateAnalysis.maps.map(m => m.id)
                    setExpandedFields(prev => new Set([...prev, ...allMapIds]))
                  }
                }}
                className={`flex flex-col items-center gap-1 ${activeMobileTab === 'maps' ? 'text-white' : 'text-gray-500'}`}
              >
                <span className={`material-symbols-outlined text-2xl transition-all ${activeMobileTab === 'maps' ? '-translate-y-1' : ''}`}>map</span>
              </button>
            </>
          )}

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

// Custom CSS 
if (typeof document !== 'undefined' && !document.getElementById('react-datepicker-styles')) {
  const style = document.createElement('style')
  style.id = 'react-datepicker-styles'
  style.textContent = `
    @keyframes highlightPulse {
      0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); border-color: #a855f7; }
      50% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); border-color: #a855f7; }
      100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
    }

    .highlight-sidebar-field {
      animation: highlightPulse 2s cubic-bezier(0.4, 0, 0.6, 1);
      border-color: #a855f7 !important;
      background-color: rgba(168, 85, 247, 0.05) !important;
    }

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
      background: #f3e8ff;
      color: #6b21a8;
    }
    
    .react-datepicker__time-list-item--selected {
      background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
      color: white;
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
  try {
    document.head.appendChild(style)
  } catch (error) {
    console.warn('Could not inject DatePicker styles:', error)
  }
}

