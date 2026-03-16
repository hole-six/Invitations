import { useEffect, useState } from "react"
import { useToast } from "../context/ToastContext"
import Modal from "../components/Modal"

const CategoryManageModal = ({ isOpen = true, onClose, onCreate, initialData }) => {
  const toast = useToast()

  const [formData, setFormData] = useState({
    id: initialData?.id || null,
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
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (value) => {
    setFormData(prev => ({ ...prev, name: value }))
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

      toast.success(initialData ? "🎉 Cập nhật thành công!" : "🎉 Tạo category thành công!")

      onClose()
    } catch (error) {
      toast.error("❌ Không thể xử lý category")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Cập nhật Category" : "Tạo Category"}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting
              ? "Đang xử lý..."
              : initialData
                ? "Cập nhật"
                : "Tạo Category"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên Category</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Hiện Đại"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="hien-dai"
          />
          <button
            onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(formData.name) }))}
            className="mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
          >
            Tạo Slug
          </button>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Thiệp cưới phong cách hiện đại..."
          />
        </div>

        {/* Display order */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Order</label>
          <input
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData(prev => ({ ...prev, display_order: e.target.value }))}
            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            id="is_active"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
        </div>
      </div>
    </Modal>
  )
}

export default CategoryManageModal
