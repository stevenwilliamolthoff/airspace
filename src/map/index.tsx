import React from "react"
import "./map.css"
import L from "leaflet"
import "leaflet-draw"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet/dist/leaflet.css"
import ControlledAirspaceGeoJson from "../faa-controlled-airspace-DTW"
import { centroid as getCentroid, getCoord } from "@turf/turf"

interface MapProps {}

export default class Map extends React.Component<MapProps> {
  map: L.Map | null = null

  componentDidMount() {
    this.map = L.map("map")
    this.addTileLayer(this.map)
    this.addControlledAirspace(this.map)
    this.centerMapOnControlledAirspace(this.map)
    this.addDrawPlugin(this.map)
  }

  addTileLayer(map: L.Map) {
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
    }).addTo(map)
  }

  addControlledAirspace(map: L.Map) {
    const controlledAirspaceStyle = { color: "rgba(255, 0, 0, .5)" }
    L.geoJSON(ControlledAirspaceGeoJson, {
      style: controlledAirspaceStyle,
    }).addTo(map)
  }

  centerMapOnControlledAirspace(map: L.Map) {
    const centroid = getCentroid(ControlledAirspaceGeoJson)
    const centroidCoordinates = getCoord(centroid)
    const longitude = centroidCoordinates[0]
    const latitude = centroidCoordinates[1]

    map.setView([latitude, longitude], 13)
  }

  addDrawPlugin(map: L.Map) {
    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)

    const shapeOptions = {
      color: "green",
    }
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        polygon: {
          shapeOptions,
        },
        rectangle: {
          shapeOptions,
        },
        circle: {
          shapeOptions,
        },
        polyline: false,
        marker: false,
        circlemarker: false,
      },
    })
    map.addControl(drawControl)

    map.on("draw:created", (event: any) => {
      drawnItems.addLayer(event.layer)
    })
  }

  render() {
    return <div id='map'></div>
  }
}
