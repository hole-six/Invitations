// Validate and fix template data before loading into editor

export const validateTemplate = (template) => {
  if (!template || !template.designData) {
    console.warn('⚠️ Template missing designData')
    return null
  }

  const { designData } = template
  
  // Validate canvas
  if (!designData.canvas) {
    console.warn('⚠️ Template missing canvas settings')
    return null
  }

  // Validate elements
  if (!Array.isArray(designData.elements)) {
    console.warn('⚠️ Template elements is not an array')
    return null
  }

  // Fix common issues in elements
  const fixedElements = designData.elements.map((element, index) => {
    const fixed = { ...element }

    // Ensure required properties
    if (!fixed.id) {
      fixed.id = `element-${Date.now()}-${index}`
      console.warn(`⚠️ Element missing ID, generated: ${fixed.id}`)
    }

    if (!fixed.type) {
      console.error(`❌ Element ${fixed.id} missing type`)
      return null
    }

    // Ensure position
    if (typeof fixed.x !== 'number') fixed.x = 0
    if (typeof fixed.y !== 'number') fixed.y = 0

    // Ensure size for non-text elements
    if (fixed.type !== 'text') {
      if (typeof fixed.width !== 'number') fixed.width = 100
      if (typeof fixed.height !== 'number') fixed.height = 100
    }

    // Ensure visibility
    if (typeof fixed.visible !== 'boolean') fixed.visible = true
    if (typeof fixed.locked !== 'boolean') fixed.locked = false
    if (typeof fixed.opacity !== 'number') fixed.opacity = 1
    if (typeof fixed.rotation !== 'number') fixed.rotation = 0
    if (typeof fixed.zIndex !== 'number') fixed.zIndex = index

    // Type-specific fixes
    if (fixed.type === 'text') {
      if (!fixed.content && fixed.content !== '') fixed.content = 'Text'
      if (!fixed.fontSize) fixed.fontSize = 16
      if (!fixed.fontFamily) fixed.fontFamily = 'Arial'
      if (!fixed.color) fixed.color = '#000000'
      if (!fixed.fontWeight) fixed.fontWeight = 'normal'
      if (!fixed.fontStyle) fixed.fontStyle = 'normal'
      if (!fixed.textAlign) fixed.textAlign = 'left'
      if (!fixed.textDecoration) fixed.textDecoration = 'none'
      if (typeof fixed.lineHeight !== 'number') fixed.lineHeight = 1.2
      if (typeof fixed.letterSpacing !== 'number') fixed.letterSpacing = 0
    }

    if (fixed.type === 'image') {
      if (!fixed.url) {
        console.error(`❌ Image element ${fixed.id} missing URL`)
        return null
      }
    }

    if (fixed.type === 'shape') {
      if (!fixed.shapeType) fixed.shapeType = 'rectangle'
      if (!fixed.fill) fixed.fill = '#cccccc'
    }

    if (fixed.type === 'music') {
      if (!fixed.icon) fixed.icon = 'music_note'
      if (!fixed.backgroundColor) fixed.backgroundColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      if (!fixed.iconColor) fixed.iconColor = '#ffffff'
      if (typeof fixed.borderRadius !== 'number') fixed.borderRadius = 30
    }

    return fixed
  }).filter(Boolean) // Remove null elements

  console.log(`✅ Validated template: ${template.name}`)
  console.log(`📊 Elements: ${designData.elements.length} → ${fixedElements.length} (${designData.elements.length - fixedElements.length} removed)`)

  return {
    ...template,
    designData: {
      ...designData,
      elements: fixedElements
    }
  }
}

export default validateTemplate
