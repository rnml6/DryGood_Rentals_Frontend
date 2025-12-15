import React, { useState, useEffect, useMemo } from 'react'

function GenerateReport () {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('http://localhost:4000/inventory/all')
        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        setInventory(
          Array.isArray(data)
            ? data
            : Array.isArray(data.message)
            ? data.message
            : []
        )
      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [])

  const handleShowReport = () => setShowReport(true)
  const handleCloseReport = () => setShowReport(false)

  const categories = useMemo(() => {
    return [...new Set(inventory.map(item => item.category).filter(Boolean))]
  }, [inventory])

  const stockByCategoryAndSize = useMemo(() => {
    return categories.map(category => {
      const items = inventory.filter(
        item =>
          item.category === category &&
          item.status?.toLowerCase() === 'available'
      )

      const sizeMap = {}
      items.forEach(item => {
        const size = item.size || 'Unknown'
        sizeMap[size] = (sizeMap[size] || 0) + 1
      })

      const sizes = Object.entries(sizeMap).map(([size, count]) => ({
        size,
        count
      }))

      const totalCount = sizes.reduce((sum, s) => sum + s.count, 0)

      let alert = null
      if (totalCount === 0) alert = 'No Stock'
      else if (totalCount < 4) alert = 'Low Stock'
      else if (totalCount > 10) alert = 'Overstock'

      return { category, totalCount, alert, sizes }
    })
  }, [categories, inventory])

  const alertSummary = useMemo(() => {
    const alerts = {
      'No Stock': 0,
      'Low Stock': 0,
      Overstock: 0
    }

    stockByCategoryAndSize.forEach(item => {
      if (item.alert) {
        alerts[item.alert]++
      }
    })

    return alerts
  }, [stockByCategoryAndSize])

  const getAlertClasses = (alert, type = 'badge') => {
    const baseClasses =
      'px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold rounded-full tracking-wider'

    switch (alert) {
      case 'No Stock':
        return type === 'badge'
          ? `${baseClasses} bg-red-100 text-red-800 border border-red-200`
          : 'bg-red-500 text-white'
      case 'Low Stock':
        return type === 'badge'
          ? `${baseClasses} bg-orange-100 text-orange-800 border border-orange-200`
          : 'bg-orange-500 text-white'
      case 'Overstock':
        return type === 'badge'
          ? `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`
          : 'bg-blue-500 text-white'
      default:
        return type === 'badge'
          ? `${baseClasses} bg-green-100 text-green-800 border border-green-200`
          : 'bg-green-500 text-white'
    }
  }

  const hasAlerts = useMemo(() => {
    return stockByCategoryAndSize.some(item => item.alert)
  }, [stockByCategoryAndSize])

  const alertItems = useMemo(() => {
    return stockByCategoryAndSize.filter(item => item.alert)
  }, [stockByCategoryAndSize])

  const healthyItems = useMemo(() => {
    return stockByCategoryAndSize.filter(item => !item.alert)
  }, [stockByCategoryAndSize])

  const totalAlertCount = useMemo(() => {
    return alertItems.length
  }, [alertItems])

  return (
    <div className='w-full'>
      <button
        onClick={handleShowReport}
        className={` max-md:px-3 max-md:py-2.5 max-md:rounded-lg px-4 py-4 w-full font-semibold rounded-xl relative ${
          hasAlerts
            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600'
            : 'bg-[#1C3D5A]  text-white hover:from-[#0f2a40] hover:to-[#1a365d]'
        }`}
      >
        {hasAlerts && (
          <div className='absolute -top-2 -right-2'>
            <div className='relative'>
              <div className='w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-100'>
                <span className='text-xs font-bold text-red-600'>
                  {totalAlertCount}
                </span>
              </div>

              <div className='absolute -inset-1 bg-red-400 rounded-full opacity-30 animate-ping'></div>

              {totalAlertCount > 9 && (
                <div className='absolute -inset-1 bg-red-500 rounded-full opacity-20 blur-sm'></div>
              )}
            </div>
          </div>
        )}

        <div className='flex items-center justify-center'>
          {hasAlerts ? (
            <div className='text-center'>
              <div className='tracking-wide'>
                STOCK ALERT{totalAlertCount !== 1 ? 'S' : ''}
              </div>
            </div>
          ) : (
            <div>STOCK REPORT</div>
          )}
        </div>
      </button>

      {showReport && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-2 sm:p-4'>
          <div className='bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden border border-[#1C3D5A]/20'>
            <div className='bg-gradient-to-r from-[#1C3D5A] to-[#2c5282] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between shadow-lg'>
              <div className='flex items-center'>
                <h1 className='text-lg sm:text-xl lg:text-2xl font-serif font-bold tracking-wider text-white drop-shadow-md'>
                  STOCK STATUS REPORT
                </h1>
              </div>
              <button
                onClick={handleCloseReport}
                className='text-white hover:text-gray-200 text-2xl sm:text-3xl font-bold bg-white/10 hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition tracking-wider'
              >
                &times;
              </button>
            </div>

            <div className='bg-[#1C3D5A]/5 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-[#1C3D5A]/10'>
              <div className='grid grid-cols-3 gap-2 sm:gap-4'>
                <div
                  className={`bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
                    alertSummary['No Stock'] > 0
                      ? 'border-red-500/50'
                      : 'border-gray-200'
                  } shadow`}
                >
                  <div className='text-xs sm:text-sm text-gray-600 font-medium tracking-wider'>
                    NO STOCK
                  </div>
                  <div className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-1 sm:mt-2'>
                    {alertSummary['No Stock']}
                  </div>
                  <div className='text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 tracking-wider'>
                    CATEGORIES
                  </div>
                </div>
                <div
                  className={`bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
                    alertSummary['Low Stock'] > 0
                      ? 'border-orange-500/50'
                      : 'border-gray-200'
                  } shadow`}
                >
                  <div className='text-xs sm:text-sm text-gray-600 font-medium tracking-wider'>
                    LOW STOCK
                  </div>
                  <div className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-1 sm:mt-2'>
                    {alertSummary['Low Stock']}
                  </div>
                  <div className='text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 tracking-wider'>
                    CATEGORIES
                  </div>
                </div>
                <div
                  className={`bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
                    alertSummary['Overstock'] > 0
                      ? 'border-blue-500/50'
                      : 'border-gray-200'
                  } shadow`}
                >
                  <div className='text-xs sm:text-sm text-gray-600 font-medium tracking-wider'>
                    OVERSTOCK
                  </div>
                  <div className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-1 sm:mt-2'>
                    {alertSummary['Overstock']}
                  </div>
                  <div className='text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 tracking-wider'>
                    CATEGORIES
                  </div>
                </div>
              </div>
            </div>

            <div
              className='p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(90vh-200px)] sm:max-h-[calc(95vh-280px)]'
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {loading ? (
                <div className='text-center py-8 sm:py-12'>
                  <div className='inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-[#1C3D5A]'></div>
                  <p className='mt-4 sm:mt-6 text-sm sm:text-base text-gray-600 font-medium tracking-wider'>
                    LOADING INVENTORY DATA...
                  </p>
                </div>
              ) : error ? (
                <div className='text-center py-8 sm:py-12 bg-red-50 rounded-lg sm:rounded-xl border border-red-200'>
                  <p className='text-red-600 font-semibold text-base sm:text-lg tracking-wider'>
                    ERROR LOADING DATA
                  </p>
                  <p className='text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base font-medium'>
                    {error}
                  </p>
                </div>
              ) : inventory.length === 0 ? (
                <div className='text-center py-8 sm:py-12 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200'>
                  <p className='text-gray-600 font-semibold text-base sm:text-lg tracking-wider'>
                    NO INVENTORY DATA AVAILABLE
                  </p>
                </div>
              ) : (
                <>
                  {alertItems.length > 0 && (
                    <div className='mb-8 sm:mb-12'>
                      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8'>
                        <h3 className='text-lg sm:text-xl font-bold text-gray-800 tracking-wider'>
                          STOCK ALERTS
                        </h3>
                        <span className='px-3 py-1.5 sm:px-4 sm:py-2 bg-red-100 text-red-800 rounded-full text-xs sm:text-sm font-bold tracking-wider border border-red-200 self-start'>
                          {alertItems.length} ALERT
                          {alertItems.length !== 1 ? 'S' : ''}
                        </span>
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
                        {alertItems.map(item => (
                          <div
                            key={item.category}
                            className='bg-white border rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-l-4'
                            style={{
                              borderLeftColor:
                                item.alert === 'No Stock'
                                  ? '#ef4444'
                                  : item.alert === 'Low Stock'
                                  ? '#f97316'
                                  : '#3b82f6'
                            }}
                          >
                            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4'>
                              <div>
                                <h4 className='font-bold text-base sm:text-lg lg:text-xl text-gray-800 tracking-wider break-words'>
                                  {item.category.toUpperCase()}
                                </h4>
                                <div className='mt-2'>
                                  <span className={getAlertClasses(item.alert)}>
                                    {item.alert.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <span className='text-2xl sm:text-3xl font-bold text-[#1C3D5A] self-end sm:self-auto'>
                                {item.totalCount}
                                <span className='text-xs sm:text-sm font-normal text-gray-500 ml-1'>
                                  ITEMS
                                </span>
                              </span>
                            </div>

                            <div className='mt-4 sm:mt-6'>
                              <div className='text-xs sm:text-sm text-gray-600 font-medium tracking-wider mb-3 sm:mb-4'>
                                STOCK BY SIZE:
                              </div>
                              <div className='space-y-2 sm:space-y-3'>
                                {item.sizes.map(size => (
                                  <div
                                    key={size.size}
                                    className='flex justify-between items-center bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded border border-gray-200'
                                  >
                                    <span className='font-medium text-gray-700 tracking-wider text-xs sm:text-sm truncate mr-2'>
                                      {size.size.toUpperCase()}
                                    </span>
                                    <span className='font-bold text-[#1C3D5A] text-base sm:text-lg whitespace-nowrap'>
                                      {size.count}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GenerateReport
