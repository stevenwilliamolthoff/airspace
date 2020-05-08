import React from "react"
import Map from "../Map"
import "./operations.scss"
import List from "./List"
import InfoPanel from "./InfoPanel"

interface Operation {
  id: number
  title: string
  feature_collection: any
}

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
        <List className='operations__list'></List>
        <div className='operations__dashboard'>
          <div className='operations__dashboard__toolbar'>
            <div className='operations__dashboard__toolbar__search'>
              Search Location by name or coordinates
            </div>
            <div
              className='operations__dashboard__toolbar__new-operation-button'
              onClick={() => this.onNewOperationButtonClick()}
            >
              + New Operation
            </div>
          </div>
          <div className='operations__dashboard__map'>
            <Map editingOperation={this.state.editingOperation}></Map>
            {this.state.editingOperation ? (
              <div className='operations__dashboard__map__info'>
                <InfoPanel></InfoPanel>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
}
