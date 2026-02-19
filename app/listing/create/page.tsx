'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

const categories = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Beauty',
  'Toys',
  'Vehicles',
  'Property',
  'Services',
  'Jobs',
]

const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']

export default function CreateListingPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const combined = [...imageFiles, ...newFiles].slice(0, 5)
    setImageFiles(combined)

    // Generate previews
    const previews = combined.map((file) => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (listingId: string): Promise<string[]> => {
    const urls: string[] = []

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${listingId}/${uuidv4()}.${fileExt}`

      const { error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file)

      if (!error) {
        const { data: urlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName)

        urls.push(urlData.publicUrl)
      }
    }

    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please login first')
        router.push('/login')
        return
      }

      // Create listing
      const { data, error } = await supabase
        .from('listings')
        .insert({
          title,
          description,
          price: parseFloat(price),
          location,
          user_id: user.id,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      // Upload images to Supabase Storage and save refs
      if (imageFiles.length > 0) {
        const imageUrls = await uploadImages(data.id)

        // Insert image references into listing_images table
        const imageInserts = imageUrls.map((url) => ({
          listing_id: data.id,
          image_url: url,
        }))

        if (imageInserts.length > 0) {
          await supabase.from('listing_images').insert(imageInserts)
        }
      }

      toast.success('Listing created successfully!')
      router.push(`/listing/${data.id}`)
    } catch (error) {
      console.error('Error creating listing:', error)
      toast.error('Error creating listing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-brand-light pt-20">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl text-brand-dark mb-2">
              Post a Listing
            </h1>
            <p className="text-brand-dark/60">
              Sell your items to buyers around the world
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you selling?"
                required
                className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item in detail..."
                rows={4}
                required
                className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20 resize-none"
              />
            </div>

            {/* Price & Location */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  required
                  className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                />
              </div>
            </div>

            {/* Category & Condition */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                >
                  <option value="">Select condition</option>
                  {conditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Images (up to 5) — uploaded to Supabase Storage
              </label>
              <div className="grid grid-cols-5 gap-4">
                {imagePreviews.map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={img}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <label className="aspect-square flex flex-col items-center justify-center bg-brand-light rounded-xl cursor-pointer hover:bg-brand-dark/5 transition-colors border-2 border-dashed border-brand-dark/20">
                    <Upload className="w-8 h-8 text-brand-dark/40 mb-2" />
                    <span className="text-xs text-brand-dark/60">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Creating...' : 'Post Listing'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
