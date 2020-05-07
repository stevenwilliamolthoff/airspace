import React from "react"
import "./map.css"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import ControlledAirspaceGeoJson from "../faa-controlled-airspace-DTW"
import { centroid as getCentroid, getCoord } from "@turf/turf"

interface MapProps {}

export default class Map extends React.Component<MapProps> {
  leafletMap: L.Map | null = null

  componentDidMount() {
    this.leafletMap = L.map("map")
    this.addTileLayer(this.leafletMap)
    this.addControlledAirspace(this.leafletMap)
    this.centerMapOnControlledAirspace(this.leafletMap)
  }

  addTileLayer(leafletMap: L.Map) {
    const urlTemplate =
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
    const attribution =
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
    const accessToken =
      "pk.eyJ1Ijoic3RldmVub2x0aG9mZiIsImEiOiJjazl2cHp4ZGYwMXR1M21xNmYxZDl0eHJrIn0.PjLPHhaTy_nG2F-JKG5QuQ"

    L.tileLayer(urlTemplate, {
      attribution,
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken,
    }).addTo(leafletMap)
  }

  addControlledAirspace(leafletMap: L.Map) {
    const controlledAirspaceStyle = { color: "red" }
    L.geoJSON(ControlledAirspaceGeoJson, {
      style: controlledAirspaceStyle,
    }).addTo(leafletMap)
  }

  centerMapOnControlledAirspace(leafletMap: L.Map) {
    const centroid = getCentroid(ControlledAirspaceGeoJson)
    const centroidCoordinates = getCoord(centroid)
    const longitude = centroidCoordinates[0]
    const latitude = centroidCoordinates[1]

    leafletMap.setView([latitude, longitude], 13)
  }

  render() {
    return <div id='map'></div>
  }
}
