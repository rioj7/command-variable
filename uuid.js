/**
 * UUID.js - RFC-compliant UUID Generator for JavaScript - Stripped
 * @author  LiosK
 * @version v4.2.8
 * @license Apache License 2.0: Copyright (c) 2010-2021 LiosK
 */

var UUID;
UUID = (function() {
"use strict";

UUID._getRandomInt = function(x) {
  if (x < 0 || x > 53) { return NaN; }
  var n = 0 | Math.random() * 0x40000000; // 1 << 30
  return x > 30 ? n + (0 | Math.random() * (1 << x - 30)) * 0x40000000 : n >>> 30 - x;
};

UUID._hexAligner = function(num, length) {
  var str = num.toString(16), i = length - str.length, z = "0";
  for (; i > 0; i >>>= 1, z += z) { if (i & 1) { str = z + str; } }
  return str;
};

UUID.FIELD_NAMES = ["timeLow", "timeMid", "timeHiAndVersion", "clockSeqHiAndReserved", "clockSeqLow", "node"];
UUID.FIELD_SIZES = [32, 16, 16, 8, 8, 48];

UUID.genV4 = function() {
  var rand = UUID._getRandomInt;
  return new UUID()._init(rand(32), rand(16),
                          0x4000 | rand(12),
                          0x80   | rand(6),
                          rand(8), rand(48));
};

UUID.prototype._init = function() {
  var names = UUID.FIELD_NAMES, sizes = UUID.FIELD_SIZES;
  var bin = UUID._binAligner, hex = UUID._hexAligner;

  this.intFields = new Array(6);
  this.bitFields = new Array(6);
  this.hexFields = new Array(6);

  for (var i = 0; i < 6; i++) {
    var intValue = parseInt(arguments[i] || 0);
    this.intFields[i] = this.intFields[names[i]] = intValue;
    this.bitFields[i] = this.bitFields[names[i]] = bin(intValue, sizes[i]);
    this.hexFields[i] = this.hexFields[names[i]] = hex(intValue, sizes[i] >>> 2);
  }
  // @ts-ignore
  this.version = (this.intFields.timeHiAndVersion >>> 12) & 0xF;
  this.bitString = this.bitFields.join("");
  this.hexNoDelim = this.hexFields.join("");
  this.hexString = this.hexFields[0] + "-" + this.hexFields[1] + "-" + this.hexFields[2]
                 + "-" + this.hexFields[3] + this.hexFields[4] + "-" + this.hexFields[5];
  this.urn = "urn:uuid:" + this.hexString;
  return this;
};

UUID._binAligner = function(num, length) {
  var str = num.toString(2), i = length - str.length, z = "0";
  for (; i > 0; i >>>= 1, z += z) { if (i & 1) { str = z + str; } }
  return str;
};

UUID.prototype.toString = function() { return this.hexString; };

UUID.NIL = new UUID()._init(0, 0, 0, 0, 0, 0);

function UUID() {}

// for nodejs
if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = UUID;
}

return UUID;

})();
