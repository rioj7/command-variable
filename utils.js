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

let showErrMsg = true;
function setShowErrMsg(b) { showErrMsg = b; }
function getShowErrMsg() { return showErrMsg; }
function getProperty(obj, prop, deflt) { return obj.hasOwnProperty(prop) ? obj[prop] : deflt; }
function getDefaultProperty(obj, deflt) { return getProperty(obj, 'default', deflt); }
function errorMessage(msg, noObject) {
  if (getShowErrMsg()) { vscode.window.showErrorMessage(msg); }
  return noObject ? noObject : "Unknown";}
function fileNotInFolderError(noObject) { return errorMessage('File not in Multi-root Workspace', noObject); }
function isString(obj) { return typeof obj === 'string';}
function isArray(obj) { return Array.isArray(obj);}
function isObject(obj) { return (typeof obj === 'object') && !isArray(obj);}
function range(size, startAt = 0) { return [...Array(size).keys()].map(i => i + startAt); }  // https://stackoverflow.com/a/10050831/9938317
function dblQuest(value, deflt) { return value !== undefined ? value : deflt; }
function nUp(i) { return i===0 ? '' : i.toString()+'Up'; }

module.exports = {
  getProperty, getDefaultProperty, errorMessage, setShowErrMsg, fileNotInFolderError, isString, isArray, isObject, range, dblQuest, nUp, utf8_to_str
}
