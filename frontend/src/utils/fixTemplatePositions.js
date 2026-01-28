// Fix template element positions to fit within canvas
// For centered text: x should be (canvasWidth - elementWidth) / 2
// For canvas width 450px and element width 400px: x = 25

export const fixTemplatePositions = (template) => {
  if (!template || !template.designData) return template

  const canvasWidth = template.designData.canvas?.width || 450
  
  const fixedElements = template.designData.elements.map(element => {
    const fixed = { ...element }

    // Fix text elements with center alignment
    if (fixed.type === 'text' && fixed.textAlign === 'center') {
      const elementWidth = fixed.width || 400
      // Calculate correct x position for centered element
      fixed.x = (canvasWidth - elementWidth) / 2
    }

    // Fix shapes that should be centered
    if (fixed.type === 'shape' && fixed.id?.includes('cover')) {
      const elementWidth = fixed.width || 100
      fixed.x = (canvasWidth - elementWidth) / 2
    }

    return fixed
  })

  return {
    ...template,
    designData: {
      ...template.designData,
      elements: fixedElements
    }
  }
}

export default fixTemplatePositions
