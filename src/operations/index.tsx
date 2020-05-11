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
  activeOperation: Operation | null
}

export default class Operations extends React.Component<any, OperationsState> {
  newOperationDefaultTitle = "Untitled Operation"
  constructor(props: any) {
    super(props)
    this.state = {
      operations: [],
      editingOperation: false,
      activeOperationId: null,
      activeOperation: null,
    }
  }

  async componentDidMount() {
    const response = await api.getOperations()
    this.setState({ operations: response.operations })
  }

  async onNewOperationButtonClick() {
    let operation: Partial<Operation> = {
      title: this.newOperationDefaultTitle,
    }
    try {
      const response = await api.putOperation(operation)
      const newOperation: Operation = response.operation
      this.addOperation(newOperation)
      this.setState({
        activeOperationId: newOperation.id,
        activeOperation: newOperation,
        editingOperation: true,
      })
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

  onListItemClick(operationId: number) {
    this.setState({ activeOperationId: operationId })
    const activeOperation = this.state.operations.find(
      (operation) => operation.id === operationId
    )
    if (activeOperation) {
      this.setState({
        activeOperation,
        editingOperation: true,
      })
    }
  }

  render() {
    return (
      <div className='operations'>
        <div className='operations__list'>
          <List
            emitListItemClick={(operationId: number) =>
              this.onListItemClick(operationId)
            }
            operations={this.state.operations}
          ></List>
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
            {this.state.editingOperation && this.state.activeOperation ? (
              <div className='operations__dashboard__map__info'>
                <InfoPanel
                  emitTitleChange={(title: string) =>
                    this.onOperationTitleChange(title)
                  }
                  defaultTitle={this.newOperationDefaultTitle}
                  operation={this.state.activeOperation}
                ></InfoPanel>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
}
