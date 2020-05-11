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
      this.checkForIntersections(event)
    })
  }

  checkForIntersections(event: any) {
    const shape: L.LatLng[] = event.layer.getLatLngs()[0]
    const turfIntersection = this.getIntersectionWithControlledAirspace(shape)
    if (turfIntersection !== null) {
      this.drawIntersections(turfIntersection)
    }
  }

  drawIntersections(
    turfIntersection: turf.Feature<turf.Polygon, turf.Properties>
  ) {
    this.intersectionPolygons.push(turfIntersection)

    const union = turf.union(...this.intersectionPolygons)
    if (!union.geometry || !union.geometry.coordinates) {
      return
    }

    this.intersectionLayers.clearLayers()
    if (union.geometry.type === "Polygon") {
      this.drawIntersectionLayer(union.geometry.coordinates)
    } else if (union.geometry.type == "MultiPolygon") {
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

  addLayerToIntersectionLayers(layer: L.Layer) {
    this.intersectionLayers.addLayer(layer)
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

  getPolygons(layerGroup: L.LayerGroup) {
    let polygons: turf.Feature<turf.Polygon, turf.Properties>[] = []
    layerGroup.eachLayer((layer: any) => {
      const shape: L.LatLng[] = layer.getLatLngs()[0]
      const coordinates: number[][] = this.getTurfCoordinates(shape)
      const newPolygon = turf.polygon([coordinates])
      polygons.push(newPolygon)
    })
    return polygons
  }

  drawMergedIntersection(coordinates: turf.Position[][]) {
    let newCoordinates = coordinates.map((coordinate: any) => ({
      lng: coordinate[0],
      lat: coordinate[1],
    }))
    newCoordinates.pop()
    const leafletPolygon = L.polygon(newCoordinates, { color: "red" })
    return leafletPolygon
    // this.intersectionLayers.addLayer(leafletPolygon)
  }

  updateIntersectionArea(intersectingPolygon: L.Layer) {
    if (this.mergedIntersectionLayers.getLayers().length === 0) {
      this.mergedIntersectionLayers.addLayer(intersectingPolygon)
      return
    }

    // const polygons: turf.Feature<
    // turf.Polygon,
    // turf.Properties
    // >[] = this.getPolygons(this.intersectionLayers)
    // const polygonUnion = turf.union(...polygons)
    // const areaOfUnionedIntersections = turf.area(polygonUnion)
    // console.log(areaOfUnionedIntersections)
    // this.setState({ intersectionArea: areaOfUnionedIntersections })
    // this.mergedIntersectionLayers.clearLayers()
    // if (
    //   polygonUnion.geometry &&
    //   polygonUnion.geometry.type === "MultiPolygon"
    // ) {
    //   let sumOfAreas = 0
    //   const shapes: turf.Position[][][] = polygonUnion.geometry.coordinates
    //   shapes.forEach((shape: turf.Position[][]) => {
    //     const polygon = turf.polygon(shape)
    //     const area = turf.area(polygon)
    //     sumOfAreas += area
    //   })
    //   console.log(sumOfAreas)
    // }
  }

  render() {
    return (
      <div className='map'>
        <Message intersectionArea={this.state.intersectionArea}></Message>
        <div id='map' />
        <div className='map__button-group'>
          <div className='map__button-group__button'>1</div>
        </div>
      </div>
    )
  }
}
