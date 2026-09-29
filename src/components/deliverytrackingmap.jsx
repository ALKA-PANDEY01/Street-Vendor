import {useEffect,useState} from "react";
import L from "leaflet";
import {MapContainer,Marker,Popup,TileLayer,useMap} from "react-leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import trackingSocket from "../api/trackingSocket.js";
import "leaflet/dist/leaflet.css";
import "./deliverytrackingmap.css";

const deliveryIcon=new L.Icon({
    iconUrl:markerIcon,
    iconRetinaUrl:markerIconRetina,
    shadowUrl:markerShadow,
    iconSize:[25,41],
    iconAnchor:[12,41],
    popupAnchor:[1,-34],
    shadowSize:[41,41],
});

const getPosition=(location)=>{
    const coordinates=location?.coordinates;
    if(!Array.isArray(coordinates) || coordinates.length < 2){
        return null;
    }
    const lng=Number(coordinates[0]);
    const lat=Number(coordinates[1]);
    return Number.isFinite(lat) && Number.isFinite(lng) ? {lat,lng} : null;
};

function RecenterMap({position}){
    const map=useMap();
    useEffect(()=>{
        map.setView([position.lat,position.lng],map.getZoom());
    },[map,position.lat,position.lng]);
    return null;
}

export default function DeliveryTrackingMap({orderId,initialLocation,fallbackLocation}){
    const [deliveryPosition,setDeliveryPosition]=useState(()=>getPosition(initialLocation));
    const [updatedAt,setUpdatedAt]=useState(null);
    const [trackingError,setTrackingError]=useState("");
    const fallbackPosition=getPosition(fallbackLocation) || {lat:20.5937,lng:78.9629};
    const mapCenter=deliveryPosition || fallbackPosition;

    useEffect(()=>{
        const applyUpdate=(update)=>{
            if(String(update.orderId) !== String(orderId)){
                return;
            }
            const position=getPosition(update.deliveryLocation);
            if(position){
                setDeliveryPosition(position);
                setUpdatedAt(update.updatedAt || null);
                setTrackingError("");
            }
        };
        trackingSocket.on("deliveryLocationUpdate",applyUpdate);
        trackingSocket.emit("joinOrderRoom",{orderId},(response)=>{
            if(!response?.ok){
                setTrackingError(response?.message || "Unable to connect to live tracking.");
                return;
            }
            const position=getPosition(response.deliveryLocation);
            if(position){
                setDeliveryPosition(position);
                setUpdatedAt(response.updatedAt || null);
            }
        });
        return ()=>trackingSocket.off("deliveryLocationUpdate",applyUpdate);
    },[orderId]);

    return (
        <section className="delivery-tracking" aria-label="Live delivery tracking">
            <div className="delivery-tracking-heading">
                <h3>Live delivery tracking</h3>
                {updatedAt && <span>Updated {new Date(updatedAt).toLocaleTimeString()}</span>}
            </div>
            {!deliveryPosition && (
                <p className="delivery-tracking-message">
                    {trackingError || "Waiting for the vendor to share their location."}
                </p>
            )}
            <div className="delivery-map-frame">
                <MapContainer
                    center={[mapCenter.lat,mapCenter.lng]}
                    zoom={14}
                    scrollWheelZoom={false}
                    className="delivery-map-canvas"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterMap position={mapCenter}/>
                    {deliveryPosition && (
                        <Marker position={[deliveryPosition.lat,deliveryPosition.lng]} icon={deliveryIcon}>
                            <Popup>Vendor delivery location</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </section>
    );
}