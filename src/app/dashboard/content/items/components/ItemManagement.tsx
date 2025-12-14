'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface Item {
  id: number
  nameEn: string
  nameZh: string
  descEn: string
  descZh: string
  imageUrl: string
  rarity: string | null
  order: number
  featured: boolean
  published: boolean
  createdAt: string
  updatedAt: string
}

const rarityOptions = ['common', 'rare', 'epic', 'legendary']

export function ItemManagement() {
  const t = useTranslations('content')
  const tCommon = useTranslations('common')

  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    nameEn: '',
    nameZh: '',
    descEn: '',
    descZh: '',
    imageUrl: '',
    rarity: '',
    order: 0,
    featured: false,
    published: false,
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/content/items')
      const data = await res.json()
      if (data.success) {
        setItems(data.items)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const formDataObj = new FormData()
      formDataObj.append('image', file)

      const res = await fetch('/api/upload/image?folder=items', {
        method: 'POST',
        body: formDataObj,
      })
      const data = await res.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }))
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  function openCreateDialog() {
    setEditingItem(null)
    setFormData({
      nameEn: '',
      nameZh: '',
      descEn: '',
      descZh: '',
      imageUrl: '',
      rarity: '',
      order: items.length,
      featured: false,
      published: false,
    })
    setShowDialog(true)
  }

  function openEditDialog(item: Item) {
    setEditingItem(item)
    setFormData({
      nameEn: item.nameEn,
      nameZh: item.nameZh,
      descEn: item.descEn,
      descZh: item.descZh,
      imageUrl: item.imageUrl,
      rarity: item.rarity || '',
      order: item.order,
      featured: item.featured,
      published: item.published,
    })
    setShowDialog(true)
  }

  async function handleSave() {
    if (!formData.nameEn || !formData.nameZh || !formData.descEn || !formData.descZh || !formData.imageUrl) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const url = editingItem
        ? `/api/admin/content/items/${editingItem.id}`
        : '/api/admin/content/items'
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rarity: formData.rarity || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowDialog(false)
        fetchItems()
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const res = await fetch(`/api/admin/content/items/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchItems()
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to delete item')
    }
  }

  const getRarityBadgeClass = (rarity: string | null) => {
    switch (rarity) {
      case 'legendary': return 'badge-accent'
      case 'epic': return 'badge-secondary'
      case 'rare': return 'badge-info'
      default: return 'badge-neutral'
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
        <h1 className="text-2xl font-bold">{t('items.title')}</h1>
        <button className="btn btn-primary" onClick={openCreateDialog}>
          {t('items.create')}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="card bg-base-100 shadow-xl">
            <figure className="h-32 bg-base-200">
              <img src={item.imageUrl} alt={item.nameEn} className="h-full object-contain" />
            </figure>
            <div className="card-body p-4">
              <h2 className="card-title text-sm">
                {item.nameEn}
                {item.featured && <span className="badge badge-primary badge-xs">Featured</span>}
              </h2>
              <p className="text-xs text-base-content/70">{item.nameZh}</p>
              <div className="flex gap-1 mt-1">
                {item.rarity && (
                  <span className={`badge badge-xs ${getRarityBadgeClass(item.rarity)}`}>
                    {item.rarity}
                  </span>
                )}
                <span className={`badge badge-xs ${item.published ? 'badge-success' : 'badge-ghost'}`}>
                  {item.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="card-actions justify-end mt-2">
                <button className="btn btn-xs btn-outline" onClick={() => openEditDialog(item)}>
                  {tCommon('common.edit')}
                </button>
                <button className="btn btn-xs btn-error btn-outline" onClick={() => handleDelete(item.id)}>
                  {tCommon('common.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-12 text-base-content/60">
            {t('items.empty')}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingItem ? t('items.edit') : t('items.create')}
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('items.fields.image')} *</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="file-input file-input-bordered w-full"
                />
                {uploadingImage && <span className="loading loading-spinner loading-sm mt-2"></span>}
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="" className="mt-2 w-24 h-24 object-contain" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('items.fields.nameEn')} *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={e => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('items.fields.nameZh')} *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nameZh}
                    onChange={e => setFormData(prev => ({ ...prev, nameZh: e.target.value }))}
                    className="input input-bordered"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('items.fields.descEn')} *</span>
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
                    <span className="label-text">{t('items.fields.descZh')} *</span>
                  </label>
                  <textarea
                    value={formData.descZh}
                    onChange={e => setFormData(prev => ({ ...prev, descZh: e.target.value }))}
                    className="textarea textarea-bordered"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('items.fields.rarity')}</span>
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={e => setFormData(prev => ({ ...prev, rarity: e.target.value }))}
                    className="select select-bordered"
                  >
                    <option value="">None</option>
                    {rarityOptions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('items.fields.order')}</span>
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
                    <span className="label-text">{t('items.fields.featured')}</span>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={e => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="checkbox checkbox-primary"
                    />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{t('items.fields.published')}</span>
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
                disabled={saving || !formData.imageUrl}
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
