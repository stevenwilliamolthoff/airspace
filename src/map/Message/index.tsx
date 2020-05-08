import React from "react"
import "./message.scss"

interface MessageProps {
  flightApproved: boolean | null
}

export default class Message extends React.Component<MessageProps, any> {
  render() {
    if (this.props.flightApproved === null) {
      return null
    } else {
      return (
        <div className='message'>{`Flight will be ${
          this.props.flightApproved ? "approved" : "denied"
        }`}</div>
      )
    }
  }
}
