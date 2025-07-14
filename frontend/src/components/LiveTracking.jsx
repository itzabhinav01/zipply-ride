import React, { useState, useEffect } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
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

const LiveTracking = () => {
    const [ currentPosition, setCurrentPosition ] = useState(center);
    const [ scriptLoaded, setScriptLoaded ] = useState(false);
    const [ mapOptions, setMapOptions ] = useState({});

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
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            });
        });

        const watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            });
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    useEffect(() => {
        const updatePosition = () => {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({
                    lat: latitude,
                    lng: longitude
                });
            });
        };

        updatePosition();
        const intervalId = setInterval(updatePosition, 1000);
        return () => clearInterval(intervalId);
    }, []);

    if (!scriptLoaded) return <div>Loading map...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPosition}
            zoom={15}
            options={mapOptions}
        >
            <Marker position={currentPosition} />
        </GoogleMap>
    )
}

export default LiveTracking