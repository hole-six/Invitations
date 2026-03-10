import React, { useState } from "react"
import { useToast } from "../context/ToastContext"

const CreateCategoryModal = ({ onClose, onCreate, initialData }) => {
  const toast = useToast()
  console.log("Initial Data:", initialData) // Debug log to check initialData

  const [formData, setFormData] = useState({
  name: initialData?.name || "",
  slug: initialData?.slug || "",
  description: initialData?.description || "",
  display_order: initialData?.display_order || 1,
  is_active: initialData?.is_active ?? true
})

  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleNameChange = (value) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)
    }))
  }

  const handleSubmit = async () => {
  if (!formData.name) {
    toast.warning("⚠️ Vui lòng nhập tên category!")
    return
  }

  try {
    setIsSubmitting(true)

    await onCreate({
      ...formData,
      display_order: Number(formData.display_order)
    })

    toast.success(
      initialData ? "🎉 Cập nhật thành công!" : "🎉 Tạo category thành công!"
    )

    onClose()

  } catch (error) {
    toast.error("❌ Không thể xử lý category")
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6">

       <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
  {initialData ? "Cập nhật Category" : "Tạo Category"}
</h2>

        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="text-sm font-medium">Tên Category</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              placeholder="Hiện Đại"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-sm font-medium">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, slug: e.target.value }))
              }
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              placeholder="hien-dai"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              placeholder="Thiệp cưới phong cách hiện đại..."
            />
          </div>

          {/* Display order */}
          <div>
            <label className="text-sm font-medium">Display Order</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  display_order: e.target.value
                }))
              }
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  is_active: e.target.checked
                }))
              }
            />
            <span>Active</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200"
          >
            Hủy
          </button>

         <button
  onClick={handleSubmit}
  disabled={isSubmitting}
  className="px-5 py-2 rounded-lg bg-primary text-white"
>
  {isSubmitting
    ? "Đang xử lý..."
    : initialData
    ? "Cập nhật"
    : "Tạo Category"}
</button>
        </div>

      </div>
    </div>
  )
}

export default CreateCategoryModal