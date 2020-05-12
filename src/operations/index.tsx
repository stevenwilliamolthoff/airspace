import React from "react"
import Map from "../Map"
import "./operations.scss"
import List from "./List"
import InfoPanel from "./InfoPanel"
import api from "../api"
import { Operation } from "../interfaces/operations"
import moment from "moment"

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
    if (!this.state.activeOperation) {
      return
    }
    let updatedOperation = this.state.activeOperation
    updatedOperation.title = title
    this.updateOperation(updatedOperation)
  }

  async onOperationDateChange(date: Date, type: "start_at" | "end_at") {
    if (!this.state.activeOperation) {
      return
    }
    let updatedOperation = this.state.activeOperation

    updatedOperation[type] = date.toISOString()

    this.updateOperation(updatedOperation)
  }

  onMapDraw(geoJson: L.GeoJSON) {
    if (!this.state.activeOperation) {
      return
    }
    let updatedOperation = this.state.activeOperation
    updatedOperation.geo_json = geoJson
    this.updateOperation(updatedOperation)
  }

  async updateOperation(updatedActiveOperation: Operation) {
    if (!this.state.activeOperation) {
      return
    }

    try {
      updatedActiveOperation = (await api.postOperation(updatedActiveOperation))
        .operation
      this.setState({ activeOperation: updatedActiveOperation })

      let updatedOperations = this.state.operations.map((operation) => {
        if (operation.id === this.state.activeOperationId) {
          return updatedActiveOperation
        }
        return operation
      })
      updatedOperations = this.getSortedOperations(updatedOperations)
      this.setState({ operations: updatedOperations })
    } catch (error) {
      console.error("Failed to update title")
    }
  }

  getSortedOperations(operations: Operation[]) {
    return operations.sort((operationA, operationB) => {
      const momentA = moment(operationA.updated_at)
      const momentB = moment(operationB.updated_at)
      if (momentA.isAfter(momentB)) {
        return -1
      } else if (momentA.isBefore(momentB)) {
        return 1
      } else {
        return 0
      }
    })
  }

  async onListItemClick(operationId: number) {
    try {
      const { operation } = await api.getOperation(operationId)
      this.setState({
        activeOperationId: operationId,
        activeOperation: operation,
        editingOperation: true,
      })
    } catch (error) {
      console.error("Failed to get operation")
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
            <Map
              operation={this.state.activeOperation}
              geoJson={this.state.activeOperation?.geo_json}
              emitDraw={(geoJson) => this.onMapDraw(geoJson)}
              editingOperation={this.state.editingOperation}
            ></Map>
            {this.state.editingOperation && this.state.activeOperation ? (
              <div className='operations__dashboard__map__info'>
                <InfoPanel
                  emitTitleChange={(title: string) =>
                    this.onOperationTitleChange(title)
                  }
                  emitDateChange={(date, type) =>
                    this.onOperationDateChange(date, type)
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
