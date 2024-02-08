/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

export default function (val, options) {
  options = options || {};
  var type = typeof val;

  if (options.toString) {
    return fmtShort(Number(val));
  } else {
    return parse(val);
  }

  // if (type === 'string' && val.length > 0) {
  //   return parse(val);
  // } else if (type === 'number' && isFinite(val)) {
  //   return options.long ? fmtLong(val) : fmtShort(val);
  // }
  // throw new Error(
  //   'val is not a non-empty string or a valid number. val=' +
  //     JSON.stringify(val)
  // );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'años':
    case 'año':
    case 'a':
      return n * y;
    case 'semanas':
    case 'semana':
      return n * w;
    case 'días' || 'dias':
    case 'día' || 'dia':
    case 'd':
      return n * d;
    case 'horas':
    case 'hora':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutos':
    case 'minuto':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'segundos':
    case 'segundo':
    case 'segs':
    case 'seg':
    case 's':
      return n * s;
    case 'milisegundos':
    case 'milisegundo':
    case 'msegs':
    case 'mseg':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'día');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hora');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minuto');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'segundo');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}
