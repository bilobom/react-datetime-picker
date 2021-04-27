function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { getYear, getMonthHuman, getDate, getHours, getMinutes, getSeconds, getHoursMinutesSeconds } from '@wojtekmaj/date-utils';
import DayInput from 'react-date-picker/dist/DateInput/DayInput';
import MonthInput from 'react-date-picker/dist/DateInput/MonthInput';
import MonthSelect from 'react-date-picker/dist/DateInput/MonthSelect';
import YearInput from 'react-date-picker/dist/DateInput/YearInput';
import Hour12Input from 'react-time-picker/dist/TimeInput/Hour12Input';
import Hour24Input from 'react-time-picker/dist/TimeInput/Hour24Input';
import MinuteInput from 'react-time-picker/dist/TimeInput/MinuteInput';
import SecondInput from 'react-time-picker/dist/TimeInput/SecondInput';
import AmPm from 'react-time-picker/dist/TimeInput/AmPm';
import Divider from './Divider';
import NativeInput from './DateTimeInput/NativeInput';
import { getFormatter, formatDate } from './shared/dateFormatter';
import { convert12to24, convert24to12 } from './shared/dates';
import { isMaxDate, isMinDate } from './shared/propTypes';
import { between, getAmPmLabels, castToString } from './shared/utils';
const defaultMinDate = new Date();
defaultMinDate.setFullYear(1, 0, 1);
defaultMinDate.setHours(0, 0, 0, 0);
const defaultMaxDate = new Date(8.64e15);
const allViews = ['hour', 'minute', 'second'];

function toDate(value) {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
}

function datesAreDifferent(date1, date2) {
  return date1 && !date2 || !date1 && date2 || date1 && date2 && date1.getTime() !== date2.getTime();
}

function isSameDate(date, year, month, day) {
  return year === getYear(date).toString() && month === getMonthHuman(date).toString() && day === getDate(date).toString();
}

function getValue(value, index) {
  if (!value) {
    return null;
  }

  const rawValue = Array.isArray(value) && value.length === 2 ? value[index] : value;

  if (!rawValue) {
    return null;
  }

  const valueDate = toDate(rawValue);

  if (isNaN(valueDate.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return valueDate;
}

function getDetailValue({
  value,
  minDate,
  maxDate
}, index) {
  const valuePiece = getValue(value, index);

  if (!valuePiece) {
    return null;
  }

  return between(valuePiece, minDate, maxDate);
}

const getDetailValueFrom = args => getDetailValue(args, 0);

const getDetailValueTo = args => getDetailValue(args, 1);

function isValidInput(element) {
  return element.tagName === 'INPUT' && element.type === 'number';
}

function findInput(element, property) {
  let nextElement = element;

  do {
    nextElement = nextElement[property];
  } while (nextElement && !isValidInput(nextElement));

  return nextElement;
}

function focus(element) {
  if (element) {
    element.focus();
  }
}

function renderCustomInputs(placeholder, elementFunctions, allowMultipleInstances) {
  const usedFunctions = [];
  const pattern = new RegExp(Object.keys(elementFunctions).map(el => `${el}+`).join('|'), 'g');
  const matches = placeholder.match(pattern);
  return placeholder.split(pattern).reduce((arr, element, index) => {
    const divider = element &&
    /*#__PURE__*/
    // eslint-disable-next-line react/no-array-index-key
    React.createElement(Divider, {
      key: `separator_${index}`
    }, element);
    const res = [...arr, divider];
    const currentMatch = matches && matches[index];

    if (currentMatch) {
      const renderFunction = elementFunctions[currentMatch] || elementFunctions[Object.keys(elementFunctions).find(elementFunction => currentMatch.match(elementFunction))];

      if (!allowMultipleInstances && usedFunctions.includes(renderFunction)) {
        res.push(currentMatch);
      } else {
        res.push(renderFunction(currentMatch, index));
        usedFunctions.push(renderFunction);
      }
    }

    return res;
  }, []);
}

export default class DateTimeInput extends PureComponent {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      amPm: null,
      year: null,
      month: null,
      day: null,
      hour: null,
      minute: null,
      second: null
    });

    _defineProperty(this, "onClick", event => {
      if (event.target === event.currentTarget) {
        // Wrapper was directly clicked
        const firstInput = event.target.children[1];
        focus(firstInput);
      }
    });

    _defineProperty(this, "onKeyDown", event => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case this.dateDivider:
        case this.timeDivider:
          {
            event.preventDefault();
            const {
              target: input
            } = event;
            const property = event.key === 'ArrowLeft' ? 'previousElementSibling' : 'nextElementSibling';
            const nextInput = findInput(input, property);
            focus(nextInput);
            break;
          }

        default:
      }
    });

    _defineProperty(this, "onKeyUp", event => {
      const {
        key,
        target: input
      } = event;
      const isNumberKey = !isNaN(parseInt(key, 10));

      if (!isNumberKey) {
        return;
      }

      const {
        value
      } = input;
      const max = input.getAttribute('max');
      /**
       * Given 1, the smallest possible number the user could type by adding another digit is 10.
       * 10 would be a valid value given max = 12, so we won't jump to the next input.
       * However, given 2, smallers possible number would be 20, and thus keeping the focus in
       * this field doesn't make sense.
       */

      if (value * 10 > max || value.length >= max.length) {
        const property = 'nextElementSibling';
        const nextInput = findInput(input, property);
        focus(nextInput);
      }
    });

    _defineProperty(this, "onChange", event => {
      const {
        name,
        value
      } = event.target;

      switch (name) {
        case 'hour12':
          {
            this.setState(prevState => ({
              hour: value ? convert12to24(parseInt(value, 10), prevState.amPm) : null
            }), this.onChangeExternal);
            break;
          }

        case 'hour24':
          {
            this.setState({
              hour: value ? parseInt(value, 10) : null
            }, this.onChangeExternal);
            break;
          }

        default:
          {
            this.setState({
              [name]: value ? parseInt(value, 10) : null
            }, this.onChangeExternal);
          }
      }
    });

    _defineProperty(this, "onChangeNative", event => {
      const {
        onChange
      } = this.props;
      const {
        value
      } = event.target;

      if (!onChange) {
        return;
      }

      const processedValue = (() => {
        if (!value) {
          return null;
        }

        const [valueDate, valueTime] = value.split('T');
        const [yearString, monthString, dayString] = valueDate.split('-');
        const year = parseInt(yearString, 10);
        const monthIndex = parseInt(monthString, 10) - 1 || 0;
        const day = parseInt(dayString, 10) || 1;
        const [hourString, minuteString, secondString] = valueTime.split(':');
        const hour = parseInt(hourString, 10) || 0;
        const minute = parseInt(minuteString, 10) || 0;
        const second = parseInt(secondString, 10) || 0;
        const proposedValue = new Date();
        proposedValue.setFullYear(year, monthIndex, day);
        proposedValue.setHours(hour, minute, second, 0);
        return proposedValue;
      })();

      onChange(processedValue, false);
    });

    _defineProperty(this, "onChangeAmPm", event => {
      const {
        value
      } = event.target;
      this.setState({
        amPm: value
      }, this.onChangeExternal);
    });

    _defineProperty(this, "onChangeExternal", () => {
      const {
        onChange
      } = this.props;

      if (!onChange) {
        return;
      }

      const formElements = [this.dayInput, this.monthInput, this.yearInput, this.hour12Input, this.hour24Input, this.minuteInput, this.secondInput, this.amPmInput].filter(Boolean);
      const formElementsWithoutSelect = formElements.slice(0, -1);
      const values = {};
      formElements.forEach(formElement => {
        values[formElement.name] = formElement.value;
      });

      if (formElementsWithoutSelect.every(formElement => !formElement.value)) {
        onChange(null, false);
      } else if (formElements.every(formElement => formElement.value && formElement.validity.valid)) {
        const year = parseInt(values.year, 10);
        const monthIndex = parseInt(values.month, 10) - 1 || 0;
        const day = parseInt(values.day || 1, 10);
        const hour = parseInt(values.hour24 || convert12to24(values.hour12, values.amPm) || 0, 10);
        const minute = parseInt(values.minute || 0, 10);
        const second = parseInt(values.second || 0, 10);
        const proposedValue = new Date();
        proposedValue.setFullYear(year, monthIndex, day);
        proposedValue.setHours(hour, minute, second, 0);
        const processedValue = proposedValue;
        onChange(processedValue, false);
      }
    });

    _defineProperty(this, "renderDay", (currentMatch, index) => {
      const {
        autoFocus,
        dayAriaLabel,
        dayPlaceholder,
        showLeadingZeros
      } = this.props;
      const {
        day,
        month,
        year
      } = this.state;

      if (currentMatch && currentMatch.length > 2) {
        throw new Error(`Unsupported token: ${currentMatch}`);
      }

      const showLeadingZerosFromFormat = currentMatch && currentMatch.length === 2;
      return /*#__PURE__*/React.createElement(DayInput, _extends({
        key: "day"
      }, this.commonInputProps, {
        ariaLabel: dayAriaLabel,
        autoFocus: index === 0 && autoFocus,
        month: castToString(month),
        placeholder: dayPlaceholder,
        showLeadingZeros: showLeadingZerosFromFormat || showLeadingZeros,
        value: castToString(day),
        year: castToString(year)
      }));
    });

    _defineProperty(this, "renderMonth", (currentMatch, index) => {
      const {
        autoFocus,
        locale,
        monthAriaLabel,
        monthPlaceholder,
        showLeadingZeros
      } = this.props;
      const {
        month,
        year
      } = this.state;

      if (currentMatch && currentMatch.length > 4) {
        throw new Error(`Unsupported token: ${currentMatch}`);
      }

      if (currentMatch.length > 2) {
        return /*#__PURE__*/React.createElement(MonthSelect, _extends({
          key: "month"
        }, this.commonInputProps, {
          ariaLabel: monthAriaLabel,
          autoFocus: index === 0 && autoFocus,
          locale: locale,
          placeholder: monthPlaceholder,
          short: currentMatch.length === 3,
          value: month,
          year: year
        }));
      }

      const showLeadingZerosFromFormat = currentMatch && currentMatch.length === 2;
      return /*#__PURE__*/React.createElement(MonthInput, _extends({
        key: "month"
      }, this.commonInputProps, {
        ariaLabel: monthAriaLabel,
        autoFocus: index === 0 && autoFocus,
        placeholder: monthPlaceholder,
        showLeadingZeros: showLeadingZerosFromFormat || showLeadingZeros,
        value: castToString(month),
        year: castToString(year)
      }));
    });

    _defineProperty(this, "renderYear", (currentMatch, index) => {
      const {
        autoFocus,
        yearAriaLabel,
        yearPlaceholder
      } = this.props;
      const {
        year
      } = this.state;
      return /*#__PURE__*/React.createElement(YearInput, _extends({
        key: "year"
      }, this.commonInputProps, {
        ariaLabel: yearAriaLabel,
        autoFocus: index === 0 && autoFocus,
        placeholder: yearPlaceholder,
        value: castToString(year),
        valueType: "day"
      }));
    });

    _defineProperty(this, "renderHour", (currentMatch, index) => {
      if (/h/.test(currentMatch)) {
        return this.renderHour12(currentMatch, index);
      }

      return this.renderHour24(currentMatch, index);
    });

    _defineProperty(this, "renderHour12", (currentMatch, index) => {
      const {
        autoFocus,
        hourAriaLabel,
        hourPlaceholder
      } = this.props;
      const {
        amPm,
        hour
      } = this.state;

      if (currentMatch && currentMatch.length > 2) {
        throw new Error(`Unsupported token: ${currentMatch}`);
      }

      const showLeadingZeros = currentMatch && currentMatch.length === 2;
      return /*#__PURE__*/React.createElement(Hour12Input, _extends({
        key: "hour12"
      }, this.commonInputProps, {
        amPm: amPm,
        ariaLabel: hourAriaLabel,
        autoFocus: index === 0 && autoFocus,
        placeholder: hourPlaceholder,
        showLeadingZeros: showLeadingZeros,
        value: castToString(hour)
      }));
    });

    _defineProperty(this, "renderHour24", (currentMatch, index) => {
      const {
        autoFocus,
        hourAriaLabel,
        hourPlaceholder
      } = this.props;
      const {
        hour
      } = this.state;

      if (currentMatch && currentMatch.length > 2) {
        throw new Error(`Unsupported token: ${currentMatch}`);
      }

      const showLeadingZeros = currentMatch && currentMatch.length === 2;
      return /*#__PURE__*/React.createElement(Hour24Input, _extends({
        key: "hour24"
      }, this.commonInputProps, {
        ariaLabel: hourAriaLabel,
        autoFocus: index === 0 && autoFocus,
        placeholder: hourPlaceholder,
        showLeadingZeros: showLeadingZeros,
        value: castToString(hour)
      }));
    });

    _defineProperty(this, "renderMinute", (currentMatch, index) => {
      const {
        autoFocus,
        minuteAriaLabel,
        minutePlaceholder
      } = this.props;
      const {
        hour,
        minute
      } = this.state;

      if (currentMatch && currentMatch.length > 2) {
        throw new Error(`Unsupported token: ${currentMatch}`);
      }

      const showLeadingZeros = currentMatch && currentMatch.length === 2;
      return /*#__PURE__*/React.createElement(MinuteInput, _extends({
        key: "minute"
      }, this.commonInputProps, {
        ariaLabel: minuteAriaLabel,
        autoFocus: index === 0 && autoFocus,
        hour: castToString(hour),
        placeholder: minutePlaceholder,
        showLeadingZeros: showLeadingZeros,
        value: castToString(minute)
      }));
    });

    _defineProperty(this, "renderSecond", (currentMatch, index) => {
      const {
        autoFocus,
        secondAriaLabel,
        secondPlaceholder
      } = this.props;
      const {
        hour,
        minute,
        second
      } = this.state;

      if (currentMatch && currentMatch.length > 2) {
        throw new Error(`Unsupported token: ${currentMatch}`);
      }

      const showLeadingZeros = currentMatch ? currentMatch.length === 2 : true;
      return /*#__PURE__*/React.createElement(SecondInput, _extends({
        key: "second"
      }, this.commonInputProps, {
        ariaLabel: secondAriaLabel,
        autoFocus: index === 0 && autoFocus,
        hour: castToString(hour),
        minute: castToString(minute),
        placeholder: secondPlaceholder,
        showLeadingZeros: showLeadingZeros,
        value: castToString(second)
      }));
    });

    _defineProperty(this, "renderAmPm", (currentMatch, index) => {
      const {
        amPmAriaLabel,
        autoFocus,
        locale
      } = this.props;
      const {
        amPm
      } = this.state;
      return /*#__PURE__*/React.createElement(AmPm, _extends({
        key: "ampm"
      }, this.commonInputProps, {
        ariaLabel: amPmAriaLabel,
        autoFocus: index === 0 && autoFocus,
        locale: locale,
        onChange: this.onChangeAmPm,
        value: amPm
      }));
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      minDate,
      maxDate
    } = nextProps;
    const nextState = {};
    /**
     * If isWidgetOpen flag has changed, we have to update it.
     * It's saved in state purely for use in getDerivedStateFromProps.
     */

    if (nextProps.isWidgetOpen !== prevState.isWidgetOpen) {
      nextState.isWidgetOpen = nextProps.isWidgetOpen;
    }
    /**
     * If the next value is different from the current one  (with an exception of situation in
     * which values provided are limited by minDate and maxDate so that the dates are the same),
     * get a new one.
     */


    const nextValue = getDetailValueFrom({
      value: nextProps.value,
      minDate,
      maxDate
    });
    const values = [nextValue, prevState.value];

    if ( // Toggling calendar visibility resets values
    nextState.isCalendarOpen // Flag was toggled
    || datesAreDifferent(...values.map(value => getDetailValueFrom({
      value,
      minDate,
      maxDate
    }))) || datesAreDifferent(...values.map(value => getDetailValueTo({
      value,
      minDate,
      maxDate
    })))) {
      if (nextValue) {
        [, nextState.amPm] = convert24to12(getHours(nextValue));
        nextState.year = getYear(nextValue).toString();
        nextState.month = getMonthHuman(nextValue).toString();
        nextState.day = getDate(nextValue).toString();
        nextState.hour = getHours(nextValue).toString();
        nextState.minute = getMinutes(nextValue).toString();
        nextState.second = getSeconds(nextValue).toString();
      } else {
        nextState.amPm = null;
        nextState.year = null;
        nextState.month = null;
        nextState.day = null;
        nextState.hour = null;
        nextState.minute = null;
        nextState.second = null;
      }

      nextState.value = nextValue;
    }

    return nextState;
  }

  get formatTime() {
    const {
      maxDetail
    } = this.props;
    const options = {
      hour: 'numeric'
    };
    const level = allViews.indexOf(maxDetail);

    if (level >= 1) {
      options.minute = 'numeric';
    }

    if (level >= 2) {
      options.second = 'numeric';
    }

    return getFormatter(options);
  } // eslint-disable-next-line class-methods-use-this


  get formatNumber() {
    const options = {
      useGrouping: false
    };
    return getFormatter(options);
  }

  get dateDivider() {
    return this.datePlaceholder.match(/[^0-9a-z]/i)[0];
  }

  get timeDivider() {
    return this.timePlaceholder.match(/[^0-9a-z]/i)[0];
  }

  get datePlaceholder() {
    const {
      locale
    } = this.props;
    const year = 2017;
    const monthIndex = 11;
    const day = 11;
    const date = new Date(year, monthIndex, day);
    const formattedDate = formatDate(locale, date);
    const datePieces = ['year', 'month', 'day'];
    const datePieceReplacements = ['y', 'M', 'd'];

    function formatDatePiece(name, dateToFormat) {
      return getFormatter({
        useGrouping: false,
        [name]: 'numeric'
      })(locale, dateToFormat).match(/\d{1,}/);
    }

    let placeholder = formattedDate;
    datePieces.forEach((datePiece, index) => {
      const formattedDatePiece = formatDatePiece(datePiece, date);
      const datePieceReplacement = datePieceReplacements[index];
      placeholder = placeholder.replace(formattedDatePiece, datePieceReplacement);
    });
    return placeholder;
  }

  get timePlaceholder() {
    const {
      locale
    } = this.props;
    const hour24 = 21;
    const hour12 = 9;
    const minute = 13;
    const second = 14;
    const date = new Date(2017, 0, 1, hour24, minute, second);
    return this.formatTime(locale, date).replace(this.formatNumber(locale, hour12), 'h').replace(this.formatNumber(locale, hour24), 'H').replace(this.formatNumber(locale, minute), 'mm').replace(this.formatNumber(locale, second), 'ss').replace(new RegExp(getAmPmLabels(locale).join('|')), 'a');
  }

  get placeholder() {
    const {
      format
    } = this.props;

    if (format) {
      return format;
    }

    return `${this.datePlaceholder}\u00a0${this.timePlaceholder}`;
  }

  get maxTime() {
    const {
      maxDate
    } = this.props;

    if (!maxDate) {
      return null;
    }

    const {
      year,
      month,
      day
    } = this.state;

    if (!isSameDate(maxDate, year, month, day)) {
      return null;
    }

    return getHoursMinutesSeconds(maxDate);
  }

  get minTime() {
    const {
      minDate
    } = this.props;

    if (!minDate) {
      return null;
    }

    const {
      year,
      month,
      day
    } = this.state;

    if (!isSameDate(minDate, year, month, day)) {
      return null;
    }

    return getHoursMinutesSeconds(minDate);
  }

  get commonInputProps() {
    const {
      className,
      disabled,
      isWidgetOpen,
      maxDate,
      minDate,
      required
    } = this.props;
    return {
      className,
      disabled,
      maxDate: maxDate || defaultMaxDate,
      minDate: minDate || defaultMinDate,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
      onKeyUp: this.onKeyUp,
      placeholder: '--',
      // This is only for showing validity when editing
      required: required || isWidgetOpen,
      itemRef: (ref, name) => {
        // Save a reference to each input field
        this[`${name}Input`] = ref;
      }
    };
  }

  get commonTimeInputProps() {
    const {
      maxTime,
      minTime
    } = this;
    return {
      maxTime,
      minTime
    };
  }
  /**
   * Returns value type that can be returned with currently applied settings.
   */


  get valueType() {
    const {
      maxDetail
    } = this.props;
    return maxDetail;
  }

  renderCustomInputs() {
    const {
      placeholder
    } = this;
    const {
      format
    } = this.props;
    const elementFunctions = {
      d: this.renderDay,
      M: this.renderMonth,
      y: this.renderYear,
      h: this.renderHour,
      H: this.renderHour,
      m: this.renderMinute,
      s: this.renderSecond,
      a: this.renderAmPm
    };
    const allowMultipleInstances = typeof format !== 'undefined';
    return renderCustomInputs(placeholder, elementFunctions, allowMultipleInstances);
  }

  renderNativeInput() {
    const {
      disabled,
      maxDate,
      minDate,
      name,
      nativeInputAriaLabel,
      required
    } = this.props;
    const {
      value
    } = this.state;
    return /*#__PURE__*/React.createElement(NativeInput, {
      key: "time",
      ariaLabel: nativeInputAriaLabel,
      disabled: disabled,
      maxDate: maxDate || defaultMaxDate,
      minDate: minDate || defaultMinDate,
      name: name,
      onChange: this.onChangeNative,
      required: required,
      value: value,
      valueType: this.valueType
    });
  }

  render() {
    const {
      className
    } = this.props;
    /* eslint-disable jsx-a11y/click-events-have-key-events */

    /* eslint-disable jsx-a11y/no-static-element-interactions */

    return /*#__PURE__*/React.createElement("div", {
      className: className,
      onClick: this.onClick
    }, this.renderNativeInput(), this.renderCustomInputs());
  }

}
DateTimeInput.defaultProps = {
  maxDetail: 'minute',
  name: 'datetime'
};
const isValue = PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]);
DateTimeInput.propTypes = {
  amPmAriaLabel: PropTypes.string,
  autoFocus: PropTypes.bool,
  className: PropTypes.string.isRequired,
  dayAriaLabel: PropTypes.string,
  dayPlaceholder: PropTypes.string,
  disabled: PropTypes.bool,
  format: PropTypes.string,
  hourAriaLabel: PropTypes.string,
  hourPlaceholder: PropTypes.string,
  isWidgetOpen: PropTypes.bool,
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
  onChange: PropTypes.func,
  required: PropTypes.bool,
  secondAriaLabel: PropTypes.string,
  secondPlaceholder: PropTypes.string,
  showLeadingZeros: PropTypes.bool,
  value: PropTypes.oneOfType([isValue, PropTypes.arrayOf(isValue)]),
  yearAriaLabel: PropTypes.string,
  yearPlaceholder: PropTypes.string
};