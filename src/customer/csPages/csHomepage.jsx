import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import BgImage from '../../assets/images/bg.jpg'
import CustomerHeader from '../csComponents/csHeader.jsx'

const ClockIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-8 w-8 text-[#60A5FA] mb-4'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    aria-hidden='true'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </svg>
)

const MapPinIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-8 w-8 text-[#60A5FA] mb-4'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    aria-hidden='true'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z'
    />
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
    />
  </svg>
)

const MailIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-8 w-8 text-[#60A5FA] mb-4'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    aria-hidden='true'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-17 4v7a2 2 0 002 2h12a2 2 0 002-2v-7'
    />
  </svg>
)

const AttireCarousel = ({ images }) => {
  const imagesPerPage = 4
  const itemWidth = 280
  const itemMargin = 16
  const fullItemWidth = itemWidth + itemMargin * 2
  const transitionDuration = 700

  const totalImages = images.length
  const [currentPage, setCurrentPage] = useState(0)

  const totalPages = useMemo(
    () => (totalImages > 0 ? Math.ceil(totalImages / imagesPerPage) : 1),
    [totalImages, imagesPerPage]
  )

  const translateX = useMemo(() => {
    if (totalImages === 0 || totalImages <= imagesPerPage) {
      return 0
    }

    const lastPageIndex = totalPages - 1
    if (currentPage < lastPageIndex) {
      return -currentPage * imagesPerPage * fullItemWidth
    } else {
      const firstItemIndexOnLastPage = Math.max(0, totalImages - imagesPerPage)
      return -firstItemIndexOnLastPage * fullItemWidth
    }
  }, [currentPage, totalImages, imagesPerPage, fullItemWidth, totalPages])

  const goToPage = useCallback(index => {
    setCurrentPage(index)
  }, [])

  useEffect(() => {
    if (totalPages <= 1) return

    const intervalId = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % totalPages)
    }, 3000)

    return () => clearInterval(intervalId)
  }, [totalPages])

  if (totalImages === 0) {
    return (
      <div className='relative w-full py-8'>
        <div className='w-full max-w-7xl mx-auto relative overflow-hidden h-[360px] flex items-center justify-center bg-gray-50 rounded-lg shadow-inner'>
          <p className='text-gray-500 font-semibold'>
            No images available in the collection.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='relative w-full'>
      <div className='max-w-7xl mx-auto relative overflow-hidden'>
        <div
          className='flex transition-transform ease-in-out'
          style={{
            transform: translateX(${translateX}px),
            width: ${totalImages * fullItemWidth}px,
            transitionDuration: ${transitionDuration}ms
          }}
        >
          {images.map((img, index) => (
            <div
              key={index}
              className='group flex-shrink-0 mx-4 transition transform hover:scale-[1.03] duration-500 ease-out shadow-xl hover:shadow-2xl rounded-xl overflow-hidden'
              style={{
                width: ${itemWidth}px,
                height: '320px'
              }}
            >
              <div className='relative w-full h-full'>
                <img
                  src={img}
                  alt={`Attire item ${index + 1}`}
                  className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                  loading='lazy'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-500 opacity-80 group-hover:opacity-100' />
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className='flex justify-center space-x-3 mt-10'>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`w-4 h-4 rounded-full transition-colors transform hover:scale-110 duration-300 ${
                index === currentPage
                  ? 'bg-[#1C3D5A] shadow-md'
                  : 'bg-gray-400/50 hover:bg-gray-500'
              }`}
              onClick={() => goToPage(index)}
              aria-label={`Go to carousel page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const API_BASE_URL = 'http://localhost:4000'

function CsHomepage () {
  const [inventory, setInventory] = useState([])
  const [attireImages, setAttireImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(${API_BASE_URL}/inventory/all)

        if (!response.ok) {
          console.error(HTTP error! status: ${response.status})
          setInventory([])
          setAttireImages([])
          return
        }

        const data = await response.json()
        const inventoryData = data.message || []

        setInventory(inventoryData)
        const images = inventoryData
          .filter(item => item.image)
          .map(item => ${API_BASE_URL}/uploads/${item.image})
        setAttireImages(images)
      } catch (error) {
        console.error('Failed to fetch inventory:', error)
        setInventory([])
        setAttireImages([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchInventory()
  }, [])

  return (
    <div className='relative font-sans text-gray-800 min-h-screen bg-white'>
      <div className='absolute w-full z-30 text-white'>
        <CustomerHeader />
      </div>

      <section className='relative h-screen flex items-center justify-center overflow-hidden text-center px-4 sm:px-8'>
        <div
          className='absolute inset-0 bg-cover bg-center transition-transform duration-1000 filter brightness-60'
          style={{ backgroundImage: url(${BgImage}) }}
          role='img'
          aria-label='Background image of a professional setting'
        />
        <div className='absolute inset-0 bg-[#1C3D5A]/40' />

        <div className='relative z-10 max-w-4xl mx-auto text-white mt-10'>
          <h1 className='text-5xl sm:text-7xl md:text-8xl font-serif font-extrabold mb-4 tracking-tight leading-tighter drop-shadow-lg'>
            DRY GOOD RENTALS
          </h1>
          <p className='text-lg md:text-2xl mb-10 max-w-3xl mx-auto font-light drop-shadow-md'>
            Premium rental suits for professional events and conferences. Look
            sharp, feel confident.
          </p>
          <NavLink to='/product'>
            <button className='bg-[#1C3D5A] text-white font-semibold py-4 px-8 md:px-12 rounded-lg shadow-2xl transition transform hover:scale-[1.02] duration-300 uppercase tracking-widest border border-transparent hover:border-white text-sm sm:text-base'>
              Explore Products
            </button>
          </NavLink>
        </div>
      </section>

      <section className='py-12 sm:py-20 bg-white'>
        <div className='max-w-7xl mx-auto text-center px-4'>
          <h2 className='text-3xl sm:text-4xl font-bold mb-2 text-[#1C3D5A]'>
            Our Attires
          </h2>
          <div className='w-30 h-1 bg-[#60A5FA] mx-auto mb-10' />

          {isLoading ? (
            <p className='text-lg text-gray-500'>
              Loading our exquisite collection...
            </p>
          ) : attireImages.length > 0 ? (
            <AttireCarousel images={attireImages} />
          ) : (
            <p className='text-lg text-gray-500'>
              No attire images are currently available.
            </p>
          )}
        </div>
      </section>

      <section className='bg-[#F3F4F6] py-10 sm:py-20 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4 text-[#1C3D5A]'>
            Our Business Details
          </h2>
          <div className='w-16 h-1 bg-[#60A5FA] mx-auto mb-6' />

          <div className='grid grid-cols-1 gap-5 mb-0 md:grid-cols-2 lg:grid-cols-3 md:gap-8'>
            <div className='bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-[#60A5FA]'>
              <ClockIcon />
              <h3 className='text-xl font-semibold mb-4 text-[#1C3D5A]'>
                Operating Hours
              </h3>
              <p className='text-gray-700'>Open from **8:00 AM to 5:00 PM**</p>
              <p className='text-gray-700 font-medium'>
                *Monday to Saturday*
              </p>
            </div>

            <div className='bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-[#60A5FA]'>
              <MapPinIcon />
              <h3 className='text-xl font-semibold mb-4 text-[#1C3D5A]'>
                Location
              </h3>
              <p className='text-gray-700 font-medium'>
                *Calaca City, Batangas*
              </p>
              <p className='text-gray-700'>Philippines</p>
            </div>

            <div className='bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-[#60A5FA]'>
              <MailIcon />
              <h3 className='text-xl font-semibold mb-4 text-[#1C3D5A]'>
                Contact Us
              </h3>
              <p className='mb-2'>
                Email:{' '}
                <a
                  href='mailto:drygoodrentals@gmail.com'
                  className='text-[#60A5FA] hover:underline font-medium'
                >
                  drygoodrentals@gmail.com
                </a>
              </p>
              <p>
                Phone:{' '}
                <a className='text-[#60A5FA] hover:underline font-medium'>
                  09673491452
                </a>
              </p>
            </div>
          </div>

          <p className='mx-auto italic text-gray-600 text-base sm:text-lg max-w-2xl mt-6 border-t pt-5 md:mt-9'>
            We provide the best quality rental attire for all your professional
            needs. Book with us today!
          </p>
        </div>
      </section>
    </div>
  )
}

export default CsHomepage
