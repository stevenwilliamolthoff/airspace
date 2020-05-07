import React from "react"
import "./map.css"
import L from "leaflet"
import "leaflet-draw"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet/dist/leaflet.css"
import ControlledAirspaceGeoJson from "../faa-controlled-airspace-DTW"
import {
  centroid as getCentroid,
  getCoord,
  polygon,
  intersect,
  Feature,
  Polygon,
  Properties,
} from "@turf/turf"

interface MapProps {}

export default class Map extends React.Component<MapProps> {
  map: L.Map | null = null
  drawnItemsFeatureGroup: L.FeatureGroup
  controlledAirspacePolygon: Feature<Polygon>

  constructor(props: MapProps) {
    super(props)
    this.drawnItemsFeatureGroup = L.featureGroup()
    this.controlledAirspacePolygon = polygon(
      ControlledAirspaceGeoJson.features[0].geometry.coordinates
    )
  }

  componentDidMount() {
    this.map = L.map("map")
    this.addTileLayer(this.map)
    this.addControlledAirspace(this.map)
    this.centerMapOnControlledAirspace(this.map)
    this.addDrawPlugin(this.map, this.drawnItemsFeatureGroup)
    this.addIntersectionCheck(this.map)
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
    const controlledAirspaceStyle = { color: "rgba(255, 100, 100, .5)" }
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

  addDrawPlugin(map: L.Map, drawnItemsFeatureGroup: L.FeatureGroup) {
    map.addLayer(drawnItemsFeatureGroup)

    const shapeOptions = {
      color: "green",
    }
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItemsFeatureGroup,
      },
      draw: {
        polygon: {
          shapeOptions,
        },
        rectangle: {
          shapeOptions,
        },
        circle: false,
        polyline: false,
        marker: false,
        circlemarker: false,
      },
    })
    map.addControl(drawControl)

    map.on(L.Draw.Event.CREATED, (event: any) => {
      drawnItemsFeatureGroup.addLayer(event.layer)
    })
  }

  addIntersectionCheck(map: L.Map) {
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const shape: L.LatLng[] = event.layer.getLatLngs()[0]
      const coordinates: number[][] = this.getTurfCoordinates(shape)
      const newlyDrawnPolygon = polygon([coordinates])
      const intersection: Feature<Polygon, Properties> | null = intersect(
        newlyDrawnPolygon,
        this.controlledAirspacePolygon
      )
      if (intersection !== null) {
        const intersectingPolygon = intersection.geometry as Polygon
        this.drawPolygon(intersectingPolygon)
      }
    })
  }

  private getTurfCoordinates(latLngs: L.LatLng[]): number[][] {
    let coordinates: number[][] = latLngs.map((latLng: L.LatLng) => [
      latLng.lng,
      latLng.lat,
    ])
    const firstCoordinate: number[] = [latLngs[0].lng, latLngs[0].lat]
    coordinates.push(firstCoordinate)
    return coordinates
  }

  private drawPolygon(polygon: Polygon) {
    const shape = polygon.coordinates[0]
    let coordinates = shape.map((coordinate) => ({
      lng: coordinate[0],
      lat: coordinate[1],
    }))
    coordinates.pop()
    L.polygon(coordinates, { color: "red" }).addTo(this.drawnItemsFeatureGroup)
  }

  render() {
    return <div id='map'></div>
  }
}
