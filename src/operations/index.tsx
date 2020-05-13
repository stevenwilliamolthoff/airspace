import React from "react"
import Map from "../map"
import "./operations.scss"
import List from "./List"
import InfoPanel from "./InfoPanel"
import api from "../api"
import { Operation } from "../interfaces/operations"
import moment from "moment"

interface OperationsState {
  operations: Operation[]
  inEditMode: boolean
  activeOperationId: number | null
  activeOperation: Operation | null
}

export default class Operations extends React.Component<any, OperationsState> {
  newOperationDefaultTitle = "Untitled Operation"

  constructor(props: any) {
    super(props)
    this.state = {
      operations: [],
      inEditMode: false,
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
      this.pushOperation(newOperation)
      this.setState({
        activeOperationId: newOperation.id,
        activeOperation: newOperation,
        inEditMode: true,
      })
    } catch (error) {
      console.error("Failed to put new operation.")
    }
  }

  pushOperation(operation: Operation) {
    let operations = this.state.operations
    operations = [operation].concat(operations)
    this.setState({ operations })
  }

  onOperationTitleChange(title: string) {
    if (!this.state.activeOperation) {
      return
    }
    let updatedOperation = this.state.activeOperation
    updatedOperation.title = title
    this.updateOperation(updatedOperation)
  }

  onOperationDateChange(date: Date, type: "start_at" | "end_at") {
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
      this.updateOperationsList(updatedActiveOperation)
    } catch (error) {
      console.error("Failed to update title")
    }
  }

  updateOperationsList(updatedActiveOperation: Operation) {
    let updatedOperations = this.state.operations.map((operation) => {
      if (operation.id === this.state.activeOperationId) {
        return updatedActiveOperation
      }
      return operation
    })
    updatedOperations = this.getSortedOperations(updatedOperations)
    this.setState({ operations: updatedOperations })
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

  async fetchOperation(operationId: number) {
    try {
      const { operation } = await api.getOperation(operationId)
      this.setState({
        activeOperationId: operationId,
        activeOperation: operation,
        inEditMode: true,
      })
    } catch (error) {
      console.error("Failed to get operation")
    }
  }

  getList(): JSX.Element {
    return (
      <List
        activeOperationId={this.state.activeOperationId}
        emitListItemClick={(operationId: number) =>
          this.fetchOperation(operationId)
        }
        operations={this.state.operations}
      ></List>
    )
  }

  getMap(): JSX.Element {
    return (
      <div className='operations__dashboard__map'>
        <Map
          operation={this.state.activeOperation}
          geoJson={this.state.activeOperation?.geo_json}
          emitDraw={(geoJson) => this.onMapDraw(geoJson)}
          inEditMode={this.state.inEditMode}
        ></Map>
        {this.getInfoPanel()}
      </div>
    )
  }

  getInfoPanel(): JSX.Element | null {
    if (!this.state.inEditMode || !this.state.activeOperation) {
      return null
    }
    return (
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
    )
  }

  render() {
    return (
      <div className='operations'>
        <div className='operations__list'>{this.getList()}</div>
        <div className='operations__dashboard'>
          <div className='operations__dashboard__toolbar'>
            <div className='operations__dashboard__toolbar__search'>
              OPERATIONS
            </div>
            <div
              className='operations__dashboard__toolbar__new-operation-button'
              onClick={() => this.onNewOperationButtonClick()}
            >
              + New Operation
            </div>
          </div>
          {this.getMap()}
        </div>
      </div>
    )
  }
}
