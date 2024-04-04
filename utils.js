const vscode = require('vscode');

function utf8_to_str (src, off, lim) {  // https://github.com/quicbit-js/qb-utf8-to-str-tiny
  lim = lim == null ? src.length : lim;
  for (var i = off || 0, s = ''; i < lim; i++) {
    var h = src[i].toString(16);
    if (h.length < 2) h = '0' + h;
    s += '%' + h;
  }
  return decodeURIComponent(s);
}

function str_to_utf8_array(str) {  // https://gist.github.com/lihnux/2aa4a6f5a9170974f6aa
  let utf8 = [];
  for (let i = 0; i < str.length; ++i) {
      let charcode = str.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
                    0x80 | (charcode & 0x3f));
      }
      else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
                    0x80 | ((charcode>>6) & 0x3f),
                    0x80 | (charcode & 0x3f));
      }
      else { // surrogate pair
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10) | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
                    0x80 | ((charcode>>12) & 0x3f),
                    0x80 | ((charcode>>6) & 0x3f),
                    0x80 | (charcode & 0x3f));
      }
  }
  return utf8;
}

let showErrMsg = true;
function setShowErrMsg(b) { showErrMsg = b; }
function getShowErrMsg() { return showErrMsg; }
function getProperty(obj, prop, deflt) { return obj.hasOwnProperty(prop) ? obj[prop] : deflt; }
function getDefaultProperty(obj, deflt) { return getProperty(obj, 'default', deflt); }
function errorMessage(msg, noObject) {
  if (getShowErrMsg()) { vscode.window.showErrorMessage(msg); }
  return noObject ? noObject : "Unknown";}
function fileNotInFolderError(noObject) { return errorMessage('File not in Multi-root Workspace', noObject); }
/** @param {any} obj @returns {obj is string} */
function isString(obj) { return typeof obj === 'string';}
/** @param {any} obj @returns {obj is any[]} */
function isArray(obj) { return Array.isArray(obj);}
function isObject(obj) { return (typeof obj === 'object') && !isArray(obj);}
function range(size, startAt = 0) { return [...Array(size).keys()].map(i => i + startAt); }  // https://stackoverflow.com/a/10050831/9938317
function dblQuest(value, deflt) { return value !== undefined ? value : deflt; }
function nUp(i) { return i===0 ? '' : i.toString()+'Up'; }

module.exports = {
  getProperty, getDefaultProperty, errorMessage, setShowErrMsg, fileNotInFolderError, isString, isArray, isObject, range, dblQuest, nUp, utf8_to_str, str_to_utf8_array
}
