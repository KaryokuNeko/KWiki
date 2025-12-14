'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline'

interface Video {
  id: number
  videoUrl: string
  titleEn: string
  titleZh: string
  descEn: string | null
  descZh: string | null
  thumbnailUrl: string | null
  autoplay: boolean
}

interface VideoCarouselProps {
  videos: Video[]
}

export function VideoCarousel({ videos }: VideoCarouselProps) {
  const locale = useLocale()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    // Play current video when index changes
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (idx === currentIndex) {
          video.play().catch(() => {})
        } else {
          video.pause()
          video.currentTime = 0
        }
      }
    })
  }, [currentIndex])

  // Update muted state for all videos
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = isMuted
      }
    })
  }, [isMuted])

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  // Auto-advance to next video when current one ends
  const handleVideoEnd = () => {
    if (videos.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % videos.length)
    }
  }

  if (videos.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-base-300 to-base-200">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to K-Wiki</h2>
          <p className="text-base-content/70">Content coming soon...</p>
        </div>
      </div>
    )
  }

  const currentVideo = videos[currentIndex]

  return (
    <div className="relative w-full h-full overflow-hidden">
      {videos.map((video, idx) => (
        <div
          key={video.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <video
            ref={(el) => { videoRefs.current[idx] = el }}
            src={video.videoUrl}
            poster={video.thumbnailUrl || undefined}
            muted={isMuted}
            loop={videos.length === 1}
            playsInline
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Overlay with title and description */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-8 md:p-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
          {locale === 'en' ? currentVideo.titleEn : currentVideo.titleZh}
        </h2>
        {(currentVideo.descEn || currentVideo.descZh) && (
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            {locale === 'en' ? currentVideo.descEn : currentVideo.descZh}
          </p>
        )}
      </div>

      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        className="absolute right-4 bottom-24 z-30 btn btn-circle btn-ghost text-white hover:bg-white/20"
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
      >
        {isMuted ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
      </button>

      {/* Navigation dots */}
      {videos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
          {videos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to video ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows */}
      {videos.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 btn btn-circle btn-ghost text-white hover:bg-white/20"
            aria-label="Previous video"
          >
            ❮
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % videos.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 btn btn-circle btn-ghost text-white hover:bg-white/20"
            aria-label="Next video"
          >
            ❯
          </button>
        </>
      )}
    </div>
  )
}
