import React, { useState, useEffect, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../additional/cropImage.js'

function RentalForm ({
  onSubmit,
  defaultStatus = 'Active',
  onCancel,
  onGenerateReceipt
}) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({
    attire_id: '',
    attire_name: '',
    price_of_rent: 0,
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    id_type: '',
    id_image: null,
    rental_date: '',
    expected_return_date: '',
    total_amount: 0,
    rental_status: defaultStatus
  })
  const [attireQuery, setAttireQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [imgSrc, setImgSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('http://localhost:4000/inventory/all')
        const data = await res.json()
        const available = data.message.filter(
          item => item.status === 'Available'
        )
        setItems(available)
      } catch (err) {
        console.error('Error fetching items:', err)
        setError('Failed to fetch available items')
      }
    }
    fetchItems()
  }, [])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    setForm(prev => ({
      ...prev,
      rental_date: today,
      expected_return_date: nextWeek
    }))
  }, [])

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(''), 3000)
    return () => clearTimeout(timer)
  }, [error])

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const computeTotalAmount = (rentalDate, returnDate, price) => {
    if (!rentalDate || !returnDate || !price) return 0

    const start = new Date(rentalDate)
    const end = new Date(returnDate)
    const diffTime = end - start
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return parseFloat(price)
    const originalExtraDays = diffDays > 3 ? diffDays - 3 : 0
    return parseFloat(price) + originalExtraDays * 200
  }

  const calculateExtraDays = (rentalDate, returnDate) => {
    if (!rentalDate || !returnDate) return { extraDays: 0, extraCharge: 0 }

    const start = new Date(rentalDate)
    const end = new Date(returnDate)
    const diffTime = end - start
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const extraDays = Math.max(0, diffDays - 3)
    const extraCharge = extraDays * 200

    return { extraDays, extraCharge }
  }

  const handleDateChange = (field, value) => {
    const start =
      field === 'rental_date' ? new Date(value) : new Date(form.rental_date)
    const end =
      field === 'expected_return_date'
        ? new Date(value)
        : new Date(form.expected_return_date)

    if (start && end && end < start) {
      setError('Expected return date cannot be before rental date.')
      return
    }

    updateField(field, value)

    const total = computeTotalAmount(
      field === 'rental_date' ? value : form.rental_date,
      field === 'expected_return_date' ? value : form.expected_return_date,
      form.price_of_rent
    )
    updateField('total_amount', total)
  }

  const onCropComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleIdImageChange = e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => setImgSrc(reader.result)
      reader.readAsDataURL(file)
      updateField('id_image', file)
    }
  }

  const validateFields = () => {
    const required = [
      'attire_id',
      'customer_name',
      'customer_phone',
      'customer_email',
      'customer_address',
      'id_type'
    ]

    for (const field of required) {
      if (!form[field]) {
        setError(`Please fill in ${field.replace('_', ' ')}`)
        return false
      }
    }

    if (!/^\d{11}$/.test(form.customer_phone)) {
      setError('Phone number must be 11 digits')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (!imgSrc) {
      setError('Please upload an ID image')
      return false
    }

    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateFields()) return

    let finalFile = form.id_image

    if (imgSrc && croppedAreaPixels) {
      try {
        const croppedBlob = await getCroppedImg(imgSrc, croppedAreaPixels)
        finalFile = new File([croppedBlob], 'id_image.jpg', {
          type: 'image/jpeg'
        })
      } catch (err) {
        console.error(err)
        setError('Failed to process image')
        return
      }
    }

    const formData = new FormData()
    Object.keys(form).forEach(key => {
      if (key === 'id_image' && finalFile) {
        formData.append(key, finalFile)
      } else {
        formData.append(key, form[key])
      }
    })

    onSubmit(formData, form)
  }

  return (
    <>
      {error && (
        <div
          className={`fixed z-[1000] top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-xl shadow-2xl transition duration-500 ease-in-out font-bold text-center ${
            error.includes('successfully')
              ? 'bg-green-100 text-green-700 border-2 border-green-500'
              : 'bg-red-100 text-red-700 border-2 border-red-500'
          }`}
        >
          {error}
        </div>
      )}

      <div
        className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70'
        role='dialog'
        aria-modal='true'
        aria-labelledby='form-title'
      >
        <div
          className='absolute inset-0'
          onClick={onCancel}
          aria-hidden='true'
        ></div>

        <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col'>
          <div className='sticky top-0 bg-[#1C3D5A] border-3 rounded-xl text-white rounded-t-xl py-4 px-6 z-10 flex justify-between items-center'>
            <h2 id='form-title' className='text-2xl font-bold tracking-wider'>
              RENTAL RECORD
            </h2>
            <button
              type='button'
              className='text-white text-3xl opacity-70 hover:opacity-100 transition'
              onClick={onCancel}
              aria-label='Close form'
            >
              &times;
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            encType='multipart/form-data'
            className='p-6 space-y-6 overflow-y-auto flex-grow'
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='relative'>
                <label
                  htmlFor='attire-search'
                  className='block text-sm font-semibold text-[#1C3D5A] mb-1'
                >
                  Select Attire <span className='text-red-500'>*</span>:
                </label>
                <input
                  id='attire-search'
                  type='text'
                  className='block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm'
                  value={attireQuery}
                  onChange={e => {
                    setAttireQuery(e.target.value)
                    setShowSuggestions(true)
                  }}
                  placeholder='Search attire by name or ID...'
                />
                {showSuggestions && attireQuery.length > 0 && (
                  <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto'>
                    {items
                      .filter(
                        item =>
                          item.name
                            .toLowerCase()
                            .includes(attireQuery.toLowerCase()) ||
                          item.id.toString().includes(attireQuery)
                      )
                      .map(item => (
                        <div
                          key={item.id}
                          className='px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer border-b last:border-b-0'
                          onClick={() => {
                            updateField('attire_id', item.id)
                            updateField('attire_name', item.name)
                            updateField('price_of_rent', parseFloat(item.price))
                            setAttireQuery(`${item.name} (${item.id})`)
                            setShowSuggestions(false)

                            const total = computeTotalAmount(
                              form.rental_date,
                              form.expected_return_date,
                              parseFloat(item.price)
                            )
                            updateField('total_amount', total)
                          }}
                        >
                          {item.name} (ID: {item.id})
                        </div>
                      ))}
                    {items.filter(
                      item =>
                        item.name
                          .toLowerCase()
                          .includes(attireQuery.toLowerCase()) ||
                        item.id.toString().includes(attireQuery)
                    ).length === 0 && (
                      <div className='px-3 py-2 text-sm text-gray-500'>
                        No matching attire found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor='price'
                  className='block text-sm font-semibold text-[#1C3D5A] mb-1'
                >
                  Rental Price:
                </label>
                <input
                  id='price'
                  type='text'
                  className='block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm bg-gray-50'
                  value={`₱${form.price_of_rent.toLocaleString()}`}
                  readOnly
                />
              </div>

              <div>
                <label
                  htmlFor='customer_name'
                  className='block text-sm font-semibold text-[#1C3D5A] mb-1'
                >
                  Customer Name <span className='text-red-500'>*</span>:
                </label>
                <input
                  id='customer_name'
                  type='text'
                  className='block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm'
                  value={form.customer_name}
                  onChange={e => updateField('customer_name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='customer_phone'
                  className='block text-sm font-semibold text-[#1C3D5A] mb-1'
                >
                  Phone Number <span className='text-red-500'>*</span>:
                </label>
                <input
                  id='customer_phone'
                  type='tel'
                  className='block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm'
                  value={form.customer_phone}
                  onChange={e => {
                    if (e.target.value.length <= 11)
                      updateField('customer_phone', e.target.value)
                  }}
                  placeholder='11 digits'
                  required
                />
              </div>

              <div className='md:col-span-2'>
                <label
                  htmlFor='customer_email'
                  className='block text-sm font-semibold text-[#1C3D5A] mb-1'
                >
                  Email Address <span className='text-red-500'>*</span>:
                </label>
                <input
                  id='customer_email'
                  type='email'
                  className='block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm'
                  value={form.customer_email}
                  onChange={e => updateField('customer_email', e.target.value)}
                  required
                />
              </div>

              <div className='md:col-span-2'>
                <label
                  htmlFor='customer_address'
                  className='block text-sm font-semibold text-[#1C3D5A] mb-1'
                >
                  Address <span className='text-red-500'>*</span>:
                </label>
                <textarea
                  id='customer_address'
                  className='block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm'
                  rows='2'
                  value={form.customer_address}
                  onChange={e =>
                    updateField('customer_address', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='id_type'
                  className='block text-sm font-semibold text-[#1C3D5A] mb-1'
                >
                  ID Type <span className='text-red-500'>*</span>:
                </label>
                <select
                  id='id_type'
                  className='block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm'
                  value={form.id_type}
                  onChange={e => updateField('id_type', e.target.value)}
                  required
                >
                  <option hidden value=''>
                    Select ID Type
                  </option>
                  <option value='Passport'>Passport</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value='National ID'>National ID</option>
                  <option value='Student ID'>Student ID</option>
                  <option value='Other'>Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor='id_image'
                  className='block text-sm font-semibold text-[#1C3D5A] mb-1'
                >
                  ID Image <span className='text-red-500'>*</span>:
                </label>
                <input
                  id='id_image'
                  type='file'
                  accept='image/*'
                  onChange={handleIdImageChange}
                  className='block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1C3D5A] file:text-white hover:file:bg-opacity-80 transition duration-300 cursor-pointer'
                  required={!imgSrc}
                />
              </div>

              <div>
                <label
                  htmlFor='rental_date'
                  className='block text-sm font-semibold text-[#1C3D5A] mb-1'
                >
                  Rental Date <span className='text-red-500'>*</span>:
                </label>
                <input
                  id='rental_date'
                  type='date'
                  className='block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm'
                  value={form.rental_date}
                  onChange={e =>
                    handleDateChange('rental_date', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='expected_return_date'
                  className='block text-sm font-semibold text-[#1C3D5A] mb-1'
                >
                  Expected Return <span className='text-red-500'>*</span>:
                </label>
                <input
                  id='expected_return_date'
                  type='date'
                  className='block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C3D5A] focus:border-[#1C3D5A] transition duration-300 shadow-sm'
                  value={form.expected_return_date}
                  onChange={e =>
                    handleDateChange('expected_return_date', e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {imgSrc && (
              <div className='mt-4'>
                <label className='block text-sm font-semibold text-[#1C3D5A] mb-2'>
                  Crop ID Image
                </label>
                <div className='relative w-full h-80 md:h-96 bg-gray-100 rounded-lg shadow-md overflow-hidden border border-gray-200'>
                  <Cropper
                    image={imgSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1.91 / 1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
              </div>
            )}

            <div className='bg-blue-50 p-4 rounded-lg border border-blue-100'>
              <div className='flex justify-between items-center'>
                <span className='text-lg font-bold text-[#1C3D5A]'>
                  TOTAL AMOUNT:
                </span>
                <span className='text-2xl font-bold text-[#1C3D5A]'>
                  ₱{form.total_amount.toLocaleString()}
                </span>
              </div>
              {form.total_amount > 0 && (
                <p className='text-sm text-gray-500 mt-2'>
                  Includes 3-day base rental + ₱200 per extra day
                </p>
              )}
            </div>

            <div className='flex justify-end space-x-4 pt-6 border-t border-gray-200'>
              <button
                type='button'
                className='px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-400 transition duration-300'
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='px-6 py-2 bg-[#1C3D5A] text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition duration-300 tracking-wider'
              >
                SAVE RENTAL
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

function AddRecord ({ className = '', onSuccess }) {
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [showReceiptConfirmation, setShowReceiptConfirmation] = useState(false)
  const [lastAddedRecord, setLastAddedRecord] = useState(null)

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(''), 3000)
    return () => clearTimeout(timer)
  }, [error])

  const calculateExtraDays = (rentalDate, returnDate) => {
    if (!rentalDate || !returnDate) return { extraDays: 0, extraCharge: 0 }

    const start = new Date(rentalDate)
    const end = new Date(returnDate)
    const diffTime = end - start
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const extraDays = Math.max(0, diffDays - 3)
    const extraCharge = extraDays * 200

    return { extraDays, extraCharge }
  }

  const generateAndPrintReceipt = record => {
    const { extraDays, extraCharge } = calculateExtraDays(
      record.rental_date,
      record.expected_return_date
    )

    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Rental #${record.id}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .no-print { display: none !important; }
          }
          .receipt {
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 2px solid #000;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #1C3D5A;
          }
          .header p {
            margin: 5px 0;
            font-size: 14px;
          }
          .details {
            margin-bottom: 20px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px dashed #ddd;
          }
          .total {
            font-weight: bold;
            font-size: 18px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #000;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          .thank-you {
            text-align: center;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>Rental Receipt</h1>
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Rental ID: ${record.id}</p>
          </div>
          
          <div class="details">
            <div class="row">
              <span>Customer:</span>
              <span><strong>${record.customer_name}</strong></span>
            </div>
            <div class="row">
              <span>Attire:</span>
              <span>${record.attire_name} (#${record.attire_id})</span>
            </div>
            <div class="row">
              <span>Rental Date:</span>
              <span>${new Date(record.rental_date).toLocaleDateString()}</span>
            </div>
            <div class="row">
              <span>Expected Return:</span>
              <span>${new Date(
                record.expected_return_date
              ).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div class="details">
            <div class="row">
              <span>Base Price (3 days):</span>
              <span>₱${Number(
                record.price_of_rent || 0
              ).toLocaleString()}</span>
            </div>
            ${
              extraDays > 0
                ? `
            <div class="row">
              <span>Extra Days (${extraDays} × ₱200):</span>
              <span>₱${extraCharge.toLocaleString()}</span>
            </div>`
                : ''
            }
            <div class="row total">
              <span>Total Amount Due:</span>
              <span>₱${Number(record.total_amount || 0).toLocaleString()}</span>
            </div>
          </div>
          
          <div class="thank-you">Thank you!</div>
          
          <div class="footer">
            <p>This is an official receipt</p>
            <p>For inquiries, please contact us</p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #1C3D5A; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Receipt
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `

    const receiptWindow = window.open('', '_blank')
    receiptWindow.document.write(receiptContent)
    receiptWindow.document.close()
    receiptWindow.focus()

    receiptWindow.onload = function () {
      setTimeout(() => {
        receiptWindow.print()
      }, 500)
    }
  }

  const handleFormSubmit = async (data, formData) => {
    try {
      const res = await fetch('http://localhost:4000/record/new', {
        method: 'POST',
        body: data
      })
      const result = await res.json()

      console.log('Backend response:', result)
      if (result.success) {
        const recordId =
          result.id ||
          result.recordId ||
          result.record?.id ||
          result.data?.id ||
          result.insertId ||
          'TEMP'

        console.log('Extracted ID:', recordId)

        setLastAddedRecord({
          ...formData,
          id: recordId
        })

        setShowReceiptConfirmation(true)
        setError('Rental record added successfully!')
      } else {
        setError('Failed to add rental: ' + result.message)
      }
    } catch (err) {
      console.error(err)
      setError('Error submitting rental')
    }
  }

  const handleReceiptConfirmation = generateReceipt => {
    if (generateReceipt && lastAddedRecord) {
      generateAndPrintReceipt(lastAddedRecord)
    }

    setShowReceiptConfirmation(false)
    setShowForm(false)
    setLastAddedRecord(null)

    if (onSuccess) {
      onSuccess()
    } else {
      window.location.reload()
    }
  }

  return (
    <>
      <button
        className={className || ' bg-[#1C3D5A]'}
        onClick={() => setShowForm(true)}
        type='button'
      >
        Add Record
      </button>

      {error && (
        <div
          className={`fixed z-[1000] top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-xl shadow-2xl transition duration-500 ease-in-out font-bold text-center ${
            error.includes('successfully')
              ? 'bg-green-100 text-green-700 border-2 border-green-500'
              : 'bg-red-100 text-red-700 border-2 border-red-500'
          }`}
        >
          {error}
        </div>
      )}

      {showForm && (
        <RentalForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false)
            setLastAddedRecord(null)
          }}
        />
      )}

      {showReceiptConfirmation && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70'>
          <div className='bg-white rounded-xl shadow-xl max-w-sm w-full p-6'>
            <div className='text-center mb-6'>
              <div className='mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-bold text-gray-900 mb-2'>
                Print Receipt?
              </h3>
              <p className='text-gray-600'>Do you want to print a receipt?</p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => handleReceiptConfirmation(false)}
                className='flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition'
              >
                No
              </button>
              <button
                onClick={() => handleReceiptConfirmation(true)}
                className='flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition'
              >
                Yes, Print
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AddRecord
