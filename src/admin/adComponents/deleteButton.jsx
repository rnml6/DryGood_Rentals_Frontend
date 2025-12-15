import React, { useState } from 'react'

function DeleteButton ({ deleteId, onDeleted }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDialog, setShowDialog] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:4000/inventory/delete/${deleteId}`,
        {
          method: 'DELETE'
        }
      )

      const data = await response.json()

      if (response.ok) {
        if (onDeleted) onDeleted(deleteId)
      } else {
        setError(data.message || 'Failed to delete')
      }
    } catch (err) {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
      setShowDialog(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setShowDialog(true)}
        disabled={loading}
        className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded'
      >
        {loading ? 'Deleting...' : 'Delete'}
      </button>

      {error && <p className='text-red-600 mt-1'>{error}</p>}

      {showDialog && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50'>
          <div className='bg-white rounded-lg p-6 w-80 shadow-lg flex flex-col gap-4'>
            <p className='text-gray-800 font-semibold'>
              Are you sure you want to delete this item?
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setShowDialog(false)}
                className='px-4 py-2 rounded bg-gray-300 hover:bg-gray-400'
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className='px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600'
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeleteButton
