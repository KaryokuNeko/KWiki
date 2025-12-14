'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface Video {
  id: number
  videoUrl: string
  titleEn: string
  titleZh: string
  descEn: string | null
  descZh: string | null
  thumbnailUrl: string | null
  autoplay: boolean
  order: number
  published: boolean
  createdAt: string
  updatedAt: string
}

export function VideoManagement() {
  const t = useTranslations('content')
  const tCommon = useTranslations('common')

  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    videoUrl: '',
    titleEn: '',
    titleZh: '',
    descEn: '',
    descZh: '',
    thumbnailUrl: '',
    autoplay: true,
    order: 0,
    published: false,
  })
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  async function fetchVideos() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/content/videos')
      const data = await res.json()
      if (data.success) {
        setVideos(data.videos)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to fetch videos')
    } finally {
      setLoading(false)
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingVideo(true)
      const formData = new FormData()
      formData.append('video', file)

      const res = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, videoUrl: data.url }))
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to upload video')
    } finally {
      setUploadingVideo(false)
    }
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingThumbnail(true)
      const formDataObj = new FormData()
      formDataObj.append('image', file)

      const res = await fetch('/api/upload/image?folder=thumbnails', {
        method: 'POST',
        body: formDataObj,
      })
      const data = await res.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, thumbnailUrl: data.url }))
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to upload thumbnail')
    } finally {
      setUploadingThumbnail(false)
    }
  }

  function openCreateDialog() {
    setEditingVideo(null)
    setFormData({
      videoUrl: '',
      titleEn: '',
      titleZh: '',
      descEn: '',
      descZh: '',
      thumbnailUrl: '',
      autoplay: true,
      order: videos.length,
      published: false,
    })
    setShowDialog(true)
  }

  function openEditDialog(video: Video) {
    setEditingVideo(video)
    setFormData({
      videoUrl: video.videoUrl,
      titleEn: video.titleEn,
      titleZh: video.titleZh,
      descEn: video.descEn || '',
      descZh: video.descZh || '',
      thumbnailUrl: video.thumbnailUrl || '',
      autoplay: video.autoplay,
      order: video.order,
      published: video.published,
    })
    setShowDialog(true)
  }

  async function handleSave() {
    if (!formData.videoUrl || !formData.titleEn || !formData.titleZh) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const url = editingVideo
        ? `/api/admin/content/videos/${editingVideo.id}`
        : '/api/admin/content/videos'
      const method = editingVideo ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setShowDialog(false)
        fetchVideos()
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to save video')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const res = await fetch(`/api/admin/content/videos/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchVideos()
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to delete video')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('videos.title')}</h1>
        <button className="btn btn-primary" onClick={openCreateDialog}>
          {t('videos.create')}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Videos Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>{t('videos.fields.thumbnail')}</th>
              <th>{t('videos.fields.titleEn')}</th>
              <th>{t('videos.fields.titleZh')}</th>
              <th>{t('videos.fields.order')}</th>
              <th>{t('videos.fields.published')}</th>
              <th>{tCommon('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {videos.map(video => (
              <tr key={video.id}>
                <td>
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt="" className="w-20 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-20 h-12 bg-base-300 rounded flex items-center justify-center text-xs">
                      No thumbnail
                    </div>
                  )}
                </td>
                <td>{video.titleEn}</td>
                <td>{video.titleZh}</td>
                <td>{video.order}</td>
                <td>
                  <span className={`badge ${video.published ? 'badge-success' : 'badge-ghost'}`}>
                    {video.published ? tCommon('common.yes') : tCommon('common.no')}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-outline" onClick={() => openEditDialog(video)}>
                      {tCommon('common.edit')}
                    </button>
                    <button className="btn btn-sm btn-error btn-outline" onClick={() => handleDelete(video.id)}>
                      {tCommon('common.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {videos.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/60">
                  {t('videos.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingVideo ? t('videos.edit') : t('videos.create')}
            </h3>

            <div className="space-y-4">
              {/* Video Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('videos.fields.videoFile')} *</span>
                </label>
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={handleVideoUpload}
                  disabled={uploadingVideo}
                  className="file-input file-input-bordered w-full"
                />
                {uploadingVideo && <span className="loading loading-spinner loading-sm mt-2"></span>}
                {formData.videoUrl && (
                  <div className="mt-2 text-sm text-success">Video uploaded successfully</div>
                )}
              </div>

              {/* Thumbnail Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('videos.fields.thumbnail')}</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={uploadingThumbnail}
                  className="file-input file-input-bordered w-full"
                />
                {uploadingThumbnail && <span className="loading loading-spinner loading-sm mt-2"></span>}
                {formData.thumbnailUrl && (
                  <img src={formData.thumbnailUrl} alt="" className="mt-2 w-32 h-20 object-cover rounded" />
                )}
              </div>

              {/* Titles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('videos.fields.titleEn')} *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={e => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('videos.fields.titleZh')} *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.titleZh}
                    onChange={e => setFormData(prev => ({ ...prev, titleZh: e.target.value }))}
                    className="input input-bordered"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('videos.fields.descEn')}</span>
                  </label>
                  <textarea
                    value={formData.descEn}
                    onChange={e => setFormData(prev => ({ ...prev, descEn: e.target.value }))}
                    className="textarea textarea-bordered"
                    rows={3}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('videos.fields.descZh')}</span>
                  </label>
                  <textarea
                    value={formData.descZh}
                    onChange={e => setFormData(prev => ({ ...prev, descZh: e.target.value }))}
                    className="textarea textarea-bordered"
                    rows={3}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('videos.fields.order')}</span>
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={e => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{t('videos.fields.autoplay')}</span>
                    <input
                      type="checkbox"
                      checked={formData.autoplay}
                      onChange={e => setFormData(prev => ({ ...prev, autoplay: e.target.checked }))}
                      className="checkbox checkbox-primary"
                    />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{t('videos.fields.published')}</span>
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={e => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                      className="checkbox checkbox-primary"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setShowDialog(false)}>
                {tCommon('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !formData.videoUrl}
              >
                {saving ? <span className="loading loading-spinner loading-sm"></span> : tCommon('common.save')}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDialog(false)}></div>
        </div>
      )}
    </div>
  )
}
