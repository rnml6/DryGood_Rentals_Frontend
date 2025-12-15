import React, { useState } from 'react'

function MarkReturn ({ record, onReturnSuccess, className, children }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)

  const handleReturnClick = () => {
    setShowConfirm(true)
  }

  const calculateTotalAmount = rec => {
    if (!rec.rental_date || !rec.expected_return_date) {
      return Number(rec.price || 0)
    }

    const rentalDate = new Date(rec.rental_date)
    const expectedReturn = new Date(rec.expected_return_date)
    const today = new Date()

    rentalDate.setHours(0, 0, 0, 0)
    expectedReturn.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffTime = expectedReturn.getTime() - rentalDate.getTime()
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    const baseRentalDays = 3
    const extraDays = Math.max(0, totalDays - baseRentalDays)
    const extraCharge = extraDays * 200

    const overdueDays = Math.max(
      0,
      Math.floor((today - expectedReturn) / (1000 * 60 * 60 * 24))
    )
    const overdueCharge = overdueDays * 250

    return Number(rec.price || 0) + extraCharge + overdueCharge
  }

  const handleConfirm = async () => {
    setShowConfirm(false)

    try {
      const totalAmount = calculateTotalAmount(record)

      const totalResponse = await fetch(
        `http://localhost:4000/record/edit/total/${record.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            total_amount: totalAmount
          })
        }
      )

      const totalData = await totalResponse.json()

      if (!totalData.success) {
        showNotification('Failed to update total amount.', 'error')
        return
      }

      const statusResponse = await fetch(
        `http://localhost:4000/record/edit/${record.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attire_id: record.attire_id,
            rental_status: 'returned'
          })
        }
      )

      const statusData = await statusResponse.json()

      if (statusData.success) {
        showNotification(
          'Record returned successfully! Total amount updated with overdue fees.',
          'success'
        )
        setTimeout(onReturnSuccess, 500)
      } else {
        showNotification(
          statusData.message || 'Failed to update status.',
          'error'
        )
      }
    } catch (err) {
      console.error(err)
      showNotification('Error connecting to server.', 'error')
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  const showNotification = (msg, type) => {
    setMessage({ msg, type })
    setShowMessage(true)
    setTimeout(() => setShowMessage(false), 3000)
  }

  return (
    <>
      <button onClick={handleReturnClick} className={className}>
        {children || 'MARK AS RETURNED'}
      </button>

      {showConfirm && (
        <div className='fixed inset-0 flex items-center justify-center z-[60] bg-black/50 backdrop-blur-sm'>
          <div className='bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center border border-gray-200'>
            <svg
              className='w-12 h-12 text-green-500 mx-auto mb-4'
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
            <p className='mb-4 text-xl font-semibold text-[#1C3D5A]'>
              Mark Attire as Returned?
            </p>

            <div className='flex justify-center gap-4'>
              <button
                onClick={handleConfirm}
                className='px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex-1 tracking-wider shadow-md'
              >
                CONFIRM
              </button>
              <button
                onClick={handleCancel}
                className='px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex-1 tracking-wider shadow-sm'
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {showMessage && (
        <div className='fixed top-8 left-1/2 -translate-x-1/2 z-[70]'>
          <div
            className={`px-6 py-3 rounded-lg shadow-xl font-medium text-white transition-all duration-300 ${
              message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {message.msg}
          </div>
        </div>
      )}
    </>
  )
}

export default MarkReturn
