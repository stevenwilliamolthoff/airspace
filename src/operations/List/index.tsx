import React from "react"
import "./list.scss"
import { Operation } from "../../interfaces/operations"

interface ListProps {
  operations: Operation[]
  emitListItemClick: Function
}

export default class List extends React.Component<ListProps, any> {
  onListItemClick(operationId: number) {
    this.props.emitListItemClick(operationId)
  }

  render() {
    if (this.props.operations.length === 0) {
      return <div className='list list--empty'>No operations</div>
    }
    const listItems = this.props.operations.map((operation) => (
      <div
        key={operation.id}
        className='list__item'
        onClick={() => this.onListItemClick(operation.id)}
      >
        {operation.title}
      </div>
    ))
    return <div className='list'>{listItems}</div>
  }
}
