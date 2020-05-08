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
  activeOperationId: number | null
}

export default class Operations extends React.Component<any, OperationsState> {
  newOperationDefaultTitle = "Untitled Operation"
  constructor(props: any) {
    super(props)
    this.state = {
      operations: [],
      editingOperation: false,
      activeOperationId: null,
    }
  }

  async componentDidMount() {
    const response = await api.getOperations()
    this.setState({ operations: response.operations })
  }

  async onNewOperationButtonClick() {
    this.setState({ editingOperation: true })
    let operation: Partial<Operation> = {
      title: this.newOperationDefaultTitle,
    }
    try {
      const response = await api.putOperation(operation)
      const newOperation: Operation = response.operation
      this.addOperation(newOperation)
      this.setState({ activeOperationId: newOperation.id })
    } catch (error) {
      console.error("Failed to put new operation.")
    }
  }

  addOperation(operation: Operation) {
    let operations = this.state.operations
    operations = [operation].concat(operations)
    this.setState({ operations })
  }

  async onOperationTitleChange(title: string) {
    console.log(title)
    let updatedOperations = this.state.operations
    let activeOperation = updatedOperations.find(
      (operation) => operation.id === this.state.activeOperationId
    )
    if (!activeOperation) {
      return
    }

    activeOperation.title = title
    try {
      await api.postOperation(activeOperation)
      this.setState({ operations: updatedOperations })
    } catch (error) {
      console.error("Failed to update title")
    }
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
                  emitTitleChange={(title: string) =>
                    this.onOperationTitleChange(title)
                  }
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
