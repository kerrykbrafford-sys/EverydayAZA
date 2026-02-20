'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, GripVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

interface ImageUploaderProps {
    listingId: string
    onUploadComplete?: (urls: string[]) => void
}

interface UploadedImage {
    id: string
    url: string
    name: string
    uploading: boolean
    progress: number
}

export default function ImageUploader({ listingId, onUploadComplete }: ImageUploaderProps) {
    const [images, setImages] = useState<UploadedImage[]>([])
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFiles = useCallback(
        async (files: FileList | File[]) => {
            const fileArray = Array.from(files).slice(0, 8 - images.length)

            for (const file of fileArray) {
                const id = uuidv4()
                const preview = URL.createObjectURL(file)

                // Add to state with uploading=true
                setImages((prev) => [
                    ...prev,
                    { id, url: preview, name: file.name, uploading: true, progress: 0 },
                ])

                // Upload to Supabase Storage
                const ext = file.name.split('.').pop()
                const path = `${listingId}/${id}.${ext}`

                const { data, error } = await supabase.storage
                    .from('listing-images')
                    .upload(path, file, { upsert: true })

                if (!error && data) {
                    const {
                        data: { publicUrl },
                    } = supabase.storage.from('listing-images').getPublicUrl(data.path)

                    // Save to listing_images table
                    await supabase.from('listing_images').insert({
                        listing_id: listingId,
                        image_url: publicUrl,
                    })

                    setImages((prev) =>
                        prev.map((img) =>
                            img.id === id
                                ? { ...img, url: publicUrl, uploading: false, progress: 100 }
                                : img
                        )
                    )
                } else {
                    // Mark as failed
                    setImages((prev) =>
                        prev.map((img) =>
                            img.id === id ? { ...img, uploading: false, progress: 0 } : img
                        )
                    )
                }
            }
        },
        [images.length, listingId]
    )

    const removeImage = (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id))
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
        }
    }

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${dragOver
                        ? 'border-brand-dark bg-brand-dark/5 scale-[1.01]'
                        : 'border-brand-dark/15 hover:border-brand-dark/30 hover:bg-brand-dark/[0.02]'
                    }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />

                <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-brand-dark/5 rounded-2xl flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-brand-dark/40" />
                    </div>
                    <p className="text-sm font-medium text-brand-dark mb-1">
                        Drop images here or click to browse
                    </p>
                    <p className="text-xs text-brand-dark/40">
                        PNG, JPG, WebP up to 10MB each • Max 8 images
                    </p>
                </div>
            </div>

            {/* Uploaded Images */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((img, index) => (
                        <div
                            key={img.id}
                            className="relative group aspect-square rounded-xl overflow-hidden bg-brand-light border border-brand-dark/8"
                        >
                            <img
                                src={img.url}
                                alt={img.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Uploading overlay */}
                            {img.uploading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-brand-dark/20 border-t-brand-dark rounded-full animate-spin" />
                                </div>
                            )}

                            {/* Badge */}
                            {index === 0 && !img.uploading && (
                                <span className="absolute top-2 left-2 badge badge-new text-[10px]">Cover</span>
                            )}

                            {/* Remove button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeImage(img.id)
                                }}
                                className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                                <X className="w-3.5 h-3.5 text-brand-dark" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {images.length > 0 && (
                <p className="text-xs text-brand-dark/40 text-center">
                    {images.length}/8 images uploaded • First image is the cover photo
                </p>
            )}
        </div>
    )
}
