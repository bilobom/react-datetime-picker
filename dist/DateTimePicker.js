function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeEventProps from 'make-event-props';
import mergeClassNames from 'merge-class-names';
import Calendar from 'react-calendar';
import Fit from 'react-fit';
import Clock from 'react-clock';
import DateTimeInput from './DateTimeInput';
import { isMaxDate, isMinDate } from './shared/propTypes';
const allViews = ['hour', 'minute', 'second'];
const baseClassName = 'react-datetime-picker';
const outsideActionEvents = ['mousedown', 'focusin', 'touchstart'];
export default class DateTimePicker extends PureComponent {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {});

    _defineProperty(this, "onOutsideAction", event => {
      if (this.wrapper && !this.wrapper.contains(event.target)) {
        this.closeWidgets();
      }
    });

    _defineProperty(this, "onDateChange", (value, closeWidgets) => {
      const {
        value: prevValue
      } = this.props;

      if (prevValue) {
        const valueWithHour = new Date(value);
        valueWithHour.setHours(prevValue.getHours(), prevValue.getMinutes(), prevValue.getSeconds(), prevValue.getMilliseconds());
        this.onChange(valueWithHour, closeWidgets);
      } else {
        this.onChange(value, closeWidgets);
      }
    });

    _defineProperty(this, "onChange", (value, closeWidgets = this.props.closeWidgets) => {
      const {
        onChange
      } = this.props;

      if (closeWidgets) {
        this.closeWidgets();
      }

      if (onChange) {
        onChange(value);
      }
    });

    _defineProperty(this, "onFocus", event => {
      const {
        disabled,
        onFocus
      } = this.props;

      if (onFocus) {
        onFocus(event);
      } // Internet Explorer still fires onFocus on disabled elements


      if (disabled) {
        return;
      }

      switch (event.target.name) {
        case 'day':
        case 'month':
        case 'year':
          this.openCalendar();
          break;

        case 'hour12':
        case 'hour24':
        case 'minute':
        case 'second':
          this.openClock();
          break;

        default:
      }
    });

    _defineProperty(this, "openClock", () => {
      this.setState({
        isCalendarOpen: false,
        isClockOpen: true
      });
    });

    _defineProperty(this, "openCalendar", () => {
      this.setState({
        isCalendarOpen: true,
        isClockOpen: false
      });
    });

    _defineProperty(this, "toggleCalendar", () => {
      this.setState(prevState => ({
        isCalendarOpen: !prevState.isCalendarOpen,
        isClockOpen: false
      }));
    });

    _defineProperty(this, "closeWidgets", () => {
      this.setState(prevState => {
        if (!prevState.isCalendarOpen && !prevState.isClockOpen) {
          return null;
        }

        return {
          isCalendarOpen: false,
          isClockOpen: false
        };
      });
    });

    _defineProperty(this, "stopPropagation", event => event.stopPropagation());

    _defineProperty(this, "clear", () => this.onChange(null));
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = {};

    if (nextProps.isCalendarOpen !== prevState.isCalendarOpenProps) {
      nextState.isCalendarOpen = nextProps.isCalendarOpen;
      nextState.isCalendarOpenProps = nextProps.isCalendarOpen;
    }

    if (nextProps.isClockOpen !== prevState.isClockOpenProps) {
      nextState.isClockOpen = nextProps.isClockOpen;
      nextState.isClockOpenProps = nextProps.isClockOpen;
    }

    return nextState;
  }

  componentDidMount() {
    this.handleOutsideActionListeners();
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      isCalendarOpen,
      isClockOpen
    } = this.state;
    const {
      onCalendarClose,
      onCalendarOpen,
      onClockClose,
      onClockOpen
    } = this.props;
    const isWidgetOpen = isCalendarOpen || isClockOpen;
    const prevIsWidgetOpen = prevState.isCalendarOpen || prevState.isClockOpen;

    if (isWidgetOpen !== prevIsWidgetOpen) {
      this.handleOutsideActionListeners();
    }

    if (isCalendarOpen !== prevState.isCalendarOpen) {
      const callback = isCalendarOpen ? onCalendarOpen : onCalendarClose;
      if (callback) callback();
    }

    if (isClockOpen !== prevState.isClockOpen) {
      const callback = isClockOpen ? onClockOpen : onClockClose;
      if (callback) callback();
    }
  }

  componentWillUnmount() {
    this.handleOutsideActionListeners(false);
  }

  get eventProps() {
    return makeEventProps(this.props);
  }

  handleOutsideActionListeners(shouldListen) {
    const {
      isCalendarOpen,
      isClockOpen
    } = this.state;
    const isWidgetOpen = isCalendarOpen || isClockOpen;
    const shouldListenWithFallback = typeof shouldListen !== 'undefined' ? shouldListen : isWidgetOpen;
    const fnName = shouldListenWithFallback ? 'addEventListener' : 'removeEventListener';
    outsideActionEvents.forEach(eventName => document[fnName](eventName, this.onOutsideAction));
  }

  renderInputs() {
    const {
      amPmAriaLabel,
      autoFocus,
      calendarAriaLabel,
      calendarIcon,
      clearAriaLabel,
      clearIcon,
      dayAriaLabel,
      dayPlaceholder,
      disableCalendar,
      disabled,
      format,
      hourAriaLabel,
      hourPlaceholder,
      locale,
      maxDate,
      maxDetail,
      minDate,
      minuteAriaLabel,
      minutePlaceholder,
      monthAriaLabel,
      monthPlaceholder,
      name,
      nativeInputAriaLabel,
      required,
      secondAriaLabel,
      secondPlaceholder,
      showLeadingZeros,
      value,
      yearAriaLabel,
      yearPlaceholder
    } = this.props;
    const {
      isCalendarOpen,
      isClockOpen
    } = this.state;
    const [valueFrom] = [].concat(value);
    const ariaLabelProps = {
      amPmAriaLabel,
      dayAriaLabel,
      hourAriaLabel,
      minuteAriaLabel,
      monthAriaLabel,
      nativeInputAriaLabel,
      secondAriaLabel,
      yearAriaLabel
    };
    const placeholderProps = {
      dayPlaceholder,
      hourPlaceholder,
      minutePlaceholder,
      monthPlaceholder,
      secondPlaceholder,
      yearPlaceholder
    };
    return /*#__PURE__*/React.createElement("div", {
      className: `${baseClassName}__wrapper`
    }, /*#__PURE__*/React.createElement(DateTimeInput, _extends({}, ariaLabelProps, placeholderProps, {
      autoFocus: autoFocus,
      className: `${baseClassName}__inputGroup`,
      disabled: disabled,
      format: format,
      isWidgetOpen: isCalendarOpen || isClockOpen,
      locale: locale,
      maxDate: maxDate,
      maxDetail: maxDetail,
      minDate: minDate,
      name: name,
      onChange: this.onChange,
      placeholder: this.placeholder,
      required: required,
      showLeadingZeros: showLeadingZeros,
      value: valueFrom
    })), clearIcon !== null && /*#__PURE__*/React.createElement("button", {
      "aria-label": clearAriaLabel,
      className: `${baseClassName}__clear-button ${baseClassName}__button`,
      disabled: disabled,
      onClick: this.clear,
      onFocus: this.stopPropagation,
      type: "button"
    }, clearIcon), calendarIcon !== null && !disableCalendar && /*#__PURE__*/React.createElement("button", {
      "aria-label": calendarAriaLabel,
      className: `${baseClassName}__calendar-button ${baseClassName}__button`,
      disabled: disabled,
      onBlur: this.resetValue,
      onClick: this.toggleCalendar,
      onFocus: this.stopPropagation,
      type: "button"
    }, calendarIcon));
  }

  renderCalendar() {
    const {
      disableCalendar
    } = this.props;
    const {
      isCalendarOpen
    } = this.state;

    if (isCalendarOpen === null || disableCalendar) {
      return null;
    }

    const {
      calendarClassName,
      className: dateTimePickerClassName,
      // Unused, here to exclude it from calendarProps
      maxDetail: dateTimePickerMaxDetail,
      // Unused, here to exclude it from calendarProps
      onChange,
      value,
      ...calendarProps
    } = this.props;
    const className = `${baseClassName}__calendar`;
    return /*#__PURE__*/React.createElement(Fit, null, /*#__PURE__*/React.createElement("div", {
      className: mergeClassNames(className, `${className}--${isCalendarOpen ? 'open' : 'closed'}`)
    }, /*#__PURE__*/React.createElement(Calendar, _extends({
      className: calendarClassName,
      onChange: this.onDateChange,
      value: value || null
    }, calendarProps))));
  }

  renderClock() {
    const {
      disableClock
    } = this.props;
    const {
      isClockOpen
    } = this.state;

    if (isClockOpen === null || disableClock) {
      return null;
    }

    const {
      clockClassName,
      className: dateTimePickerClassName,
      // Unused, here to exclude it from clockProps
      maxDetail,
      onChange,
      value,
      ...clockProps
    } = this.props;
    const className = `${baseClassName}__clock`;
    const [valueFrom] = [].concat(value);
    const maxDetailIndex = allViews.indexOf(maxDetail);
    return /*#__PURE__*/React.createElement(Fit, null, /*#__PURE__*/React.createElement("div", {
      className: mergeClassNames(className, `${className}--${isClockOpen ? 'open' : 'closed'}`)
    }, /*#__PURE__*/React.createElement(Clock, _extends({
      className: clockClassName,
      renderMinuteHand: maxDetailIndex > 0,
      renderSecondHand: maxDetailIndex > 1,
      value: valueFrom
    }, clockProps))));
  }

  render() {
    const {
      className,
      disabled
    } = this.props;
    const {
      isCalendarOpen,
      isClockOpen
    } = this.state;
    return /*#__PURE__*/React.createElement("div", _extends({
      className: mergeClassNames(baseClassName, `${baseClassName}--${isCalendarOpen || isClockOpen ? 'open' : 'closed'}`, `${baseClassName}--${disabled ? 'disabled' : 'enabled'}`, className)
    }, this.eventProps, {
      onFocus: this.onFocus,
      ref: ref => {
        if (!ref) {
          return;
        }

        this.wrapper = ref;
      }
    }), this.renderInputs(), this.renderCalendar(), this.renderClock());
  }

}
const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 19,
  height: 19,
  viewBox: '0 0 19 19',
  stroke: 'black',
  strokeWidth: 2
};
const CalendarIcon = /*#__PURE__*/React.createElement("svg", _extends({}, iconProps, {
  className: `${baseClassName}__calendar-button__icon ${baseClassName}__button__icon`
}), /*#__PURE__*/React.createElement("rect", {
  fill: "none",
  height: "15",
  width: "15",
  x: "2",
  y: "2"
}), /*#__PURE__*/React.createElement("line", {
  x1: "6",
  x2: "6",
  y1: "0",
  y2: "4"
}), /*#__PURE__*/React.createElement("line", {
  x1: "13",
  x2: "13",
  y1: "0",
  y2: "4"
}));
const ClearIcon = /*#__PURE__*/React.createElement("svg", _extends({}, iconProps, {
  className: `${baseClassName}__clear-button__icon ${baseClassName}__button__icon`
}), /*#__PURE__*/React.createElement("line", {
  x1: "4",
  x2: "15",
  y1: "4",
  y2: "15"
}), /*#__PURE__*/React.createElement("line", {
  x1: "15",
  x2: "4",
  y1: "4",
  y2: "15"
}));
DateTimePicker.defaultProps = {
  calendarIcon: CalendarIcon,
  clearIcon: ClearIcon,
  closeWidgets: true,
  isCalendarOpen: null,
  isClockOpen: null,
  maxDetail: 'minute'
};
const isValue = PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]);
DateTimePicker.propTypes = {
  amPmAriaLabel: PropTypes.string,
  autoFocus: PropTypes.bool,
  calendarAriaLabel: PropTypes.string,
  calendarClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  calendarIcon: PropTypes.node,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  clearAriaLabel: PropTypes.string,
  clearIcon: PropTypes.node,
  clockClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  closeWidgets: PropTypes.bool,
  dayAriaLabel: PropTypes.string,
  dayPlaceholder: PropTypes.string,
  disableCalendar: PropTypes.bool,
  disableClock: PropTypes.bool,
  disabled: PropTypes.bool,
  format: PropTypes.string,
  hourAriaLabel: PropTypes.string,
  hourPlaceholder: PropTypes.string,
  isCalendarOpen: PropTypes.bool,
  isClockOpen: PropTypes.bool,
  locale: PropTypes.string,
  maxDate: isMaxDate,
  maxDetail: PropTypes.oneOf(allViews),
  minDate: isMinDate,
  minuteAriaLabel: PropTypes.string,
  minutePlaceholder: PropTypes.string,
  monthAriaLabel: PropTypes.string,
  monthPlaceholder: PropTypes.string,
  name: PropTypes.string,
  nativeInputAriaLabel: PropTypes.string,
  onCalendarClose: PropTypes.func,
  onCalendarOpen: PropTypes.func,
  onChange: PropTypes.func,
  onClockClose: PropTypes.func,
  onClockOpen: PropTypes.func,
  onFocus: PropTypes.func,
  required: PropTypes.bool,
  secondAriaLabel: PropTypes.string,
  secondPlaceholder: PropTypes.string,
  showLeadingZeros: PropTypes.bool,
  value: PropTypes.oneOfType([isValue, PropTypes.arrayOf(isValue)]),
  yearAriaLabel: PropTypes.string,
  yearPlaceholder: PropTypes.string
};