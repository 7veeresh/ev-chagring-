import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  MapPin, 
  Star, 
  Clock, 
  Zap, 
  Wifi, 
  Car, 
  Coffee, 
  ShoppingBag,
  Battery,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

const StationCard = ({ station, onBook }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100'
      case 'maintenance': return 'text-yellow-600 bg-yellow-100'
      case 'offline': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />
      case 'maintenance': return <AlertCircle className="w-4 h-4" />
      case 'offline': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />
      case 'parking': return <Car className="w-4 h-4" />
      case 'restaurant': return <Coffee className="w-4 h-4" />
      case 'shopping': return <ShoppingBag className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  const availableConnectors = station.connectors.filter(connector => connector.available)
  const hasAvailableConnectors = availableConnectors.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {station.name}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{station.address}</span>
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(station.status)}`}>
            {getStatusIcon(station.status)}
            <span className="capitalize">{station.status}</span>
          </div>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between mb-4">
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
          <div className="flex items-center space-x-1 text-accent-600">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">{station.loyaltyPoints} pts</span>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="flex items-center text-gray-600 mb-4">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-sm">{station.operatingHours}</span>
        </div>
      </div>

      {/* Connectors */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Available Connectors</h4>
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
                  <Battery className="w-4 h-4" />
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
      <div className="p-6 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h4>
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

      {/* Peak Hours Info */}
      {station.peakHours && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Peak Hours</span>
            </div>
            <div className="text-sm text-yellow-700">
              {station.peakHours.start} - {station.peakHours.end} ({station.peakHours.multiplier}x rate)
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-6">
        <div className="flex space-x-3">
          <Link
            to={`/booking/${station.id}`}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-center transition-all duration-300 ${
              hasAvailableConnectors && station.status === 'online'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!hasAvailableConnectors || station.status !== 'online') {
                e.preventDefault()
              }
            }}
          >
            {hasAvailableConnectors && station.status === 'online' ? 'Book Now' : 'Unavailable'}
          </Link>
          <button
            onClick={() => onBook && onBook(station)}
            className="px-4 py-3 border-2 border-primary-500 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-300"
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default StationCard
