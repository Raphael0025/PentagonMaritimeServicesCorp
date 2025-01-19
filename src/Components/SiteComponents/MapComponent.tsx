'use client'

import React from 'react'

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

export default function MapComponent(){
    
    const center ={
        lat: 14.582181001671337,
        lng: 120.98376193672414,
    }
    
    const mapContainerStyle = {
        width: '100%',
        height: '400px',
    }

    return(
    <>
        <LoadScript googleMapsApiKey={`${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`} >
            <GoogleMap 
                mapContainerStyle={mapContainerStyle} 
                center={center} 
                zoom={18} 
            >
                <Marker position={center} />
            </GoogleMap>
        </LoadScript>
    </>
    )
}