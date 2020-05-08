import React from "react"
import "./list.scss"

export default class List extends React.Component<any, any> {
  operations = [
    {
      id: 1,
      title: "Operation 1",
    },
    {
      id: 2,
      title: "Operation 2",
    },
    {
      id: 3,
      title: "Operation 1",
    },
    {
      id: 4,
      title: "Operation 2",
    },
  ]
  render() {
    const listItems = this.operations.map((operation) => (
      <div key={operation.id} className='list__item'>
        {operation.title}
      </div>
    ))
    return <div className='list'>{listItems}</div>
  }
}
