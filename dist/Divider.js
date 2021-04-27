import React from 'react';
import PropTypes from 'prop-types';
export default function Divider({
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "react-datetime-picker__inputGroup__divider"
  }, children);
}
Divider.propTypes = {
  children: PropTypes.node
};