import React from "react"
import "./info-panel.scss"
import { Operation } from "../../interfaces/operations"

interface InfoPanelProps {
  defaultTitle: string
  emitTitleChange: Function
  operation: Operation
}

interface InfoPanelState {
  localOperation: Operation
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
      localOperation: this.props.operation,
      title: this.props.defaultTitle,
      editing: true,
    }
    this.titleInputRef = React.createRef()
  }
  componentWillReceiveProps(newProps: InfoPanelProps) {
    this.setState({ localOperation: newProps.operation })
  }
  onTitleChange(event: any) {
    let updatedOperation = this.state.localOperation
    updatedOperation.title = event.target.value
    this.setState({ localOperation: updatedOperation })
  }
  onTitleBlur() {
    if (this.state.title.length > 0) {
      this.setState({ editing: false })
      this.props.emitTitleChange(this.state.localOperation.title)
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
          autoFocus={
            this.state.localOperation.title === this.props.defaultTitle
          }
          type='text'
          placeholder='Name of operation'
          value={this.state.localOperation.title}
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
          {this.state.localOperation.title}
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
