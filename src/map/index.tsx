import React, { FunctionComponent, useEffect } from "react"
import "./map.css"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapProps {}

export default class Map extends React.Component<MapProps> {
  leafletMap: L.Map | null = null
  constructor(props: MapProps) {
    super(props)
  }
  componentDidMount() {
    this.leafletMap = L.map("map").setView([51.505, -0.09], 13)
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
    }).addTo(this.leafletMap)
  }
  render() {
    return <div id='map'></div>
  }
}
