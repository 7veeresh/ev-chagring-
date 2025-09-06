import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Clock, 
  Zap, 
  Wifi, 
  Car, 
  Coffee,
  CheckCircle
} from 'lucide-react'
import BookingForm from '../components/BookingForm'
import { useAuth } from '../context/AuthContext'
import stationsData from '../data/stations.json'

const Booking = () => {
  const { stationId } = useParams()
  const navigate = useNavigate()
  const { user, addBooking } = useAuth()
  const [station, setStation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Find the station by ID
    const foundStation = stationsData.find(s => s.id === stationId)
    if (foundStation) {
      setStation(foundStation)
    } else {
      toast.error('Station not found')
      navigate('/stations')
    }
    setLoading(false)
  }, [stationId, navigate])

  const handleBookingSubmit = (booking) => {
    if (!user) {
      toast.error('Please login to book a charging session')
      navigate('/login')
      return
    }

    // Add booking to user's bookings
    addBooking(booking)
    
    toast.success('Booking confirmed successfully!')
    navigate('/profile')
  }

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />
      case 'parking': return <Car className="w-4 h-4" />
      case 'restaurant': return <Coffee className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading station details...</p>
        </div>
      </div>
    )
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Station Not Found</h2>
          <p className="text-gray-600 mb-4">The requested charging station could not be found.</p>
          <button
            onClick={() => navigate('/stations')}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Stations
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/stations')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book Charging Session</h1>
              <p className="text-gray-600">Reserve your spot at {station.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Station Details */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Station Details</h2>
              
              {/* Station Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{station.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{station.address}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(station.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{station.rating}</span>
                  <span className="text-sm text-gray-500">({station.reviews} reviews)</span>
                </div>

                {/* Operating Hours */}
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{station.operatingHours}</span>
                </div>

                {/* Status */}
                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                  station.status === 'online' 
                    ? 'text-green-600 bg-green-100' 
                    : station.status === 'maintenance'
                    ? 'text-yellow-600 bg-yellow-100'
                    : 'text-red-600 bg-red-100'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    station.status === 'online' 
                      ? 'bg-green-500' 
                      : station.status === 'maintenance'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`} />
                  <span className="capitalize">{station.status}</span>
                </div>
              </div>

              {/* Connectors */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Available Connectors</h4>
                <div className="space-y-2">
                  {station.connectors.map((connector, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        connector.available
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          connector.available
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{connector.type}</div>
                          <div className="text-sm text-gray-600">{connector.power}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₹{connector.price}/kWh</div>
                        <div className={`text-xs ${
                          connector.available ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {connector.available ? 'Available' : 'Occupied'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {station.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Peak Hours */}
              {station.peakHours && (
                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-1">Peak Hours</h4>
                  <p className="text-sm text-yellow-700">
                    {station.peakHours.start} - {station.peakHours.end}
                  </p>
                  <p className="text-sm text-yellow-700">
                    {station.peakHours.multiplier}x rate applies
                  </p>
                </div>
              )}

              {/* Loyalty Points */}
              <div className="mt-6 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-800">
                    Earn {station.loyaltyPoints} loyalty points
                  </span>
                </div>
                <p className="text-xs text-primary-600 mt-1">
                  Points can be redeemed for free charging sessions
                </p>
              </div>
            </motion.div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <BookingForm
              station={station}
              onBookingSubmit={handleBookingSubmit}
              user={user}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking
