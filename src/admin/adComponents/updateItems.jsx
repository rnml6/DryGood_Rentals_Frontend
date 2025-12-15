import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../additional/cropImage.js'

function UpdateItem ({ updateItems, onUpdateSuccess }) {
  const [showForm, setShowForm] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: updateItems.name || '',
    category: updateItems.category || '',
    gender: updateItems.gender || '',
    size: updateItems.size || '',
    color: updateItems.color || '',
    material: updateItems.material || '',
    price: updateItems.price || '',
    status: updateItems.status || 'Available',
    description: updateItems.description || '',
    date_added: updateItems.date_added
      ? new Date(updateItems.date_added).toISOString().split('T')[0]
      : '',
    image: null
  })

  const [imgSrc, setImgSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const handleChange = e => {
    const { name, value, files } = e.target
    if (name === 'image' && files && files.length > 0) {
      const reader = new FileReader()
      reader.readAsDataURL(files[0])
      reader.onload = () => setImgSrc(reader.result)
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const onCropComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleUpdateClick = () => setShowConfirm(true)
  const handleCancelUpdate = () => setShowConfirm(false)
  const handleCloseForm = () => {
    setShowForm(false)
    setImgSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  const handleConfirmUpdate = async () => {
    setError('')
    setLoading(true)
    setShowConfirm(false)

    try {
      let finalImage = formData.image
      if (imgSrc && croppedAreaPixels) {
        finalImage = await getCroppedImg(imgSrc, croppedAreaPixels)
      }

      const sendData = new FormData()
      Object.keys(formData).forEach(key => {
        if (key === 'image' && finalImage) {
          sendData.append(key, finalImage, 'cropped.jpg')
        } else if (key !== 'image' && formData[key] !== null) {
          sendData.append(key, formData[key])
        }
      })

      const response = await fetch(
        `http://localhost:4000/inventory/edit/${updateItems.id}`,
        {
          method: 'PUT',
          body: sendData
        }
      )

      const data = await response.json()

      if (!data.success) {
        setError(data.message || 'Update failed')
      } else {
        if (onUpdateSuccess) onUpdateSuccess(updateItems.id)
        setShowForm(false)
      }
    } catch (err) {
      console.error(err)
      setError('A network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setShowForm(true)}
        className='px-4 py-2 bg-[#1C3D5A] text-white rounded shadow-md hover:bg-[#1C3D5A]/80 transition'
      >
        Edit Item
      </button>

      {showForm && (
        <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
          <div
            className='bg-white pt-0 p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100'
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className='sticky top-0 bg-white pt-5 pb-3 border-b-2 border-[#1C3D5A]/10 flex items-center justify-between'>
              <h3 className='text-xl font-bold text-[#1C3D5A] uppercase'>
                Update Item
              </h3>

              <div
                className='text-[#1C3D5A]  text-3xl opacity-70 hover:opacity-100 transition'
                onClick={handleCloseForm}
              >
                &times;
              </div>
            </div>

            {error && <p className='text-red-500 mb-4 font-medium'>{error}</p>}

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                placeholder='Name'
                className='border border-gray-300 p-3 rounded-lg focus:border-[#1C3D5A] focus:ring-1 focus:ring-[#1C3D5A] outline-none transition duration-150'
              />

              <select
                name='category'
                value={formData.category}
                onChange={handleChange}
                className='border border-gray-300 p-3 rounded-lg focus:border-[#1C3D5A] focus:ring-1 focus:ring-[#1C3D5A] outline-none transition duration-150'
              >
                <option hidden value=''>
                  Select Category
                </option>
                <option value='Dress'>Dress</option>
                <option value='Gown'>Gown</option>
                <option value='Barong'>Barong</option>
                <option value='Coat'>Coat</option>
                <option value='Others'>Others</option>
              </select>

              <select
                name='gender'
                value={formData.gender}
                onChange={handleChange}
                className='border border-gray-300 p-3 rounded-lg focus:border-[#1C3D5A] focus:ring-1 focus:ring-[#1C3D5A] outline-none transition duration-150'
              >
                <option hidden value=''>
                  Select Gender
                </option>
                <option value='Male'>Male</option>
                <option value='Female'>Female</option>
                <option value='Unisex'>Unisex</option>
              </select>

              <select
                name='size'
                value={formData.size}
                onChange={handleChange}
                className='border border-gray-300 p-3 rounded-lg focus:border-[#1C3D5A] focus:ring-1 focus:ring-[#1C3D5A] outline-none transition duration-150'
              >
                <option hidden value=''>
                  Select Size
                </option>
                <option value='XS'>XS</option>
                <option value='S'>S</option>
                <option value='M'>M</option>
                <option value='L'>L</option>
                <option value='XL'>XL</option>
                <option value='XXL'>XXL</option>
              </select>

              <input
                type='text'
                name='color'
                value={formData.color}
                onChange={handleChange}
                placeholder='Color'
                className='border border-gray-300 p-3 rounded-lg focus:border-[#1C3D5A] focus:ring-1 focus:ring-[#1C3D5A] outline-none transition duration-150'
              />

              <input
                type='text'
                name='material'
                value={formData.material}
                onChange={handleChange}
                placeholder='Material'
                className='border border-gray-300 p-3 rounded-lg focus:border-[#1C3D5A] focus:ring-1 focus:ring-[#1C3D5A] outline-none transition duration-150'
              />

              <input
                type='number'
                name='price'
                value={formData.price}
                onChange={handleChange}
                placeholder='Price'
                className='border border-gray-300 p-3 rounded-lg focus:border-[#1C3D5A] focus:ring-1 focus:ring-[#1C3D5A] outline-none transition duration-150'
              />

              <input
                type='date'
                name='date_added'
                value={formData.date_added}
                onChange={handleChange}
                className='border border-gray-300 p-3 rounded-lg focus:border-[#1C3D5A] focus:ring-1 focus:ring-[#1C3D5A] outline-none transition duration-150'
              />

              <select
                name='status'
                value={formData.status}
                onChange={handleChange}
                className='border border-gray-300 p-3 rounded-lg focus:border-[#1C3D5A] focus:ring-1 focus:ring-[#1C3D5A] outline-none transition duration-150'
              >
                <option value='Available'>Available</option>
                <option value='Rented'>Rented</option>
                <option value='Maintenance'>Maintenance</option>
              </select>

              <textarea
                name='description'
                value={formData.description}
                onChange={handleChange}
                placeholder='Description'
                rows='3'
                className='border border-gray-300 p-3 rounded-lg focus:border-[#1C3D5A] focus:ring-1 focus:ring-[#1C3D5A] outline-none transition duration-150 col-span-1 sm:col-span-2'
              />

              <label className='block text-sm font-medium text-gray-700 col-span-1 sm:col-span-2'>
                Upload New Image (Optional)
              </label>
              <input
                type='file'
                accept='image/*'
                name='image'
                onChange={handleChange}
                className='p-3 col-span-1 sm:col-span-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1C3D5A]/10 file:text-[#1C3D5A] hover:file:bg-[#1C3D5A]/20'
              />

              {imgSrc && (
                <div className='relative col-span-1 sm:col-span-2 mt-2 w-full h-80 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 shadow-inner'>
                  <Cropper
                    image={imgSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1 / 1.3}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    style={{ containerStyle: { borderRadius: '8px' } }}
                  />
                  <div className='absolute bottom-2 left-0 right-0 p-2 bg-black/50 text-white text-center text-xs'>
                    Adjust the crop area. Aspect Ratio: 1:1.3
                  </div>
                </div>
              )}
            </div>

            <div className='mt-6 flex justify-end gap-3'>
              <button
                onClick={handleCloseForm}
                className='px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition duration-150 shadow'
                disabled={loading}
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateClick}
                className='px-6 py-2 bg-[#1C3D5A] text-white rounded-lg font-medium hover:bg-[#1C3D5A]/90 transition duration-150 shadow-md'
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4'>
          <div className='bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-center transform scale-100 opacity-100 transition-all duration-300'>
            <h4 className='mb-4 text-xl font-bold text-[#1C3D5A]'>
              Confirm Update
            </h4>
            <p className='mb-6 text-gray-700'>
              Are you sure you want to update{' '}
              <strong>{updateItems.name}</strong>?
            </p>
            <div className='flex justify-center gap-4'>
              <button
                onClick={handleCancelUpdate}
                className='px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition duration-150 shadow'
              >
                No, Cancel
              </button>
              <button
                onClick={handleConfirmUpdate}
                className='px-5 py-2 bg-[#1C3D5A] text-white rounded-lg font-medium hover:bg-[#1C3D5A]/90 transition duration-150 shadow'
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpdateItem
