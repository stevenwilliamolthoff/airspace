import React from "react"
import Map from "../Map"
import "./operations.scss"
import InfoPanel from "./InfoPanel"

export default class Operations extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = {
      editingOperation: false,
    }
  }

  onNewOperationButtonClick() {
    this.setState({ editingOperation: true })
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
          <Map editingOperation={this.state.editingOperation}></Map>
          {this.state.editingOperation ? (
            <div className='operations__map__info'>
              <InfoPanel></InfoPanel>
            </div>
          ) : null}
        </div>
      </div>
    )
  }
}
