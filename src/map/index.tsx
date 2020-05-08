import React from "react"
import "./map.css"
import L from "leaflet"
import "leaflet-draw"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet/dist/leaflet.css"
import ControlledAirspaceGeoJson from "../faa-controlled-airspace-DTW"
import {
  area,
  centroid as getCentroid,
  getCoord,
  polygon,
  intersect,
  Feature,
  Polygon,
  Properties,
  union,
} from "@turf/turf"
import Message from "./Message"

interface MapProps {
  editingOperation: boolean
}

interface MapState {
  flightApproved: boolean | null
}

export default class Map extends React.Component<MapProps, MapState> {
  map: L.Map | null = null
  drawnItemsFeatureGroup: L.FeatureGroup
  intersectionLayerGroup: L.LayerGroup
  drawControl: L.Control.Draw

  controlledAirspacePolygon: Feature<Polygon>

  constructor(props: MapProps) {
    super(props)
    this.controlledAirspacePolygon = polygon(
      ControlledAirspaceGeoJson.features[0].geometry.coordinates
    )

    const shapeOptions = {
      color: "green",
    }
    this.drawnItemsFeatureGroup = L.featureGroup()
    this.intersectionLayerGroup = L.layerGroup()
    this.drawControl = new L.Control.Draw({
      position: "topright",
      edit: {
        featureGroup: this.drawnItemsFeatureGroup,
        edit: false,
        remove: false,
      },
      draw: {
        polygon: {
          shapeOptions,
          allowIntersection: false,
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
  }

  componentDidMount() {
    this.map = L.map("map")
    this.addTileLayer(this.map)
    this.addControlledAirspace(this.map)
    this.centerMapOnControlledAirspace(this.map)
    this.addDrawingLayer(this.map)
    this.addIntersectionCheck(this.map)
  }

  componentDidUpdate() {
    if (this.map && this.props.editingOperation) {
      this.enableDrawing(this.map)
    }
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

  addDrawingLayer(map: L.Map) {
    map.on(L.Draw.Event.CREATED, (event: any) => {
      this.drawnItemsFeatureGroup.addLayer(event.layer)
    })
  }

  enableDrawing(map: L.Map) {
    map.addLayer(this.drawnItemsFeatureGroup)
    map.addLayer(this.intersectionLayerGroup)
    map.addControl(this.drawControl)
  }

  addIntersectionCheck(map: L.Map) {
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const shape: L.LatLng[] = event.layer.getLatLngs()[0]
      const intersection: Feature<
        Polygon,
        Properties
      > | null = this.getIntersectionWithControlledAirspace(shape)
      if (intersection !== null) {
        const intersectingPolygon = intersection.geometry as Polygon
        console.log(area(intersectingPolygon))
        this.drawIntersection(intersectingPolygon)
        this.calculateIntersectionArea()
      }
    })
  }

  private getIntersectionWithControlledAirspace(shape: L.LatLng[]) {
    const coordinates: number[][] = this.getTurfCoordinates(shape)
    const newlyDrawnPolygon = polygon([coordinates])
    const intersection: Feature<Polygon, Properties> | null = intersect(
      newlyDrawnPolygon,
      this.controlledAirspacePolygon
    )
    return intersection
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

  private drawIntersection(polygon: Polygon) {
    const shape = polygon.coordinates[0]
    let coordinates = shape.map((coordinate) => ({
      lng: coordinate[0],
      lat: coordinate[1],
    }))
    coordinates.pop()
    const leafletPolygon = L.polygon(coordinates, { color: "red" })
    this.intersectionLayerGroup.addLayer(leafletPolygon)
  }

  private getPolygons(layerGroup: L.LayerGroup) {
    let polygons: Feature<Polygon, Properties>[] = []
    layerGroup.eachLayer((layer: any) => {
      const shape: L.LatLng[] = layer.getLatLngs()[0]
      const coordinates: number[][] = this.getTurfCoordinates(shape)
      const newPolygon = polygon([coordinates])
      polygons.push(newPolygon)
    })
    return polygons
  }

  private calculateIntersectionArea() {
    const polygons: Feature<Polygon, Properties>[] = this.getPolygons(
      this.intersectionLayerGroup
    )
    const polygonUnion = union(...polygons)
    const areaOfUnionedIntersections = area(polygonUnion)
    console.log(areaOfUnionedIntersections)
  }

  render() {
    return (
      <div className='map'>
        <Message flightApproved={true}></Message>
        <div id='map' />
      </div>
    )
  }
}
