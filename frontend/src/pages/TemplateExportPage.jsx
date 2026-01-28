import React, { useState } from 'react'
import allTemplates from '../data/premiumTemplates'
import { 
  downloadTemplateSQL, 
  downloadAllTemplatesSQL, 
  copyTemplateSQL 
} from '../utils/exportTemplateToSQL'

const TemplateExportPage = () => {
  const [copiedId, setCopiedId] = useState(null)

  const handleCopySQL = async (template) => {
    const success = await copyTemplateSQL(template)
    if (success) {
      setCopiedId(template.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4">📦 Export Templates to SQL</h1>
          <p className="text-gray-600 mb-6">
            Export các template sang SQL để import vào database MySQL
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={() => downloadAllTemplatesSQL(allTemplates)}
              className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">download</span>
              Download All Templates SQL
            </button>
            
            <div className="text-sm text-gray-500 flex items-center">
              {allTemplates.length} templates
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {allTemplates.map((template) => (
            <div 
              key={template.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="flex">
                <img 
                  src={template.thumbnail} 
                  alt={template.name}
                  className="w-48 h-64 object-cover"
                />
                
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{template.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          ID: {template.id}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {template.category}
                        </span>
                        {template.isPremium && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">
                            PREMIUM
                          </span>
                        )}
                        {template.isFeatured && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">
                            FEATURED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Canvas:</span>
                      <div className="font-mono text-xs">
                        {template.designData.canvas.width}x{template.designData.canvas.height}px
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Elements:</span>
                      <div className="font-bold">
                        {template.designData.elements.length}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Pages:</span>
                      <div className="font-bold">
                        {template.designData.canvas.pages}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadTemplateSQL(template)}
                      className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Download SQL
                    </button>
                    
                    <button
                      onClick={() => handleCopySQL(template)}
                      className={`px-4 py-2 rounded font-medium transition-colors flex items-center gap-2 text-sm ${
                        copiedId === template.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {copiedId === template.id ? 'check' : 'content_copy'}
                      </span>
                      {copiedId === template.id ? 'Copied!' : 'Copy SQL'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">📝 Hướng dẫn sử dụng:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Click "Download All Templates SQL" để tải file SQL chứa tất cả templates</li>
            <li>Hoặc download từng template riêng lẻ</li>
            <li>Mở phpMyAdmin hoặc MySQL Workbench</li>
            <li>Chọn database <code className="bg-blue-100 px-1 rounded">wedding_invitation</code></li>
            <li>Import file SQL vừa download</li>
            <li>Kiểm tra bảng <code className="bg-blue-100 px-1 rounded">templates</code> để xem dữ liệu</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default TemplateExportPage
