import React from "react"
import "./list.scss"
import { Operation } from "../../interfaces/operations"
import moment from "moment"

interface ListProps {
  operations: Operation[]
  emitListItemClick: Function
  activeOperationId: number | null
}

interface ListState {
  activeOperationId: number | null
}

export default class List extends React.Component<ListProps, ListState> {
  constructor(props: ListProps) {
    super(props)
    this.state = {
      activeOperationId: this.props.activeOperationId
        ? this.props.activeOperationId
        : null,
    }
  }

  componentDidUpdate(prevProps: ListProps) {
    if (prevProps.activeOperationId !== this.props.activeOperationId) {
      this.setState({ activeOperationId: this.props.activeOperationId })
    }
  }

  onListItemClick(operationId: number) {
    this.props.emitListItemClick(operationId)
    this.setState({ activeOperationId: operationId })
  }

  getFormattedSubtitle(operation: Operation) {
    const format = "DD MMM HH:mm"
    return `${moment(operation.start_at).format(format)} - ${moment(
      operation.end_at
    ).format(format)}`
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
        <div className='list__item__subtitle'>
          {this.getFormattedSubtitle(operation)}
        </div>
      </div>
    ))
    return <div className='list'>{listItems}</div>
  }
}
