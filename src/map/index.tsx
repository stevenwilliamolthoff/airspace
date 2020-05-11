import React from "react"
import "./map.css"
import L from "leaflet"
import "leaflet-draw"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet/dist/leaflet.css"
import ControlledAirspaceGeoJson from "../faa-controlled-airspace-DTW"
import * as turf from "@turf/turf"
import Message from "./Message"
import { URL_TEMPLATE, TILE_LAYER_OPTIONS } from "./MapConfig"

interface MapProps {
  editingOperation: boolean
}

interface MapState {
  intersectionArea: number | null
}

export default class Map extends React.Component<MapProps, MapState> {
  map: L.Map | null = null

  // Leaflet layer groups
  drawnLayers: L.FeatureGroup = L.featureGroup()
  intersectionLayers: L.LayerGroup = L.layerGroup()
  mergedIntersectionLayers: L.LayerGroup = L.layerGroup()

  intersectionPolygons: turf.Feature<turf.Polygon, turf.Properties>[] = []

  controlledAirspacePolygon: turf.Feature<
    turf.Polygon
  > = this.getControlledAirspacePolygon()

  pane1: any

  SHAPE_OPTIONS = {
    color: "green",
  }
  DRAW_OPTIONS: L.Control.DrawConstructorOptions = {
    position: "topright",
    edit: {
      featureGroup: this.drawnLayers,
      edit: false,
      remove: false,
    },
    draw: {
      polygon: {
        shapeOptions: this.SHAPE_OPTIONS,
        allowIntersection: false,
      },
      rectangle: {
        shapeOptions: this.SHAPE_OPTIONS,
      },
      circle: false,
      polyline: false,
      marker: false,
      circlemarker: false,
    },
  }
  drawControl: L.Control.Draw = new L.Control.Draw(this.DRAW_OPTIONS)

  constructor(props: MapProps) {
    super(props)
    this.state = {
      intersectionArea: null,
    }
  }

  componentDidMount() {
    this.map = L.map("map")
    this.getTileLayer().addTo(this.map)
    this.getControlledAirspace().addTo(this.map)
    this.centerMapOnControlledAirspace(this.map)
    this.addLayerCreatedHandler(this.map)
    this.map.addLayer(this.drawnLayers)
    this.map.addLayer(this.intersectionLayers)
    this.map.addLayer(this.mergedIntersectionLayers)
  }

  componentDidUpdate() {
    if (this.map && this.props.editingOperation) {
      this.map.addControl(this.drawControl)
    }
  }

  getTileLayer() {
    return L.tileLayer(URL_TEMPLATE, TILE_LAYER_OPTIONS)
  }

  getControlledAirspace() {
    return L.geoJSON(ControlledAirspaceGeoJson, {
      style: { color: "rgba(255, 100, 100, .5)" },
    })
  }

  getControlledAirspacePolygon() {
    return turf.polygon(
      ControlledAirspaceGeoJson.features[0].geometry.coordinates
    )
  }

  centerMapOnControlledAirspace(map: L.Map) {
    const centroid = turf.centroid(ControlledAirspaceGeoJson)
    const centroidCoordinates = turf.getCoord(centroid)
    const longitude = centroidCoordinates[0]
    const latitude = centroidCoordinates[1]
    map.setView([latitude, longitude], 13)
  }

  addLayerCreatedHandler(map: L.Map) {
    map.on(L.Draw.Event.CREATED, (event: any) => {
      this.drawnLayers.addLayer(event.layer)
      this.handleIntersections(event)
    })
  }

  handleIntersections(event: any) {
    const shape: L.LatLng[] = event.layer.getLatLngs()[0]
    const turfIntersection = this.getIntersectionWithControlledAirspace(shape)
    if (turfIntersection === null) {
      if (this.state.intersectionArea === null) {
        this.setState({ intersectionArea: 0 })
      }
    } else {
      this.intersectionPolygons.push(turfIntersection)
      const union = this.getUnionOfIntersections()
      this.drawIntersections(union)
      const intersectionArea = this.getAreaOfIntersections(union, "miles")
      this.setState({ intersectionArea })
    }
  }

  getAreaOfIntersections(
    union: turf.Feature<turf.Polygon | turf.MultiPolygon, turf.Properties>,
    unit: turf.Units
  ) {
    return turf.convertArea(turf.area(union), "meters", unit)
  }

  getUnionOfIntersections() {
    return turf.union(...this.intersectionPolygons)
  }

  drawIntersections(
    union: turf.Feature<turf.Polygon | turf.MultiPolygon, turf.Properties>
  ) {
    if (!union.geometry || !union.geometry.coordinates) {
      return
    }

    this.intersectionLayers.clearLayers()
    if (union.geometry.type === "Polygon") {
      this.drawIntersectionLayer(union.geometry.coordinates)
    } else if (union.geometry.type === "MultiPolygon") {
      union.geometry.coordinates.forEach((coordinates) =>
        this.drawIntersectionLayer(coordinates)
      )
    }
  }

  getLeafletCoordinates(turfCoordinates: turf.Position[][]) {
    let newCoordinates = turfCoordinates[0].map(
      (coordinate: turf.Position) => ({
        lng: coordinate[0],
        lat: coordinate[1],
      })
    )
    newCoordinates.pop()
    return newCoordinates
  }

  drawIntersectionLayer(turfCoordinates: turf.Position[][]) {
    let newCoordinates = this.getLeafletCoordinates(turfCoordinates)
    const leafletPolygon = L.polygon(newCoordinates, { color: "red" })
    this.intersectionLayers.addLayer(leafletPolygon)
  }

  getIntersectionWithControlledAirspace(shape: L.LatLng[]) {
    const coordinates: number[][] = this.getTurfCoordinates(shape)
    const newlyDrawnPolygon = turf.polygon([coordinates])
    const intersection = turf.intersect(
      newlyDrawnPolygon,
      this.controlledAirspacePolygon
    )
    return intersection
  }

  getTurfCoordinates(latLngs: L.LatLng[]): number[][] {
    let coordinates: number[][] = latLngs.map((latLng: L.LatLng) => [
      latLng.lng,
      latLng.lat,
    ])
    const firstCoordinate: number[] = [latLngs[0].lng, latLngs[0].lat]
    coordinates.push(firstCoordinate)
    return coordinates
  }

  render() {
    const message =
      this.state.intersectionArea !== null ? (
        <Message intersectionArea={this.state.intersectionArea}></Message>
      ) : null
    return (
      <div className='map'>
        {message}
        <div id='map' />
      </div>
    )
  }
}
