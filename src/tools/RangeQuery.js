const { isString, isNumber } = require('util');

module.exports = (queryInput, type = 'string') => {
  if (type === 'Date') {
    // Standard equals query
    if (isString(queryInput)) {
      // Validate Date parsing
      try {
        if (moment(queryInput).isValid()) {
          return moment(queryInput).toDate();
        }
      } catch (err) {
        return null;
      }
    } else {
      // Range query
      const rangeQuery = {};
      // Validate Date parsing and assign to RangeQuery
      if (!Number.isNaN(Date.parse(queryInput.eq))) {
        rangeQuery.eq = new Date(queryInput.eq);
      }
      if (!Number.isNaN(Date.parse(queryInput.lt))) {
        rangeQuery.lt = new Date(queryInput.lt);
      }
      if (!Number.isNaN(Date.parse(queryInput.lte))) {
        rangeQuery.lte = new Date(queryInput.lte);
      }
      if (!Number.isNaN(Date.parse(queryInput.gt))) {
        rangeQuery.gt = new Date(queryInput.gt);
      }
      if (!Number.isNaN(Date.parse(queryInput.gte))) {
        rangeQuery.gte = new Date(queryInput.gte);
      }
      if (!Number.isNaN(Date.parse(queryInput.ne))) {
        rangeQuery.ne = new Date(queryInput.ne);
      }
      // No match query input
      if (Object.keys(rangeQuery).length !== 0) {
        return rangeQuery;
      }
    }
  } else if (type === 'string') {
    if (isString(queryInput)) {
      return queryInput;
    }
    // Range query
    const rangeQuery = {};
    // Validate Date parsing and assign to RangeQuery
    if (isString(queryInput.eq)) {
      rangeQuery.eq = queryInput.eq;
    }
    if (isString(queryInput.lt)) {
      rangeQuery.lt = queryInput.lt;
    }
    if (isString(queryInput.lte)) {
      rangeQuery.lte = queryInput.lte;
    }
    if (isString(queryInput.gt)) {
      rangeQuery.gt = queryInput.gt;
    }
    if (isString(queryInput.gte)) {
      rangeQuery.gte = queryInput.gte;
    }
    if (isString(queryInput.me)) {
      rangeQuery.ne = queryInput.ne;
    }
    // No match query input
    if (Object.keys(rangeQuery).length !== 0) {
      return rangeQuery;
    }
  } else if (type === 'number') {
    if (isNumber(queryInput)) {
      return queryInput;
    }
    // Range query
    const rangeQuery = {};
    // Validate Date parsing and assign to RangeQuery
    if (isNumber(queryInput.eq)) {
      rangeQuery.eq = queryInput.eq;
    }
    if (isNumber(queryInput.lt)) {
      rangeQuery.lt = queryInput.lt;
    }
    if (isNumber(queryInput.lte)) {
      rangeQuery.lte = queryInput.lte;
    }
    if (isNumber(queryInput.gt)) {
      rangeQuery.gt = queryInput.gt;
    }
    if (isNumber(queryInput.gte)) {
      rangeQuery.gte = queryInput.gte;
    }
    if (isNumber(queryInput.me)) {
      rangeQuery.ne = queryInput.ne;
    }
    // No match query input
    if (Object.keys(rangeQuery).length !== 0) {
      return rangeQuery;
    }
  }
  // No match type and query input
  return null;
};
