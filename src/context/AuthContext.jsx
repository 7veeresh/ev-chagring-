import React, { createContext, useContext, useState, useEffect } from 'react'
import usersData from '../data/users.json'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('ecocharge_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const foundUser = usersData.find(u => u.email === email && u.password === password)
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('ecocharge_user', JSON.stringify(userWithoutPassword))
      return { success: true, user: userWithoutPassword }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  const register = (userData) => {
    const existingUser = usersData.find(u => u.email === userData.email)
    if (existingUser) {
      return { success: false, error: 'User already exists' }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      role: 'user',
      loyaltyPoints: 0,
      bookings: [],
      reviews: []
    }

    // In a real app, this would be saved to a database
    usersData.push(newUser)
    
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem('ecocharge_user', JSON.stringify(userWithoutPassword))
    
    return { success: true, user: userWithoutPassword }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ecocharge_user')
  }

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
    localStorage.setItem('ecocharge_user', JSON.stringify(updatedUser))
  }

  const addBooking = (booking) => {
    const updatedUser = {
      ...user,
      bookings: [...user.bookings, booking],
      loyaltyPoints: user.loyaltyPoints + booking.loyaltyPointsEarned
    }
    setUser(updatedUser)
    localStorage.setItem('ecocharge_user', JSON.stringify(updatedUser))
  }

  const addReview = (review) => {
    const updatedUser = {
      ...user,
      reviews: [...user.reviews, review]
    }
    setUser(updatedUser)
    localStorage.setItem('ecocharge_user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    addBooking,
    addReview,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
