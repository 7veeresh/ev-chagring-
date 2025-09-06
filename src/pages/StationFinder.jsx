import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  MapPin, 
  Zap, 
  Star,
  Clock,
  SlidersHorizontal,
  X
} from 'lucide-react'
import StationCard from '../components/StationCard'
import stationsData from '../data/stations.json'

const StationFinder = () => {
  const [stations, setStations] = useState(stationsData)
  const [filteredStations, setFilteredStations] = useState(stationsData)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    connectorType: '',
    priceRange: '',
    status: '',
    amenities: []
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStation, setSelectedStation] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'map'

  // Filter stations based on search and filters
  useEffect(() => {
    let filtered = stations.filter(station => {
      // Search filter
      const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           station.address.toLowerCase().includes(searchTerm.toLowerCase())

      // Connector type filter
      const matchesConnector = !selectedFilters.connectorType ||
                              station.connectors.some(connector => 
                                connector.type === selectedFilters.connectorType && connector.available
                              )

      // Price range filter
      const matchesPrice = !selectedFilters.priceRange ||
                          station.connectors.some(connector => {
                            const price = connector.price
                            switch (selectedFilters.priceRange) {
                              case 'low': return price <= 10
                              case 'medium': return price > 10 && price <= 15
                              case 'high': return price > 15
                              default: return true
                            }
                          })

      // Status filter
      const matchesStatus = !selectedFilters.status || station.status === selectedFilters.status

      // Amenities filter
      const matchesAmenities = selectedFilters.amenities.length === 0 ||
                              selectedFilters.amenities.every(amenity =>
                                station.amenities.includes(amenity)
                              )

      return matchesSearch && matchesConnector && matchesPrice && matchesStatus && matchesAmenities
    })

    setFilteredStations(filtered)
  }, [stations, searchTerm, selectedFilters])

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'amenities') {
      setSelectedFilters(prev => ({
        ...prev,
        amenities: prev.amenities.includes(value)
          ? prev.amenities.filter(a => a !== value)
          : [...prev.amenities, value]
      }))
    } else {
      setSelectedFilters(prev => ({
        ...prev,
        [filterType]: value
      }))
    }
  }

  const clearFilters = () => {
    setSelectedFilters({
      connectorType: '',
      priceRange: '',
      status: '',
      amenities: []
    })
    setSearchTerm('')
  }

  const getConnectorTypes = () => {
    const types = new Set()
    stations.forEach(station => {
      station.connectors.forEach(connector => {
        types.add(connector.type)
      })
    })
    return Array.from(types)
  }

  const getAmenities = () => {
    const amenities = new Set()
    stations.forEach(station => {
      station.amenities.forEach(amenity => {
        amenities.add(amenity)
      })
    })
    return Array.from(amenities)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find Charging Stations
            </h1>
            <p className="text-gray-600">
              Discover and book EV charging stations near you
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Search */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stations or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Connector Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connector Type
                  </label>
                  <select
                    value={selectedFilters.connectorType}
                    onChange={(e) => handleFilterChange('connectorType', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {getConnectorTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (₹/kWh)
                  </label>
                  <select
                    value={selectedFilters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Prices</option>
                    <option value="low">Low (≤ ₹10)</option>
                    <option value="medium">Medium (₹10-15)</option>
                    <option value="high">High (&gt; ₹15)</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Station Status
                  </label>
                  <select
                    value={selectedFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="online">Online</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <div className="space-y-2">
                    {getAmenities().map(amenity => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.amenities.includes(amenity)}
                          onChange={() => handleFilterChange('amenities', amenity)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''} found
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Map
                </button>
              </div>
            </div>

            {/* Results */}
            {viewMode === 'grid' ? (
              <div className="space-y-6">
                {filteredStations.map((station, index) => (
                  <motion.div
                    key={station.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <StationCard
                      station={station}
                      onBook={(station) => setSelectedStation(station)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
                <MapContainer
                  center={[12.9716, 77.5946]}
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {filteredStations.map((station) => (
                    <Marker
                      key={station.id}
                      position={station.coordinates}
                      eventHandlers={{
                        click: () => setSelectedStation(station)
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-gray-900 mb-1">{station.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{station.address}</p>
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{station.rating}</span>
                            <span className="text-sm text-gray-500">({station.reviews})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4 text-primary-600" />
                            <span className="text-sm">
                              {station.connectors.filter(c => c.available).length} available
                            </span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}

            {filteredStations.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stations found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StationFinder
