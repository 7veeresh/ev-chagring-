import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Car, 
  Battery, 
  CreditCard, 
  Star,
  MapPin,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { format, addHours, isAfter, isBefore } from 'date-fns'

const BookingForm = ({ station, onBookingSubmit, user }) => {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedConnector, setSelectedConnector] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState(2)
  const [vehicleDetails, setVehicleDetails] = useState({
    make: '',
    model: '',
    batterySize: '',
    currentCharge: 50
  })
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [errors, setErrors] = useState({})

  const availableConnectors = station.connectors.filter(connector => connector.available)

  // Generate time slots for the selected date
  const generateTimeSlots = () => {
    const slots = []
    const startHour = 6
    const endHour = 22
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Calculate pricing
  const calculatePricing = () => {
    if (!selectedConnector || !estimatedDuration) return { total: 0, breakdown: {} }
    
    const connector = station.connectors.find(c => c.type === selectedConnector)
    if (!connector) return { total: 0, breakdown: {} }

    const basePrice = connector.price
    const peakMultiplier = station.peakHours ? station.peakHours.multiplier : 1
    
    // Check if selected time is in peak hours
    const isPeakTime = selectedTime && station.peakHours && 
      selectedTime >= station.peakHours.start && selectedTime <= station.peakHours.end
    
    const finalPrice = isPeakTime ? basePrice * peakMultiplier : basePrice
    const totalCost = finalPrice * estimatedDuration * (vehicleDetails.batterySize / 100)
    const loyaltyPointsEarned = Math.floor(totalCost * 2) // 2 points per rupee

    return {
      total: totalCost,
      breakdown: {
        basePrice: basePrice,
        peakMultiplier: isPeakTime ? peakMultiplier : 1,
        duration: estimatedDuration,
        batterySize: vehicleDetails.batterySize,
        loyaltyPointsEarned
      }
    }
  }

  const pricing = calculatePricing()

  // Validation
  const validateForm = () => {
    const newErrors = {}

    if (!selectedDate) newErrors.date = 'Please select a date'
    if (!selectedTime) newErrors.time = 'Please select a time'
    if (!selectedConnector) newErrors.connector = 'Please select a connector'
    if (!vehicleDetails.make) newErrors.make = 'Please enter vehicle make'
    if (!vehicleDetails.model) newErrors.model = 'Please enter vehicle model'
    if (!vehicleDetails.batterySize) newErrors.batterySize = 'Please enter battery size'
    if (vehicleDetails.currentCharge < 0 || vehicleDetails.currentCharge > 100) {
      newErrors.currentCharge = 'Current charge must be between 0-100%'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const booking = {
      id: `booking-${Date.now()}`,
      stationId: station.id,
      stationName: station.name,
      connectorType: selectedConnector,
      date: selectedDate,
      time: selectedTime,
      duration: estimatedDuration,
      vehicle: vehicleDetails,
      totalCost: pricing.total,
      status: 'confirmed',
      loyaltyPointsEarned: pricing.breakdown.loyaltyPointsEarned,
      createdAt: new Date().toISOString()
    }

    onBookingSubmit(booking)
  }

  // Set minimum date to today
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Charging Session</h2>
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{station.name}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={today}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.date ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Select Time
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    selectedTime === time
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-primary-50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
          </div>
        )}

        {/* Connector Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Zap className="w-4 h-4 inline mr-2" />
            Select Connector
          </label>
          <div className="space-y-2">
            {availableConnectors.map((connector, index) => (
              <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="connector"
                  value={connector.type}
                  checked={selectedConnector === connector.type}
                  onChange={(e) => setSelectedConnector(e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{connector.type}</div>
                      <div className="text-sm text-gray-600">{connector.power}</div>
                    </div>
                    <div className="text-lg font-semibold text-primary-600">
                      ₹{connector.price}/kWh
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.connector && <p className="text-red-500 text-sm mt-1">{errors.connector}</p>}
        </div>

        {/* Vehicle Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Car className="w-4 h-4 inline mr-2" />
              Vehicle Make
            </label>
            <input
              type="text"
              value={vehicleDetails.make}
              onChange={(e) => setVehicleDetails(prev => ({ ...prev, make: e.target.value }))}
              placeholder="e.g., Tesla, BMW, Tata"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.make ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.make && <p className="text-red-500 text-sm mt-1">{errors.make}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Model
            </label>
            <input
              type="text"
              value={vehicleDetails.model}
              onChange={(e) => setVehicleDetails(prev => ({ ...prev, model: e.target.value }))}
              placeholder="e.g., Model 3, iX, Nexon EV"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.model ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Battery className="w-4 h-4 inline mr-2" />
              Battery Size (kWh)
            </label>
            <input
              type="number"
              value={vehicleDetails.batterySize}
              onChange={(e) => setVehicleDetails(prev => ({ ...prev, batterySize: e.target.value }))}
              placeholder="e.g., 75"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.batterySize ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.batterySize && <p className="text-red-500 text-sm mt-1">{errors.batterySize}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Charge (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={vehicleDetails.currentCharge}
              onChange={(e) => setVehicleDetails(prev => ({ ...prev, currentCharge: e.target.value }))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.currentCharge ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.currentCharge && <p className="text-red-500 text-sm mt-1">{errors.currentCharge}</p>}
          </div>
        </div>

        {/* Estimated Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Charging Duration (hours)
          </label>
          <input
            type="number"
            min="0.5"
            max="8"
            step="0.5"
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Peak Hours Warning */}
        {selectedTime && station.peakHours && 
         selectedTime >= station.peakHours.start && selectedTime <= station.peakHours.end && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Peak hours: {station.peakHours.multiplier}x rate applies
            </span>
          </div>
        )}

        {/* Pricing Summary */}
        {pricing.total > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Pricing Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Rate:</span>
                <span>₹{pricing.breakdown.basePrice}/kWh</span>
              </div>
              {pricing.breakdown.peakMultiplier > 1 && (
                <div className="flex justify-between">
                  <span>Peak Multiplier:</span>
                  <span>{pricing.breakdown.peakMultiplier}x</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{pricing.breakdown.duration} hours</span>
              </div>
              <div className="flex justify-between">
                <span>Battery Size:</span>
                <span>{pricing.breakdown.batterySize} kWh</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total Cost:</span>
                <span>₹{pricing.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-primary-600">
                <span>Loyalty Points:</span>
                <span>+{pricing.breakdown.loyaltyPointsEarned} pts</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard className="w-4 h-4 inline mr-2" />
            Payment Method
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-primary-600 focus:ring-primary-500"
              />
              <CreditCard className="w-4 h-4 ml-3 mr-2" />
              <span>Credit/Debit Card</span>
            </label>
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="wallet"
                checked={paymentMethod === 'wallet'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-primary-600 focus:ring-primary-500"
              />
              <div className="w-4 h-4 ml-3 mr-2 bg-primary-500 rounded"></div>
              <span>EcoCharge Wallet</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <CheckCircle className="w-5 h-5 inline mr-2" />
          Confirm Booking
        </button>
      </form>
    </motion.div>
  )
}

export default BookingForm
