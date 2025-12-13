'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  keycloakId: string
  nickname: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export function ProfileEditor() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [nickname, setNickname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/profile')
      const data = await response.json()

      if (response.ok && data.success) {
        setProfile(data.profile)
        setNickname(data.profile.nickname || '')
        setAvatarUrl(data.profile.avatarUrl || '')
      } else if (response.status === 404) {
        // Profile doesn't exist yet, will create on first save
        setProfile(null)
        setNickname('')
        setAvatarUrl('')
      } else {
        setError(data.error || 'Failed to load profile')
      }
    } catch (err) {
      setError('Failed to load profile')
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setSelectedFile(file)
    setError(null)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('avatar', selectedFile)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAvatarUrl(data.url)
        setSelectedFile(null)
        setPreviewUrl(null)
        setSuccess('Avatar uploaded successfully')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to upload avatar')
      }
    } catch (err) {
      setError('Failed to upload avatar')
      console.error('Error uploading avatar:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const method = profile ? 'PUT' : 'POST'
      const response = await fetch('/api/profile', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickname || null,
          avatarUrl: avatarUrl || null,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setProfile(data.profile)
        setSuccess(data.message || 'Profile updated successfully')

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to save profile')
      }
    } catch (err) {
      setError('Failed to save profile')
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
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
    <div className="space-y-6">
      {/* Display Keycloak info (read-only) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              value={session?.user?.name || 'N/A'}
              disabled
              className="input input-bordered bg-base-200"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="text"
              value={session?.user?.email || 'N/A'}
              disabled
              className="input input-bordered bg-base-200"
            />
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* Editable profile form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold">Profile Settings</h3>

        {/* Avatar section */}
        <div className="space-y-4">
          <h4 className="font-medium">Avatar</h4>

          {/* Current avatar or preview */}
          <div className="flex items-center space-x-4">
            {(previewUrl || avatarUrl) && (
              <div className="avatar">
                <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={previewUrl || avatarUrl} alt="Avatar" />
                </div>
              </div>
            )}
          </div>

          {/* File upload */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Upload New Avatar</span>
              <span className="label-text-alt">Max 5MB (JPEG, PNG, GIF, WebP)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="file-input file-input-bordered flex-1"
              />
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn btn-primary"
                >
                  {uploading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Optional: Manual URL input */}
          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-sm font-medium">
              Or enter avatar URL manually
            </div>
            <div className="collapse-content">
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="input input-bordered w-full"
              />
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Nickname</span>
            <span className="label-text-alt">Max 100 characters</span>
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={100}
            placeholder="Enter your display name"
            className="input input-bordered"
          />
        </div>

        {/* Error and success messages */}
        {error && (
          <div className="alert alert-error">
            <XCircleIcon className="stroke-current shrink-0 h-6 w-6" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircleIcon className="stroke-current shrink-0 h-6 w-6" />
            <span>{success}</span>
          </div>
        )}

        {/* Submit button */}
        <div className="card-actions justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? (
              <>
                <span className="loading loading-spinner"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>

      {/* Profile metadata */}
      {profile && (
        <div className="text-sm text-base-content/60 pt-4 border-t">
          <p>Created: {new Date(profile.createdAt).toLocaleString()}</p>
          <p>Last updated: {new Date(profile.updatedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
