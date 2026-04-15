import React from 'react'

const Forbidden = () => {
  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center'>
      <h1 className='text-4xl font-bold text-red-600'>403 - Forbidden</h1>
      <p className='text-lg mt-4'>This is a custom forbidden page</p>
      <p className='text-gray-600'>You do not have permission to access this page.</p>
    </div>
  )
}

export default Forbidden