'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface Skill {
  id: number
  nameEn: string
  nameZh: string
  descEn: string
  descZh: string
  iconUrl: string
  order: number
}

interface Character {
  id: number
  nameEn: string
  nameZh: string
  descEn: string
  descZh: string
  imageUrl: string
  order: number
  featured: boolean
  published: boolean
  skills: Skill[]
  createdAt: string
  updatedAt: string
}

export function CharacterManagement() {
  const t = useTranslations('content')
  const tCommon = useTranslations('common')

  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [showSkillsDialog, setShowSkillsDialog] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    nameEn: '',
    nameZh: '',
    descEn: '',
    descZh: '',
    imageUrl: '',
    order: 0,
    featured: false,
    published: false,
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  // Skill form state
  const [skillFormData, setSkillFormData] = useState({
    nameEn: '',
    nameZh: '',
    descEn: '',
    descZh: '',
    iconUrl: '',
    order: 0,
  })
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [uploadingSkillIcon, setUploadingSkillIcon] = useState(false)

  useEffect(() => {
    fetchCharacters()
  }, [])

  async function fetchCharacters() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/content/characters')
      const data = await res.json()
      if (data.success) {
        setCharacters(data.characters)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to fetch characters')
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

      const res = await fetch('/api/upload/image?folder=characters', {
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

  async function handleSkillIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingSkillIcon(true)
      const formDataObj = new FormData()
      formDataObj.append('image', file)

      const res = await fetch('/api/upload/image?folder=skills', {
        method: 'POST',
        body: formDataObj,
      })
      const data = await res.json()
      if (data.success) {
        setSkillFormData(prev => ({ ...prev, iconUrl: data.url }))
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to upload skill icon')
    } finally {
      setUploadingSkillIcon(false)
    }
  }

  function openCreateDialog() {
    setEditingCharacter(null)
    setFormData({
      nameEn: '',
      nameZh: '',
      descEn: '',
      descZh: '',
      imageUrl: '',
      order: characters.length,
      featured: false,
      published: false,
    })
    setShowDialog(true)
  }

  function openEditDialog(character: Character) {
    setEditingCharacter(character)
    setFormData({
      nameEn: character.nameEn,
      nameZh: character.nameZh,
      descEn: character.descEn,
      descZh: character.descZh,
      imageUrl: character.imageUrl,
      order: character.order,
      featured: character.featured,
      published: character.published,
    })
    setShowDialog(true)
  }

  function openSkillsDialog(character: Character) {
    setSelectedCharacter(character)
    setEditingSkill(null)
    setSkillFormData({
      nameEn: '',
      nameZh: '',
      descEn: '',
      descZh: '',
      iconUrl: '',
      order: character.skills.length + 1,
    })
    setShowSkillsDialog(true)
  }

  async function handleSave() {
    if (!formData.nameEn || !formData.nameZh || !formData.descEn || !formData.descZh || !formData.imageUrl) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const url = editingCharacter
        ? `/api/admin/content/characters/${editingCharacter.id}`
        : '/api/admin/content/characters'
      const method = editingCharacter ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setShowDialog(false)
        fetchCharacters()
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to save character')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this character?')) return

    try {
      const res = await fetch(`/api/admin/content/characters/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchCharacters()
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to delete character')
    }
  }

  async function handleSaveSkill() {
    if (!selectedCharacter) return
    if (!skillFormData.nameEn || !skillFormData.nameZh || !skillFormData.descEn || !skillFormData.descZh || !skillFormData.iconUrl) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const url = editingSkill
        ? `/api/admin/content/characters/${selectedCharacter.id}/skills/${editingSkill.id}`
        : `/api/admin/content/characters/${selectedCharacter.id}/skills`
      const method = editingSkill ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillFormData),
      })
      const data = await res.json()
      if (data.success) {
        setEditingSkill(null)
        setSkillFormData({
          nameEn: '',
          nameZh: '',
          descEn: '',
          descZh: '',
          iconUrl: '',
          order: 0,
        })
        fetchCharacters()
        // Refresh selected character
        const updated = await fetch(`/api/admin/content/characters/${selectedCharacter.id}`)
        const updatedData = await updated.json()
        if (updatedData.success) {
          setSelectedCharacter(updatedData.character)
        }
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to save skill')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSkill(skillId: number) {
    if (!selectedCharacter) return
    if (!confirm('Are you sure you want to delete this skill?')) return

    try {
      const res = await fetch(`/api/admin/content/characters/${selectedCharacter.id}/skills/${skillId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchCharacters()
        const updated = await fetch(`/api/admin/content/characters/${selectedCharacter.id}`)
        const updatedData = await updated.json()
        if (updatedData.success) {
          setSelectedCharacter(updatedData.character)
        }
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to delete skill')
    }
  }

  function editSkill(skill: Skill) {
    setEditingSkill(skill)
    setSkillFormData({
      nameEn: skill.nameEn,
      nameZh: skill.nameZh,
      descEn: skill.descEn,
      descZh: skill.descZh,
      iconUrl: skill.iconUrl,
      order: skill.order,
    })
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
        <h1 className="text-2xl font-bold">{t('characters.title')}</h1>
        <button className="btn btn-primary" onClick={openCreateDialog}>
          {t('characters.create')}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Characters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map(character => (
          <div key={character.id} className="card bg-base-100 shadow-xl">
            <figure className="h-48">
              <img src={character.imageUrl} alt={character.nameEn} className="w-full h-full object-cover" />
            </figure>
            <div className="card-body">
              <h2 className="card-title">
                {character.nameEn}
                {character.featured && <span className="badge badge-primary badge-sm">Featured</span>}
              </h2>
              <p className="text-sm text-base-content/70">{character.nameZh}</p>
              <div className="flex gap-2 mt-2">
                <span className={`badge ${character.published ? 'badge-success' : 'badge-ghost'}`}>
                  {character.published ? 'Published' : 'Draft'}
                </span>
                <span className="badge badge-outline">{character.skills.length} skills</span>
              </div>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-sm btn-outline" onClick={() => openSkillsDialog(character)}>
                  Skills
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => openEditDialog(character)}>
                  {tCommon('common.edit')}
                </button>
                <button className="btn btn-sm btn-error btn-outline" onClick={() => handleDelete(character.id)}>
                  {tCommon('common.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
        {characters.length === 0 && (
          <div className="col-span-full text-center py-12 text-base-content/60">
            {t('characters.empty')}
          </div>
        )}
      </div>

      {/* Create/Edit Character Dialog */}
      {showDialog && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingCharacter ? t('characters.edit') : t('characters.create')}
            </h3>

            <div className="space-y-4">
              {/* Image Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('characters.fields.image')} *</span>
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
                  <img src={formData.imageUrl} alt="" className="mt-2 w-32 h-32 object-cover rounded" />
                )}
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('characters.fields.nameEn')} *</span>
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
                    <span className="label-text">{t('characters.fields.nameZh')} *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nameZh}
                    onChange={e => setFormData(prev => ({ ...prev, nameZh: e.target.value }))}
                    className="input input-bordered"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('characters.fields.descEn')} *</span>
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
                    <span className="label-text">{t('characters.fields.descZh')} *</span>
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
                    <span className="label-text">{t('characters.fields.order')}</span>
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
                    <span className="label-text">{t('characters.fields.featured')}</span>
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
                    <span className="label-text">{t('characters.fields.published')}</span>
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

      {/* Skills Dialog */}
      {showSkillsDialog && selectedCharacter && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg mb-4">
              {t('skills.title')} - {selectedCharacter.nameEn}
            </h3>

            {/* Existing Skills */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Current Skills ({selectedCharacter.skills.length}/4)</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedCharacter.skills.map(skill => (
                  <div key={skill.id} className="flex items-center gap-2 p-2 bg-base-200 rounded">
                    <img src={skill.iconUrl} alt="" className="w-10 h-10 object-contain" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{skill.nameEn}</div>
                      <div className="text-xs text-base-content/60">{skill.nameZh}</div>
                    </div>
                    <button className="btn btn-xs btn-ghost" onClick={() => editSkill(skill)}>Edit</button>
                    <button className="btn btn-xs btn-ghost text-error" onClick={() => handleDeleteSkill(skill.id)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add/Edit Skill Form */}
            {selectedCharacter.skills.length < 4 || editingSkill ? (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">
                  {editingSkill ? 'Edit Skill' : t('skills.addSkill')}
                </h4>
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t('skills.fields.icon')} *</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSkillIconUpload}
                      disabled={uploadingSkillIcon}
                      className="file-input file-input-bordered file-input-sm w-full"
                    />
                    {uploadingSkillIcon && <span className="loading loading-spinner loading-sm mt-2"></span>}
                    {skillFormData.iconUrl && (
                      <img src={skillFormData.iconUrl} alt="" className="mt-2 w-16 h-16 object-contain" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">{t('skills.fields.nameEn')} *</span>
                      </label>
                      <input
                        type="text"
                        value={skillFormData.nameEn}
                        onChange={e => setSkillFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                        className="input input-bordered input-sm"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">{t('skills.fields.nameZh')} *</span>
                      </label>
                      <input
                        type="text"
                        value={skillFormData.nameZh}
                        onChange={e => setSkillFormData(prev => ({ ...prev, nameZh: e.target.value }))}
                        className="input input-bordered input-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">{t('skills.fields.descEn')} *</span>
                      </label>
                      <textarea
                        value={skillFormData.descEn}
                        onChange={e => setSkillFormData(prev => ({ ...prev, descEn: e.target.value }))}
                        className="textarea textarea-bordered textarea-sm"
                        rows={2}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">{t('skills.fields.descZh')} *</span>
                      </label>
                      <textarea
                        value={skillFormData.descZh}
                        onChange={e => setSkillFormData(prev => ({ ...prev, descZh: e.target.value }))}
                        className="textarea textarea-bordered textarea-sm"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {editingSkill && (
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => {
                          setEditingSkill(null)
                          setSkillFormData({ nameEn: '', nameZh: '', descEn: '', descZh: '', iconUrl: '', order: 0 })
                        }}
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleSaveSkill}
                      disabled={saving || !skillFormData.iconUrl}
                    >
                      {saving ? <span className="loading loading-spinner loading-sm"></span> : (editingSkill ? 'Update Skill' : 'Add Skill')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-base-content/60">
                {t('skills.maxSkills')}
              </div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setShowSkillsDialog(false)}>
                {tCommon('common.close')}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowSkillsDialog(false)}></div>
        </div>
      )}
    </div>
  )
}
