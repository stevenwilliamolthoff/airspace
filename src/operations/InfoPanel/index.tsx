import React from "react"
import "./info-panel.scss"
import { Operation } from "../../interfaces/operations"

interface InfoPanelProps {
  defaultTitle: string
  emitTitleChange: Function
  operation: Operation
}

interface InfoPanelState {
  title: string
  editing: boolean
}

export default class InfoPanel extends React.Component<
  InfoPanelProps,
  InfoPanelState
> {
  titleInputRef: any
  constructor(props: InfoPanelProps) {
    super(props)
    this.state = {
      title: this.props.operation.title,
      editing: true,
    }
    this.titleInputRef = React.createRef()
  }
  componentDidUpdate(prevProps: InfoPanelProps) {
    console.log(this.props.operation.id)
    if (prevProps.operation.id !== this.props.operation.id) {
      this.setState({ title: this.props.operation.title })
    }
  }
  onTitleChange(event: any) {
    this.setState({ title: event.target.value })
  }
  onTitleBlur() {
    if (this.state.title.length > 0) {
      this.setState({ editing: false })
      this.props.emitTitleChange(this.state.title)
    } else {
      if (this.titleInputRef !== null) {
        this.titleInputRef.current.focus()
      }
    }
  }
  onTitleClick() {
    this.setState({ editing: true })
  }
  getTitleElement() {
    if (this.state.editing) {
      return (
        <input
          className='info-panel__title-container__input'
          ref={this.titleInputRef}
          type='text'
          placeholder='Name of operation'
          value={this.state.title}
          onChange={(event) => this.onTitleChange(event)}
          onBlur={() => this.onTitleBlur()}
        ></input>
      )
    } else {
      return (
        <div
          className='info-panel__title-container__title'
          onClick={() => this.onTitleClick()}
        >
          {this.state.title}
        </div>
      )
    }
  }
  render() {
    return (
      <div className='info-panel'>
        <div className='info-panel__title-container'>
          {this.getTitleElement()}
        </div>
      </div>
    )
  }
}
