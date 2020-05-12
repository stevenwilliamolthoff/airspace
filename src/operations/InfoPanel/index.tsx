import React from "react"
import "./info-panel.scss"
import { Operation } from "../../interfaces/operations"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import moment from "moment"
import TimerIcon from "@material-ui/icons/Timer"

interface InfoPanelProps {
  defaultTitle: string
  emitTitleChange: (title: string) => void
  emitDateChange: (date: Date, type: "start_at" | "end_at") => void
  operation: Operation
}

interface InfoPanelState {
  title: string
  startAt: Date
  endAt: Date
  editing: boolean
  showDatePickerModal: boolean
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
      startAt: new Date(this.props.operation.start_at),
      endAt: new Date(this.props.operation.end_at),
      editing: true,
      showDatePickerModal: false,
    }
    this.titleInputRef = React.createRef()
  }
  componentDidUpdate(prevProps: InfoPanelProps) {
    if (prevProps.operation.id !== this.props.operation.id) {
      this.setState({
        title: this.props.operation.title,
        startAt: new Date(this.props.operation.start_at),
        endAt: new Date(this.props.operation.end_at),
      })
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
      this.setState({ title: this.props.defaultTitle })
      this.props.emitTitleChange(this.props.defaultTitle)
    }
  }
  onTitleClick() {
    this.setState({ editing: true })
  }
  onDateChange(date: Date | null, type: "start_at" | "end_at") {
    if (!date) {
      return
    }
    if (type === "start_at") {
      this.setState({ startAt: date })
    }
    if (type === "end_at") {
      this.setState({ endAt: date })
    }
    this.props.emitDateChange(date, type)
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
          autoFocus
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
  getDatePickerModal() {
    if (this.state.showDatePickerModal) {
      return (
        <div className='info-panel__date-picker-modal'>
          <div className='info-panel__date-picker-modal__menu'>
            <div className='info-panel__date-picker-modal__menu__header'>
              Set Flight Time
            </div>
            <div className='info-panel__date-picker-modal__menu__body'>
              <div className='info-panel__date-picker-modal__menu__body__section'>
                <div className='info-panel__date-picker-modal__menu__body__section__title'>
                  Start Date
                </div>
                <DatePicker
                  className='info-panel__date-picker-modal__date-picker'
                  selected={this.state.startAt}
                  onChange={(date) => this.onDateChange(date, "start_at")}
                  showTimeSelect
                  dateFormat='yyyy-MM-dd hh:mm a'
                  todayButton='Today'
                />
              </div>
              <div className='info-panel__date-picker-modal__menu__body__section'>
                <div className='info-panel__date-picker-modal__menu__body__section__title'>
                  End Date
                </div>
                <DatePicker
                  className='info-panel__date-picker-modal__date-picker'
                  selected={this.state.endAt}
                  onChange={(date) => this.onDateChange(date, "end_at")}
                  showTimeSelect
                  dateFormat='yyyy-MM-dd hh:mm a'
                  todayButton='Today'
                />
              </div>
            </div>
            <div className='info-panel__date-picker-modal__menu__footer'>
              <div
                onClick={() => this.setState({ showDatePickerModal: false })}
                className='info-panel__date-picker-modal__menu__footer__button info-panel__date-picker-modal__menu__footer__confirm-button'
              >
                Ok
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }
  getDates() {
    return (
      <div className='info-panel__dates'>
        <div
          className='info-panel__dates__button'
          onClick={() => this.setState({ showDatePickerModal: true })}
        >
          <div className='info-panel__dates__button__title'>
            <TimerIcon fontSize='small'></TimerIcon>
            <div>Start Time</div>
          </div>
          <div className='info-panel__dates__button__date'>
            {moment(this.state.startAt).format("YYYY-MM-DD hh:mm a")}
          </div>
        </div>
        <div
          className='info-panel__dates__button'
          onClick={() => this.setState({ showDatePickerModal: true })}
        >
          <div className='info-panel__dates__button__title'>
            <TimerIcon fontSize='small'></TimerIcon>
            <div>End Time</div>
          </div>
          <div className='info-panel__dates__button__date'>
            {moment(this.state.endAt).format("YYYY-MM-DD hh:mm a")}
          </div>
        </div>
      </div>
    )
  }
  render() {
    return (
      <div className='info-panel'>
        {this.getDatePickerModal()}
        <div className='info-panel__title-container'>
          {this.getTitleElement()}
        </div>
        {this.getDates()}
      </div>
    )
  }
}
