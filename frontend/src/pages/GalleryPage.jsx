import React, { useState, useEffect, useMemo, useRef } from "react";
import { Lightbox } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import mediaService from "../services/media.service";
import apiService from "../services/api.service";
import { useToast } from "../context/ToastContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const GalleryContent = () => {
  const toast = useToast();
  const locale = navigator.language || "vi-VN";
  const DEFAULT_FOLDER = "wedding";
  const labels = {
    common: {
      error_default: "Có lỗi xảy ra. Vui lòng thử lại.",
      confirm_delete: "Bạn có chắc muốn xóa?",
      deleted_success: "Đã xóa thành công",
      required: "Vui lòng nhập thông tin",
      created_success: "Tạo thành công",
      updated_success: "Cập nhật thành công",
      success: "Thành công",
      loading_data: "Đang tải...",
      delete: "Xóa",
      add: "Thêm",
      select_all: "Chọn tất cả",
    },
    gallery: {
      title: "Ảnh",
      albums: "Album ảnh",
      sortBy: "Sắp xếp",
      sortDay: "Theo ngày",
      sortMonth: "Theo tháng",
      sortYear: "Theo năm",
      delete_message: "Bạn có chắc muốn xóa ảnh này?",
      delete_album_message: "Bạn có chắc muốn xóa album này?",
      deleted_success: "Đã xóa ảnh",
      album_deleted_success: "Đã xóa album",
      album_added_success: "Đã tạo album",
      album_updated_success: "Đã cập nhật album",
      album_name_placeholder: "Nhập tên album",
      no_photos: "Chưa có ảnh",
      no_albums: "Chưa có album",
      image_open: "Mở ảnh",
      image_delete: "Xóa ảnh",
      album_open: "Mở album",
      album_edit: "Sửa album",
      album_delete: "Xóa album",
    },
  };
  const tr = (key) => {
    const parts = key.split(".");
    let value = labels;
    for (const p of parts) {
      value = value?.[p];
      if (!value) break;
    }
    return value || key;
  };
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [expandedYear, setExpandedYear] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideshowPlaying, setSlideshowPlaying] = useState(false);
  const slideshowRef = useRef(null);
  const progressInterval = useRef(null);
  const [progress, setProgress] = useState(0);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortType, setSortType] = useState("day"); // Options: 'day', 'month', 'year'
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total_pages: 1,
    total: 0,
  });
  const [menuConfig, setMenuConfig] = useState({
    visible: false,
    x: 0,
    y: 0,
    index: null,
    type: "photo",
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchGallery = async (pageNum) => {
    try {
      setLoading(true);
      const response = await apiService.get("/api/v1/system/listFiles", {
        page: pageNum,
        limit: 20,
        folder: DEFAULT_FOLDER,
      });
      const data = Array.isArray(response?.data) ? response.data : [];
      const pagData = response?.pagination || {
        page: pageNum,
        total_pages: 1,
        total: data.length,
        has_next: false,
      };
      const normalizedImages = data.map((img) => ({
        ...img,
        selected: false,
      }));

      setImages(normalizedImages);
      setPagination(pagData);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error fetching gallery:", error);
      toast.error(tr("common.error_default") || "Không thể tải thư viện ảnh");
    } finally {
      setLoading(false);
    }
  };

  //Helper to generate page numbers with ellipses
  const getPageNumbers = () => {
    const { page, total_pages } = pagination;
    const pages = [];
    const range = 2;
    for (let i = 1; i <= total_pages; i++) {
      if (
        i === 1 ||
        i === total_pages ||
        (i >= page - range && i <= page + range)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  // Grouping and Sorting ---
  const groupedData = useMemo(() => {
    const groups = {};
    images.forEach((img) => {
      const date = new Date(img.created_at);
      const year = date.getFullYear();
      const month = date.toLocaleString(locale, { month: "long" });
      const day = date.getDate().toString().padStart(2, "0");

      let groupKey =
        sortType === "year"
          ? `${year}`
          : sortType === "month"
            ? `${month} ${year}`
            : `${month} ${day}, ${year}`;

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(img);
    });

    return Object.keys(groups)
      .sort(
        (a, b) =>
          new Date(groups[b][0].created_at).getTime() - new Date(groups[a][0].created_at).getTime(),
      )
      .map((key) => ({ label: key, items: groups[key] }));
  }, [images, sortType, locale]);

  // Sidebar Timeline Data
  const timeline = useMemo(() => {
    const years = {};
    images.forEach((img) => {
      const d = new Date(img.created_at);
      const y = d.getFullYear();

      const m = d.toLocaleString(locale, { month: "long" });

      if (!years[y]) years[y] = new Set();
      years[y].add(m);
    });
    return Object.entries(years).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [images, locale]);

  const toggleSortMenu = (e) => {
    e?.stopPropagation();
    setShowSortMenu((prev) => !prev);
    setShowCalendar(false);
  };

  const slides = useMemo(() => images.map((img) => ({ src: img.url })), [images]);

  // Select All button (Images or Albums)
  const handleSelectAll = () => {
    const newValue = !(images.length > 0 && images.every((i) => i.selected));
    setImages(images.map((img) => ({ ...img, selected: newValue })));
  };

  // Toggle selection
  const toggleSelection = (id, type) => {
    if (type === "photo") {
      setImages((prev) =>
        prev.map((img) =>
          img.file_key === id ? { ...img, selected: !img.selected } : img,
        ),
      );
    }
  };

  //  Handle bulk delete
  const handleDelete = async () => {
    const selectedItems = images.filter((img) => img.selected);

    if (!selectedItems.length) return;

    const confirmText =
      tr("gallery.delete_message") || tr("common.confirm_delete");
    if (!window.confirm(confirmText)) return;

    try {
      await Promise.all(
        selectedItems.map((img) =>
          mediaService.delete(img.file_key),
        ),
      );
      setImages((prev) => prev.filter((img) => !img.selected));
      toast.success(
        tr("gallery.deleted_success") ||
        tr("common.deleted_success") ||
        "Đã xóa thành công",
      );
    } catch (e) {
      console.error("Delete failed", e);
      toast.error(tr("common.error_default") || "Không thể xóa");
    }
  };

  //  Handle single picture delete using mouse
  const handleSingleDelete = async (indexFromClick) => {
    const index = typeof indexFromClick === "number" ? indexFromClick : menuConfig.index;
    const imgToDelete = images[index];

    if (!imgToDelete) return;

    if (!window.confirm(tr("gallery.delete_message") || tr("common.confirm_delete"))) return;

    try {
      await mediaService.delete(imgToDelete.file_key);

      setImages((prev) =>
        prev.filter((img) => img.file_key !== imgToDelete.file_key),
      );
      setMenuConfig((prev) => ({ ...prev, visible: false }));

      toast.success(tr("gallery.deleted_success") || tr("common.deleted_success") || "Đã xóa");
    } catch (error) {
      console.error("Delete failed", error);
      toast.error(tr("common.error_default") || "Không thể xóa");
    }
  };

  // Right click image behavior
  const handleContextMenu = (e, img) => {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 150;
    const menuHeight = 100;

    let x = e.pageX;
    let y = e.pageY;

    if (x + menuWidth > window.innerWidth) {
      x = x - menuWidth;
    }

    if (y + menuHeight > window.innerHeight) {
      y = y - menuHeight;
    }

    setMenuConfig({
      visible: true,
      x: x,
      y: y,
      type: "photo",
      index: images.findIndex((i) => i.file_key === img.file_key),
    });
  };

  // Toogle month in the year timeline
  const handleYearClick = (year) => {
    setExpandedYear((prevYear) => (prevYear === year ? null : year));

    setSortType("year");
    setTimeout(() => scrollToGroup(year), 100);
  };

  const handleAdd = async () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await mediaService.upload(
        file,
        DEFAULT_FOLDER
      );
      toast.success(tr("common.success") || "Tải lên thành công");

      // Refresh gallery
      fetchGallery(1);
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(tr("common.error_default") || "Tải lên thất bại");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = null; // Clear input
    }
  };

  const scrollToGroup = (groupLabel) => {
    const element = document.getElementById(`group-${groupLabel}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    //fetch gallery data
    fetchGallery(1);

    // Close dropdown when clicking outside
    const close = () => {
      setShowSortMenu(false);
      setShowCalendar(false);
      setMenuConfig((prev) =>
        prev.visible ? { ...prev, visible: false } : prev,
      );
    };
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    window.addEventListener("scroll", close);

    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
      window.removeEventListener("scroll", close);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <main className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-2">
              <h1
                className="text-xl font-semibold text-gray-900"
              >
                {tr("gallery.title")}
              </h1>
              <span className="ml-2 text-xs text-gray-500">
                {`${pagination.total || images.length} ảnh`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  checked={
                    images.length > 0 && images.every((i) => i.selected)
                  }
                  onChange={handleSelectAll}
                />
                {tr("common.select_all") || "Chọn tất cả"}
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={toggleSortMenu}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
                >
                  <span className="material-symbols-outlined text-[16px]">filter_alt</span>
                  {tr("gallery.sortBy")}
                </button>
                {showSortMenu && (
                  <div
                    className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500">
                      {tr("gallery.sortBy")}
                    </div>
                    {[
                      { key: "day", label: tr("gallery.sortDay") },
                      { key: "month", label: tr("gallery.sortMonth") },
                      { key: "year", label: tr("gallery.sortYear") },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setSortType(item.key);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${sortType === item.key ? "text-gray-900 font-semibold" : "text-gray-600"}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                style={{
                  opacity: images.some((i) => i.selected) ? 1 : 0.4,
                }}
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                {tr("common.delete")}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {isUploading ? (tr("common.loading_data") || "Đang tải") : (tr("common.add") || "Thêm")}
                </button>
              </div>
            </div>
          </div>

            <div className="flex gap-4">
              <aside className="hidden md:block relative">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCalendar(!showCalendar);
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                </button>
                {showCalendar && (
                  <div className="absolute top-12 left-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20">
                    <ul className="space-y-2">
                      {timeline.map(([year, months]) => {
                        const isExpanded = expandedYear === year;
                        return (
                          <li key={year}>
                            <button
                              type="button"
                              onClick={() => handleYearClick(year)}
                              className={`w-full text-left text-sm font-semibold ${isExpanded ? "text-gray-900" : "text-gray-600"}`}
                            >
                              {year}
                            </button>
                            {isExpanded && (
                              <ul className="mt-2 space-y-1 pl-3">
                                {[...months].map((month) => (
                                  <li key={month}>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSortType("month");
                                        setShowCalendar(false);
                                        setTimeout(() => scrollToGroup(`${month} ${year}`), 100);
                                      }}
                                      className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                      {month}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </aside>

            <div className="flex-1">
              {loading ? (
                <div className="py-16 text-center text-gray-500">
                  {tr("common.loading_data")}
                </div>
              ) : images.length > 0 ? (
                <div className="space-y-6">
                  {groupedData.map((group) => (
                    <div key={group.label} id={`group-${group.label}`}>
                      <h5 className="text-sm font-semibold text-gray-500 mb-3">{group.label}</h5>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                        {group.items.map((img) => (
                          <div key={img.file_key} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
                            <button
                              type="button"
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-red-500 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                              onClick={(e) => {
                                e.stopPropagation();
                                const idx = images.findIndex(i => i.file_key === img.file_key);
                                setMenuConfig((prev) => ({ ...prev, index: idx }));
                                handleSingleDelete(idx);
                              }}
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                            <label className="absolute top-2 left-2">
                              <input
                                type="checkbox"
                                checked={img.selected}
                                onChange={() => toggleSelection(img.file_key, "photo")}
                                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                              />
                            </label>
                            <div className="relative w-full aspect-square overflow-hidden">
                              <img
                                src={img.url}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                onContextMenu={(e) => handleContextMenu(e, img)}
                                onClick={() => {
                                  setCurrentIndex(images.findIndex((i) => i.file_key === img.file_key));
                                  setLightboxOpen(true);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-gray-500">
                  {tr("gallery.no_photos")}
                </div>
              )}
            </div>
          </div>

          {pagination.total_pages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <div className="text-sm text-gray-500">
                Trang {pagination.page} / {pagination.total_pages}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  disabled={pagination.page === 1}
                  onClick={() => fetchGallery(pagination.page - 1)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                {getPageNumbers().map((pageNum, idx) => (
                  <button
                    key={`${pageNum}-${idx}`}
                    type="button"
                    disabled={pageNum === "..."}
                    onClick={() => {
                      if (pageNum !== "...") fetchGallery(pageNum);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${
                      pageNum === pagination.page
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    } ${pageNum === "..." ? "cursor-default opacity-60" : ""}`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!pagination.has_next && pagination.page >= pagination.total_pages}
                  onClick={() => fetchGallery(pagination.page + 1)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>

      {menuConfig.visible && (
        <div
          className="fixed z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          style={{ top: menuConfig.y, left: menuConfig.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            onClick={() => {
              setLightboxOpen(true);
              setCurrentIndex(menuConfig.index);
              setMenuConfig((prev) => ({ ...prev, visible: false }));
            }}
          >
            {tr("gallery.image_open")}
          </div>
          <div className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer" onClick={handleSingleDelete}>
            {tr("gallery.image_delete")}
          </div>
        </div>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => {
          setLightboxOpen(false);
          setSlideshowPlaying(false);
          setProgress(0);
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
        }}
        slides={slides}
        index={currentIndex}
        plugins={[Zoom, Slideshow]}
        carousel={{ imageFit: "contain" }}
        zoom={{ maxZoomPixelRatio: 3 }}
        slideshow={{ autoplay: false, delay: 3000 }}
        render={{
          slideContainer: ({ slide, children }) => (
            <div className="relative">
              {children}
              {slideshowPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                  <div
                    className="h-full bg-white"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )
        }}
        on={{
          viewing: ({ index }) => setCurrentIndex(index),
          slideshowStart: () => {
            setSlideshowPlaying(true);
            setProgress(0);
            const duration = 3000;
            const interval = 50;
            let elapsed = 0;
            if (progressInterval.current) clearInterval(progressInterval.current);
            progressInterval.current = setInterval(() => {
              elapsed += interval;
              setProgress((elapsed / duration) * 100);
              if (elapsed >= duration) {
                setProgress(0);
                elapsed = 0;
              }
            }, interval);
          },
          slideshowStop: () => {
            setSlideshowPlaying(false);
            setProgress(0);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
          },
        }}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*"
      />

    </div>
  );
};

// export default GalleryPage;

const GalleryPage = () => {
  return (
    <div className="bg-gray-50 dark:bg-black text-gray-900 dark:text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 md:px-6 pt-6 pb-10">
        <GalleryContent />
      </main>
      <Footer />
    </div>
  )
}

export default GalleryPage
