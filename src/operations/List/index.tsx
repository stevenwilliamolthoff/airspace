import React from "react"
import "./list.scss"
import api from "../../api"
import { Operation } from "../../interfaces/operations"

interface ListProps {
  operations: Operation[]
}

export default class List extends React.Component<ListProps, any> {
  constructor(props: ListProps) {
    super(props)
  }

  render() {
    const listItems = this.props.operations.map((operation) => (
      <div key={operation.id} className='list__item'>
        {operation.title}
      </div>
    ))
    return <div className='list'>{listItems}</div>
  }
}
