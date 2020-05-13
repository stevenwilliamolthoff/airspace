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
import { Operation } from "../interfaces/operations"

interface MapProps {
  operation: Operation | null
  inEditMode: boolean
  emitDraw: EmitDraw
  geoJson: any
}

interface MapState {
  intersectionArea: number | null
}

interface EmitDraw {
  (geoJson: any): void
}

export default class Map extends React.Component<MapProps, MapState> {
  map: L.Map | null = null

  // Leaflet layer groups
  drawnLayers: L.FeatureGroup = L.featureGroup()
  intersectionLayers: L.LayerGroup = L.layerGroup()

  intersectionPolygons: turf.Feature<turf.Polygon, turf.Properties>[] = []

  controlledAirspacePolygon: turf.Feature<
    turf.Polygon
  > = this.getControlledAirspacePolygon()

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
  }

  componentDidUpdate(prevProps: MapProps) {
    if (this.map && this.props.inEditMode) {
      this.map.addControl(this.drawControl)
    }
    const openingFirstOperation = !prevProps.operation && this.props.operation
    const openingDifferentOperation =
      prevProps.operation?.id !== this.props.operation?.id
    if (openingFirstOperation || openingDifferentOperation) {
      this.loadOperation()
    }
  }

  loadOperation() {
    this.drawnLayers.clearLayers()
    this.intersectionLayers.clearLayers()
    this.intersectionPolygons = []
    this.addDrawnLayers()
    this.setState({ intersectionArea: null }, this.addIntersectionLayers)
  }

  addDrawnLayers() {
    if (!this.map) {
      return
    }
    const geoJsonFeatureGroup: L.FeatureGroup = L.geoJSON(
      this.props.operation?.geo_json,
      {
        style: this.SHAPE_OPTIONS,
      }
    )
    this.drawnLayers = geoJsonFeatureGroup
    this.drawnLayers.addTo(this.map)
  }

  addIntersectionLayers() {
    this.drawnLayers.eachLayer((layer: any) => {
      const shape = layer.getLatLngs()[0]
      this.handleIntersections(shape)
    })
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
      const shape: L.LatLng[] = event.layer.getLatLngs()[0]
      this.handleIntersections(shape)

      this.props.emitDraw(this.drawnLayers.toGeoJSON())
    })
  }

  handleIntersections(shape: L.LatLng[]) {
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

  getMessage(): JSX.Element | null {
    if (this.state.intersectionArea === null) {
      return null
    }
    return <Message intersectionArea={this.state.intersectionArea}></Message>
  }

  render() {
    return (
      <div className='map'>
        {this.getMessage()}
        <div id='map' />
      </div>
    )
  }
}
