import React from "react"
import "./list.scss"
import { Operation } from "../../interfaces/operations"

interface ListProps {
  operations: Operation[]
  emitListItemClick: Function
}

interface ListState {
  activeOperationId: number | null
}

export default class List extends React.Component<ListProps, ListState> {
  constructor(props: ListProps) {
    super(props)
    this.state = {
      activeOperationId: null,
    }
  }

  onListItemClick(operationId: number) {
    this.props.emitListItemClick(operationId)
    this.setState({ activeOperationId: operationId })
  }

  render() {
    if (this.props.operations.length === 0) {
      return <div className='list list--empty'>No operations</div>
    }
    const listItems = this.props.operations.map((operation) => (
      <div
        key={operation.id}
        className={[
          "list__item",
          operation.id === this.state.activeOperationId
            ? "list__item--active"
            : null,
        ].join(" ")}
        onClick={() => this.onListItemClick(operation.id)}
      >
        {operation.title}
      </div>
    ))
    return <div className='list'>{listItems}</div>
  }
}
