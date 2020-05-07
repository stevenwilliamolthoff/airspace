import React from "react"
import Map from "../map"
import "./operations.css"

export default class Operations extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = {
      showOperationInfo: false,
    }
  }

  onNewOperationButtonClick() {
    this.setState({ showOperationInfo: true })
  }

  render() {
    return (
      <div className='operations'>
        <div className='operations__toolbar'>
          <div className='operations__toolbar__search'>
            Search Location by name or coordinates
          </div>
          <div
            className='operations__toolbar__new-operation-button'
            onClick={() => this.onNewOperationButtonClick()}
          >
            + New Operation
          </div>
        </div>
        <div className='operations__map'>
          <Map></Map>
          {this.state.showOperationInfo ? (
            <div className='operations__map__info'></div>
          ) : null}
        </div>
      </div>
    )
  }
}
