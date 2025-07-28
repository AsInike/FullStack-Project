import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import '../styles/LocationModal.css';

const LocationModal = ({ isOpen, onClose, onLocationSelect, currentLocation }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(currentLocation || {
    address: '',
    lat: null,
    lng: null
  });
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && mapRef.current && !map) {
      initializeMap();
    }
  }, [isOpen, map]);

  const initializeMap = async () => {
    const loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places']
    });

    try {
      const google = await loader.load();
      
      // Default to user's current location or a default location
      let initialLocation = { lat: 11.5564, lng: 104.9282 }; // Phnom Penh, Cambodia
      
      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            initialLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            initMap(google, initialLocation);
          },
          () => {
            // If geolocation fails, use default location
            initMap(google, initialLocation);
          }
        );
      } else {
        initMap(google, initialLocation);
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
  };

  const initMap = (google, location) => {
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: location,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Create marker
    const markerInstance = new google.maps.Marker({
      position: location,
      map: mapInstance,
      draggable: true,
      title: 'Delivery Location'
    });

    // Add click event to map
    mapInstance.addListener('click', (event) => {
      const clickedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      updateLocation(clickedLocation, markerInstance, google);
    });

    // Add drag event to marker
    markerInstance.addListener('dragend', (event) => {
      const draggedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      updateLocation(draggedLocation, markerInstance, google);
    });

    // Initialize search box
    if (searchInputRef.current) {
      const searchBoxInstance = new google.maps.places.SearchBox(searchInputRef.current);
      
      searchBoxInstance.addListener('places_changed', () => {
        const places = searchBoxInstance.getPlaces();
        if (places.length === 0) return;

        const place = places[0];
        const searchLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        mapInstance.setCenter(searchLocation);
        markerInstance.setPosition(searchLocation);
        
        setSelectedLocation({
          address: place.formatted_address || place.name,
          lat: searchLocation.lat,
          lng: searchLocation.lng
        });
      });

      setSearchBox(searchBoxInstance);
    }

    setMap(mapInstance);
    setMarker(markerInstance);

    // If there's a current location, use it
    if (currentLocation && currentLocation.lat && currentLocation.lng) {
      const currentPos = { lat: currentLocation.lat, lng: currentLocation.lng };
      mapInstance.setCenter(currentPos);
      markerInstance.setPosition(currentPos);
      setSelectedLocation(currentLocation);
    }
  };

  const updateLocation = async (location, markerInstance, google) => {
    markerInstance.setPosition(location);
    
    // Reverse geocoding to get address
    const geocoder = new google.maps.Geocoder();
    try {
      const result = await geocoder.geocode({ location });
      const address = result.results[0]?.formatted_address || 'Unknown location';
      
      setSelectedLocation({
        address,
        lat: location.lat,
        lng: location.lng
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      setSelectedLocation({
        address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
        lat: location.lat,
        lng: location.lng
      });
    }
  };

  const handleConfirm = () => {
    if (selectedLocation.lat && selectedLocation.lng) {
      onLocationSelect(selectedLocation);
      onClose();
    } else {
      alert('Please select a location on the map');
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="location-modal-overlay">
      <div className="location-modal">
        <div className="location-modal-header">
          <h3>Select Delivery Location</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="location-search">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a location..."
            className="location-search-input"
          />
        </div>
        
        <div className="map-container">
          <div ref={mapRef} className="google-map"></div>
        </div>
        
        <div className="selected-location">
          <h4>Selected Location:</h4>
          <p>{selectedLocation.address || 'Click on the map to select a location'}</p>
        </div>
        
        <div className="location-modal-footer">
          <button className="cancel-btn" onClick={handleClose}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={handleConfirm}>
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;