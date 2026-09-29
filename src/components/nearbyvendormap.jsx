import L from "leaflet";
import {Circle, MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import "./nearbyvendormap.css";

const vendorIcon=new L.Icon({
    iconUrl:markerIcon,
    iconRetinaUrl:markerIconRetina,
    shadowUrl:markerShadow,
    iconSize:[25,41],
    iconAnchor:[12,41],
    popupAnchor:[1,-34],
    shadowSize:[41,41],
});

const userIcon=L.divIcon({
    className:"nearby-user-marker",
    html:"<span></span>",
    iconSize:[20,20],
    iconAnchor:[10,10],
});

export default function NearbyVendorMap({center,vendors,radiusKm=10,loading=false}){
    if(!center){
        return null;
    }

    return (
        <section className="nearby-map-section" aria-label="Nearby vendors map">
            <div className="nearby-map-heading">
                <h2>Vendors near you</h2>
                <span>Within {radiusKm} km</span>
            </div>
            {loading ? (
                <p className="nearby-map-empty">Finding vendors near you...</p>
            ) : vendors.length === 0 && (
                <p className="nearby-map-empty">No vendors found within {radiusKm} km.</p>
            )}
            <div className="nearby-map-frame">
                <MapContainer
                    center={[center.lat,center.lng]}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="nearby-map-canvas"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Circle
                        center={[center.lat,center.lng]}
                        radius={radiusKm*1000}
                        pathOptions={{color:"#258477",fillColor:"#63b7a3",fillOpacity:0.12}}
                    />
                    <Marker position={[center.lat,center.lng]} icon={userIcon}>
                        <Popup>Your location</Popup>
                    </Marker>
                    {vendors.map((vendor)=>(
                        <Marker
                            key={vendor.id}
                            position={[vendor.lat,vendor.lng]}
                            icon={vendorIcon}
                        >
                            <Popup>
                                <div className="nearby-vendor-popup">
                                    <strong>{vendor.name}</strong>
                                    <span>{vendor.distanceKm.toFixed(1)} km away</span>
                                    <ul>
                                        {vendor.products.map((product)=>(
                                            <li key={product.id}>
                                                <span>{product.name}</span>
                                                <span>Rs. {product.price}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </section>
    );
}