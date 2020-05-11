import React from "react"
import "./message.scss"

interface MessageProps {
  intersectionArea: number | null
}

export default class Message extends React.Component<MessageProps, any> {
  getAreaMessage() {
    if (this.props.intersectionArea === 0) {
      return null
    }
    const roundedArea = Number(this.props.intersectionArea).toFixed(2)
    return (
      <div className='message__subtitle'>
        Area in controlled airspace: <b>{roundedArea} mi&sup2;</b>
      </div>
    )
  }
  render() {
    if (this.props.intersectionArea === null) {
      return null
    } else {
      const approved = this.props.intersectionArea === 0
      const messageClasses = [
        "message",
        approved ? "message--approved" : "message--denied",
      ].join(" ")
      return (
        <div className={messageClasses}>
          <div className='message__title'>{`Flight will be ${
            approved ? "approved" : "denied"
          }`}</div>
          {this.getAreaMessage()}
        </div>
      )
    }
  }
}
