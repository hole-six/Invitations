// Export template to SQL INSERT statement
// Công cụ để convert template JavaScript sang SQL

export const exportTemplateToSQL = (template) => {
  const designDataJSON = JSON.stringify(template.designData)
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/\n/g, '\\n') // Escape newlines
  
  const tagsArray = template.tags || ['wedding', 'template']
  const tagsJSON = JSON.stringify(tagsArray).replace(/'/g, "\\'")
  
  const sql = `
-- Template: ${template.name}
INSERT INTO templates (
    id,
    uuid,
    category_id,
    name,
    slug,
    description,
    thumbnail_url,
    preview_url,
    design_data,
    is_premium,
    is_featured,
    is_active,
    tags,
    created_at
) VALUES (
    ${template.id},
    UUID(),
    ${template.categoryId || 1},
    '${template.name.replace(/'/g, "\\'")}',
    '${template.slug}',
    '${template.description.replace(/'/g, "\\'")}',
    '${template.thumbnail}',
    '${template.thumbnail}',
    '${designDataJSON}',
    ${template.isPremium ? 1 : 0},
    ${template.isFeatured ? 1 : 0},
    1,
    '${tagsJSON}',
    NOW()
);
`
  
  return sql
}

// Export all templates
export const exportAllTemplatesToSQL = (templates) => {
  let sql = `-- ============================================
-- EXPORTED WEDDING TEMPLATES
-- Generated: ${new Date().toISOString()}
-- ============================================

USE wedding_invitations;

`
  
  templates.forEach(template => {
    sql += exportTemplateToSQL(template)
    sql += '\n\n'
  })
  
  sql += `
-- ============================================
-- Verify insertion
-- ============================================

SELECT 
    id,
    name,
    slug,
    is_premium,
    is_featured,
    JSON_LENGTH(design_data, '$.elements') as element_count,
    created_at
FROM templates 
WHERE id >= ${templates[0]?.id || 100}
ORDER BY id;
`
  
  return sql
}

// Download SQL file
export const downloadTemplateSQL = (template) => {
  const sql = exportTemplateToSQL(template)
  const blob = new Blob([sql], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `template_${template.slug}.sql`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Download all templates SQL
export const downloadAllTemplatesSQL = (templates) => {
  const sql = exportAllTemplatesToSQL(templates)
  const blob = new Blob([sql], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `all_templates_${Date.now()}.sql`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Copy SQL to clipboard
export const copyTemplateSQL = async (template) => {
  const sql = exportTemplateToSQL(template)
  try {
    await navigator.clipboard.writeText(sql)
    return true
  } catch (err) {
    console.error('Failed to copy SQL:', err)
    return false
  }
}

export default {
  exportTemplateToSQL,
  exportAllTemplatesToSQL,
  downloadTemplateSQL,
  downloadAllTemplatesSQL,
  copyTemplateSQL
}
