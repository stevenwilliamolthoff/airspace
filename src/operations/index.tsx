import React from "react"
import Map from "../Map"
import "./operations.scss"
import List from "./List"
import InfoPanel from "./InfoPanel"
import api from "../api"
import { Operation } from "../interfaces/operations"

interface OperationsState {
  operations: Operation[]
  editingOperation: boolean
}

export default class Operations extends React.Component<any, OperationsState> {
  newOperationDefaultTitle = "Untitled Operation"
  constructor(props: any) {
    super(props)
    this.state = {
      operations: [],
      editingOperation: false,
    }
  }

  async componentDidMount() {
    const response = await api.getOperations()
    this.setState({ operations: response.operations })
  }

  async onNewOperationButtonClick() {
    this.setState({ editingOperation: true })
    let operation: Operation = {
      title: this.newOperationDefaultTitle,
    }
    try {
      const response = await api.putOperation(operation)
      operation = response.operation
      this.addOperation(operation)

      console.log(operation)
    } catch (error) {
      console.error("Failed to put new operation.")
    }
  }

  addOperation(operation: Operation) {
    let operations = this.state.operations
    operations.push(operation)
    this.setState({ operations })
  }

  render() {
    return (
      <div className='operations'>
        <div className='operations__list'>
          <List operations={this.state.operations}></List>
        </div>
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
