import React from 'react'
import { Link } from 'react-router-dom'

function ProtectedRoute ({ children }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return 
      <div></div>
  }

  return children
}

export default ProtectedRoute