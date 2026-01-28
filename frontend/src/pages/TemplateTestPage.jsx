import React from 'react'
import { useNavigate } from 'react-router-dom'
import allTemplates from '../data/premiumTemplates'

const TemplateTestPage = () => {
  const navigate = useNavigate()

  const testTemplate = (template) => {
    console.log('🧪 Testing template:', template.name)
    console.log('📦 Template data:', template)
    
    // Store in sessionStorage
    sessionStorage.setItem('selectedTemplate', JSON.stringify(template))
    
    // Navigate to editor
    navigate(`/editor?template=${template.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Template Test Page</h1>
        
        <div className="grid grid-cols-3 gap-6">
          {allTemplates.map((template) => (
            <div 
              key={template.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => testTemplate(template)}
            >
              <img 
                src={template.thumbnail} 
                alt={template.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">{template.category}</span>
                  <span className="text-xs text-gray-500">
                    {template.designData?.elements?.length || 0} elements
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Canvas: {template.designData?.canvas?.width}x{template.designData?.canvas?.height}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TemplateTestPage
