const extend = require('extend');
const error = require('../error.json');

module.exports = (targetCode, additionMessage) => extend(true, {
  additionMessage
}, error[targetCode]);
