import React from "react"
import Map from "../Map"
import "./operations.scss"
import List from "./List"
import InfoPanel from "./InfoPanel"
import api from "../api"
import { Operation } from "../interfaces/operations"

export default class Operations extends React.Component<any, any> {
  newOperationDefaultTitle = "Untitled Operation"
  constructor(props: any) {
    super(props)
    this.state = {
      editingOperation: false,
    }
  }

  async onNewOperationButtonClick() {
    this.setState({ editingOperation: true })
    let operation: Operation = {
      title: this.newOperationDefaultTitle,
    }
    try {
      const response = await api.putOperation(operation)
      operation = response.operation
      console.log(operation)
    } catch (error) {
      console.error("Failed to put new operation.")
    }
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
                <InfoPanel
                  defaultTitle={this.newOperationDefaultTitle}
                ></InfoPanel>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
}
