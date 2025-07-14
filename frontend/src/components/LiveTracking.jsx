import React, { useState, useEffect } from 'react'
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { loadGomapsScript } from '../utils/loadGomapsScript'

const containerStyle = {
    width: '100%',
    height: '100%',
};

const center = {
    lat: -3.745,
    lng: -38.523
};

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const LiveTracking = ({ pickupCoords, destinationCoords }) => {
    const [ currentPosition, setCurrentPosition ] = useState(null); // Start as null
    const [ scriptLoaded, setScriptLoaded ] = useState(false);
    const [ mapOptions, setMapOptions ] = useState({});
    const [ loadingLocation, setLoadingLocation ] = useState(true);
    const [ directions, setDirections ] = useState(null);

    useEffect(() => {
        loadGomapsScript(apiKey)
            .then(() => {
                setScriptLoaded(true);
                setMapOptions({
                    zoomControl: true,
                    zoomControlOptions: {
                        position: window.google.maps.ControlPosition.TOP_RIGHT
                    }
                });
            })
            .catch(() => alert('Failed to load map script!'));
    }, []);

    useEffect(() => {
        if (pickupCoords && destinationCoords && scriptLoaded && window.google) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: pickupCoords,
                    destination: destinationCoords,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === 'OK') {
                        setDirections(result);
                    } else {
                        setDirections(null);
                    }
                }
            );
        } else {
            setDirections(null);
        }
    }, [pickupCoords, destinationCoords, scriptLoaded]);

    useEffect(() => {
        if (!pickupCoords) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({
                    lat: latitude,
                    lng: longitude
                });
                setLoadingLocation(false);
            }, () => {
                setLoadingLocation(false);
            });

            const watchId = navigator.geolocation.watchPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({
                    lat: latitude,
                    lng: longitude
                });
            });

            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            setCurrentPosition(pickupCoords);
            setLoadingLocation(false);
        }
    }, [pickupCoords]);

    useEffect(() => {
        if (!currentPosition) return;
        const updatePosition = () => {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({
                    lat: latitude,
                    lng: longitude
                });
            });
        };

        const intervalId = setInterval(updatePosition, 1000);
        return () => clearInterval(intervalId);
    }, [currentPosition]);

    if (!scriptLoaded || loadingLocation || !currentPosition) return <div className='w-full h-full flex items-center justify-center text-lg'>Loading map...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPosition}
            zoom={15}
            options={mapOptions}
        >
            {!directions && <Marker position={currentPosition} />}
            {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
    )
}

export default LiveTracking