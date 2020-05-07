import React from "react"
import Map from "../map"
import "./operations.css"

export default class Operations extends React.Component<any> {
  render() {
    return (
      <div className='operations'>
        <div className='operations__toolbar'>
          <div className='operations__toolbar__search'>
            Search Location by name or coordinates
          </div>
          <div className='operations__toolbar__new-operation-button'>
            + New Operation
          </div>
        </div>
        <div className='operations__map'>
          <Map></Map>
          <div className='operations__map__info'></div>
        </div>
      </div>
    )
  }
}
