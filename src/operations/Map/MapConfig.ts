export const URL_TEMPLATE =
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
const attribution =
  'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
const accessToken =
  "pk.eyJ1Ijoic3RldmVub2x0aG9mZiIsImEiOiJjazl2cHp4ZGYwMXR1M21xNmYxZDl0eHJrIn0.PjLPHhaTy_nG2F-JKG5QuQ"

export const TILE_LAYER_OPTIONS = {
  attribution,
  maxZoom: 18,
  id: "mapbox/streets-v11",
  tileSize: 512,
  zoomOffset: -1,
  accessToken,
}
