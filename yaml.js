'use strict';
// module: "yaml": "^2.1.3"
Object.defineProperty(exports, '__esModule', { value: true });

var dist = {};

var composer$2 = {};

var directives$2 = {};

var Node$t = {};

const ALIAS = Symbol.for('yaml.alias');
const DOC = Symbol.for('yaml.document');
const MAP = Symbol.for('yaml.map');
const PAIR = Symbol.for('yaml.pair');
const SCALAR$1 = Symbol.for('yaml.scalar');
const SEQ = Symbol.for('yaml.seq');
const NODE_TYPE = Symbol.for('yaml.node.type');
const isAlias$1 = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === ALIAS;
const isDocument$1 = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === DOC;
const isMap$1 = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === MAP;
const isPair$1 = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === PAIR;
const isScalar$2 = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SCALAR$1;
const isSeq$1 = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SEQ;
function isCollection$2(node) {
if (node && typeof node === 'object')
switch (node[NODE_TYPE]) {
case MAP:
case SEQ:
return true;
}
return false;
}
function isNode$1(node) {
if (node && typeof node === 'object')
switch (node[NODE_TYPE]) {
case ALIAS:
case MAP:
case SCALAR$1:
case SEQ:
return true;
}
return false;
}
const hasAnchor = (node) => (isScalar$2(node) || isCollection$2(node)) && !!node.anchor;
class NodeBase {
constructor(type) {
Object.defineProperty(this, NODE_TYPE, { value: type });
}
clone() {
const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
if (this.range)
copy.range = this.range.slice();
return copy;
}
}

Node$t.ALIAS = ALIAS;
Node$t.DOC = DOC;
Node$t.MAP = MAP;
Node$t.NODE_TYPE = NODE_TYPE;
Node$t.NodeBase = NodeBase;
Node$t.PAIR = PAIR;
Node$t.SCALAR = SCALAR$1;
Node$t.SEQ = SEQ;
Node$t.hasAnchor = hasAnchor;
Node$t.isAlias = isAlias$1;
Node$t.isCollection = isCollection$2;
Node$t.isDocument = isDocument$1;
Node$t.isMap = isMap$1;
Node$t.isNode = isNode$1;
Node$t.isPair = isPair$1;
Node$t.isScalar = isScalar$2;
Node$t.isSeq = isSeq$1;

var visit$6 = {};

var Node$s = Node$t;

const BREAK$1 = Symbol('break visit');
const SKIP$1 = Symbol('skip children');
const REMOVE$1 = Symbol('remove node');
function visit$5(node, visitor) {
const visitor_ = initVisitor(visitor);
if (Node$s.isDocument(node)) {
const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
if (cd === REMOVE$1)
node.contents = null;
}
else
visit_(null, node, visitor_, Object.freeze([]));
}
visit$5.BREAK = BREAK$1;
visit$5.SKIP = SKIP$1;
visit$5.REMOVE = REMOVE$1;
function visit_(key, node, visitor, path) {
const ctrl = callVisitor(key, node, visitor, path);
if (Node$s.isNode(ctrl) || Node$s.isPair(ctrl)) {
replaceNode(key, path, ctrl);
return visit_(key, ctrl, visitor, path);
}
if (typeof ctrl !== 'symbol') {
if (Node$s.isCollection(node)) {
path = Object.freeze(path.concat(node));
for (let i = 0; i < node.items.length; ++i) {
const ci = visit_(i, node.items[i], visitor, path);
if (typeof ci === 'number')
i = ci - 1;
else if (ci === BREAK$1)
return BREAK$1;
else if (ci === REMOVE$1) {
node.items.splice(i, 1);
i -= 1;
}
}
}
else if (Node$s.isPair(node)) {
path = Object.freeze(path.concat(node));
const ck = visit_('key', node.key, visitor, path);
if (ck === BREAK$1)
return BREAK$1;
else if (ck === REMOVE$1)
node.key = null;
const cv = visit_('value', node.value, visitor, path);
if (cv === BREAK$1)
return BREAK$1;
else if (cv === REMOVE$1)
node.value = null;
}
}
return ctrl;
}
async function visitAsync$1(node, visitor) {
const visitor_ = initVisitor(visitor);
if (Node$s.isDocument(node)) {
const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
if (cd === REMOVE$1)
node.contents = null;
}
else
await visitAsync_(null, node, visitor_, Object.freeze([]));
}
visitAsync$1.BREAK = BREAK$1;
visitAsync$1.SKIP = SKIP$1;
visitAsync$1.REMOVE = REMOVE$1;
async function visitAsync_(key, node, visitor, path) {
const ctrl = await callVisitor(key, node, visitor, path);
if (Node$s.isNode(ctrl) || Node$s.isPair(ctrl)) {
replaceNode(key, path, ctrl);
return visitAsync_(key, ctrl, visitor, path);
}
if (typeof ctrl !== 'symbol') {
if (Node$s.isCollection(node)) {
path = Object.freeze(path.concat(node));
for (let i = 0; i < node.items.length; ++i) {
const ci = await visitAsync_(i, node.items[i], visitor, path);
if (typeof ci === 'number')
i = ci - 1;
else if (ci === BREAK$1)
return BREAK$1;
else if (ci === REMOVE$1) {
node.items.splice(i, 1);
i -= 1;
}
}
}
else if (Node$s.isPair(node)) {
path = Object.freeze(path.concat(node));
const ck = await visitAsync_('key', node.key, visitor, path);
if (ck === BREAK$1)
return BREAK$1;
else if (ck === REMOVE$1)
node.key = null;
const cv = await visitAsync_('value', node.value, visitor, path);
if (cv === BREAK$1)
return BREAK$1;
else if (cv === REMOVE$1)
node.value = null;
}
}
return ctrl;
}
function initVisitor(visitor) {
if (typeof visitor === 'object' &&
(visitor.Collection || visitor.Node || visitor.Value)) {
return Object.assign({
Alias: visitor.Node,
Map: visitor.Node,
Scalar: visitor.Node,
Seq: visitor.Node
}, visitor.Value && {
Map: visitor.Value,
Scalar: visitor.Value,
Seq: visitor.Value
}, visitor.Collection && {
Map: visitor.Collection,
Seq: visitor.Collection
}, visitor);
}
return visitor;
}
function callVisitor(key, node, visitor, path) {
if (typeof visitor === 'function')
return visitor(key, node, path);
if (Node$s.isMap(node))
return visitor.Map?.(key, node, path);
if (Node$s.isSeq(node))
return visitor.Seq?.(key, node, path);
if (Node$s.isPair(node))
return visitor.Pair?.(key, node, path);
if (Node$s.isScalar(node))
return visitor.Scalar?.(key, node, path);
if (Node$s.isAlias(node))
return visitor.Alias?.(key, node, path);
return undefined;
}
function replaceNode(key, path, node) {
const parent = path[path.length - 1];
if (Node$s.isCollection(parent)) {
parent.items[key] = node;
}
else if (Node$s.isPair(parent)) {
if (key === 'key')
parent.key = node;
else
parent.value = node;
}
else if (Node$s.isDocument(parent)) {
parent.contents = node;
}
else {
const pt = Node$s.isAlias(parent) ? 'alias' : 'scalar';
throw new Error(`Cannot replace node with ${pt} parent`);
}
}

visit$6.visit = visit$5;
visit$6.visitAsync = visitAsync$1;

var Node$r = Node$t;
var visit$4 = visit$6;

const escapeChars = {
'!': '%21',
',': '%2C',
'[': '%5B',
']': '%5D',
'{': '%7B',
'}': '%7D'
};
const escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, ch => escapeChars[ch]);
class Directives {
constructor(yaml, tags) {
this.docStart = null;
this.docEnd = false;
this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
this.tags = Object.assign({}, Directives.defaultTags, tags);
}
clone() {
const copy = new Directives(this.yaml, this.tags);
copy.docStart = this.docStart;
return copy;
}
atDocument() {
const res = new Directives(this.yaml, this.tags);
switch (this.yaml.version) {
case '1.1':
this.atNextDocument = true;
break;
case '1.2':
this.atNextDocument = false;
this.yaml = {
explicit: Directives.defaultYaml.explicit,
version: '1.2'
};
this.tags = Object.assign({}, Directives.defaultTags);
break;
}
return res;
}
add(line, onError) {
if (this.atNextDocument) {
this.yaml = { explicit: Directives.defaultYaml.explicit, version: '1.1' };
this.tags = Object.assign({}, Directives.defaultTags);
this.atNextDocument = false;
}
const parts = line.trim().split(/[ \t]+/);
const name = parts.shift();
switch (name) {
case '%TAG': {
if (parts.length !== 2) {
onError(0, '%TAG directive should contain exactly two parts');
if (parts.length < 2)
return false;
}
const [handle, prefix] = parts;
this.tags[handle] = prefix;
return true;
}
case '%YAML': {
this.yaml.explicit = true;
if (parts.length !== 1) {
onError(0, '%YAML directive should contain exactly one part');
return false;
}
const [version] = parts;
if (version === '1.1' || version === '1.2') {
this.yaml.version = version;
return true;
}
else {
const isValid = /^\d+\.\d+$/.test(version);
onError(6, `Unsupported YAML version ${version}`, isValid);
return false;
}
}
default:
onError(0, `Unknown directive ${name}`, true);
return false;
}
}
tagName(source, onError) {
if (source === '!')
return '!';
if (source[0] !== '!') {
onError(`Not a valid tag: ${source}`);
return null;
}
if (source[1] === '<') {
const verbatim = source.slice(2, -1);
if (verbatim === '!' || verbatim === '!!') {
onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
return null;
}
if (source[source.length - 1] !== '>')
onError('Verbatim tags must end with a >');
return verbatim;
}
const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/);
if (!suffix)
onError(`The ${source} tag has no suffix`);
const prefix = this.tags[handle];
if (prefix)
return prefix + decodeURIComponent(suffix);
if (handle === '!')
return source;
onError(`Could not resolve tag: ${source}`);
return null;
}
tagString(tag) {
for (const [handle, prefix] of Object.entries(this.tags)) {
if (tag.startsWith(prefix))
return handle + escapeTagName(tag.substring(prefix.length));
}
return tag[0] === '!' ? tag : `!<${tag}>`;
}
toString(doc) {
const lines = this.yaml.explicit
? [`%YAML ${this.yaml.version || '1.2'}`]
: [];
const tagEntries = Object.entries(this.tags);
let tagNames;
if (doc && tagEntries.length > 0 && Node$r.isNode(doc.contents)) {
const tags = {};
visit$4.visit(doc.contents, (_key, node) => {
if (Node$r.isNode(node) && node.tag)
tags[node.tag] = true;
});
tagNames = Object.keys(tags);
}
else
tagNames = [];
for (const [handle, prefix] of tagEntries) {
if (handle === '!!' && prefix === 'tag:yaml.org,2002:')
continue;
if (!doc || tagNames.some(tn => tn.startsWith(prefix)))
lines.push(`%TAG ${handle} ${prefix}`);
}
return lines.join('\n');
}
}
Directives.defaultYaml = { explicit: false, version: '1.2' };
Directives.defaultTags = { '!!': 'tag:yaml.org,2002:' };

directives$2.Directives = Directives;

var Document$5 = {};

var Alias$5 = {};

var anchors$3 = {};

var Node$q = Node$t;
var visit$3 = visit$6;

function anchorIsValid(anchor) {
if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
const sa = JSON.stringify(anchor);
const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
throw new Error(msg);
}
return true;
}
function anchorNames(root) {
const anchors = new Set();
visit$3.visit(root, {
Value(_key, node) {
if (node.anchor)
anchors.add(node.anchor);
}
});
return anchors;
}
function findNewAnchor(prefix, exclude) {
for (let i = 1; true; ++i) {
const name = `${prefix}${i}`;
if (!exclude.has(name))
return name;
}
}
function createNodeAnchors(doc, prefix) {
const aliasObjects = [];
const sourceObjects = new Map();
let prevAnchors = null;
return {
onAnchor: (source) => {
aliasObjects.push(source);
if (!prevAnchors)
prevAnchors = anchorNames(doc);
const anchor = findNewAnchor(prefix, prevAnchors);
prevAnchors.add(anchor);
return anchor;
},
setAnchors: () => {
for (const source of aliasObjects) {
const ref = sourceObjects.get(source);
if (typeof ref === 'object' &&
ref.anchor &&
(Node$q.isScalar(ref.node) || Node$q.isCollection(ref.node))) {
ref.node.anchor = ref.anchor;
}
else {
const error = new Error('Failed to resolve repeated object (this should not happen)');
error.source = source;
throw error;
}
}
},
sourceObjects
};
}

anchors$3.anchorIsValid = anchorIsValid;
anchors$3.anchorNames = anchorNames;
anchors$3.createNodeAnchors = createNodeAnchors;
anchors$3.findNewAnchor = findNewAnchor;

var anchors$2 = anchors$3;
var visit$2 = visit$6;
var Node$p = Node$t;

class Alias$4 extends Node$p.NodeBase {
constructor(source) {
super(Node$p.ALIAS);
this.source = source;
Object.defineProperty(this, 'tag', {
set() {
throw new Error('Alias nodes cannot have tags');
}
});
}
resolve(doc) {
let found = undefined;
visit$2.visit(doc, {
Node: (_key, node) => {
if (node === this)
return visit$2.visit.BREAK;
if (node.anchor === this.source)
found = node;
}
});
return found;
}
toJSON(_arg, ctx) {
if (!ctx)
return { source: this.source };
const { anchors, doc, maxAliasCount } = ctx;
const source = this.resolve(doc);
if (!source) {
const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
throw new ReferenceError(msg);
}
const data = anchors.get(source);
if (!data || data.res === undefined) {
const msg = 'This should not happen: Alias anchor was not resolved?';
throw new ReferenceError(msg);
}
if (maxAliasCount >= 0) {
data.count += 1;
if (data.aliasCount === 0)
data.aliasCount = getAliasCount(doc, source, anchors);
if (data.count * data.aliasCount > maxAliasCount) {
const msg = 'Excessive alias count indicates a resource exhaustion attack';
throw new ReferenceError(msg);
}
}
return data.res;
}
toString(ctx, _onComment, _onChompKeep) {
const src = `*${this.source}`;
if (ctx) {
anchors$2.anchorIsValid(this.source);
if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
throw new Error(msg);
}
if (ctx.implicitKey)
return `${src} `;
}
return src;
}
}
function getAliasCount(doc, node, anchors) {
if (Node$p.isAlias(node)) {
const source = node.resolve(doc);
const anchor = anchors && source && anchors.get(source);
return anchor ? anchor.count * anchor.aliasCount : 0;
}
else if (Node$p.isCollection(node)) {
let count = 0;
for (const item of node.items) {
const c = getAliasCount(doc, item, anchors);
if (c > count)
count = c;
}
return count;
}
else if (Node$p.isPair(node)) {
const kc = getAliasCount(doc, node.key, anchors);
const vc = getAliasCount(doc, node.value, anchors);
return Math.max(kc, vc);
}
return 1;
}

Alias$5.Alias = Alias$4;

var Collection$5 = {};

var createNode$5 = {};

var Scalar$k = {};

var toJS$6 = {};

var Node$o = Node$t;

function toJS$5(value, arg, ctx) {
if (Array.isArray(value))
return value.map((v, i) => toJS$5(v, String(i), ctx));
if (value && typeof value.toJSON === 'function') {
if (!ctx || !Node$o.hasAnchor(value))
return value.toJSON(arg, ctx);
const data = { aliasCount: 0, count: 1, res: undefined };
ctx.anchors.set(value, data);
ctx.onCreate = res => {
data.res = res;
delete ctx.onCreate;
};
const res = value.toJSON(arg, ctx);
if (ctx.onCreate)
ctx.onCreate(res);
return res;
}
if (typeof value === 'bigint' && !ctx?.keep)
return Number(value);
return value;
}

toJS$6.toJS = toJS$5;

var Node$n = Node$t;
var toJS$4 = toJS$6;

const isScalarValue = (value) => !value || (typeof value !== 'function' && typeof value !== 'object');
class Scalar$j extends Node$n.NodeBase {
constructor(value) {
super(Node$n.SCALAR);
this.value = value;
}
toJSON(arg, ctx) {
return ctx?.keep ? this.value : toJS$4.toJS(this.value, arg, ctx);
}
toString() {
return String(this.value);
}
}
Scalar$j.BLOCK_FOLDED = 'BLOCK_FOLDED';
Scalar$j.BLOCK_LITERAL = 'BLOCK_LITERAL';
Scalar$j.PLAIN = 'PLAIN';
Scalar$j.QUOTE_DOUBLE = 'QUOTE_DOUBLE';
Scalar$j.QUOTE_SINGLE = 'QUOTE_SINGLE';

Scalar$k.Scalar = Scalar$j;
Scalar$k.isScalarValue = isScalarValue;

var Alias$3 = Alias$5;
var Node$m = Node$t;
var Scalar$i = Scalar$k;

const defaultTagPrefix = 'tag:yaml.org,2002:';
function findTagObject(value, tagName, tags) {
if (tagName) {
const match = tags.filter(t => t.tag === tagName);
const tagObj = match.find(t => !t.format) ?? match[0];
if (!tagObj)
throw new Error(`Tag ${tagName} not found`);
return tagObj;
}
return tags.find(t => t.identify?.(value) && !t.format);
}
function createNode$4(value, tagName, ctx) {
if (Node$m.isDocument(value))
value = value.contents;
if (Node$m.isNode(value))
return value;
if (Node$m.isPair(value)) {
const map = ctx.schema[Node$m.MAP].createNode?.(ctx.schema, null, ctx);
map.items.push(value);
return map;
}
if (value instanceof String ||
value instanceof Number ||
value instanceof Boolean ||
(typeof BigInt !== 'undefined' && value instanceof BigInt)
) {
value = value.valueOf();
}
const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
let ref = undefined;
if (aliasDuplicateObjects && value && typeof value === 'object') {
ref = sourceObjects.get(value);
if (ref) {
if (!ref.anchor)
ref.anchor = onAnchor(value);
return new Alias$3.Alias(ref.anchor);
}
else {
ref = { anchor: null, node: null };
sourceObjects.set(value, ref);
}
}
if (tagName?.startsWith('!!'))
tagName = defaultTagPrefix + tagName.slice(2);
let tagObj = findTagObject(value, tagName, schema.tags);
if (!tagObj) {
if (value && typeof value.toJSON === 'function') {
value = value.toJSON();
}
if (!value || typeof value !== 'object') {
const node = new Scalar$i.Scalar(value);
if (ref)
ref.node = node;
return node;
}
tagObj =
value instanceof Map
? schema[Node$m.MAP]
: Symbol.iterator in Object(value)
? schema[Node$m.SEQ]
: schema[Node$m.MAP];
}
if (onTagObj) {
onTagObj(tagObj);
delete ctx.onTagObj;
}
const node = tagObj?.createNode
? tagObj.createNode(ctx.schema, value, ctx)
: new Scalar$i.Scalar(value);
if (tagName)
node.tag = tagName;
if (ref)
ref.node = node;
return node;
}

createNode$5.createNode = createNode$4;

var createNode$3 = createNode$5;
var Node$l = Node$t;

function collectionFromPath(schema, path, value) {
let v = value;
for (let i = path.length - 1; i >= 0; --i) {
const k = path[i];
if (typeof k === 'number' && Number.isInteger(k) && k >= 0) {
const a = [];
a[k] = v;
v = a;
}
else {
v = new Map([[k, v]]);
}
}
return createNode$3.createNode(v, undefined, {
aliasDuplicateObjects: false,
keepUndefined: false,
onAnchor: () => {
throw new Error('This should not happen, please report a bug.');
},
schema,
sourceObjects: new Map()
});
}
const isEmptyPath = (path) => path == null ||
(typeof path === 'object' && !!path[Symbol.iterator]().next().done);
class Collection$4 extends Node$l.NodeBase {
constructor(type, schema) {
super(type);
Object.defineProperty(this, 'schema', {
value: schema,
configurable: true,
enumerable: false,
writable: true
});
}
clone(schema) {
const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
if (schema)
copy.schema = schema;
copy.items = copy.items.map(it => Node$l.isNode(it) || Node$l.isPair(it) ? it.clone(schema) : it);
if (this.range)
copy.range = this.range.slice();
return copy;
}
addIn(path, value) {
if (isEmptyPath(path))
this.add(value);
else {
const [key, ...rest] = path;
const node = this.get(key, true);
if (Node$l.isCollection(node))
node.addIn(rest, value);
else if (node === undefined && this.schema)
this.set(key, collectionFromPath(this.schema, rest, value));
else
throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
}
}
deleteIn(path) {
const [key, ...rest] = path;
if (rest.length === 0)
return this.delete(key);
const node = this.get(key, true);
if (Node$l.isCollection(node))
return node.deleteIn(rest);
else
throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
}
getIn(path, keepScalar) {
const [key, ...rest] = path;
const node = this.get(key, true);
if (rest.length === 0)
return !keepScalar && Node$l.isScalar(node) ? node.value : node;
else
return Node$l.isCollection(node) ? node.getIn(rest, keepScalar) : undefined;
}
hasAllNullValues(allowScalar) {
return this.items.every(node => {
if (!Node$l.isPair(node))
return false;
const n = node.value;
return (n == null ||
(allowScalar &&
Node$l.isScalar(n) &&
n.value == null &&
!n.commentBefore &&
!n.comment &&
!n.tag));
});
}
hasIn(path) {
const [key, ...rest] = path;
if (rest.length === 0)
return this.has(key);
const node = this.get(key, true);
return Node$l.isCollection(node) ? node.hasIn(rest) : false;
}
setIn(path, value) {
const [key, ...rest] = path;
if (rest.length === 0) {
this.set(key, value);
}
else {
const node = this.get(key, true);
if (Node$l.isCollection(node))
node.setIn(rest, value);
else if (node === undefined && this.schema)
this.set(key, collectionFromPath(this.schema, rest, value));
else
throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
}
}
}
Collection$4.maxFlowStringSingleLineLength = 60;

Collection$5.Collection = Collection$4;
Collection$5.collectionFromPath = collectionFromPath;
Collection$5.isEmptyPath = isEmptyPath;

var Pair$9 = {};

var stringifyPair$2 = {};

var stringify$9 = {};

var stringifyComment$5 = {};

const stringifyComment$4 = (str) => str.replace(/^(?!$)(?: $)?/gm, '#');
function indentComment(comment, indent) {
if (/^\n+$/.test(comment))
return comment.substring(1);
return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
}
const lineComment = (str, indent, comment) => str.endsWith('\n')
? indentComment(comment, indent)
: comment.includes('\n')
? '\n' + indentComment(comment, indent)
: (str.endsWith(' ') ? '' : ' ') + comment;

stringifyComment$5.indentComment = indentComment;
stringifyComment$5.lineComment = lineComment;
stringifyComment$5.stringifyComment = stringifyComment$4;

var stringifyString$5 = {};

var foldFlowLines$2 = {};

const FOLD_FLOW = 'flow';
const FOLD_BLOCK = 'block';
const FOLD_QUOTED = 'quoted';
function foldFlowLines$1(text, indent, mode = 'flow', { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
if (!lineWidth || lineWidth < 0)
return text;
const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
if (text.length <= endStep)
return text;
const folds = [];
const escapedFolds = {};
let end = lineWidth - indent.length;
if (typeof indentAtStart === 'number') {
if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
folds.push(0);
else
end = lineWidth - indentAtStart;
}
let split = undefined;
let prev = undefined;
let overflow = false;
let i = -1;
let escStart = -1;
let escEnd = -1;
if (mode === FOLD_BLOCK) {
i = consumeMoreIndentedLines(text, i);
if (i !== -1)
end = i + endStep;
}
for (let ch; (ch = text[(i += 1)]);) {
if (mode === FOLD_QUOTED && ch === '\\') {
escStart = i;
switch (text[i + 1]) {
case 'x':
i += 3;
break;
case 'u':
i += 5;
break;
case 'U':
i += 9;
break;
default:
i += 1;
}
escEnd = i;
}
if (ch === '\n') {
if (mode === FOLD_BLOCK)
i = consumeMoreIndentedLines(text, i);
end = i + endStep;
split = undefined;
}
else {
if (ch === ' ' &&
prev &&
prev !== ' ' &&
prev !== '\n' &&
prev !== '\t') {
const next = text[i + 1];
if (next && next !== ' ' && next !== '\n' && next !== '\t')
split = i;
}
if (i >= end) {
if (split) {
folds.push(split);
end = split + endStep;
split = undefined;
}
else if (mode === FOLD_QUOTED) {
while (prev === ' ' || prev === '\t') {
prev = ch;
ch = text[(i += 1)];
overflow = true;
}
const j = i > escEnd + 1 ? i - 2 : escStart - 1;
if (escapedFolds[j])
return text;
folds.push(j);
escapedFolds[j] = true;
end = j + endStep;
split = undefined;
}
else {
overflow = true;
}
}
}
prev = ch;
}
if (overflow && onOverflow)
onOverflow();
if (folds.length === 0)
return text;
if (onFold)
onFold();
let res = text.slice(0, folds[0]);
for (let i = 0; i < folds.length; ++i) {
const fold = folds[i];
const end = folds[i + 1] || text.length;
if (fold === 0)
res = `\n${indent}${text.slice(0, end)}`;
else {
if (mode === FOLD_QUOTED && escapedFolds[fold])
res += `${text[fold]}\\`;
res += `\n${indent}${text.slice(fold + 1, end)}`;
}
}
return res;
}
function consumeMoreIndentedLines(text, i) {
let ch = text[i + 1];
while (ch === ' ' || ch === '\t') {
do {
ch = text[(i += 1)];
} while (ch && ch !== '\n');
ch = text[i + 1];
}
return i;
}

foldFlowLines$2.FOLD_BLOCK = FOLD_BLOCK;
foldFlowLines$2.FOLD_FLOW = FOLD_FLOW;
foldFlowLines$2.FOLD_QUOTED = FOLD_QUOTED;
foldFlowLines$2.foldFlowLines = foldFlowLines$1;

var Scalar$h = Scalar$k;
var foldFlowLines = foldFlowLines$2;

const getFoldOptions = (ctx) => ({
indentAtStart: ctx.indentAtStart,
lineWidth: ctx.options.lineWidth,
minContentWidth: ctx.options.minContentWidth
});
const containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
function lineLengthOverLimit(str, lineWidth, indentLength) {
if (!lineWidth || lineWidth < 0)
return false;
const limit = lineWidth - indentLength;
const strLen = str.length;
if (strLen <= limit)
return false;
for (let i = 0, start = 0; i < strLen; ++i) {
if (str[i] === '\n') {
if (i - start > limit)
return true;
start = i + 1;
if (strLen - start <= limit)
return false;
}
}
return true;
}
function doubleQuotedString(value, ctx) {
const json = JSON.stringify(value);
if (ctx.options.doubleQuotedAsJSON)
return json;
const { implicitKey } = ctx;
const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
let str = '';
let start = 0;
for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
if (ch === ' ' && json[i + 1] === '\\' && json[i + 2] === 'n') {
str += json.slice(start, i) + '\\ ';
i += 1;
start = i;
ch = '\\';
}
if (ch === '\\')
switch (json[i + 1]) {
case 'u':
{
str += json.slice(start, i);
const code = json.substr(i + 2, 4);
switch (code) {
case '0000':
str += '\\0';
break;
case '0007':
str += '\\a';
break;
case '000b':
str += '\\v';
break;
case '001b':
str += '\\e';
break;
case '0085':
str += '\\N';
break;
case '00a0':
str += '\\_';
break;
case '2028':
str += '\\L';
break;
case '2029':
str += '\\P';
break;
default:
if (code.substr(0, 2) === '00')
str += '\\x' + code.substr(2);
else
str += json.substr(i, 6);
}
i += 5;
start = i + 1;
}
break;
case 'n':
if (implicitKey ||
json[i + 2] === '"' ||
json.length < minMultiLineLength) {
i += 1;
}
else {
str += json.slice(start, i) + '\n\n';
while (json[i + 2] === '\\' &&
json[i + 3] === 'n' &&
json[i + 4] !== '"') {
str += '\n';
i += 2;
}
str += indent;
if (json[i + 2] === ' ')
str += '\\';
i += 1;
start = i + 1;
}
break;
default:
i += 1;
}
}
str = start ? str + json.slice(start) : json;
return implicitKey
? str
: foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx));
}
function singleQuotedString(value, ctx) {
if (ctx.options.singleQuote === false ||
(ctx.implicitKey && value.includes('\n')) ||
/[ \t]\n|\n[ \t]/.test(value)
)
return doubleQuotedString(value, ctx);
const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&\n${indent}`) + "'";
return ctx.implicitKey
? res
: foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx));
}
function quotedString(value, ctx) {
const { singleQuote } = ctx.options;
let qs;
if (singleQuote === false)
qs = doubleQuotedString;
else {
const hasDouble = value.includes('"');
const hasSingle = value.includes("'");
if (hasDouble && !hasSingle)
qs = singleQuotedString;
else if (hasSingle && !hasDouble)
qs = doubleQuotedString;
else
qs = singleQuote ? singleQuotedString : doubleQuotedString;
}
return qs(value, ctx);
}
function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
const { blockQuote, commentString, lineWidth } = ctx.options;
if (!blockQuote || /\n[\t ]+$/.test(value) || /^\s*$/.test(value)) {
return quotedString(value, ctx);
}
const indent = ctx.indent ||
(ctx.forceBlockIndent || containsDocumentMarker(value) ? '  ' : '');
const literal = blockQuote === 'literal'
? true
: blockQuote === 'folded' || type === Scalar$h.Scalar.BLOCK_FOLDED
? false
: type === Scalar$h.Scalar.BLOCK_LITERAL
? true
: !lineLengthOverLimit(value, lineWidth, indent.length);
if (!value)
return literal ? '|\n' : '>\n';
let chomp;
let endStart;
for (endStart = value.length; endStart > 0; --endStart) {
const ch = value[endStart - 1];
if (ch !== '\n' && ch !== '\t' && ch !== ' ')
break;
}
let end = value.substring(endStart);
const endNlPos = end.indexOf('\n');
if (endNlPos === -1) {
chomp = '-';
}
else if (value === end || endNlPos !== end.length - 1) {
chomp = '+';
if (onChompKeep)
onChompKeep();
}
else {
chomp = '';
}
if (end) {
value = value.slice(0, -end.length);
if (end[end.length - 1] === '\n')
end = end.slice(0, -1);
end = end.replace(/\n+(?!\n|$)/g, `$&${indent}`);
}
let startWithSpace = false;
let startEnd;
let startNlPos = -1;
for (startEnd = 0; startEnd < value.length; ++startEnd) {
const ch = value[startEnd];
if (ch === ' ')
startWithSpace = true;
else if (ch === '\n')
startNlPos = startEnd;
else
break;
}
let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
if (start) {
value = value.substring(start.length);
start = start.replace(/\n+/g, `$&${indent}`);
}
const indentSize = indent ? '2' : '1';
let header = (literal ? '|' : '>') + (startWithSpace ? indentSize : '') + chomp;
if (comment) {
header += ' ' + commentString(comment.replace(/ ?[\r\n]+/g, ' '));
if (onComment)
onComment();
}
if (literal) {
value = value.replace(/\n+/g, `$&${indent}`);
return `${header}\n${indent}${start}${value}${end}`;
}
value = value
.replace(/\n+/g, '\n$&')
.replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, '$1$2')
.replace(/\n+/g, `$&${indent}`);
const body = foldFlowLines.foldFlowLines(`${start}${value}${end}`, indent, foldFlowLines.FOLD_BLOCK, getFoldOptions(ctx));
return `${header}\n${indent}${body}`;
}
function plainString(item, ctx, onComment, onChompKeep) {
const { type, value } = item;
const { actualString, implicitKey, indent, inFlow } = ctx;
if ((implicitKey && /[\n[\]{},]/.test(value)) ||
(inFlow && /[[\]{},]/.test(value))) {
return quotedString(value, ctx);
}
if (!value ||
/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
return implicitKey || inFlow || !value.includes('\n')
? quotedString(value, ctx)
: blockString(item, ctx, onComment, onChompKeep);
}
if (!implicitKey &&
!inFlow &&
type !== Scalar$h.Scalar.PLAIN &&
value.includes('\n')) {
return blockString(item, ctx, onComment, onChompKeep);
}
if (indent === '' && containsDocumentMarker(value)) {
ctx.forceBlockIndent = true;
return blockString(item, ctx, onComment, onChompKeep);
}
const str = value.replace(/\n+/g, `$&\n${indent}`);
if (actualString) {
const test = (tag) => tag.default && tag.tag !== 'tag:yaml.org,2002:str' && tag.test?.test(str);
const { compat, tags } = ctx.doc.schema;
if (tags.some(test) || compat?.some(test))
return quotedString(value, ctx);
}
return implicitKey
? str
: foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx));
}
function stringifyString$4(item, ctx, onComment, onChompKeep) {
const { implicitKey, inFlow } = ctx;
const ss = typeof item.value === 'string'
? item
: Object.assign({}, item, { value: String(item.value) });
let { type } = item;
if (type !== Scalar$h.Scalar.QUOTE_DOUBLE) {
if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
type = Scalar$h.Scalar.QUOTE_DOUBLE;
}
const _stringify = (_type) => {
switch (_type) {
case Scalar$h.Scalar.BLOCK_FOLDED:
case Scalar$h.Scalar.BLOCK_LITERAL:
return implicitKey || inFlow
? quotedString(ss.value, ctx)
: blockString(ss, ctx, onComment, onChompKeep);
case Scalar$h.Scalar.QUOTE_DOUBLE:
return doubleQuotedString(ss.value, ctx);
case Scalar$h.Scalar.QUOTE_SINGLE:
return singleQuotedString(ss.value, ctx);
case Scalar$h.Scalar.PLAIN:
return plainString(ss, ctx, onComment, onChompKeep);
default:
return null;
}
};
let res = _stringify(type);
if (res === null) {
const { defaultKeyType, defaultStringType } = ctx.options;
const t = (implicitKey && defaultKeyType) || defaultStringType;
res = _stringify(t);
if (res === null)
throw new Error(`Unsupported default string type ${t}`);
}
return res;
}

stringifyString$5.stringifyString = stringifyString$4;

var anchors$1 = anchors$3;
var Node$k = Node$t;
var stringifyComment$3 = stringifyComment$5;
var stringifyString$3 = stringifyString$5;

function createStringifyContext(doc, options) {
const opt = Object.assign({
blockQuote: true,
commentString: stringifyComment$3.stringifyComment,
defaultKeyType: null,
defaultStringType: 'PLAIN',
directives: null,
doubleQuotedAsJSON: false,
doubleQuotedMinMultiLineLength: 40,
falseStr: 'false',
indentSeq: true,
lineWidth: 80,
minContentWidth: 20,
nullStr: 'null',
simpleKeys: false,
singleQuote: null,
trueStr: 'true',
verifyAliasOrder: true
}, doc.schema.toStringOptions, options);
let inFlow;
switch (opt.collectionStyle) {
case 'block':
inFlow = false;
break;
case 'flow':
inFlow = true;
break;
default:
inFlow = null;
}
return {
anchors: new Set(),
doc,
indent: '',
indentStep: typeof opt.indent === 'number' ? ' '.repeat(opt.indent) : '  ',
inFlow,
options: opt
};
}
function getTagObject(tags, item) {
if (item.tag) {
const match = tags.filter(t => t.tag === item.tag);
if (match.length > 0)
return match.find(t => t.format === item.format) ?? match[0];
}
let tagObj = undefined;
let obj;
if (Node$k.isScalar(item)) {
obj = item.value;
const match = tags.filter(t => t.identify?.(obj));
tagObj =
match.find(t => t.format === item.format) ?? match.find(t => !t.format);
}
else {
obj = item;
tagObj = tags.find(t => t.nodeClass && obj instanceof t.nodeClass);
}
if (!tagObj) {
const name = obj?.constructor?.name ?? typeof obj;
throw new Error(`Tag not resolved for ${name} value`);
}
return tagObj;
}
function stringifyProps(node, tagObj, { anchors: anchors$1$1, doc }) {
if (!doc.directives)
return '';
const props = [];
const anchor = (Node$k.isScalar(node) || Node$k.isCollection(node)) && node.anchor;
if (anchor && anchors$1.anchorIsValid(anchor)) {
anchors$1$1.add(anchor);
props.push(`&${anchor}`);
}
const tag = node.tag ? node.tag : tagObj.default ? null : tagObj.tag;
if (tag)
props.push(doc.directives.tagString(tag));
return props.join(' ');
}
function stringify$8(item, ctx, onComment, onChompKeep) {
if (Node$k.isPair(item))
return item.toString(ctx, onComment, onChompKeep);
if (Node$k.isAlias(item)) {
if (ctx.doc.directives)
return item.toString(ctx);
if (ctx.resolvedAliases?.has(item)) {
throw new TypeError(`Cannot stringify circular structure without alias nodes`);
}
else {
if (ctx.resolvedAliases)
ctx.resolvedAliases.add(item);
else
ctx.resolvedAliases = new Set([item]);
item = item.resolve(ctx.doc);
}
}
let tagObj = undefined;
const node = Node$k.isNode(item)
? item
: ctx.doc.createNode(item, { onTagObj: o => (tagObj = o) });
if (!tagObj)
tagObj = getTagObject(ctx.doc.schema.tags, node);
const props = stringifyProps(node, tagObj, ctx);
if (props.length > 0)
ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
const str = typeof tagObj.stringify === 'function'
? tagObj.stringify(node, ctx, onComment, onChompKeep)
: Node$k.isScalar(node)
? stringifyString$3.stringifyString(node, ctx, onComment, onChompKeep)
: node.toString(ctx, onComment, onChompKeep);
if (!props)
return str;
return Node$k.isScalar(node) || str[0] === '{' || str[0] === '['
? `${props} ${str}`
: `${props}\n${ctx.indent}${str}`;
}

stringify$9.createStringifyContext = createStringifyContext;
stringify$9.stringify = stringify$8;

var Node$j = Node$t;
var Scalar$g = Scalar$k;
var stringify$7 = stringify$9;
var stringifyComment$2 = stringifyComment$5;

function stringifyPair$1({ key, value }, ctx, onComment, onChompKeep) {
const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
let keyComment = (Node$j.isNode(key) && key.comment) || null;
if (simpleKeys) {
if (keyComment) {
throw new Error('With simple keys, key nodes cannot have comments');
}
if (Node$j.isCollection(key)) {
const msg = 'With simple keys, collection cannot be used as a key value';
throw new Error(msg);
}
}
let explicitKey = !simpleKeys &&
(!key ||
(keyComment && value == null && !ctx.inFlow) ||
Node$j.isCollection(key) ||
(Node$j.isScalar(key)
? key.type === Scalar$g.Scalar.BLOCK_FOLDED || key.type === Scalar$g.Scalar.BLOCK_LITERAL
: typeof key === 'object'));
ctx = Object.assign({}, ctx, {
allNullValues: false,
implicitKey: !explicitKey && (simpleKeys || !allNullValues),
indent: indent + indentStep
});
let keyCommentDone = false;
let chompKeep = false;
let str = stringify$7.stringify(key, ctx, () => (keyCommentDone = true), () => (chompKeep = true));
if (!explicitKey && !ctx.inFlow && str.length > 1024) {
if (simpleKeys)
throw new Error('With simple keys, single line scalar must not span more than 1024 characters');
explicitKey = true;
}
if (ctx.inFlow) {
if (allNullValues || value == null) {
if (keyCommentDone && onComment)
onComment();
return str === '' ? '?' : explicitKey ? `? ${str}` : str;
}
}
else if ((allNullValues && !simpleKeys) || (value == null && explicitKey)) {
str = `? ${str}`;
if (keyComment && !keyCommentDone) {
str += stringifyComment$2.lineComment(str, ctx.indent, commentString(keyComment));
}
else if (chompKeep && onChompKeep)
onChompKeep();
return str;
}
if (keyCommentDone)
keyComment = null;
if (explicitKey) {
if (keyComment)
str += stringifyComment$2.lineComment(str, ctx.indent, commentString(keyComment));
str = `? ${str}\n${indent}:`;
}
else {
str = `${str}:`;
if (keyComment)
str += stringifyComment$2.lineComment(str, ctx.indent, commentString(keyComment));
}
let vcb = '';
let valueComment = null;
if (Node$j.isNode(value)) {
if (value.spaceBefore)
vcb = '\n';
if (value.commentBefore) {
const cs = commentString(value.commentBefore);
vcb += `\n${stringifyComment$2.indentComment(cs, ctx.indent)}`;
}
valueComment = value.comment;
}
else if (value && typeof value === 'object') {
value = doc.createNode(value);
}
ctx.implicitKey = false;
if (!explicitKey && !keyComment && Node$j.isScalar(value))
ctx.indentAtStart = str.length + 1;
chompKeep = false;
if (!indentSeq &&
indentStep.length >= 2 &&
!ctx.inFlow &&
!explicitKey &&
Node$j.isSeq(value) &&
!value.flow &&
!value.tag &&
!value.anchor) {
ctx.indent = ctx.indent.substr(2);
}
let valueCommentDone = false;
const valueStr = stringify$7.stringify(value, ctx, () => (valueCommentDone = true), () => (chompKeep = true));
let ws = ' ';
if (vcb || keyComment) {
if (valueStr === '' && !ctx.inFlow)
ws = vcb === '\n' ? '\n\n' : vcb;
else
ws = `${vcb}\n${ctx.indent}`;
}
else if (!explicitKey && Node$j.isCollection(value)) {
const flow = valueStr[0] === '[' || valueStr[0] === '{';
if (!flow || valueStr.includes('\n'))
ws = `\n${ctx.indent}`;
}
else if (valueStr === '' || valueStr[0] === '\n')
ws = '';
str += ws + valueStr;
if (ctx.inFlow) {
if (valueCommentDone && onComment)
onComment();
}
else if (valueComment && !valueCommentDone) {
str += stringifyComment$2.lineComment(str, ctx.indent, commentString(valueComment));
}
else if (chompKeep && onChompKeep) {
onChompKeep();
}
return str;
}

stringifyPair$2.stringifyPair = stringifyPair$1;

var addPairToJSMap$3 = {};

var log$2 = {};

function debug(logLevel, ...messages) {
if (logLevel === 'debug')
console.log(...messages);
}
function warn(logLevel, warning) {
if (logLevel === 'debug' || logLevel === 'warn') {
if (typeof process !== 'undefined' && process.emitWarning)
process.emitWarning(warning);
else
console.warn(warning);
}
}

log$2.debug = debug;
log$2.warn = warn;

var log$1 = log$2;
var stringify$6 = stringify$9;
var Node$i = Node$t;
var Scalar$f = Scalar$k;
var toJS$3 = toJS$6;

const MERGE_KEY = '<<';
function addPairToJSMap$2(ctx, map, { key, value }) {
if (ctx?.doc.schema.merge && isMergeKey(key)) {
value = Node$i.isAlias(value) ? value.resolve(ctx.doc) : value;
if (Node$i.isSeq(value))
for (const it of value.items)
mergeToJSMap(ctx, map, it);
else if (Array.isArray(value))
for (const it of value)
mergeToJSMap(ctx, map, it);
else
mergeToJSMap(ctx, map, value);
}
else {
const jsKey = toJS$3.toJS(key, '', ctx);
if (map instanceof Map) {
map.set(jsKey, toJS$3.toJS(value, jsKey, ctx));
}
else if (map instanceof Set) {
map.add(jsKey);
}
else {
const stringKey = stringifyKey(key, jsKey, ctx);
const jsValue = toJS$3.toJS(value, stringKey, ctx);
if (stringKey in map)
Object.defineProperty(map, stringKey, {
value: jsValue,
writable: true,
enumerable: true,
configurable: true
});
else
map[stringKey] = jsValue;
}
}
return map;
}
const isMergeKey = (key) => key === MERGE_KEY ||
(Node$i.isScalar(key) &&
key.value === MERGE_KEY &&
(!key.type || key.type === Scalar$f.Scalar.PLAIN));
function mergeToJSMap(ctx, map, value) {
const source = ctx && Node$i.isAlias(value) ? value.resolve(ctx.doc) : value;
if (!Node$i.isMap(source))
throw new Error('Merge sources must be maps or map aliases');
const srcMap = source.toJSON(null, ctx, Map);
for (const [key, value] of srcMap) {
if (map instanceof Map) {
if (!map.has(key))
map.set(key, value);
}
else if (map instanceof Set) {
map.add(key);
}
else if (!Object.prototype.hasOwnProperty.call(map, key)) {
Object.defineProperty(map, key, {
value,
writable: true,
enumerable: true,
configurable: true
});
}
}
return map;
}
function stringifyKey(key, jsKey, ctx) {
if (jsKey === null)
return '';
if (typeof jsKey !== 'object')
return String(jsKey);
if (Node$i.isNode(key) && ctx && ctx.doc) {
const strCtx = stringify$6.createStringifyContext(ctx.doc, {});
strCtx.anchors = new Set();
for (const node of ctx.anchors.keys())
strCtx.anchors.add(node.anchor);
strCtx.inFlow = true;
strCtx.inStringifyKey = true;
const strKey = key.toString(strCtx);
if (!ctx.mapKeyWarned) {
let jsonStr = JSON.stringify(strKey);
if (jsonStr.length > 40)
jsonStr = jsonStr.substring(0, 36) + '..."';
log$1.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
ctx.mapKeyWarned = true;
}
return strKey;
}
return JSON.stringify(jsKey);
}

addPairToJSMap$3.addPairToJSMap = addPairToJSMap$2;

var createNode$2 = createNode$5;
var stringifyPair = stringifyPair$2;
var addPairToJSMap$1 = addPairToJSMap$3;
var Node$h = Node$t;

function createPair(key, value, ctx) {
const k = createNode$2.createNode(key, undefined, ctx);
const v = createNode$2.createNode(value, undefined, ctx);
return new Pair$8(k, v);
}
class Pair$8 {
constructor(key, value = null) {
Object.defineProperty(this, Node$h.NODE_TYPE, { value: Node$h.PAIR });
this.key = key;
this.value = value;
}
clone(schema) {
let { key, value } = this;
if (Node$h.isNode(key))
key = key.clone(schema);
if (Node$h.isNode(value))
value = value.clone(schema);
return new Pair$8(key, value);
}
toJSON(_, ctx) {
const pair = ctx?.mapAsMap ? new Map() : {};
return addPairToJSMap$1.addPairToJSMap(ctx, pair, this);
}
toString(ctx, onComment, onChompKeep) {
return ctx?.doc
? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep)
: JSON.stringify(this);
}
}

Pair$9.Pair = Pair$8;
Pair$9.createPair = createPair;

var Schema$3 = {};

var map$6 = {};

var YAMLMap$7 = {};

var stringifyCollection$3 = {};

var Collection$3 = Collection$5;
var Node$g = Node$t;
var stringify$5 = stringify$9;
var stringifyComment$1 = stringifyComment$5;

function stringifyCollection$2(collection, ctx, options) {
const flow = ctx.inFlow ?? collection.flow;
const stringify = flow ? stringifyFlowCollection : stringifyBlockCollection;
return stringify(collection, ctx, options);
}
function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
const { indent, options: { commentString } } = ctx;
const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
let chompKeep = false;
const lines = [];
for (let i = 0; i < items.length; ++i) {
const item = items[i];
let comment = null;
if (Node$g.isNode(item)) {
if (!chompKeep && item.spaceBefore)
lines.push('');
addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
if (item.comment)
comment = item.comment;
}
else if (Node$g.isPair(item)) {
const ik = Node$g.isNode(item.key) ? item.key : null;
if (ik) {
if (!chompKeep && ik.spaceBefore)
lines.push('');
addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
}
}
chompKeep = false;
let str = stringify$5.stringify(item, itemCtx, () => (comment = null), () => (chompKeep = true));
if (comment)
str += stringifyComment$1.lineComment(str, itemIndent, commentString(comment));
if (chompKeep && comment)
chompKeep = false;
lines.push(blockItemPrefix + str);
}
let str;
if (lines.length === 0) {
str = flowChars.start + flowChars.end;
}
else {
str = lines[0];
for (let i = 1; i < lines.length; ++i) {
const line = lines[i];
str += line ? `\n${indent}${line}` : '\n';
}
}
if (comment) {
str += '\n' + stringifyComment$1.indentComment(commentString(comment), indent);
if (onComment)
onComment();
}
else if (chompKeep && onChompKeep)
onChompKeep();
return str;
}
function stringifyFlowCollection({ comment, items }, ctx, { flowChars, itemIndent, onComment }) {
const { indent, indentStep, options: { commentString } } = ctx;
itemIndent += indentStep;
const itemCtx = Object.assign({}, ctx, {
indent: itemIndent,
inFlow: true,
type: null
});
let reqNewline = false;
let linesAtValue = 0;
const lines = [];
for (let i = 0; i < items.length; ++i) {
const item = items[i];
let comment = null;
if (Node$g.isNode(item)) {
if (item.spaceBefore)
lines.push('');
addCommentBefore(ctx, lines, item.commentBefore, false);
if (item.comment)
comment = item.comment;
}
else if (Node$g.isPair(item)) {
const ik = Node$g.isNode(item.key) ? item.key : null;
if (ik) {
if (ik.spaceBefore)
lines.push('');
addCommentBefore(ctx, lines, ik.commentBefore, false);
if (ik.comment)
reqNewline = true;
}
const iv = Node$g.isNode(item.value) ? item.value : null;
if (iv) {
if (iv.comment)
comment = iv.comment;
if (iv.commentBefore)
reqNewline = true;
}
else if (item.value == null && ik && ik.comment) {
comment = ik.comment;
}
}
if (comment)
reqNewline = true;
let str = stringify$5.stringify(item, itemCtx, () => (comment = null));
if (i < items.length - 1)
str += ',';
if (comment)
str += stringifyComment$1.lineComment(str, itemIndent, commentString(comment));
if (!reqNewline && (lines.length > linesAtValue || str.includes('\n')))
reqNewline = true;
lines.push(str);
linesAtValue = lines.length;
}
let str;
const { start, end } = flowChars;
if (lines.length === 0) {
str = start + end;
}
else {
if (!reqNewline) {
const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
reqNewline = len > Collection$3.Collection.maxFlowStringSingleLineLength;
}
if (reqNewline) {
str = start;
for (const line of lines)
str += line ? `\n${indentStep}${indent}${line}` : '\n';
str += `\n${indent}${end}`;
}
else {
str = `${start} ${lines.join(' ')} ${end}`;
}
}
if (comment) {
str += stringifyComment$1.lineComment(str, commentString(comment), indent);
if (onComment)
onComment();
}
return str;
}
function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
if (comment && chompKeep)
comment = comment.replace(/^\n+/, '');
if (comment) {
const ic = stringifyComment$1.indentComment(commentString(comment), indent);
lines.push(ic.trimStart());
}
}

stringifyCollection$3.stringifyCollection = stringifyCollection$2;

var stringifyCollection$1 = stringifyCollection$3;
var addPairToJSMap = addPairToJSMap$3;
var Collection$2 = Collection$5;
var Node$f = Node$t;
var Pair$7 = Pair$9;
var Scalar$e = Scalar$k;

function findPair(items, key) {
const k = Node$f.isScalar(key) ? key.value : key;
for (const it of items) {
if (Node$f.isPair(it)) {
if (it.key === key || it.key === k)
return it;
if (Node$f.isScalar(it.key) && it.key.value === k)
return it;
}
}
return undefined;
}
class YAMLMap$6 extends Collection$2.Collection {
constructor(schema) {
super(Node$f.MAP, schema);
this.items = [];
}
static get tagName() {
return 'tag:yaml.org,2002:map';
}
add(pair, overwrite) {
let _pair;
if (Node$f.isPair(pair))
_pair = pair;
else if (!pair || typeof pair !== 'object' || !('key' in pair)) {
_pair = new Pair$7.Pair(pair, pair?.value);
}
else
_pair = new Pair$7.Pair(pair.key, pair.value);
const prev = findPair(this.items, _pair.key);
const sortEntries = this.schema?.sortMapEntries;
if (prev) {
if (!overwrite)
throw new Error(`Key ${_pair.key} already set`);
if (Node$f.isScalar(prev.value) && Scalar$e.isScalarValue(_pair.value))
prev.value.value = _pair.value;
else
prev.value = _pair.value;
}
else if (sortEntries) {
const i = this.items.findIndex(item => sortEntries(_pair, item) < 0);
if (i === -1)
this.items.push(_pair);
else
this.items.splice(i, 0, _pair);
}
else {
this.items.push(_pair);
}
}
delete(key) {
const it = findPair(this.items, key);
if (!it)
return false;
const del = this.items.splice(this.items.indexOf(it), 1);
return del.length > 0;
}
get(key, keepScalar) {
const it = findPair(this.items, key);
const node = it?.value;
return (!keepScalar && Node$f.isScalar(node) ? node.value : node) ?? undefined;
}
has(key) {
return !!findPair(this.items, key);
}
set(key, value) {
this.add(new Pair$7.Pair(key, value), true);
}
toJSON(_, ctx, Type) {
const map = Type ? new Type() : ctx?.mapAsMap ? new Map() : {};
if (ctx?.onCreate)
ctx.onCreate(map);
for (const item of this.items)
addPairToJSMap.addPairToJSMap(ctx, map, item);
return map;
}
toString(ctx, onComment, onChompKeep) {
if (!ctx)
return JSON.stringify(this);
for (const item of this.items) {
if (!Node$f.isPair(item))
throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
}
if (!ctx.allNullValues && this.hasAllNullValues(false))
ctx = Object.assign({}, ctx, { allNullValues: true });
return stringifyCollection$1.stringifyCollection(this, ctx, {
blockItemPrefix: '',
flowChars: { start: '{', end: '}' },
itemIndent: ctx.indent || '',
onChompKeep,
onComment
});
}
}

YAMLMap$7.YAMLMap = YAMLMap$6;
YAMLMap$7.findPair = findPair;

var Node$e = Node$t;
var Pair$6 = Pair$9;
var YAMLMap$5 = YAMLMap$7;

function createMap(schema, obj, ctx) {
const { keepUndefined, replacer } = ctx;
const map = new YAMLMap$5.YAMLMap(schema);
const add = (key, value) => {
if (typeof replacer === 'function')
value = replacer.call(obj, key, value);
else if (Array.isArray(replacer) && !replacer.includes(key))
return;
if (value !== undefined || keepUndefined)
map.items.push(Pair$6.createPair(key, value, ctx));
};
if (obj instanceof Map) {
for (const [key, value] of obj)
add(key, value);
}
else if (obj && typeof obj === 'object') {
for (const key of Object.keys(obj))
add(key, obj[key]);
}
if (typeof schema.sortMapEntries === 'function') {
map.items.sort(schema.sortMapEntries);
}
return map;
}
const map$5 = {
collection: 'map',
createNode: createMap,
default: true,
nodeClass: YAMLMap$5.YAMLMap,
tag: 'tag:yaml.org,2002:map',
resolve(map, onError) {
if (!Node$e.isMap(map))
onError('Expected a mapping for this tag');
return map;
}
};

map$6.map = map$5;

var seq$6 = {};

var YAMLSeq$7 = {};

var stringifyCollection = stringifyCollection$3;
var Collection$1 = Collection$5;
var Node$d = Node$t;
var Scalar$d = Scalar$k;
var toJS$2 = toJS$6;

class YAMLSeq$6 extends Collection$1.Collection {
constructor(schema) {
super(Node$d.SEQ, schema);
this.items = [];
}
static get tagName() {
return 'tag:yaml.org,2002:seq';
}
add(value) {
this.items.push(value);
}
delete(key) {
const idx = asItemIndex(key);
if (typeof idx !== 'number')
return false;
const del = this.items.splice(idx, 1);
return del.length > 0;
}
get(key, keepScalar) {
const idx = asItemIndex(key);
if (typeof idx !== 'number')
return undefined;
const it = this.items[idx];
return !keepScalar && Node$d.isScalar(it) ? it.value : it;
}
has(key) {
const idx = asItemIndex(key);
return typeof idx === 'number' && idx < this.items.length;
}
set(key, value) {
const idx = asItemIndex(key);
if (typeof idx !== 'number')
throw new Error(`Expected a valid index, not ${key}.`);
const prev = this.items[idx];
if (Node$d.isScalar(prev) && Scalar$d.isScalarValue(value))
prev.value = value;
else
this.items[idx] = value;
}
toJSON(_, ctx) {
const seq = [];
if (ctx?.onCreate)
ctx.onCreate(seq);
let i = 0;
for (const item of this.items)
seq.push(toJS$2.toJS(item, String(i++), ctx));
return seq;
}
toString(ctx, onComment, onChompKeep) {
if (!ctx)
return JSON.stringify(this);
return stringifyCollection.stringifyCollection(this, ctx, {
blockItemPrefix: '- ',
flowChars: { start: '[', end: ']' },
itemIndent: (ctx.indent || '') + '  ',
onChompKeep,
onComment
});
}
}
function asItemIndex(key) {
let idx = Node$d.isScalar(key) ? key.value : key;
if (idx && typeof idx === 'string')
idx = Number(idx);
return typeof idx === 'number' && Number.isInteger(idx) && idx >= 0
? idx
: null;
}

YAMLSeq$7.YAMLSeq = YAMLSeq$6;

var createNode$1 = createNode$5;
var Node$c = Node$t;
var YAMLSeq$5 = YAMLSeq$7;

function createSeq(schema, obj, ctx) {
const { replacer } = ctx;
const seq = new YAMLSeq$5.YAMLSeq(schema);
if (obj && Symbol.iterator in Object(obj)) {
let i = 0;
for (let it of obj) {
if (typeof replacer === 'function') {
const key = obj instanceof Set ? it : String(i++);
it = replacer.call(obj, key, it);
}
seq.items.push(createNode$1.createNode(it, undefined, ctx));
}
}
return seq;
}
const seq$5 = {
collection: 'seq',
createNode: createSeq,
default: true,
nodeClass: YAMLSeq$5.YAMLSeq,
tag: 'tag:yaml.org,2002:seq',
resolve(seq, onError) {
if (!Node$c.isSeq(seq))
onError('Expected a sequence for this tag');
return seq;
}
};

seq$6.seq = seq$5;

var string$5 = {};

var stringifyString$2 = stringifyString$5;

const string$4 = {
identify: value => typeof value === 'string',
default: true,
tag: 'tag:yaml.org,2002:str',
resolve: str => str,
stringify(item, ctx, onComment, onChompKeep) {
ctx = Object.assign({ actualString: true }, ctx);
return stringifyString$2.stringifyString(item, ctx, onComment, onChompKeep);
}
};

string$5.string = string$4;

var tags$1 = {};

var _null$3 = {};

var Scalar$c = Scalar$k;

const nullTag = {
identify: value => value == null,
createNode: () => new Scalar$c.Scalar(null),
default: true,
tag: 'tag:yaml.org,2002:null',
test: /^(?:~|[Nn]ull|NULL)?$/,
resolve: () => new Scalar$c.Scalar(null),
stringify: ({ source }, ctx) => typeof source === 'string' && nullTag.test.test(source)
? source
: ctx.options.nullStr
};

_null$3.nullTag = nullTag;

var bool$4 = {};

var Scalar$b = Scalar$k;

const boolTag = {
identify: value => typeof value === 'boolean',
default: true,
tag: 'tag:yaml.org,2002:bool',
test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
resolve: str => new Scalar$b.Scalar(str[0] === 't' || str[0] === 'T'),
stringify({ source, value }, ctx) {
if (source && boolTag.test.test(source)) {
const sv = source[0] === 't' || source[0] === 'T';
if (value === sv)
return source;
}
return value ? ctx.options.trueStr : ctx.options.falseStr;
}
};

bool$4.boolTag = boolTag;

var float$6 = {};

var stringifyNumber$6 = {};

function stringifyNumber$5({ format, minFractionDigits, tag, value }) {
if (typeof value === 'bigint')
return String(value);
const num = typeof value === 'number' ? value : Number(value);
if (!isFinite(num))
return isNaN(num) ? '.nan' : num < 0 ? '-.inf' : '.inf';
let n = JSON.stringify(value);
if (!format &&
minFractionDigits &&
(!tag || tag === 'tag:yaml.org,2002:float') &&
/^\d/.test(n)) {
let i = n.indexOf('.');
if (i < 0) {
i = n.length;
n += '.';
}
let d = minFractionDigits - (n.length - i - 1);
while (d-- > 0)
n += '0';
}
return n;
}

stringifyNumber$6.stringifyNumber = stringifyNumber$5;

var Scalar$a = Scalar$k;
var stringifyNumber$4 = stringifyNumber$6;

const floatNaN$1 = {
identify: value => typeof value === 'number',
default: true,
tag: 'tag:yaml.org,2002:float',
test: /^(?:[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN))$/,
resolve: str => str.slice(-3).toLowerCase() === 'nan'
? NaN
: str[0] === '-'
? Number.NEGATIVE_INFINITY
: Number.POSITIVE_INFINITY,
stringify: stringifyNumber$4.stringifyNumber
};
const floatExp$1 = {
identify: value => typeof value === 'number',
default: true,
tag: 'tag:yaml.org,2002:float',
format: 'EXP',
test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
resolve: str => parseFloat(str),
stringify(node) {
const num = Number(node.value);
return isFinite(num) ? num.toExponential() : stringifyNumber$4.stringifyNumber(node);
}
};
const float$5 = {
identify: value => typeof value === 'number',
default: true,
tag: 'tag:yaml.org,2002:float',
test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
resolve(str) {
const node = new Scalar$a.Scalar(parseFloat(str));
const dot = str.indexOf('.');
if (dot !== -1 && str[str.length - 1] === '0')
node.minFractionDigits = str.length - dot - 1;
return node;
},
stringify: stringifyNumber$4.stringifyNumber
};

float$6.float = float$5;
float$6.floatExp = floatExp$1;
float$6.floatNaN = floatNaN$1;

var int$6 = {};

var stringifyNumber$3 = stringifyNumber$6;

const intIdentify$2 = (value) => typeof value === 'bigint' || Number.isInteger(value);
const intResolve$1 = (str, offset, radix, { intAsBigInt }) => (intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix));
function intStringify$1(node, radix, prefix) {
const { value } = node;
if (intIdentify$2(value) && value >= 0)
return prefix + value.toString(radix);
return stringifyNumber$3.stringifyNumber(node);
}
const intOct$1 = {
identify: value => intIdentify$2(value) && value >= 0,
default: true,
tag: 'tag:yaml.org,2002:int',
format: 'OCT',
test: /^0o[0-7]+$/,
resolve: (str, _onError, opt) => intResolve$1(str, 2, 8, opt),
stringify: node => intStringify$1(node, 8, '0o')
};
const int$5 = {
identify: intIdentify$2,
default: true,
tag: 'tag:yaml.org,2002:int',
test: /^[-+]?[0-9]+$/,
resolve: (str, _onError, opt) => intResolve$1(str, 0, 10, opt),
stringify: stringifyNumber$3.stringifyNumber
};
const intHex$1 = {
identify: value => intIdentify$2(value) && value >= 0,
default: true,
tag: 'tag:yaml.org,2002:int',
format: 'HEX',
test: /^0x[0-9a-fA-F]+$/,
resolve: (str, _onError, opt) => intResolve$1(str, 2, 16, opt),
stringify: node => intStringify$1(node, 16, '0x')
};

int$6.int = int$5;
int$6.intHex = intHex$1;
int$6.intOct = intOct$1;

var schema$8 = {};

var map$4 = map$6;
var _null$2 = _null$3;
var seq$4 = seq$6;
var string$3 = string$5;
var bool$3 = bool$4;
var float$4 = float$6;
var int$4 = int$6;

const schema$7 = [
map$4.map,
seq$4.seq,
string$3.string,
_null$2.nullTag,
bool$3.boolTag,
int$4.intOct,
int$4.int,
int$4.intHex,
float$4.floatNaN,
float$4.floatExp,
float$4.float
];

schema$8.schema = schema$7;

var schema$6 = {};

var Scalar$9 = Scalar$k;
var map$3 = map$6;
var seq$3 = seq$6;

function intIdentify$1(value) {
return typeof value === 'bigint' || Number.isInteger(value);
}
const stringifyJSON = ({ value }) => JSON.stringify(value);
const jsonScalars = [
{
identify: value => typeof value === 'string',
default: true,
tag: 'tag:yaml.org,2002:str',
resolve: str => str,
stringify: stringifyJSON
},
{
identify: value => value == null,
createNode: () => new Scalar$9.Scalar(null),
default: true,
tag: 'tag:yaml.org,2002:null',
test: /^null$/,
resolve: () => null,
stringify: stringifyJSON
},
{
identify: value => typeof value === 'boolean',
default: true,
tag: 'tag:yaml.org,2002:bool',
test: /^true|false$/,
resolve: str => str === 'true',
stringify: stringifyJSON
},
{
identify: intIdentify$1,
default: true,
tag: 'tag:yaml.org,2002:int',
test: /^-?(?:0|[1-9][0-9]*)$/,
resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
stringify: ({ value }) => intIdentify$1(value) ? value.toString() : JSON.stringify(value)
},
{
identify: value => typeof value === 'number',
default: true,
tag: 'tag:yaml.org,2002:float',
test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
resolve: str => parseFloat(str),
stringify: stringifyJSON
}
];
const jsonError = {
default: true,
tag: '',
test: /^/,
resolve(str, onError) {
onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
return str;
}
};
const schema$5 = [map$3.map, seq$3.seq].concat(jsonScalars, jsonError);

schema$6.schema = schema$5;

var binary$3 = {};

var Scalar$8 = Scalar$k;
var stringifyString$1 = stringifyString$5;

const binary$2 = {
identify: value => value instanceof Uint8Array,
default: false,
tag: 'tag:yaml.org,2002:binary',
resolve(src, onError) {
if (typeof Buffer === 'function') {
return Buffer.from(src, 'base64');
}
else if (typeof atob === 'function') {
const str = atob(src.replace(/[\n\r]/g, ''));
const buffer = new Uint8Array(str.length);
for (let i = 0; i < str.length; ++i)
buffer[i] = str.charCodeAt(i);
return buffer;
}
else {
onError('This environment does not support reading binary tags; either Buffer or atob is required');
return src;
}
},
stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
const buf = value;
let str;
if (typeof Buffer === 'function') {
str =
buf instanceof Buffer
? buf.toString('base64')
: Buffer.from(buf.buffer).toString('base64');
}
else if (typeof btoa === 'function') {
let s = '';
for (let i = 0; i < buf.length; ++i)
s += String.fromCharCode(buf[i]);
str = btoa(s);
}
else {
throw new Error('This environment does not support writing binary tags; either Buffer or btoa is required');
}
if (!type)
type = Scalar$8.Scalar.BLOCK_LITERAL;
if (type !== Scalar$8.Scalar.QUOTE_DOUBLE) {
const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
const n = Math.ceil(str.length / lineWidth);
const lines = new Array(n);
for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
lines[i] = str.substr(o, lineWidth);
}
str = lines.join(type === Scalar$8.Scalar.BLOCK_LITERAL ? '\n' : ' ');
}
return stringifyString$1.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
}
};

binary$3.binary = binary$2;

var omap$3 = {};

var pairs$4 = {};

var Node$b = Node$t;
var Pair$5 = Pair$9;
var Scalar$7 = Scalar$k;
var YAMLSeq$4 = YAMLSeq$7;

function resolvePairs(seq, onError) {
if (Node$b.isSeq(seq)) {
for (let i = 0; i < seq.items.length; ++i) {
let item = seq.items[i];
if (Node$b.isPair(item))
continue;
else if (Node$b.isMap(item)) {
if (item.items.length > 1)
onError('Each pair must have its own sequence indicator');
const pair = item.items[0] || new Pair$5.Pair(new Scalar$7.Scalar(null));
if (item.commentBefore)
pair.key.commentBefore = pair.key.commentBefore
? `${item.commentBefore}\n${pair.key.commentBefore}`
: item.commentBefore;
if (item.comment) {
const cn = pair.value ?? pair.key;
cn.comment = cn.comment
? `${item.comment}\n${cn.comment}`
: item.comment;
}
item = pair;
}
seq.items[i] = Node$b.isPair(item) ? item : new Pair$5.Pair(item);
}
}
else
onError('Expected a sequence for this tag');
return seq;
}
function createPairs(schema, iterable, ctx) {
const { replacer } = ctx;
const pairs = new YAMLSeq$4.YAMLSeq(schema);
pairs.tag = 'tag:yaml.org,2002:pairs';
let i = 0;
if (iterable && Symbol.iterator in Object(iterable))
for (let it of iterable) {
if (typeof replacer === 'function')
it = replacer.call(iterable, String(i++), it);
let key, value;
if (Array.isArray(it)) {
if (it.length === 2) {
key = it[0];
value = it[1];
}
else
throw new TypeError(`Expected [key, value] tuple: ${it}`);
}
else if (it && it instanceof Object) {
const keys = Object.keys(it);
if (keys.length === 1) {
key = keys[0];
value = it[key];
}
else
throw new TypeError(`Expected { key: value } tuple: ${it}`);
}
else {
key = it;
}
pairs.items.push(Pair$5.createPair(key, value, ctx));
}
return pairs;
}
const pairs$3 = {
collection: 'seq',
default: false,
tag: 'tag:yaml.org,2002:pairs',
resolve: resolvePairs,
createNode: createPairs
};

pairs$4.createPairs = createPairs;
pairs$4.pairs = pairs$3;
pairs$4.resolvePairs = resolvePairs;

var YAMLSeq$3 = YAMLSeq$7;
var toJS$1 = toJS$6;
var Node$a = Node$t;
var YAMLMap$4 = YAMLMap$7;
var pairs$2 = pairs$4;

class YAMLOMap extends YAMLSeq$3.YAMLSeq {
constructor() {
super();
this.add = YAMLMap$4.YAMLMap.prototype.add.bind(this);
this.delete = YAMLMap$4.YAMLMap.prototype.delete.bind(this);
this.get = YAMLMap$4.YAMLMap.prototype.get.bind(this);
this.has = YAMLMap$4.YAMLMap.prototype.has.bind(this);
this.set = YAMLMap$4.YAMLMap.prototype.set.bind(this);
this.tag = YAMLOMap.tag;
}
toJSON(_, ctx) {
if (!ctx)
return super.toJSON(_);
const map = new Map();
if (ctx?.onCreate)
ctx.onCreate(map);
for (const pair of this.items) {
let key, value;
if (Node$a.isPair(pair)) {
key = toJS$1.toJS(pair.key, '', ctx);
value = toJS$1.toJS(pair.value, key, ctx);
}
else {
key = toJS$1.toJS(pair, '', ctx);
}
if (map.has(key))
throw new Error('Ordered maps must not include duplicate keys');
map.set(key, value);
}
return map;
}
}
YAMLOMap.tag = 'tag:yaml.org,2002:omap';
const omap$2 = {
collection: 'seq',
identify: value => value instanceof Map,
nodeClass: YAMLOMap,
default: false,
tag: 'tag:yaml.org,2002:omap',
resolve(seq, onError) {
const pairs$1 = pairs$2.resolvePairs(seq, onError);
const seenKeys = [];
for (const { key } of pairs$1.items) {
if (Node$a.isScalar(key)) {
if (seenKeys.includes(key.value)) {
onError(`Ordered maps must not include duplicate keys: ${key.value}`);
}
else {
seenKeys.push(key.value);
}
}
}
return Object.assign(new YAMLOMap(), pairs$1);
},
createNode(schema, iterable, ctx) {
const pairs$1 = pairs$2.createPairs(schema, iterable, ctx);
const omap = new YAMLOMap();
omap.items = pairs$1.items;
return omap;
}
};

omap$3.YAMLOMap = YAMLOMap;
omap$3.omap = omap$2;

var schema$4 = {};

var bool$2 = {};

var Scalar$6 = Scalar$k;

function boolStringify({ value, source }, ctx) {
const boolObj = value ? trueTag : falseTag;
if (source && boolObj.test.test(source))
return source;
return value ? ctx.options.trueStr : ctx.options.falseStr;
}
const trueTag = {
identify: value => value === true,
default: true,
tag: 'tag:yaml.org,2002:bool',
test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
resolve: () => new Scalar$6.Scalar(true),
stringify: boolStringify
};
const falseTag = {
identify: value => value === false,
default: true,
tag: 'tag:yaml.org,2002:bool',
test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/i,
resolve: () => new Scalar$6.Scalar(false),
stringify: boolStringify
};

bool$2.falseTag = falseTag;
bool$2.trueTag = trueTag;

var float$3 = {};

var Scalar$5 = Scalar$k;
var stringifyNumber$2 = stringifyNumber$6;

const floatNaN = {
identify: value => typeof value === 'number',
default: true,
tag: 'tag:yaml.org,2002:float',
test: /^[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN)$/,
resolve: (str) => str.slice(-3).toLowerCase() === 'nan'
? NaN
: str[0] === '-'
? Number.NEGATIVE_INFINITY
: Number.POSITIVE_INFINITY,
stringify: stringifyNumber$2.stringifyNumber
};
const floatExp = {
identify: value => typeof value === 'number',
default: true,
tag: 'tag:yaml.org,2002:float',
format: 'EXP',
test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
resolve: (str) => parseFloat(str.replace(/_/g, '')),
stringify(node) {
const num = Number(node.value);
return isFinite(num) ? num.toExponential() : stringifyNumber$2.stringifyNumber(node);
}
};
const float$2 = {
identify: value => typeof value === 'number',
default: true,
tag: 'tag:yaml.org,2002:float',
test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
resolve(str) {
const node = new Scalar$5.Scalar(parseFloat(str.replace(/_/g, '')));
const dot = str.indexOf('.');
if (dot !== -1) {
const f = str.substring(dot + 1).replace(/_/g, '');
if (f[f.length - 1] === '0')
node.minFractionDigits = f.length;
}
return node;
},
stringify: stringifyNumber$2.stringifyNumber
};

float$3.float = float$2;
float$3.floatExp = floatExp;
float$3.floatNaN = floatNaN;

var int$3 = {};

var stringifyNumber$1 = stringifyNumber$6;

const intIdentify = (value) => typeof value === 'bigint' || Number.isInteger(value);
function intResolve(str, offset, radix, { intAsBigInt }) {
const sign = str[0];
if (sign === '-' || sign === '+')
offset += 1;
str = str.substring(offset).replace(/_/g, '');
if (intAsBigInt) {
switch (radix) {
case 2:
str = `0b${str}`;
break;
case 8:
str = `0o${str}`;
break;
case 16:
str = `0x${str}`;
break;
}
const n = BigInt(str);
return sign === '-' ? BigInt(-1) * n : n;
}
const n = parseInt(str, radix);
return sign === '-' ? -1 * n : n;
}
function intStringify(node, radix, prefix) {
const { value } = node;
if (intIdentify(value)) {
const str = value.toString(radix);
return value < 0 ? '-' + prefix + str.substr(1) : prefix + str;
}
return stringifyNumber$1.stringifyNumber(node);
}
const intBin = {
identify: intIdentify,
default: true,
tag: 'tag:yaml.org,2002:int',
format: 'BIN',
test: /^[-+]?0b[0-1_]+$/,
resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
stringify: node => intStringify(node, 2, '0b')
};
const intOct = {
identify: intIdentify,
default: true,
tag: 'tag:yaml.org,2002:int',
format: 'OCT',
test: /^[-+]?0[0-7_]+$/,
resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
stringify: node => intStringify(node, 8, '0')
};
const int$2 = {
identify: intIdentify,
default: true,
tag: 'tag:yaml.org,2002:int',
test: /^[-+]?[0-9][0-9_]*$/,
resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
stringify: stringifyNumber$1.stringifyNumber
};
const intHex = {
identify: intIdentify,
default: true,
tag: 'tag:yaml.org,2002:int',
format: 'HEX',
test: /^[-+]?0x[0-9a-fA-F_]+$/,
resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
stringify: node => intStringify(node, 16, '0x')
};

int$3.int = int$2;
int$3.intBin = intBin;
int$3.intHex = intHex;
int$3.intOct = intOct;

var set$3 = {};

var Node$9 = Node$t;
var Pair$4 = Pair$9;
var YAMLMap$3 = YAMLMap$7;

class YAMLSet extends YAMLMap$3.YAMLMap {
constructor(schema) {
super(schema);
this.tag = YAMLSet.tag;
}
add(key) {
let pair;
if (Node$9.isPair(key))
pair = key;
else if (key &&
typeof key === 'object' &&
'key' in key &&
'value' in key &&
key.value === null)
pair = new Pair$4.Pair(key.key, null);
else
pair = new Pair$4.Pair(key, null);
const prev = YAMLMap$3.findPair(this.items, pair.key);
if (!prev)
this.items.push(pair);
}
get(key, keepPair) {
const pair = YAMLMap$3.findPair(this.items, key);
return !keepPair && Node$9.isPair(pair)
? Node$9.isScalar(pair.key)
? pair.key.value
: pair.key
: pair;
}
set(key, value) {
if (typeof value !== 'boolean')
throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
const prev = YAMLMap$3.findPair(this.items, key);
if (prev && !value) {
this.items.splice(this.items.indexOf(prev), 1);
}
else if (!prev && value) {
this.items.push(new Pair$4.Pair(key));
}
}
toJSON(_, ctx) {
return super.toJSON(_, ctx, Set);
}
toString(ctx, onComment, onChompKeep) {
if (!ctx)
return JSON.stringify(this);
if (this.hasAllNullValues(true))
return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
else
throw new Error('Set items must all have null values');
}
}
YAMLSet.tag = 'tag:yaml.org,2002:set';
const set$2 = {
collection: 'map',
identify: value => value instanceof Set,
nodeClass: YAMLSet,
default: false,
tag: 'tag:yaml.org,2002:set',
resolve(map, onError) {
if (Node$9.isMap(map)) {
if (map.hasAllNullValues(true))
return Object.assign(new YAMLSet(), map);
else
onError('Set items must all have null values');
}
else
onError('Expected a mapping for this tag');
return map;
},
createNode(schema, iterable, ctx) {
const { replacer } = ctx;
const set = new YAMLSet(schema);
if (iterable && Symbol.iterator in Object(iterable))
for (let value of iterable) {
if (typeof replacer === 'function')
value = replacer.call(iterable, value, value);
set.items.push(Pair$4.createPair(value, null, ctx));
}
return set;
}
};

set$3.YAMLSet = YAMLSet;
set$3.set = set$2;

var timestamp$3 = {};

var stringifyNumber = stringifyNumber$6;

function parseSexagesimal(str, asBigInt) {
const sign = str[0];
const parts = sign === '-' || sign === '+' ? str.substring(1) : str;
const num = (n) => asBigInt ? BigInt(n) : Number(n);
const res = parts
.replace(/_/g, '')
.split(':')
.reduce((res, p) => res * num(60) + num(p), num(0));
return (sign === '-' ? num(-1) * res : res);
}
function stringifySexagesimal(node) {
let { value } = node;
let num = (n) => n;
if (typeof value === 'bigint')
num = n => BigInt(n);
else if (isNaN(value) || !isFinite(value))
return stringifyNumber.stringifyNumber(node);
let sign = '';
if (value < 0) {
sign = '-';
value *= num(-1);
}
const _60 = num(60);
const parts = [value % _60];
if (value < 60) {
parts.unshift(0);
}
else {
value = (value - parts[0]) / _60;
parts.unshift(value % _60);
if (value >= 60) {
value = (value - parts[0]) / _60;
parts.unshift(value);
}
}
return (sign +
parts
.map(n => (n < 10 ? '0' + String(n) : String(n)))
.join(':')
.replace(/000000\d*$/, '')
);
}
const intTime = {
identify: value => typeof value === 'bigint' || Number.isInteger(value),
default: true,
tag: 'tag:yaml.org,2002:int',
format: 'TIME',
test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
stringify: stringifySexagesimal
};
const floatTime = {
identify: value => typeof value === 'number',
default: true,
tag: 'tag:yaml.org,2002:float',
format: 'TIME',
test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
resolve: str => parseSexagesimal(str, false),
stringify: stringifySexagesimal
};
const timestamp$2 = {
identify: value => value instanceof Date,
default: true,
tag: 'tag:yaml.org,2002:timestamp',
test: RegExp('^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})' +
'(?:' +
'(?:t|T|[ \\t]+)' +
'([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)' +
'(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?' +
')?$'),
resolve(str) {
const match = str.match(timestamp$2.test);
if (!match)
throw new Error('!!timestamp expects a date, starting with yyyy-mm-dd');
const [, year, month, day, hour, minute, second] = match.map(Number);
const millisec = match[7] ? Number((match[7] + '00').substr(1, 3)) : 0;
let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
const tz = match[8];
if (tz && tz !== 'Z') {
let d = parseSexagesimal(tz, false);
if (Math.abs(d) < 30)
d *= 60;
date -= 60000 * d;
}
return new Date(date);
},
stringify: ({ value }) => value.toISOString().replace(/((T00:00)?:00)?\.000Z$/, '')
};

timestamp$3.floatTime = floatTime;
timestamp$3.intTime = intTime;
timestamp$3.timestamp = timestamp$2;

var map$2 = map$6;
var _null$1 = _null$3;
var seq$2 = seq$6;
var string$2 = string$5;
var binary$1 = binary$3;
var bool$1 = bool$2;
var float$1 = float$3;
var int$1 = int$3;
var omap$1 = omap$3;
var pairs$1 = pairs$4;
var set$1 = set$3;
var timestamp$1 = timestamp$3;

const schema$3 = [
map$2.map,
seq$2.seq,
string$2.string,
_null$1.nullTag,
bool$1.trueTag,
bool$1.falseTag,
int$1.intBin,
int$1.intOct,
int$1.int,
int$1.intHex,
float$1.floatNaN,
float$1.floatExp,
float$1.float,
binary$1.binary,
omap$1.omap,
pairs$1.pairs,
set$1.set,
timestamp$1.intTime,
timestamp$1.floatTime,
timestamp$1.timestamp
];

schema$4.schema = schema$3;

var map$1 = map$6;
var _null = _null$3;
var seq$1 = seq$6;
var string$1 = string$5;
var bool = bool$4;
var float = float$6;
var int = int$6;
var schema = schema$8;
var schema$1 = schema$6;
var binary = binary$3;
var omap = omap$3;
var pairs = pairs$4;
var schema$2 = schema$4;
var set = set$3;
var timestamp = timestamp$3;

const schemas = new Map([
['core', schema.schema],
['failsafe', [map$1.map, seq$1.seq, string$1.string]],
['json', schema$1.schema],
['yaml11', schema$2.schema],
['yaml-1.1', schema$2.schema]
]);
const tagsByName = {
binary: binary.binary,
bool: bool.boolTag,
float: float.float,
floatExp: float.floatExp,
floatNaN: float.floatNaN,
floatTime: timestamp.floatTime,
int: int.int,
intHex: int.intHex,
intOct: int.intOct,
intTime: timestamp.intTime,
map: map$1.map,
null: _null.nullTag,
omap: omap.omap,
pairs: pairs.pairs,
seq: seq$1.seq,
set: set.set,
timestamp: timestamp.timestamp
};
const coreKnownTags = {
'tag:yaml.org,2002:binary': binary.binary,
'tag:yaml.org,2002:omap': omap.omap,
'tag:yaml.org,2002:pairs': pairs.pairs,
'tag:yaml.org,2002:set': set.set,
'tag:yaml.org,2002:timestamp': timestamp.timestamp
};
function getTags(customTags, schemaName) {
let tags = schemas.get(schemaName);
if (!tags) {
if (Array.isArray(customTags))
tags = [];
else {
const keys = Array.from(schemas.keys())
.filter(key => key !== 'yaml11')
.map(key => JSON.stringify(key))
.join(', ');
throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
}
}
if (Array.isArray(customTags)) {
for (const tag of customTags)
tags = tags.concat(tag);
}
else if (typeof customTags === 'function') {
tags = customTags(tags.slice());
}
return tags.map(tag => {
if (typeof tag !== 'string')
return tag;
const tagObj = tagsByName[tag];
if (tagObj)
return tagObj;
const keys = Object.keys(tagsByName)
.map(key => JSON.stringify(key))
.join(', ');
throw new Error(`Unknown custom tag "${tag}"; use one of ${keys}`);
});
}

tags$1.coreKnownTags = coreKnownTags;
tags$1.getTags = getTags;

var Node$8 = Node$t;
var map = map$6;
var seq = seq$6;
var string = string$5;
var tags = tags$1;

const sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
class Schema$2 {
constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
this.compat = Array.isArray(compat)
? tags.getTags(compat, 'compat')
: compat
? tags.getTags(null, compat)
: null;
this.merge = !!merge;
this.name = (typeof schema === 'string' && schema) || 'core';
this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
this.tags = tags.getTags(customTags, this.name);
this.toStringOptions = toStringDefaults ?? null;
Object.defineProperty(this, Node$8.MAP, { value: map.map });
Object.defineProperty(this, Node$8.SCALAR, { value: string.string });
Object.defineProperty(this, Node$8.SEQ, { value: seq.seq });
this.sortMapEntries =
typeof sortMapEntries === 'function'
? sortMapEntries
: sortMapEntries === true
? sortMapEntriesByKey
: null;
}
clone() {
const copy = Object.create(Schema$2.prototype, Object.getOwnPropertyDescriptors(this));
copy.tags = this.tags.slice();
return copy;
}
}

Schema$3.Schema = Schema$2;

var stringifyDocument$2 = {};

var Node$7 = Node$t;
var stringify$4 = stringify$9;
var stringifyComment = stringifyComment$5;

function stringifyDocument$1(doc, options) {
const lines = [];
let hasDirectives = options.directives === true;
if (options.directives !== false && doc.directives) {
const dir = doc.directives.toString(doc);
if (dir) {
lines.push(dir);
hasDirectives = true;
}
else if (doc.directives.docStart)
hasDirectives = true;
}
if (hasDirectives)
lines.push('---');
const ctx = stringify$4.createStringifyContext(doc, options);
const { commentString } = ctx.options;
if (doc.commentBefore) {
if (lines.length !== 1)
lines.unshift('');
const cs = commentString(doc.commentBefore);
lines.unshift(stringifyComment.indentComment(cs, ''));
}
let chompKeep = false;
let contentComment = null;
if (doc.contents) {
if (Node$7.isNode(doc.contents)) {
if (doc.contents.spaceBefore && hasDirectives)
lines.push('');
if (doc.contents.commentBefore) {
const cs = commentString(doc.contents.commentBefore);
lines.push(stringifyComment.indentComment(cs, ''));
}
ctx.forceBlockIndent = !!doc.comment;
contentComment = doc.contents.comment;
}
const onChompKeep = contentComment ? undefined : () => (chompKeep = true);
let body = stringify$4.stringify(doc.contents, ctx, () => (contentComment = null), onChompKeep);
if (contentComment)
body += stringifyComment.lineComment(body, '', commentString(contentComment));
if ((body[0] === '|' || body[0] === '>') &&
lines[lines.length - 1] === '---') {
lines[lines.length - 1] = `--- ${body}`;
}
else
lines.push(body);
}
else {
lines.push(stringify$4.stringify(doc.contents, ctx));
}
if (doc.directives?.docEnd) {
if (doc.comment) {
const cs = commentString(doc.comment);
if (cs.includes('\n')) {
lines.push('...');
lines.push(stringifyComment.indentComment(cs, ''));
}
else {
lines.push(`... ${cs}`);
}
}
else {
lines.push('...');
}
}
else {
let dc = doc.comment;
if (dc && chompKeep)
dc = dc.replace(/^\n+/, '');
if (dc) {
if ((!chompKeep || contentComment) && lines[lines.length - 1] !== '')
lines.push('');
lines.push(stringifyComment.indentComment(commentString(dc), ''));
}
}
return lines.join('\n') + '\n';
}

stringifyDocument$2.stringifyDocument = stringifyDocument$1;

var applyReviver$2 = {};

function applyReviver$1(reviver, obj, key, val) {
if (val && typeof val === 'object') {
if (Array.isArray(val)) {
for (let i = 0, len = val.length; i < len; ++i) {
const v0 = val[i];
const v1 = applyReviver$1(reviver, val, String(i), v0);
if (v1 === undefined)
delete val[i];
else if (v1 !== v0)
val[i] = v1;
}
}
else if (val instanceof Map) {
for (const k of Array.from(val.keys())) {
const v0 = val.get(k);
const v1 = applyReviver$1(reviver, val, k, v0);
if (v1 === undefined)
val.delete(k);
else if (v1 !== v0)
val.set(k, v1);
}
}
else if (val instanceof Set) {
for (const v0 of Array.from(val)) {
const v1 = applyReviver$1(reviver, val, v0, v0);
if (v1 === undefined)
val.delete(v0);
else if (v1 !== v0) {
val.delete(v0);
val.add(v1);
}
}
}
else {
for (const [k, v0] of Object.entries(val)) {
const v1 = applyReviver$1(reviver, val, k, v0);
if (v1 === undefined)
delete val[k];
else if (v1 !== v0)
val[k] = v1;
}
}
}
return reviver.call(obj, key, val);
}

applyReviver$2.applyReviver = applyReviver$1;

var Alias$2 = Alias$5;
var Collection = Collection$5;
var Node$6 = Node$t;
var Pair$3 = Pair$9;
var toJS = toJS$6;
var Schema$1 = Schema$3;
var stringify$3 = stringify$9;
var stringifyDocument = stringifyDocument$2;
var anchors = anchors$3;
var applyReviver = applyReviver$2;
var createNode = createNode$5;
var directives$1 = directives$2;

class Document$4 {
constructor(value, replacer, options) {
this.commentBefore = null;
this.comment = null;
this.errors = [];
this.warnings = [];
Object.defineProperty(this, Node$6.NODE_TYPE, { value: Node$6.DOC });
let _replacer = null;
if (typeof replacer === 'function' || Array.isArray(replacer)) {
_replacer = replacer;
}
else if (options === undefined && replacer) {
options = replacer;
replacer = undefined;
}
const opt = Object.assign({
intAsBigInt: false,
keepSourceTokens: false,
logLevel: 'warn',
prettyErrors: true,
strict: true,
uniqueKeys: true,
version: '1.2'
}, options);
this.options = opt;
let { version } = opt;
if (options?._directives) {
this.directives = options._directives.atDocument();
if (this.directives.yaml.explicit)
version = this.directives.yaml.version;
}
else
this.directives = new directives$1.Directives({ version });
this.setSchema(version, options);
if (value === undefined)
this.contents = null;
else {
this.contents = this.createNode(value, _replacer, options);
}
}
clone() {
const copy = Object.create(Document$4.prototype, {
[Node$6.NODE_TYPE]: { value: Node$6.DOC }
});
copy.commentBefore = this.commentBefore;
copy.comment = this.comment;
copy.errors = this.errors.slice();
copy.warnings = this.warnings.slice();
copy.options = Object.assign({}, this.options);
if (this.directives)
copy.directives = this.directives.clone();
copy.schema = this.schema.clone();
copy.contents = Node$6.isNode(this.contents)
? this.contents.clone(copy.schema)
: this.contents;
if (this.range)
copy.range = this.range.slice();
return copy;
}
add(value) {
if (assertCollection(this.contents))
this.contents.add(value);
}
addIn(path, value) {
if (assertCollection(this.contents))
this.contents.addIn(path, value);
}
createAlias(node, name) {
if (!node.anchor) {
const prev = anchors.anchorNames(this);
node.anchor =
!name || prev.has(name) ? anchors.findNewAnchor(name || 'a', prev) : name;
}
return new Alias$2.Alias(node.anchor);
}
createNode(value, replacer, options) {
let _replacer = undefined;
if (typeof replacer === 'function') {
value = replacer.call({ '': value }, '', value);
_replacer = replacer;
}
else if (Array.isArray(replacer)) {
const keyToStr = (v) => typeof v === 'number' || v instanceof String || v instanceof Number;
const asStr = replacer.filter(keyToStr).map(String);
if (asStr.length > 0)
replacer = replacer.concat(asStr);
_replacer = replacer;
}
else if (options === undefined && replacer) {
options = replacer;
replacer = undefined;
}
const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(this, 
anchorPrefix || 'a');
const ctx = {
aliasDuplicateObjects: aliasDuplicateObjects ?? true,
keepUndefined: keepUndefined ?? false,
onAnchor,
onTagObj,
replacer: _replacer,
schema: this.schema,
sourceObjects
};
const node = createNode.createNode(value, tag, ctx);
if (flow && Node$6.isCollection(node))
node.flow = true;
setAnchors();
return node;
}
createPair(key, value, options = {}) {
const k = this.createNode(key, null, options);
const v = this.createNode(value, null, options);
return new Pair$3.Pair(k, v);
}
delete(key) {
return assertCollection(this.contents) ? this.contents.delete(key) : false;
}
deleteIn(path) {
if (Collection.isEmptyPath(path)) {
if (this.contents == null)
return false;
this.contents = null;
return true;
}
return assertCollection(this.contents)
? this.contents.deleteIn(path)
: false;
}
get(key, keepScalar) {
return Node$6.isCollection(this.contents)
? this.contents.get(key, keepScalar)
: undefined;
}
getIn(path, keepScalar) {
if (Collection.isEmptyPath(path))
return !keepScalar && Node$6.isScalar(this.contents)
? this.contents.value
: this.contents;
return Node$6.isCollection(this.contents)
? this.contents.getIn(path, keepScalar)
: undefined;
}
has(key) {
return Node$6.isCollection(this.contents) ? this.contents.has(key) : false;
}
hasIn(path) {
if (Collection.isEmptyPath(path))
return this.contents !== undefined;
return Node$6.isCollection(this.contents) ? this.contents.hasIn(path) : false;
}
set(key, value) {
if (this.contents == null) {
this.contents = Collection.collectionFromPath(this.schema, [key], value);
}
else if (assertCollection(this.contents)) {
this.contents.set(key, value);
}
}
setIn(path, value) {
if (Collection.isEmptyPath(path))
this.contents = value;
else if (this.contents == null) {
this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
}
else if (assertCollection(this.contents)) {
this.contents.setIn(path, value);
}
}
setSchema(version, options = {}) {
if (typeof version === 'number')
version = String(version);
let opt;
switch (version) {
case '1.1':
if (this.directives)
this.directives.yaml.version = '1.1';
else
this.directives = new directives$1.Directives({ version: '1.1' });
opt = { merge: true, resolveKnownTags: false, schema: 'yaml-1.1' };
break;
case '1.2':
case 'next':
if (this.directives)
this.directives.yaml.version = version;
else
this.directives = new directives$1.Directives({ version });
opt = { merge: false, resolveKnownTags: true, schema: 'core' };
break;
case null:
if (this.directives)
delete this.directives;
opt = null;
break;
default: {
const sv = JSON.stringify(version);
throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
}
}
if (options.schema instanceof Object)
this.schema = options.schema;
else if (opt)
this.schema = new Schema$1.Schema(Object.assign(opt, options));
else
throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
}
toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
const ctx = {
anchors: new Map(),
doc: this,
keep: !json,
mapAsMap: mapAsMap === true,
mapKeyWarned: false,
maxAliasCount: typeof maxAliasCount === 'number' ? maxAliasCount : 100,
stringify: stringify$3.stringify
};
const res = toJS.toJS(this.contents, jsonArg ?? '', ctx);
if (typeof onAnchor === 'function')
for (const { count, res } of ctx.anchors.values())
onAnchor(res, count);
return typeof reviver === 'function'
? applyReviver.applyReviver(reviver, { '': res }, '', res)
: res;
}
toJSON(jsonArg, onAnchor) {
return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
}
toString(options = {}) {
if (this.errors.length > 0)
throw new Error('Document with errors cannot be stringified');
if ('indent' in options &&
(!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
const s = JSON.stringify(options.indent);
throw new Error(`"indent" option must be a positive integer, not ${s}`);
}
return stringifyDocument.stringifyDocument(this, options);
}
}
function assertCollection(contents) {
if (Node$6.isCollection(contents))
return true;
throw new Error('Expected a YAML collection as document contents');
}

Document$5.Document = Document$4;

var errors$4 = {};

class YAMLError$1 extends Error {
constructor(name, pos, code, message) {
super();
this.name = name;
this.code = code;
this.message = message;
this.pos = pos;
}
}
class YAMLParseError$1 extends YAMLError$1 {
constructor(pos, code, message) {
super('YAMLParseError', pos, code, message);
}
}
class YAMLWarning$1 extends YAMLError$1 {
constructor(pos, code, message) {
super('YAMLWarning', pos, code, message);
}
}
const prettifyError = (src, lc) => (error) => {
if (error.pos[0] === -1)
return;
error.linePos = error.pos.map(pos => lc.linePos(pos));
const { line, col } = error.linePos[0];
error.message += ` at line ${line}, column ${col}`;
let ci = col - 1;
let lineStr = src
.substring(lc.lineStarts[line - 1], lc.lineStarts[line])
.replace(/[\n\r]+$/, '');
if (ci >= 60 && lineStr.length > 80) {
const trimStart = Math.min(ci - 39, lineStr.length - 79);
lineStr = '…' + lineStr.substring(trimStart);
ci -= trimStart - 1;
}
if (lineStr.length > 80)
lineStr = lineStr.substring(0, 79) + '…';
if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
if (prev.length > 80)
prev = prev.substring(0, 79) + '…\n';
lineStr = prev + lineStr;
}
if (/[^ ]/.test(lineStr)) {
let count = 1;
const end = error.linePos[1];
if (end && end.line === line && end.col > col) {
count = Math.min(end.col - col, 80 - ci);
}
const pointer = ' '.repeat(ci) + '^'.repeat(count);
error.message += `:\n\n${lineStr}\n${pointer}\n`;
}
};

errors$4.YAMLError = YAMLError$1;
errors$4.YAMLParseError = YAMLParseError$1;
errors$4.YAMLWarning = YAMLWarning$1;
errors$4.prettifyError = prettifyError;

var composeDoc$2 = {};

var composeNode$2 = {};

var composeCollection$2 = {};

var resolveBlockMap$2 = {};

var resolveProps$5 = {};

function resolveProps$4(tokens, { flow, indicator, next, offset, onError, startOnNewline }) {
let spaceBefore = false;
let atNewline = startOnNewline;
let hasSpace = startOnNewline;
let comment = '';
let commentSep = '';
let hasNewline = false;
let hasNewlineAfterProp = false;
let reqSpace = false;
let anchor = null;
let tag = null;
let comma = null;
let found = null;
let start = null;
for (const token of tokens) {
if (reqSpace) {
if (token.type !== 'space' &&
token.type !== 'newline' &&
token.type !== 'comma')
onError(token.offset, 'MISSING_CHAR', 'Tags and anchors must be separated from the next token by white space');
reqSpace = false;
}
switch (token.type) {
case 'space':
if (!flow &&
atNewline &&
indicator !== 'doc-start' &&
token.source[0] === '\t')
onError(token, 'TAB_AS_INDENT', 'Tabs are not allowed as indentation');
hasSpace = true;
break;
case 'comment': {
if (!hasSpace)
onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
const cb = token.source.substring(1) || ' ';
if (!comment)
comment = cb;
else
comment += commentSep + cb;
commentSep = '';
atNewline = false;
break;
}
case 'newline':
if (atNewline) {
if (comment)
comment += token.source;
else
spaceBefore = true;
}
else
commentSep += token.source;
atNewline = true;
hasNewline = true;
if (anchor || tag)
hasNewlineAfterProp = true;
hasSpace = true;
break;
case 'anchor':
if (anchor)
onError(token, 'MULTIPLE_ANCHORS', 'A node can have at most one anchor');
if (token.source.endsWith(':'))
onError(token.offset + token.source.length - 1, 'BAD_ALIAS', 'Anchor ending in : is ambiguous', true);
anchor = token;
if (start === null)
start = token.offset;
atNewline = false;
hasSpace = false;
reqSpace = true;
break;
case 'tag': {
if (tag)
onError(token, 'MULTIPLE_TAGS', 'A node can have at most one tag');
tag = token;
if (start === null)
start = token.offset;
atNewline = false;
hasSpace = false;
reqSpace = true;
break;
}
case indicator:
if (anchor || tag)
onError(token, 'BAD_PROP_ORDER', `Anchors and tags must be after the ${token.source} indicator`);
if (found)
onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${token.source} in ${flow ?? 'collection'}`);
found = token;
atNewline = false;
hasSpace = false;
break;
case 'comma':
if (flow) {
if (comma)
onError(token, 'UNEXPECTED_TOKEN', `Unexpected , in ${flow}`);
comma = token;
atNewline = false;
hasSpace = false;
break;
}
default:
onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${token.type} token`);
atNewline = false;
hasSpace = false;
}
}
const last = tokens[tokens.length - 1];
const end = last ? last.offset + last.source.length : offset;
if (reqSpace &&
next &&
next.type !== 'space' &&
next.type !== 'newline' &&
next.type !== 'comma' &&
(next.type !== 'scalar' || next.source !== ''))
onError(next.offset, 'MISSING_CHAR', 'Tags and anchors must be separated from the next token by white space');
return {
comma,
found,
spaceBefore,
comment,
hasNewline,
hasNewlineAfterProp,
anchor,
tag,
end,
start: start ?? end
};
}

resolveProps$5.resolveProps = resolveProps$4;

var utilContainsNewline$3 = {};

function containsNewline(key) {
if (!key)
return null;
switch (key.type) {
case 'alias':
case 'scalar':
case 'double-quoted-scalar':
case 'single-quoted-scalar':
if (key.source.includes('\n'))
return true;
if (key.end)
for (const st of key.end)
if (st.type === 'newline')
return true;
return false;
case 'flow-collection':
for (const it of key.items) {
for (const st of it.start)
if (st.type === 'newline')
return true;
if (it.sep)
for (const st of it.sep)
if (st.type === 'newline')
return true;
if (containsNewline(it.key) || containsNewline(it.value))
return true;
}
return false;
default:
return true;
}
}

utilContainsNewline$3.containsNewline = containsNewline;

var utilFlowIndentCheck$2 = {};

var utilContainsNewline$2 = utilContainsNewline$3;

function flowIndentCheck(indent, fc, onError) {
if (fc?.type === 'flow-collection') {
const end = fc.end[0];
if (end.indent === indent &&
(end.source === ']' || end.source === '}') &&
utilContainsNewline$2.containsNewline(fc)) {
const msg = 'Flow end indicator should be more indented than parent';
onError(end, 'BAD_INDENT', msg, true);
}
}
}

utilFlowIndentCheck$2.flowIndentCheck = flowIndentCheck;

var utilMapIncludes$2 = {};

var Node$5 = Node$t;

function mapIncludes(ctx, items, search) {
const { uniqueKeys } = ctx.options;
if (uniqueKeys === false)
return false;
const isEqual = typeof uniqueKeys === 'function'
? uniqueKeys
: (a, b) => a === b ||
(Node$5.isScalar(a) &&
Node$5.isScalar(b) &&
a.value === b.value &&
!(a.value === '<<' && ctx.schema.merge));
return items.some(pair => isEqual(pair.key, search));
}

utilMapIncludes$2.mapIncludes = mapIncludes;

var Pair$2 = Pair$9;
var YAMLMap$2 = YAMLMap$7;
var resolveProps$3 = resolveProps$5;
var utilContainsNewline$1 = utilContainsNewline$3;
var utilFlowIndentCheck$1 = utilFlowIndentCheck$2;
var utilMapIncludes$1 = utilMapIncludes$2;

const startColMsg = 'All mapping items must start at the same column';
function resolveBlockMap$1({ composeNode, composeEmptyNode }, ctx, bm, onError) {
const map = new YAMLMap$2.YAMLMap(ctx.schema);
if (ctx.atRoot)
ctx.atRoot = false;
let offset = bm.offset;
let commentEnd = null;
for (const collItem of bm.items) {
const { start, key, sep, value } = collItem;
const keyProps = resolveProps$3.resolveProps(start, {
indicator: 'explicit-key-ind',
next: key ?? sep?.[0],
offset,
onError,
startOnNewline: true
});
const implicitKey = !keyProps.found;
if (implicitKey) {
if (key) {
if (key.type === 'block-seq')
onError(offset, 'BLOCK_AS_IMPLICIT_KEY', 'A block sequence may not be used as an implicit map key');
else if ('indent' in key && key.indent !== bm.indent)
onError(offset, 'BAD_INDENT', startColMsg);
}
if (!keyProps.anchor && !keyProps.tag && !sep) {
commentEnd = keyProps.end;
if (keyProps.comment) {
if (map.comment)
map.comment += '\n' + keyProps.comment;
else
map.comment = keyProps.comment;
}
continue;
}
if (keyProps.hasNewlineAfterProp || utilContainsNewline$1.containsNewline(key)) {
onError(key ?? start[start.length - 1], 'MULTILINE_IMPLICIT_KEY', 'Implicit keys need to be on a single line');
}
}
else if (keyProps.found?.indent !== bm.indent) {
onError(offset, 'BAD_INDENT', startColMsg);
}
const keyStart = keyProps.end;
const keyNode = key
? composeNode(ctx, key, keyProps, onError)
: composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
if (ctx.schema.compat)
utilFlowIndentCheck$1.flowIndentCheck(bm.indent, key, onError);
if (utilMapIncludes$1.mapIncludes(ctx, map.items, keyNode))
onError(keyStart, 'DUPLICATE_KEY', 'Map keys must be unique');
const valueProps = resolveProps$3.resolveProps(sep ?? [], {
indicator: 'map-value-ind',
next: value,
offset: keyNode.range[2],
onError,
startOnNewline: !key || key.type === 'block-scalar'
});
offset = valueProps.end;
if (valueProps.found) {
if (implicitKey) {
if (value?.type === 'block-map' && !valueProps.hasNewline)
onError(offset, 'BLOCK_AS_IMPLICIT_KEY', 'Nested mappings are not allowed in compact mappings');
if (ctx.options.strict &&
keyProps.start < valueProps.found.offset - 1024)
onError(keyNode.range, 'KEY_OVER_1024_CHARS', 'The : indicator must be at most 1024 chars after the start of an implicit block mapping key');
}
const valueNode = value
? composeNode(ctx, value, valueProps, onError)
: composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
if (ctx.schema.compat)
utilFlowIndentCheck$1.flowIndentCheck(bm.indent, value, onError);
offset = valueNode.range[2];
const pair = new Pair$2.Pair(keyNode, valueNode);
if (ctx.options.keepSourceTokens)
pair.srcToken = collItem;
map.items.push(pair);
}
else {
if (implicitKey)
onError(keyNode.range, 'MISSING_CHAR', 'Implicit map keys need to be followed by map values');
if (valueProps.comment) {
if (keyNode.comment)
keyNode.comment += '\n' + valueProps.comment;
else
keyNode.comment = valueProps.comment;
}
const pair = new Pair$2.Pair(keyNode);
if (ctx.options.keepSourceTokens)
pair.srcToken = collItem;
map.items.push(pair);
}
}
if (commentEnd && commentEnd < offset)
onError(commentEnd, 'IMPOSSIBLE', 'Map comment with trailing content');
map.range = [bm.offset, offset, commentEnd ?? offset];
return map;
}

resolveBlockMap$2.resolveBlockMap = resolveBlockMap$1;

var resolveBlockSeq$2 = {};

var YAMLSeq$2 = YAMLSeq$7;
var resolveProps$2 = resolveProps$5;
var utilFlowIndentCheck = utilFlowIndentCheck$2;

function resolveBlockSeq$1({ composeNode, composeEmptyNode }, ctx, bs, onError) {
const seq = new YAMLSeq$2.YAMLSeq(ctx.schema);
if (ctx.atRoot)
ctx.atRoot = false;
let offset = bs.offset;
let commentEnd = null;
for (const { start, value } of bs.items) {
const props = resolveProps$2.resolveProps(start, {
indicator: 'seq-item-ind',
next: value,
offset,
onError,
startOnNewline: true
});
if (!props.found) {
if (props.anchor || props.tag || value) {
if (value && value.type === 'block-seq')
onError(props.end, 'BAD_INDENT', 'All sequence items must start at the same column');
else
onError(offset, 'MISSING_CHAR', 'Sequence item without - indicator');
}
else {
commentEnd = props.end;
if (props.comment)
seq.comment = props.comment;
continue;
}
}
const node = value
? composeNode(ctx, value, props, onError)
: composeEmptyNode(ctx, props.end, start, null, props, onError);
if (ctx.schema.compat)
utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
offset = node.range[2];
seq.items.push(node);
}
seq.range = [bs.offset, offset, commentEnd ?? offset];
return seq;
}

resolveBlockSeq$2.resolveBlockSeq = resolveBlockSeq$1;

var resolveFlowCollection$2 = {};

var resolveEnd$6 = {};

function resolveEnd$5(end, offset, reqSpace, onError) {
let comment = '';
if (end) {
let hasSpace = false;
let sep = '';
for (const token of end) {
const { source, type } = token;
switch (type) {
case 'space':
hasSpace = true;
break;
case 'comment': {
if (reqSpace && !hasSpace)
onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
const cb = source.substring(1) || ' ';
if (!comment)
comment = cb;
else
comment += sep + cb;
sep = '';
break;
}
case 'newline':
if (comment)
sep += source;
hasSpace = true;
break;
default:
onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${type} at node end`);
}
offset += source.length;
}
}
return { comment, offset };
}

resolveEnd$6.resolveEnd = resolveEnd$5;

var Node$4 = Node$t;
var Pair$1 = Pair$9;
var YAMLMap$1 = YAMLMap$7;
var YAMLSeq$1 = YAMLSeq$7;
var resolveEnd$4 = resolveEnd$6;
var resolveProps$1 = resolveProps$5;
var utilContainsNewline = utilContainsNewline$3;
var utilMapIncludes = utilMapIncludes$2;

const blockMsg = 'Block collections are not allowed within flow collections';
const isBlock = (token) => token && (token.type === 'block-map' || token.type === 'block-seq');
function resolveFlowCollection$1({ composeNode, composeEmptyNode }, ctx, fc, onError) {
const isMap = fc.start.source === '{';
const fcName = isMap ? 'flow map' : 'flow sequence';
const coll = isMap
? new YAMLMap$1.YAMLMap(ctx.schema)
: new YAMLSeq$1.YAMLSeq(ctx.schema);
coll.flow = true;
const atRoot = ctx.atRoot;
if (atRoot)
ctx.atRoot = false;
let offset = fc.offset + fc.start.source.length;
for (let i = 0; i < fc.items.length; ++i) {
const collItem = fc.items[i];
const { start, key, sep, value } = collItem;
const props = resolveProps$1.resolveProps(start, {
flow: fcName,
indicator: 'explicit-key-ind',
next: key ?? sep?.[0],
offset,
onError,
startOnNewline: false
});
if (!props.found) {
if (!props.anchor && !props.tag && !sep && !value) {
if (i === 0 && props.comma)
onError(props.comma, 'UNEXPECTED_TOKEN', `Unexpected , in ${fcName}`);
else if (i < fc.items.length - 1)
onError(props.start, 'UNEXPECTED_TOKEN', `Unexpected empty item in ${fcName}`);
if (props.comment) {
if (coll.comment)
coll.comment += '\n' + props.comment;
else
coll.comment = props.comment;
}
offset = props.end;
continue;
}
if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
onError(key,
'MULTILINE_IMPLICIT_KEY', 'Implicit keys of flow sequence pairs need to be on a single line');
}
if (i === 0) {
if (props.comma)
onError(props.comma, 'UNEXPECTED_TOKEN', `Unexpected , in ${fcName}`);
}
else {
if (!props.comma)
onError(props.start, 'MISSING_CHAR', `Missing , between ${fcName} items`);
if (props.comment) {
let prevItemComment = '';
loop: for (const st of start) {
switch (st.type) {
case 'comma':
case 'space':
break;
case 'comment':
prevItemComment = st.source.substring(1);
break loop;
default:
break loop;
}
}
if (prevItemComment) {
let prev = coll.items[coll.items.length - 1];
if (Node$4.isPair(prev))
prev = prev.value ?? prev.key;
if (prev.comment)
prev.comment += '\n' + prevItemComment;
else
prev.comment = prevItemComment;
props.comment = props.comment.substring(prevItemComment.length + 1);
}
}
}
if (!isMap && !sep && !props.found) {
const valueNode = value
? composeNode(ctx, value, props, onError)
: composeEmptyNode(ctx, props.end, sep, null, props, onError);
coll.items.push(valueNode);
offset = valueNode.range[2];
if (isBlock(value))
onError(valueNode.range, 'BLOCK_IN_FLOW', blockMsg);
}
else {
const keyStart = props.end;
const keyNode = key
? composeNode(ctx, key, props, onError)
: composeEmptyNode(ctx, keyStart, start, null, props, onError);
if (isBlock(key))
onError(keyNode.range, 'BLOCK_IN_FLOW', blockMsg);
const valueProps = resolveProps$1.resolveProps(sep ?? [], {
flow: fcName,
indicator: 'map-value-ind',
next: value,
offset: keyNode.range[2],
onError,
startOnNewline: false
});
if (valueProps.found) {
if (!isMap && !props.found && ctx.options.strict) {
if (sep)
for (const st of sep) {
if (st === valueProps.found)
break;
if (st.type === 'newline') {
onError(st, 'MULTILINE_IMPLICIT_KEY', 'Implicit keys of flow sequence pairs need to be on a single line');
break;
}
}
if (props.start < valueProps.found.offset - 1024)
onError(valueProps.found, 'KEY_OVER_1024_CHARS', 'The : indicator must be at most 1024 chars after the start of an implicit flow sequence key');
}
}
else if (value) {
if ('source' in value && value.source && value.source[0] === ':')
onError(value, 'MISSING_CHAR', `Missing space after : in ${fcName}`);
else
onError(valueProps.start, 'MISSING_CHAR', `Missing , or : between ${fcName} items`);
}
const valueNode = value
? composeNode(ctx, value, valueProps, onError)
: valueProps.found
? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError)
: null;
if (valueNode) {
if (isBlock(value))
onError(valueNode.range, 'BLOCK_IN_FLOW', blockMsg);
}
else if (valueProps.comment) {
if (keyNode.comment)
keyNode.comment += '\n' + valueProps.comment;
else
keyNode.comment = valueProps.comment;
}
const pair = new Pair$1.Pair(keyNode, valueNode);
if (ctx.options.keepSourceTokens)
pair.srcToken = collItem;
if (isMap) {
const map = coll;
if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
onError(keyStart, 'DUPLICATE_KEY', 'Map keys must be unique');
map.items.push(pair);
}
else {
const map = new YAMLMap$1.YAMLMap(ctx.schema);
map.flow = true;
map.items.push(pair);
coll.items.push(map);
}
offset = valueNode ? valueNode.range[2] : valueProps.end;
}
}
const expectedEnd = isMap ? '}' : ']';
const [ce, ...ee] = fc.end;
let cePos = offset;
if (ce && ce.source === expectedEnd)
cePos = ce.offset + ce.source.length;
else {
const name = fcName[0].toUpperCase() + fcName.substring(1);
const msg = atRoot
? `${name} must end with a ${expectedEnd}`
: `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
onError(offset, atRoot ? 'MISSING_CHAR' : 'BAD_INDENT', msg);
if (ce && ce.source.length !== 1)
ee.unshift(ce);
}
if (ee.length > 0) {
const end = resolveEnd$4.resolveEnd(ee, cePos, ctx.options.strict, onError);
if (end.comment) {
if (coll.comment)
coll.comment += '\n' + end.comment;
else
coll.comment = end.comment;
}
coll.range = [fc.offset, cePos, end.offset];
}
else {
coll.range = [fc.offset, cePos, cePos];
}
return coll;
}

resolveFlowCollection$2.resolveFlowCollection = resolveFlowCollection$1;

var Node$3 = Node$t;
var Scalar$4 = Scalar$k;
var resolveBlockMap = resolveBlockMap$2;
var resolveBlockSeq = resolveBlockSeq$2;
var resolveFlowCollection = resolveFlowCollection$2;

function composeCollection$1(CN, ctx, token, tagToken, onError) {
let coll;
switch (token.type) {
case 'block-map': {
coll = resolveBlockMap.resolveBlockMap(CN, ctx, token, onError);
break;
}
case 'block-seq': {
coll = resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError);
break;
}
case 'flow-collection': {
coll = resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError);
break;
}
}
if (!tagToken)
return coll;
const tagName = ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg));
if (!tagName)
return coll;
const Coll = coll.constructor;
if (tagName === '!' || tagName === Coll.tagName) {
coll.tag = Coll.tagName;
return coll;
}
const expType = Node$3.isMap(coll) ? 'map' : 'seq';
let tag = ctx.schema.tags.find(t => t.collection === expType && t.tag === tagName);
if (!tag) {
const kt = ctx.schema.knownTags[tagName];
if (kt && kt.collection === expType) {
ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
tag = kt;
}
else {
onError(tagToken, 'TAG_RESOLVE_FAILED', `Unresolved tag: ${tagName}`, true);
coll.tag = tagName;
return coll;
}
}
const res = tag.resolve(coll, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg), ctx.options);
const node = Node$3.isNode(res)
? res
: new Scalar$4.Scalar(res);
node.range = coll.range;
node.tag = tagName;
if (tag?.format)
node.format = tag.format;
return node;
}

composeCollection$2.composeCollection = composeCollection$1;

var composeScalar$2 = {};

var resolveBlockScalar$3 = {};

var Scalar$3 = Scalar$k;

function resolveBlockScalar$2(scalar, strict, onError) {
const start = scalar.offset;
const header = parseBlockScalarHeader(scalar, strict, onError);
if (!header)
return { value: '', type: null, comment: '', range: [start, start, start] };
const type = header.mode === '>' ? Scalar$3.Scalar.BLOCK_FOLDED : Scalar$3.Scalar.BLOCK_LITERAL;
const lines = scalar.source ? splitLines(scalar.source) : [];
let chompStart = lines.length;
for (let i = lines.length - 1; i >= 0; --i) {
const content = lines[i][1];
if (content === '' || content === '\r')
chompStart = i;
else
break;
}
if (chompStart === 0) {
const value = header.chomp === '+' && lines.length > 0
? '\n'.repeat(Math.max(1, lines.length - 1))
: '';
let end = start + header.length;
if (scalar.source)
end += scalar.source.length;
return { value, type, comment: header.comment, range: [start, end, end] };
}
let trimIndent = scalar.indent + header.indent;
let offset = scalar.offset + header.length;
let contentStart = 0;
for (let i = 0; i < chompStart; ++i) {
const [indent, content] = lines[i];
if (content === '' || content === '\r') {
if (header.indent === 0 && indent.length > trimIndent)
trimIndent = indent.length;
}
else {
if (indent.length < trimIndent) {
const message = 'Block scalars with more-indented leading empty lines must use an explicit indentation indicator';
onError(offset + indent.length, 'MISSING_CHAR', message);
}
if (header.indent === 0)
trimIndent = indent.length;
contentStart = i;
break;
}
offset += indent.length + content.length + 1;
}
for (let i = lines.length - 1; i >= chompStart; --i) {
if (lines[i][0].length > trimIndent)
chompStart = i + 1;
}
let value = '';
let sep = '';
let prevMoreIndented = false;
for (let i = 0; i < contentStart; ++i)
value += lines[i][0].slice(trimIndent) + '\n';
for (let i = contentStart; i < chompStart; ++i) {
let [indent, content] = lines[i];
offset += indent.length + content.length + 1;
const crlf = content[content.length - 1] === '\r';
if (crlf)
content = content.slice(0, -1);
if (content && indent.length < trimIndent) {
const src = header.indent
? 'explicit indentation indicator'
: 'first line';
const message = `Block scalar lines must not be less indented than their ${src}`;
onError(offset - content.length - (crlf ? 2 : 1), 'BAD_INDENT', message);
indent = '';
}
if (type === Scalar$3.Scalar.BLOCK_LITERAL) {
value += sep + indent.slice(trimIndent) + content;
sep = '\n';
}
else if (indent.length > trimIndent || content[0] === '\t') {
if (sep === ' ')
sep = '\n';
else if (!prevMoreIndented && sep === '\n')
sep = '\n\n';
value += sep + indent.slice(trimIndent) + content;
sep = '\n';
prevMoreIndented = true;
}
else if (content === '') {
if (sep === '\n')
value += '\n';
else
sep = '\n';
}
else {
value += sep + content;
sep = ' ';
prevMoreIndented = false;
}
}
switch (header.chomp) {
case '-':
break;
case '+':
for (let i = chompStart; i < lines.length; ++i)
value += '\n' + lines[i][0].slice(trimIndent);
if (value[value.length - 1] !== '\n')
value += '\n';
break;
default:
value += '\n';
}
const end = start + header.length + scalar.source.length;
return { value, type, comment: header.comment, range: [start, end, end] };
}
function parseBlockScalarHeader({ offset, props }, strict, onError) {
if (props[0].type !== 'block-scalar-header') {
onError(props[0], 'IMPOSSIBLE', 'Block scalar header not found');
return null;
}
const { source } = props[0];
const mode = source[0];
let indent = 0;
let chomp = '';
let error = -1;
for (let i = 1; i < source.length; ++i) {
const ch = source[i];
if (!chomp && (ch === '-' || ch === '+'))
chomp = ch;
else {
const n = Number(ch);
if (!indent && n)
indent = n;
else if (error === -1)
error = offset + i;
}
}
if (error !== -1)
onError(error, 'UNEXPECTED_TOKEN', `Block scalar header includes extra characters: ${source}`);
let hasSpace = false;
let comment = '';
let length = source.length;
for (let i = 1; i < props.length; ++i) {
const token = props[i];
switch (token.type) {
case 'space':
hasSpace = true;
case 'newline':
length += token.source.length;
break;
case 'comment':
if (strict && !hasSpace) {
const message = 'Comments must be separated from other tokens by white space characters';
onError(token, 'MISSING_CHAR', message);
}
length += token.source.length;
comment = token.source.substring(1);
break;
case 'error':
onError(token, 'UNEXPECTED_TOKEN', token.message);
length += token.source.length;
break;
default: {
const message = `Unexpected token in block scalar header: ${token.type}`;
onError(token, 'UNEXPECTED_TOKEN', message);
const ts = token.source;
if (ts && typeof ts === 'string')
length += ts.length;
}
}
}
return { mode, indent, chomp, comment, length };
}
function splitLines(source) {
const split = source.split(/\n( *)/);
const first = split[0];
const m = first.match(/^( *)/);
const line0 = m?.[1]
? [m[1], first.slice(m[1].length)]
: ['', first];
const lines = [line0];
for (let i = 1; i < split.length; i += 2)
lines.push([split[i], split[i + 1]]);
return lines;
}

resolveBlockScalar$3.resolveBlockScalar = resolveBlockScalar$2;

var resolveFlowScalar$3 = {};

var Scalar$2 = Scalar$k;
var resolveEnd$3 = resolveEnd$6;

function resolveFlowScalar$2(scalar, strict, onError) {
const { offset, type, source, end } = scalar;
let _type;
let value;
const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
switch (type) {
case 'scalar':
_type = Scalar$2.Scalar.PLAIN;
value = plainValue(source, _onError);
break;
case 'single-quoted-scalar':
_type = Scalar$2.Scalar.QUOTE_SINGLE;
value = singleQuotedValue(source, _onError);
break;
case 'double-quoted-scalar':
_type = Scalar$2.Scalar.QUOTE_DOUBLE;
value = doubleQuotedValue(source, _onError);
break;
default:
onError(scalar, 'UNEXPECTED_TOKEN', `Expected a flow scalar value, but found: ${type}`);
return {
value: '',
type: null,
comment: '',
range: [offset, offset + source.length, offset + source.length]
};
}
const valueEnd = offset + source.length;
const re = resolveEnd$3.resolveEnd(end, valueEnd, strict, onError);
return {
value,
type: _type,
comment: re.comment,
range: [offset, valueEnd, re.offset]
};
}
function plainValue(source, onError) {
let badChar = '';
switch (source[0]) {
case '\t':
badChar = 'a tab character';
break;
case ',':
badChar = 'flow indicator character ,';
break;
case '%':
badChar = 'directive indicator character %';
break;
case '|':
case '>': {
badChar = `block scalar indicator ${source[0]}`;
break;
}
case '@':
case '`': {
badChar = `reserved character ${source[0]}`;
break;
}
}
if (badChar)
onError(0, 'BAD_SCALAR_START', `Plain value cannot start with ${badChar}`);
return foldLines(source);
}
function singleQuotedValue(source, onError) {
if (source[source.length - 1] !== "'" || source.length === 1)
onError(source.length, 'MISSING_CHAR', "Missing closing 'quote");
return foldLines(source.slice(1, -1)).replace(/''/g, "'");
}
function foldLines(source) {
let first, line;
try {
first = new RegExp('(.*?)(?<![ \t])[ \t]*\r?\n', 'sy');
line = new RegExp('[ \t]*(.*?)(?:(?<![ \t])[ \t]*)?\r?\n', 'sy');
}
catch (_) {
first = /(.*?)[ \t]*\r?\n/sy;
line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
}
let match = first.exec(source);
if (!match)
return source;
let res = match[1];
let sep = ' ';
let pos = first.lastIndex;
line.lastIndex = pos;
while ((match = line.exec(source))) {
if (match[1] === '') {
if (sep === '\n')
res += sep;
else
sep = '\n';
}
else {
res += sep + match[1];
sep = ' ';
}
pos = line.lastIndex;
}
const last = /[ \t]*(.*)/sy;
last.lastIndex = pos;
match = last.exec(source);
return res + sep + (match?.[1] ?? '');
}
function doubleQuotedValue(source, onError) {
let res = '';
for (let i = 1; i < source.length - 1; ++i) {
const ch = source[i];
if (ch === '\r' && source[i + 1] === '\n')
continue;
if (ch === '\n') {
const { fold, offset } = foldNewline(source, i);
res += fold;
i = offset;
}
else if (ch === '\\') {
let next = source[++i];
const cc = escapeCodes[next];
if (cc)
res += cc;
else if (next === '\n') {
next = source[i + 1];
while (next === ' ' || next === '\t')
next = source[++i + 1];
}
else if (next === '\r' && source[i + 1] === '\n') {
next = source[++i + 1];
while (next === ' ' || next === '\t')
next = source[++i + 1];
}
else if (next === 'x' || next === 'u' || next === 'U') {
const length = { x: 2, u: 4, U: 8 }[next];
res += parseCharCode(source, i + 1, length, onError);
i += length;
}
else {
const raw = source.substr(i - 1, 2);
onError(i - 1, 'BAD_DQ_ESCAPE', `Invalid escape sequence ${raw}`);
res += raw;
}
}
else if (ch === ' ' || ch === '\t') {
const wsStart = i;
let next = source[i + 1];
while (next === ' ' || next === '\t')
next = source[++i + 1];
if (next !== '\n' && !(next === '\r' && source[i + 2] === '\n'))
res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
}
else {
res += ch;
}
}
if (source[source.length - 1] !== '"' || source.length === 1)
onError(source.length, 'MISSING_CHAR', 'Missing closing "quote');
return res;
}
function foldNewline(source, offset) {
let fold = '';
let ch = source[offset + 1];
while (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
if (ch === '\r' && source[offset + 2] !== '\n')
break;
if (ch === '\n')
fold += '\n';
offset += 1;
ch = source[offset + 1];
}
if (!fold)
fold = ' ';
return { fold, offset };
}
const escapeCodes = {
'0': '\0',
a: '\x07',
b: '\b',
e: '\x1b',
f: '\f',
n: '\n',
r: '\r',
t: '\t',
v: '\v',
N: '\u0085',
_: '\u00a0',
L: '\u2028',
P: '\u2029',
' ': ' ',
'"': '"',
'/': '/',
'\\': '\\',
'\t': '\t'
};
function parseCharCode(source, offset, length, onError) {
const cc = source.substr(offset, length);
const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
const code = ok ? parseInt(cc, 16) : NaN;
if (isNaN(code)) {
const raw = source.substr(offset - 2, length + 2);
onError(offset - 2, 'BAD_DQ_ESCAPE', `Invalid escape sequence ${raw}`);
return raw;
}
return String.fromCodePoint(code);
}

resolveFlowScalar$3.resolveFlowScalar = resolveFlowScalar$2;

var Node$2 = Node$t;
var Scalar$1 = Scalar$k;
var resolveBlockScalar$1 = resolveBlockScalar$3;
var resolveFlowScalar$1 = resolveFlowScalar$3;

function composeScalar$1(ctx, token, tagToken, onError) {
const { value, type, comment, range } = token.type === 'block-scalar'
? resolveBlockScalar$1.resolveBlockScalar(token, ctx.options.strict, onError)
: resolveFlowScalar$1.resolveFlowScalar(token, ctx.options.strict, onError);
const tagName = tagToken
? ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg))
: null;
const tag = tagToken && tagName
? findScalarTagByName(ctx.schema, value, tagName, tagToken, onError)
: token.type === 'scalar'
? findScalarTagByTest(ctx, value, token, onError)
: ctx.schema[Node$2.SCALAR];
let scalar;
try {
const res = tag.resolve(value, msg => onError(tagToken ?? token, 'TAG_RESOLVE_FAILED', msg), ctx.options);
scalar = Node$2.isScalar(res) ? res : new Scalar$1.Scalar(res);
}
catch (error) {
const msg = error instanceof Error ? error.message : String(error);
onError(tagToken ?? token, 'TAG_RESOLVE_FAILED', msg);
scalar = new Scalar$1.Scalar(value);
}
scalar.range = range;
scalar.source = value;
if (type)
scalar.type = type;
if (tagName)
scalar.tag = tagName;
if (tag.format)
scalar.format = tag.format;
if (comment)
scalar.comment = comment;
return scalar;
}
function findScalarTagByName(schema, value, tagName, tagToken, onError) {
if (tagName === '!')
return schema[Node$2.SCALAR];
const matchWithTest = [];
for (const tag of schema.tags) {
if (!tag.collection && tag.tag === tagName) {
if (tag.default && tag.test)
matchWithTest.push(tag);
else
return tag;
}
}
for (const tag of matchWithTest)
if (tag.test?.test(value))
return tag;
const kt = schema.knownTags[tagName];
if (kt && !kt.collection) {
schema.tags.push(Object.assign({}, kt, { default: false, test: undefined }));
return kt;
}
onError(tagToken, 'TAG_RESOLVE_FAILED', `Unresolved tag: ${tagName}`, tagName !== 'tag:yaml.org,2002:str');
return schema[Node$2.SCALAR];
}
function findScalarTagByTest({ directives, schema }, value, token, onError) {
const tag = schema.tags.find(tag => tag.default && tag.test?.test(value)) || schema[Node$2.SCALAR];
if (schema.compat) {
const compat = schema.compat.find(tag => tag.default && tag.test?.test(value)) ??
schema[Node$2.SCALAR];
if (tag.tag !== compat.tag) {
const ts = directives.tagString(tag.tag);
const cs = directives.tagString(compat.tag);
const msg = `Value may be parsed as either ${ts} or ${cs}`;
onError(token, 'TAG_RESOLVE_FAILED', msg, true);
}
}
return tag;
}

composeScalar$2.composeScalar = composeScalar$1;

var utilEmptyScalarPosition$1 = {};

function emptyScalarPosition(offset, before, pos) {
if (before) {
if (pos === null)
pos = before.length;
for (let i = pos - 1; i >= 0; --i) {
let st = before[i];
switch (st.type) {
case 'space':
case 'comment':
case 'newline':
offset -= st.source.length;
continue;
}
st = before[++i];
while (st?.type === 'space') {
offset += st.source.length;
st = before[++i];
}
break;
}
}
return offset;
}

utilEmptyScalarPosition$1.emptyScalarPosition = emptyScalarPosition;

var Alias$1 = Alias$5;
var composeCollection = composeCollection$2;
var composeScalar = composeScalar$2;
var resolveEnd$2 = resolveEnd$6;
var utilEmptyScalarPosition = utilEmptyScalarPosition$1;

const CN = { composeNode: composeNode$1, composeEmptyNode };
function composeNode$1(ctx, token, props, onError) {
const { spaceBefore, comment, anchor, tag } = props;
let node;
let isSrcToken = true;
switch (token.type) {
case 'alias':
node = composeAlias(ctx, token, onError);
if (anchor || tag)
onError(token, 'ALIAS_PROPS', 'An alias node must not specify any properties');
break;
case 'scalar':
case 'single-quoted-scalar':
case 'double-quoted-scalar':
case 'block-scalar':
node = composeScalar.composeScalar(ctx, token, tag, onError);
if (anchor)
node.anchor = anchor.source.substring(1);
break;
case 'block-map':
case 'block-seq':
case 'flow-collection':
node = composeCollection.composeCollection(CN, ctx, token, tag, onError);
if (anchor)
node.anchor = anchor.source.substring(1);
break;
default: {
const message = token.type === 'error'
? token.message
: `Unsupported token (type: ${token.type})`;
onError(token, 'UNEXPECTED_TOKEN', message);
node = composeEmptyNode(ctx, token.offset, undefined, null, props, onError);
isSrcToken = false;
}
}
if (anchor && node.anchor === '')
onError(anchor, 'BAD_ALIAS', 'Anchor cannot be an empty string');
if (spaceBefore)
node.spaceBefore = true;
if (comment) {
if (token.type === 'scalar' && token.source === '')
node.comment = comment;
else
node.commentBefore = comment;
}
if (ctx.options.keepSourceTokens && isSrcToken)
node.srcToken = token;
return node;
}
function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
const token = {
type: 'scalar',
offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
indent: -1,
source: ''
};
const node = composeScalar.composeScalar(ctx, token, tag, onError);
if (anchor) {
node.anchor = anchor.source.substring(1);
if (node.anchor === '')
onError(anchor, 'BAD_ALIAS', 'Anchor cannot be an empty string');
}
if (spaceBefore)
node.spaceBefore = true;
if (comment) {
node.comment = comment;
node.range[2] = end;
}
return node;
}
function composeAlias({ options }, { offset, source, end }, onError) {
const alias = new Alias$1.Alias(source.substring(1));
if (alias.source === '')
onError(offset, 'BAD_ALIAS', 'Alias cannot be an empty string');
if (alias.source.endsWith(':'))
onError(offset + source.length - 1, 'BAD_ALIAS', 'Alias ending in : is ambiguous', true);
const valueEnd = offset + source.length;
const re = resolveEnd$2.resolveEnd(end, valueEnd, options.strict, onError);
alias.range = [offset, valueEnd, re.offset];
if (re.comment)
alias.comment = re.comment;
return alias;
}

composeNode$2.composeEmptyNode = composeEmptyNode;
composeNode$2.composeNode = composeNode$1;

var Document$3 = Document$5;
var composeNode = composeNode$2;
var resolveEnd$1 = resolveEnd$6;
var resolveProps = resolveProps$5;

function composeDoc$1(options, directives, { offset, start, value, end }, onError) {
const opts = Object.assign({ _directives: directives }, options);
const doc = new Document$3.Document(undefined, opts);
const ctx = {
atRoot: true,
directives: doc.directives,
options: doc.options,
schema: doc.schema
};
const props = resolveProps.resolveProps(start, {
indicator: 'doc-start',
next: value ?? end?.[0],
offset,
onError,
startOnNewline: true
});
if (props.found) {
doc.directives.docStart = true;
if (value &&
(value.type === 'block-map' || value.type === 'block-seq') &&
!props.hasNewline)
onError(props.end, 'MISSING_CHAR', 'Block collection cannot start on same line with directives-end marker');
}
doc.contents = value
? composeNode.composeNode(ctx, value, props, onError)
: composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
const contentEnd = doc.contents.range[2];
const re = resolveEnd$1.resolveEnd(end, contentEnd, false, onError);
if (re.comment)
doc.comment = re.comment;
doc.range = [offset, contentEnd, re.offset];
return doc;
}

composeDoc$2.composeDoc = composeDoc$1;

var directives = directives$2;
var Document$2 = Document$5;
var errors$3 = errors$4;
var Node$1 = Node$t;
var composeDoc = composeDoc$2;
var resolveEnd = resolveEnd$6;

function getErrorPos(src) {
if (typeof src === 'number')
return [src, src + 1];
if (Array.isArray(src))
return src.length === 2 ? src : [src[0], src[1]];
const { offset, source } = src;
return [offset, offset + (typeof source === 'string' ? source.length : 1)];
}
function parsePrelude(prelude) {
let comment = '';
let atComment = false;
let afterEmptyLine = false;
for (let i = 0; i < prelude.length; ++i) {
const source = prelude[i];
switch (source[0]) {
case '#':
comment +=
(comment === '' ? '' : afterEmptyLine ? '\n\n' : '\n') +
(source.substring(1) || ' ');
atComment = true;
afterEmptyLine = false;
break;
case '%':
if (prelude[i + 1]?.[0] !== '#')
i += 1;
atComment = false;
break;
default:
if (!atComment)
afterEmptyLine = true;
atComment = false;
}
}
return { comment, afterEmptyLine };
}
class Composer$1 {
constructor(options = {}) {
this.doc = null;
this.atDirectives = false;
this.prelude = [];
this.errors = [];
this.warnings = [];
this.onError = (source, code, message, warning) => {
const pos = getErrorPos(source);
if (warning)
this.warnings.push(new errors$3.YAMLWarning(pos, code, message));
else
this.errors.push(new errors$3.YAMLParseError(pos, code, message));
};
this.directives = new directives.Directives({ version: options.version || '1.2' });
this.options = options;
}
decorate(doc, afterDoc) {
const { comment, afterEmptyLine } = parsePrelude(this.prelude);
if (comment) {
const dc = doc.contents;
if (afterDoc) {
doc.comment = doc.comment ? `${doc.comment}\n${comment}` : comment;
}
else if (afterEmptyLine || doc.directives.docStart || !dc) {
doc.commentBefore = comment;
}
else if (Node$1.isCollection(dc) && !dc.flow && dc.items.length > 0) {
let it = dc.items[0];
if (Node$1.isPair(it))
it = it.key;
const cb = it.commentBefore;
it.commentBefore = cb ? `${comment}\n${cb}` : comment;
}
else {
const cb = dc.commentBefore;
dc.commentBefore = cb ? `${comment}\n${cb}` : comment;
}
}
if (afterDoc) {
Array.prototype.push.apply(doc.errors, this.errors);
Array.prototype.push.apply(doc.warnings, this.warnings);
}
else {
doc.errors = this.errors;
doc.warnings = this.warnings;
}
this.prelude = [];
this.errors = [];
this.warnings = [];
}
streamInfo() {
return {
comment: parsePrelude(this.prelude).comment,
directives: this.directives,
errors: this.errors,
warnings: this.warnings
};
}
*compose(tokens, forceDoc = false, endOffset = -1) {
for (const token of tokens)
yield* this.next(token);
yield* this.end(forceDoc, endOffset);
}
*next(token) {
if (process.env.LOG_STREAM)
console.dir(token, { depth: null });
switch (token.type) {
case 'directive':
this.directives.add(token.source, (offset, message, warning) => {
const pos = getErrorPos(token);
pos[0] += offset;
this.onError(pos, 'BAD_DIRECTIVE', message, warning);
});
this.prelude.push(token.source);
this.atDirectives = true;
break;
case 'document': {
const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
if (this.atDirectives && !doc.directives.docStart)
this.onError(token, 'MISSING_CHAR', 'Missing directives-end/doc-start indicator line');
this.decorate(doc, false);
if (this.doc)
yield this.doc;
this.doc = doc;
this.atDirectives = false;
break;
}
case 'byte-order-mark':
case 'space':
break;
case 'comment':
case 'newline':
this.prelude.push(token.source);
break;
case 'error': {
const msg = token.source
? `${token.message}: ${JSON.stringify(token.source)}`
: token.message;
const error = new errors$3.YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', msg);
if (this.atDirectives || !this.doc)
this.errors.push(error);
else
this.doc.errors.push(error);
break;
}
case 'doc-end': {
if (!this.doc) {
const msg = 'Unexpected doc-end without preceding document';
this.errors.push(new errors$3.YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', msg));
break;
}
this.doc.directives.docEnd = true;
const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
this.decorate(this.doc, true);
if (end.comment) {
const dc = this.doc.comment;
this.doc.comment = dc ? `${dc}\n${end.comment}` : end.comment;
}
this.doc.range[2] = end.offset;
break;
}
default:
this.errors.push(new errors$3.YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', `Unsupported token ${token.type}`));
}
}
*end(forceDoc = false, endOffset = -1) {
if (this.doc) {
this.decorate(this.doc, true);
yield this.doc;
this.doc = null;
}
else if (forceDoc) {
const opts = Object.assign({ _directives: this.directives }, this.options);
const doc = new Document$2.Document(undefined, opts);
if (this.atDirectives)
this.onError(endOffset, 'MISSING_CHAR', 'Missing directives-end indicator line');
doc.range = [0, endOffset, endOffset];
this.decorate(doc, false);
yield doc;
}
}
}

composer$2.Composer = Composer$1;

var cst$3 = {};

var cstScalar$1 = {};

var resolveBlockScalar = resolveBlockScalar$3;
var resolveFlowScalar = resolveFlowScalar$3;
var errors$2 = errors$4;
var stringifyString = stringifyString$5;

function resolveAsScalar(token, strict = true, onError) {
if (token) {
const _onError = (pos, code, message) => {
const offset = typeof pos === 'number' ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
if (onError)
onError(offset, code, message);
else
throw new errors$2.YAMLParseError([offset, offset + 1], code, message);
};
switch (token.type) {
case 'scalar':
case 'single-quoted-scalar':
case 'double-quoted-scalar':
return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
case 'block-scalar':
return resolveBlockScalar.resolveBlockScalar(token, strict, _onError);
}
}
return null;
}
function createScalarToken(value, context) {
const { implicitKey = false, indent, inFlow = false, offset = -1, type = 'PLAIN' } = context;
const source = stringifyString.stringifyString({ type, value }, {
implicitKey,
indent: indent > 0 ? ' '.repeat(indent) : '',
inFlow,
options: { blockQuote: true, lineWidth: -1 }
});
const end = context.end ?? [
{ type: 'newline', offset: -1, indent, source: '\n' }
];
switch (source[0]) {
case '|':
case '>': {
const he = source.indexOf('\n');
const head = source.substring(0, he);
const body = source.substring(he + 1) + '\n';
const props = [
{ type: 'block-scalar-header', offset, indent, source: head }
];
if (!addEndtoBlockProps(props, end))
props.push({ type: 'newline', offset: -1, indent, source: '\n' });
return { type: 'block-scalar', offset, indent, props, source: body };
}
case '"':
return { type: 'double-quoted-scalar', offset, indent, source, end };
case "'":
return { type: 'single-quoted-scalar', offset, indent, source, end };
default:
return { type: 'scalar', offset, indent, source, end };
}
}
function setScalarValue(token, value, context = {}) {
let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
let indent = 'indent' in token ? token.indent : null;
if (afterKey && typeof indent === 'number')
indent += 2;
if (!type)
switch (token.type) {
case 'single-quoted-scalar':
type = 'QUOTE_SINGLE';
break;
case 'double-quoted-scalar':
type = 'QUOTE_DOUBLE';
break;
case 'block-scalar': {
const header = token.props[0];
if (header.type !== 'block-scalar-header')
throw new Error('Invalid block scalar header');
type = header.source[0] === '>' ? 'BLOCK_FOLDED' : 'BLOCK_LITERAL';
break;
}
default:
type = 'PLAIN';
}
const source = stringifyString.stringifyString({ type, value }, {
implicitKey: implicitKey || indent === null,
indent: indent !== null && indent > 0 ? ' '.repeat(indent) : '',
inFlow,
options: { blockQuote: true, lineWidth: -1 }
});
switch (source[0]) {
case '|':
case '>':
setBlockScalarValue(token, source);
break;
case '"':
setFlowScalarValue(token, source, 'double-quoted-scalar');
break;
case "'":
setFlowScalarValue(token, source, 'single-quoted-scalar');
break;
default:
setFlowScalarValue(token, source, 'scalar');
}
}
function setBlockScalarValue(token, source) {
const he = source.indexOf('\n');
const head = source.substring(0, he);
const body = source.substring(he + 1) + '\n';
if (token.type === 'block-scalar') {
const header = token.props[0];
if (header.type !== 'block-scalar-header')
throw new Error('Invalid block scalar header');
header.source = head;
token.source = body;
}
else {
const { offset } = token;
const indent = 'indent' in token ? token.indent : -1;
const props = [
{ type: 'block-scalar-header', offset, indent, source: head }
];
if (!addEndtoBlockProps(props, 'end' in token ? token.end : undefined))
props.push({ type: 'newline', offset: -1, indent, source: '\n' });
for (const key of Object.keys(token))
if (key !== 'type' && key !== 'offset')
delete token[key];
Object.assign(token, { type: 'block-scalar', indent, props, source: body });
}
}
function addEndtoBlockProps(props, end) {
if (end)
for (const st of end)
switch (st.type) {
case 'space':
case 'comment':
props.push(st);
break;
case 'newline':
props.push(st);
return true;
}
return false;
}
function setFlowScalarValue(token, source, type) {
switch (token.type) {
case 'scalar':
case 'double-quoted-scalar':
case 'single-quoted-scalar':
token.type = type;
token.source = source;
break;
case 'block-scalar': {
const end = token.props.slice(1);
let oa = source.length;
if (token.props[0].type === 'block-scalar-header')
oa -= token.props[0].source.length;
for (const tok of end)
tok.offset += oa;
delete token.props;
Object.assign(token, { type, source, end });
break;
}
case 'block-map':
case 'block-seq': {
const offset = token.offset + source.length;
const nl = { type: 'newline', offset, indent: token.indent, source: '\n' };
delete token.items;
Object.assign(token, { type, source, end: [nl] });
break;
}
default: {
const indent = 'indent' in token ? token.indent : -1;
const end = 'end' in token && Array.isArray(token.end)
? token.end.filter(st => st.type === 'space' ||
st.type === 'comment' ||
st.type === 'newline')
: [];
for (const key of Object.keys(token))
if (key !== 'type' && key !== 'offset')
delete token[key];
Object.assign(token, { type, indent, source, end });
}
}
}

cstScalar$1.createScalarToken = createScalarToken;
cstScalar$1.resolveAsScalar = resolveAsScalar;
cstScalar$1.setScalarValue = setScalarValue;

var cstStringify$1 = {};

const stringify$2 = (cst) => 'type' in cst ? stringifyToken(cst) : stringifyItem(cst);
function stringifyToken(token) {
switch (token.type) {
case 'block-scalar': {
let res = '';
for (const tok of token.props)
res += stringifyToken(tok);
return res + token.source;
}
case 'block-map':
case 'block-seq': {
let res = '';
for (const item of token.items)
res += stringifyItem(item);
return res;
}
case 'flow-collection': {
let res = token.start.source;
for (const item of token.items)
res += stringifyItem(item);
for (const st of token.end)
res += st.source;
return res;
}
case 'document': {
let res = stringifyItem(token);
if (token.end)
for (const st of token.end)
res += st.source;
return res;
}
default: {
let res = token.source;
if ('end' in token && token.end)
for (const st of token.end)
res += st.source;
return res;
}
}
}
function stringifyItem({ start, key, sep, value }) {
let res = '';
for (const st of start)
res += st.source;
if (key)
res += stringifyToken(key);
if (sep)
for (const st of sep)
res += st.source;
if (value)
res += stringifyToken(value);
return res;
}

cstStringify$1.stringify = stringify$2;

var cstVisit$1 = {};

const BREAK = Symbol('break visit');
const SKIP = Symbol('skip children');
const REMOVE = Symbol('remove item');
function visit$1(cst, visitor) {
if ('type' in cst && cst.type === 'document')
cst = { start: cst.start, value: cst.value };
_visit(Object.freeze([]), cst, visitor);
}
visit$1.BREAK = BREAK;
visit$1.SKIP = SKIP;
visit$1.REMOVE = REMOVE;
visit$1.itemAtPath = (cst, path) => {
let item = cst;
for (const [field, index] of path) {
const tok = item?.[field];
if (tok && 'items' in tok) {
item = tok.items[index];
}
else
return undefined;
}
return item;
};
visit$1.parentCollection = (cst, path) => {
const parent = visit$1.itemAtPath(cst, path.slice(0, -1));
const field = path[path.length - 1][0];
const coll = parent?.[field];
if (coll && 'items' in coll)
return coll;
throw new Error('Parent collection not found');
};
function _visit(path, item, visitor) {
let ctrl = visitor(item, path);
if (typeof ctrl === 'symbol')
return ctrl;
for (const field of ['key', 'value']) {
const token = item[field];
if (token && 'items' in token) {
for (let i = 0; i < token.items.length; ++i) {
const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
if (typeof ci === 'number')
i = ci - 1;
else if (ci === BREAK)
return BREAK;
else if (ci === REMOVE) {
token.items.splice(i, 1);
i -= 1;
}
}
if (typeof ctrl === 'function' && field === 'key')
ctrl = ctrl(item, path);
}
}
return typeof ctrl === 'function' ? ctrl(item, path) : ctrl;
}

cstVisit$1.visit = visit$1;

var cstScalar = cstScalar$1;
var cstStringify = cstStringify$1;
var cstVisit = cstVisit$1;

const BOM = '\u{FEFF}';
const DOCUMENT = '\x02';
const FLOW_END = '\x18';
const SCALAR = '\x1f';
const isCollection$1 = (token) => !!token && 'items' in token;
const isScalar$1 = (token) => !!token &&
(token.type === 'scalar' ||
token.type === 'single-quoted-scalar' ||
token.type === 'double-quoted-scalar' ||
token.type === 'block-scalar');
function prettyToken(token) {
switch (token) {
case BOM:
return '<BOM>';
case DOCUMENT:
return '<DOC>';
case FLOW_END:
return '<FLOW_END>';
case SCALAR:
return '<SCALAR>';
default:
return JSON.stringify(token);
}
}
function tokenType(source) {
switch (source) {
case BOM:
return 'byte-order-mark';
case DOCUMENT:
return 'doc-mode';
case FLOW_END:
return 'flow-error-end';
case SCALAR:
return 'scalar';
case '---':
return 'doc-start';
case '...':
return 'doc-end';
case '':
case '\n':
case '\r\n':
return 'newline';
case '-':
return 'seq-item-ind';
case '?':
return 'explicit-key-ind';
case ':':
return 'map-value-ind';
case '{':
return 'flow-map-start';
case '}':
return 'flow-map-end';
case '[':
return 'flow-seq-start';
case ']':
return 'flow-seq-end';
case ',':
return 'comma';
}
switch (source[0]) {
case ' ':
case '\t':
return 'space';
case '#':
return 'comment';
case '%':
return 'directive-line';
case '*':
return 'alias';
case '&':
return 'anchor';
case '!':
return 'tag';
case "'":
return 'single-quoted-scalar';
case '"':
return 'double-quoted-scalar';
case '|':
case '>':
return 'block-scalar-header';
}
return null;
}

cst$3.createScalarToken = cstScalar.createScalarToken;
cst$3.resolveAsScalar = cstScalar.resolveAsScalar;
cst$3.setScalarValue = cstScalar.setScalarValue;
cst$3.stringify = cstStringify.stringify;
cst$3.visit = cstVisit.visit;
cst$3.BOM = BOM;
cst$3.DOCUMENT = DOCUMENT;
cst$3.FLOW_END = FLOW_END;
cst$3.SCALAR = SCALAR;
cst$3.isCollection = isCollection$1;
cst$3.isScalar = isScalar$1;
cst$3.prettyToken = prettyToken;
cst$3.tokenType = tokenType;

var lexer$2 = {};

var cst$2 = cst$3;

function isEmpty(ch) {
switch (ch) {
case undefined:
case ' ':
case '\n':
case '\r':
case '\t':
return true;
default:
return false;
}
}
const hexDigits = '0123456789ABCDEFabcdef'.split('');
const tagChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()".split('');
const invalidFlowScalarChars = ',[]{}'.split('');
const invalidAnchorChars = ' ,[]{}\n\r\t'.split('');
const isNotAnchorChar = (ch) => !ch || invalidAnchorChars.includes(ch);
class Lexer$1 {
constructor() {
this.atEnd = false;
this.blockScalarIndent = -1;
this.blockScalarKeep = false;
this.buffer = '';
this.flowKey = false;
this.flowLevel = 0;
this.indentNext = 0;
this.indentValue = 0;
this.lineEndPos = null;
this.next = null;
this.pos = 0;
}
*lex(source, incomplete = false) {
if (source) {
this.buffer = this.buffer ? this.buffer + source : source;
this.lineEndPos = null;
}
this.atEnd = !incomplete;
let next = this.next ?? 'stream';
while (next && (incomplete || this.hasChars(1)))
next = yield* this.parseNext(next);
}
atLineEnd() {
let i = this.pos;
let ch = this.buffer[i];
while (ch === ' ' || ch === '\t')
ch = this.buffer[++i];
if (!ch || ch === '#' || ch === '\n')
return true;
if (ch === '\r')
return this.buffer[i + 1] === '\n';
return false;
}
charAt(n) {
return this.buffer[this.pos + n];
}
continueScalar(offset) {
let ch = this.buffer[offset];
if (this.indentNext > 0) {
let indent = 0;
while (ch === ' ')
ch = this.buffer[++indent + offset];
if (ch === '\r') {
const next = this.buffer[indent + offset + 1];
if (next === '\n' || (!next && !this.atEnd))
return offset + indent + 1;
}
return ch === '\n' || indent >= this.indentNext || (!ch && !this.atEnd)
? offset + indent
: -1;
}
if (ch === '-' || ch === '.') {
const dt = this.buffer.substr(offset, 3);
if ((dt === '---' || dt === '...') && isEmpty(this.buffer[offset + 3]))
return -1;
}
return offset;
}
getLine() {
let end = this.lineEndPos;
if (typeof end !== 'number' || (end !== -1 && end < this.pos)) {
end = this.buffer.indexOf('\n', this.pos);
this.lineEndPos = end;
}
if (end === -1)
return this.atEnd ? this.buffer.substring(this.pos) : null;
if (this.buffer[end - 1] === '\r')
end -= 1;
return this.buffer.substring(this.pos, end);
}
hasChars(n) {
return this.pos + n <= this.buffer.length;
}
setNext(state) {
this.buffer = this.buffer.substring(this.pos);
this.pos = 0;
this.lineEndPos = null;
this.next = state;
return null;
}
peek(n) {
return this.buffer.substr(this.pos, n);
}
*parseNext(next) {
switch (next) {
case 'stream':
return yield* this.parseStream();
case 'line-start':
return yield* this.parseLineStart();
case 'block-start':
return yield* this.parseBlockStart();
case 'doc':
return yield* this.parseDocument();
case 'flow':
return yield* this.parseFlowCollection();
case 'quoted-scalar':
return yield* this.parseQuotedScalar();
case 'block-scalar':
return yield* this.parseBlockScalar();
case 'plain-scalar':
return yield* this.parsePlainScalar();
}
}
*parseStream() {
let line = this.getLine();
if (line === null)
return this.setNext('stream');
if (line[0] === cst$2.BOM) {
yield* this.pushCount(1);
line = line.substring(1);
}
if (line[0] === '%') {
let dirEnd = line.length;
const cs = line.indexOf('#');
if (cs !== -1) {
const ch = line[cs - 1];
if (ch === ' ' || ch === '\t')
dirEnd = cs - 1;
}
while (true) {
const ch = line[dirEnd - 1];
if (ch === ' ' || ch === '\t')
dirEnd -= 1;
else
break;
}
const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
yield* this.pushCount(line.length - n);
this.pushNewline();
return 'stream';
}
if (this.atLineEnd()) {
const sp = yield* this.pushSpaces(true);
yield* this.pushCount(line.length - sp);
yield* this.pushNewline();
return 'stream';
}
yield cst$2.DOCUMENT;
return yield* this.parseLineStart();
}
*parseLineStart() {
const ch = this.charAt(0);
if (!ch && !this.atEnd)
return this.setNext('line-start');
if (ch === '-' || ch === '.') {
if (!this.atEnd && !this.hasChars(4))
return this.setNext('line-start');
const s = this.peek(3);
if (s === '---' && isEmpty(this.charAt(3))) {
yield* this.pushCount(3);
this.indentValue = 0;
this.indentNext = 0;
return 'doc';
}
else if (s === '...' && isEmpty(this.charAt(3))) {
yield* this.pushCount(3);
return 'stream';
}
}
this.indentValue = yield* this.pushSpaces(false);
if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
this.indentNext = this.indentValue;
return yield* this.parseBlockStart();
}
*parseBlockStart() {
const [ch0, ch1] = this.peek(2);
if (!ch1 && !this.atEnd)
return this.setNext('block-start');
if ((ch0 === '-' || ch0 === '?' || ch0 === ':') && isEmpty(ch1)) {
const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
this.indentNext = this.indentValue + 1;
this.indentValue += n;
return yield* this.parseBlockStart();
}
return 'doc';
}
*parseDocument() {
yield* this.pushSpaces(true);
const line = this.getLine();
if (line === null)
return this.setNext('doc');
let n = yield* this.pushIndicators();
switch (line[n]) {
case '#':
yield* this.pushCount(line.length - n);
case undefined:
yield* this.pushNewline();
return yield* this.parseLineStart();
case '{':
case '[':
yield* this.pushCount(1);
this.flowKey = false;
this.flowLevel = 1;
return 'flow';
case '}':
case ']':
yield* this.pushCount(1);
return 'doc';
case '*':
yield* this.pushUntil(isNotAnchorChar);
return 'doc';
case '"':
case "'":
return yield* this.parseQuotedScalar();
case '|':
case '>':
n += yield* this.parseBlockScalarHeader();
n += yield* this.pushSpaces(true);
yield* this.pushCount(line.length - n);
yield* this.pushNewline();
return yield* this.parseBlockScalar();
default:
return yield* this.parsePlainScalar();
}
}
*parseFlowCollection() {
let nl, sp;
let indent = -1;
do {
nl = yield* this.pushNewline();
if (nl > 0) {
sp = yield* this.pushSpaces(false);
this.indentValue = indent = sp;
}
else {
sp = 0;
}
sp += yield* this.pushSpaces(true);
} while (nl + sp > 0);
const line = this.getLine();
if (line === null)
return this.setNext('flow');
if ((indent !== -1 && indent < this.indentNext && line[0] !== '#') ||
(indent === 0 &&
(line.startsWith('---') || line.startsWith('...')) &&
isEmpty(line[3]))) {
const atFlowEndMarker = indent === this.indentNext - 1 &&
this.flowLevel === 1 &&
(line[0] === ']' || line[0] === '}');
if (!atFlowEndMarker) {
this.flowLevel = 0;
yield cst$2.FLOW_END;
return yield* this.parseLineStart();
}
}
let n = 0;
while (line[n] === ',') {
n += yield* this.pushCount(1);
n += yield* this.pushSpaces(true);
this.flowKey = false;
}
n += yield* this.pushIndicators();
switch (line[n]) {
case undefined:
return 'flow';
case '#':
yield* this.pushCount(line.length - n);
return 'flow';
case '{':
case '[':
yield* this.pushCount(1);
this.flowKey = false;
this.flowLevel += 1;
return 'flow';
case '}':
case ']':
yield* this.pushCount(1);
this.flowKey = true;
this.flowLevel -= 1;
return this.flowLevel ? 'flow' : 'doc';
case '*':
yield* this.pushUntil(isNotAnchorChar);
return 'flow';
case '"':
case "'":
this.flowKey = true;
return yield* this.parseQuotedScalar();
case ':': {
const next = this.charAt(1);
if (this.flowKey || isEmpty(next) || next === ',') {
this.flowKey = false;
yield* this.pushCount(1);
yield* this.pushSpaces(true);
return 'flow';
}
}
default:
this.flowKey = false;
return yield* this.parsePlainScalar();
}
}
*parseQuotedScalar() {
const quote = this.charAt(0);
let end = this.buffer.indexOf(quote, this.pos + 1);
if (quote === "'") {
while (end !== -1 && this.buffer[end + 1] === "'")
end = this.buffer.indexOf("'", end + 2);
}
else {
while (end !== -1) {
let n = 0;
while (this.buffer[end - 1 - n] === '\\')
n += 1;
if (n % 2 === 0)
break;
end = this.buffer.indexOf('"', end + 1);
}
}
const qb = this.buffer.substring(0, end);
let nl = qb.indexOf('\n', this.pos);
if (nl !== -1) {
while (nl !== -1) {
const cs = this.continueScalar(nl + 1);
if (cs === -1)
break;
nl = qb.indexOf('\n', cs);
}
if (nl !== -1) {
end = nl - (qb[nl - 1] === '\r' ? 2 : 1);
}
}
if (end === -1) {
if (!this.atEnd)
return this.setNext('quoted-scalar');
end = this.buffer.length;
}
yield* this.pushToIndex(end + 1, false);
return this.flowLevel ? 'flow' : 'doc';
}
*parseBlockScalarHeader() {
this.blockScalarIndent = -1;
this.blockScalarKeep = false;
let i = this.pos;
while (true) {
const ch = this.buffer[++i];
if (ch === '+')
this.blockScalarKeep = true;
else if (ch > '0' && ch <= '9')
this.blockScalarIndent = Number(ch) - 1;
else if (ch !== '-')
break;
}
return yield* this.pushUntil(ch => isEmpty(ch) || ch === '#');
}
*parseBlockScalar() {
let nl = this.pos - 1;
let indent = 0;
let ch;
loop: for (let i = this.pos; (ch = this.buffer[i]); ++i) {
switch (ch) {
case ' ':
indent += 1;
break;
case '\n':
nl = i;
indent = 0;
break;
case '\r': {
const next = this.buffer[i + 1];
if (!next && !this.atEnd)
return this.setNext('block-scalar');
if (next === '\n')
break;
}
default:
break loop;
}
}
if (!ch && !this.atEnd)
return this.setNext('block-scalar');
if (indent >= this.indentNext) {
if (this.blockScalarIndent === -1)
this.indentNext = indent;
else
this.indentNext += this.blockScalarIndent;
do {
const cs = this.continueScalar(nl + 1);
if (cs === -1)
break;
nl = this.buffer.indexOf('\n', cs);
} while (nl !== -1);
if (nl === -1) {
if (!this.atEnd)
return this.setNext('block-scalar');
nl = this.buffer.length;
}
}
if (!this.blockScalarKeep) {
do {
let i = nl - 1;
let ch = this.buffer[i];
if (ch === '\r')
ch = this.buffer[--i];
const lastChar = i;
while (ch === ' ' || ch === '\t')
ch = this.buffer[--i];
if (ch === '\n' && i >= this.pos && i + 1 + indent > lastChar)
nl = i;
else
break;
} while (true);
}
yield cst$2.SCALAR;
yield* this.pushToIndex(nl + 1, true);
return yield* this.parseLineStart();
}
*parsePlainScalar() {
const inFlow = this.flowLevel > 0;
let end = this.pos - 1;
let i = this.pos - 1;
let ch;
while ((ch = this.buffer[++i])) {
if (ch === ':') {
const next = this.buffer[i + 1];
if (isEmpty(next) || (inFlow && next === ','))
break;
end = i;
}
else if (isEmpty(ch)) {
let next = this.buffer[i + 1];
if (ch === '\r') {
if (next === '\n') {
i += 1;
ch = '\n';
next = this.buffer[i + 1];
}
else
end = i;
}
if (next === '#' || (inFlow && invalidFlowScalarChars.includes(next)))
break;
if (ch === '\n') {
const cs = this.continueScalar(i + 1);
if (cs === -1)
break;
i = Math.max(i, cs - 2);
}
}
else {
if (inFlow && invalidFlowScalarChars.includes(ch))
break;
end = i;
}
}
if (!ch && !this.atEnd)
return this.setNext('plain-scalar');
yield cst$2.SCALAR;
yield* this.pushToIndex(end + 1, true);
return inFlow ? 'flow' : 'doc';
}
*pushCount(n) {
if (n > 0) {
yield this.buffer.substr(this.pos, n);
this.pos += n;
return n;
}
return 0;
}
*pushToIndex(i, allowEmpty) {
const s = this.buffer.slice(this.pos, i);
if (s) {
yield s;
this.pos += s.length;
return s.length;
}
else if (allowEmpty)
yield '';
return 0;
}
*pushIndicators() {
switch (this.charAt(0)) {
case '!':
return ((yield* this.pushTag()) +
(yield* this.pushSpaces(true)) +
(yield* this.pushIndicators()));
case '&':
return ((yield* this.pushUntil(isNotAnchorChar)) +
(yield* this.pushSpaces(true)) +
(yield* this.pushIndicators()));
case '-':
case '?':
case ':': {
const inFlow = this.flowLevel > 0;
const ch1 = this.charAt(1);
if (isEmpty(ch1) || (inFlow && invalidFlowScalarChars.includes(ch1))) {
if (!inFlow)
this.indentNext = this.indentValue + 1;
else if (this.flowKey)
this.flowKey = false;
return ((yield* this.pushCount(1)) +
(yield* this.pushSpaces(true)) +
(yield* this.pushIndicators()));
}
}
}
return 0;
}
*pushTag() {
if (this.charAt(1) === '<') {
let i = this.pos + 2;
let ch = this.buffer[i];
while (!isEmpty(ch) && ch !== '>')
ch = this.buffer[++i];
return yield* this.pushToIndex(ch === '>' ? i + 1 : i, false);
}
else {
let i = this.pos + 1;
let ch = this.buffer[i];
while (ch) {
if (tagChars.includes(ch))
ch = this.buffer[++i];
else if (ch === '%' &&
hexDigits.includes(this.buffer[i + 1]) &&
hexDigits.includes(this.buffer[i + 2])) {
ch = this.buffer[(i += 3)];
}
else
break;
}
return yield* this.pushToIndex(i, false);
}
}
*pushNewline() {
const ch = this.buffer[this.pos];
if (ch === '\n')
return yield* this.pushCount(1);
else if (ch === '\r' && this.charAt(1) === '\n')
return yield* this.pushCount(2);
else
return 0;
}
*pushSpaces(allowTabs) {
let i = this.pos - 1;
let ch;
do {
ch = this.buffer[++i];
} while (ch === ' ' || (allowTabs && ch === '\t'));
const n = i - this.pos;
if (n > 0) {
yield this.buffer.substr(this.pos, n);
this.pos = i;
}
return n;
}
*pushUntil(test) {
let i = this.pos;
let ch = this.buffer[i];
while (!test(ch))
ch = this.buffer[++i];
return yield* this.pushToIndex(i, false);
}
}

lexer$2.Lexer = Lexer$1;

var lineCounter$2 = {};

class LineCounter$1 {
constructor() {
this.lineStarts = [];
this.addNewLine = (offset) => this.lineStarts.push(offset);
this.linePos = (offset) => {
let low = 0;
let high = this.lineStarts.length;
while (low < high) {
const mid = (low + high) >> 1;
if (this.lineStarts[mid] < offset)
low = mid + 1;
else
high = mid;
}
if (this.lineStarts[low] === offset)
return { line: low + 1, col: 1 };
if (low === 0)
return { line: 0, col: offset };
const start = this.lineStarts[low - 1];
return { line: low, col: offset - start + 1 };
};
}
}

lineCounter$2.LineCounter = LineCounter$1;

var parser$2 = {};

var cst$1 = cst$3;
var lexer$1 = lexer$2;

function includesToken(list, type) {
for (let i = 0; i < list.length; ++i)
if (list[i].type === type)
return true;
return false;
}
function findNonEmptyIndex(list) {
for (let i = 0; i < list.length; ++i) {
switch (list[i].type) {
case 'space':
case 'comment':
case 'newline':
break;
default:
return i;
}
}
return -1;
}
function isFlowToken(token) {
switch (token?.type) {
case 'alias':
case 'scalar':
case 'single-quoted-scalar':
case 'double-quoted-scalar':
case 'flow-collection':
return true;
default:
return false;
}
}
function getPrevProps(parent) {
switch (parent.type) {
case 'document':
return parent.start;
case 'block-map': {
const it = parent.items[parent.items.length - 1];
return it.sep ?? it.start;
}
case 'block-seq':
return parent.items[parent.items.length - 1].start;
default:
return [];
}
}
function getFirstKeyStartProps(prev) {
if (prev.length === 0)
return [];
let i = prev.length;
loop: while (--i >= 0) {
switch (prev[i].type) {
case 'doc-start':
case 'explicit-key-ind':
case 'map-value-ind':
case 'seq-item-ind':
case 'newline':
break loop;
}
}
while (prev[++i]?.type === 'space') {
}
return prev.splice(i, prev.length);
}
function fixFlowSeqItems(fc) {
if (fc.start.type === 'flow-seq-start') {
for (const it of fc.items) {
if (it.sep &&
!it.value &&
!includesToken(it.start, 'explicit-key-ind') &&
!includesToken(it.sep, 'map-value-ind')) {
if (it.key)
it.value = it.key;
delete it.key;
if (isFlowToken(it.value)) {
if (it.value.end)
Array.prototype.push.apply(it.value.end, it.sep);
else
it.value.end = it.sep;
}
else
Array.prototype.push.apply(it.start, it.sep);
delete it.sep;
}
}
}
}
class Parser$1 {
constructor(onNewLine) {
this.atNewLine = true;
this.atScalar = false;
this.indent = 0;
this.offset = 0;
this.onKeyLine = false;
this.stack = [];
this.source = '';
this.type = '';
this.lexer = new lexer$1.Lexer();
this.onNewLine = onNewLine;
}
*parse(source, incomplete = false) {
if (this.onNewLine && this.offset === 0)
this.onNewLine(0);
for (const lexeme of this.lexer.lex(source, incomplete))
yield* this.next(lexeme);
if (!incomplete)
yield* this.end();
}
*next(source) {
this.source = source;
if (process.env.LOG_TOKENS)
console.log('|', cst$1.prettyToken(source));
if (this.atScalar) {
this.atScalar = false;
yield* this.step();
this.offset += source.length;
return;
}
const type = cst$1.tokenType(source);
if (!type) {
const message = `Not a YAML token: ${source}`;
yield* this.pop({ type: 'error', offset: this.offset, message, source });
this.offset += source.length;
}
else if (type === 'scalar') {
this.atNewLine = false;
this.atScalar = true;
this.type = 'scalar';
}
else {
this.type = type;
yield* this.step();
switch (type) {
case 'newline':
this.atNewLine = true;
this.indent = 0;
if (this.onNewLine)
this.onNewLine(this.offset + source.length);
break;
case 'space':
if (this.atNewLine && source[0] === ' ')
this.indent += source.length;
break;
case 'explicit-key-ind':
case 'map-value-ind':
case 'seq-item-ind':
if (this.atNewLine)
this.indent += source.length;
break;
case 'doc-mode':
case 'flow-error-end':
return;
default:
this.atNewLine = false;
}
this.offset += source.length;
}
}
*end() {
while (this.stack.length > 0)
yield* this.pop();
}
get sourceToken() {
const st = {
type: this.type,
offset: this.offset,
indent: this.indent,
source: this.source
};
return st;
}
*step() {
const top = this.peek(1);
if (this.type === 'doc-end' && (!top || top.type !== 'doc-end')) {
while (this.stack.length > 0)
yield* this.pop();
this.stack.push({
type: 'doc-end',
offset: this.offset,
source: this.source
});
return;
}
if (!top)
return yield* this.stream();
switch (top.type) {
case 'document':
return yield* this.document(top);
case 'alias':
case 'scalar':
case 'single-quoted-scalar':
case 'double-quoted-scalar':
return yield* this.scalar(top);
case 'block-scalar':
return yield* this.blockScalar(top);
case 'block-map':
return yield* this.blockMap(top);
case 'block-seq':
return yield* this.blockSequence(top);
case 'flow-collection':
return yield* this.flowCollection(top);
case 'doc-end':
return yield* this.documentEnd(top);
}
yield* this.pop();
}
peek(n) {
return this.stack[this.stack.length - n];
}
*pop(error) {
const token = error ?? this.stack.pop();
if (!token) {
const message = 'Tried to pop an empty stack';
yield { type: 'error', offset: this.offset, source: '', message };
}
else if (this.stack.length === 0) {
yield token;
}
else {
const top = this.peek(1);
if (token.type === 'block-scalar') {
token.indent = 'indent' in top ? top.indent : 0;
}
else if (token.type === 'flow-collection' && top.type === 'document') {
token.indent = 0;
}
if (token.type === 'flow-collection')
fixFlowSeqItems(token);
switch (top.type) {
case 'document':
top.value = token;
break;
case 'block-scalar':
top.props.push(token);
break;
case 'block-map': {
const it = top.items[top.items.length - 1];
if (it.value) {
top.items.push({ start: [], key: token, sep: [] });
this.onKeyLine = true;
return;
}
else if (it.sep) {
it.value = token;
}
else {
Object.assign(it, { key: token, sep: [] });
this.onKeyLine = !includesToken(it.start, 'explicit-key-ind');
return;
}
break;
}
case 'block-seq': {
const it = top.items[top.items.length - 1];
if (it.value)
top.items.push({ start: [], value: token });
else
it.value = token;
break;
}
case 'flow-collection': {
const it = top.items[top.items.length - 1];
if (!it || it.value)
top.items.push({ start: [], key: token, sep: [] });
else if (it.sep)
it.value = token;
else
Object.assign(it, { key: token, sep: [] });
return;
}
default:
yield* this.pop();
yield* this.pop(token);
}
if ((top.type === 'document' ||
top.type === 'block-map' ||
top.type === 'block-seq') &&
(token.type === 'block-map' || token.type === 'block-seq')) {
const last = token.items[token.items.length - 1];
if (last &&
!last.sep &&
!last.value &&
last.start.length > 0 &&
findNonEmptyIndex(last.start) === -1 &&
(token.indent === 0 ||
last.start.every(st => st.type !== 'comment' || st.indent < token.indent))) {
if (top.type === 'document')
top.end = last.start;
else
top.items.push({ start: last.start });
token.items.splice(-1, 1);
}
}
}
}
*stream() {
switch (this.type) {
case 'directive-line':
yield { type: 'directive', offset: this.offset, source: this.source };
return;
case 'byte-order-mark':
case 'space':
case 'comment':
case 'newline':
yield this.sourceToken;
return;
case 'doc-mode':
case 'doc-start': {
const doc = {
type: 'document',
offset: this.offset,
start: []
};
if (this.type === 'doc-start')
doc.start.push(this.sourceToken);
this.stack.push(doc);
return;
}
}
yield {
type: 'error',
offset: this.offset,
message: `Unexpected ${this.type} token in YAML stream`,
source: this.source
};
}
*document(doc) {
if (doc.value)
return yield* this.lineEnd(doc);
switch (this.type) {
case 'doc-start': {
if (findNonEmptyIndex(doc.start) !== -1) {
yield* this.pop();
yield* this.step();
}
else
doc.start.push(this.sourceToken);
return;
}
case 'anchor':
case 'tag':
case 'space':
case 'comment':
case 'newline':
doc.start.push(this.sourceToken);
return;
}
const bv = this.startBlockValue(doc);
if (bv)
this.stack.push(bv);
else {
yield {
type: 'error',
offset: this.offset,
message: `Unexpected ${this.type} token in YAML document`,
source: this.source
};
}
}
*scalar(scalar) {
if (this.type === 'map-value-ind') {
const prev = getPrevProps(this.peek(2));
const start = getFirstKeyStartProps(prev);
let sep;
if (scalar.end) {
sep = scalar.end;
sep.push(this.sourceToken);
delete scalar.end;
}
else
sep = [this.sourceToken];
const map = {
type: 'block-map',
offset: scalar.offset,
indent: scalar.indent,
items: [{ start, key: scalar, sep }]
};
this.onKeyLine = true;
this.stack[this.stack.length - 1] = map;
}
else
yield* this.lineEnd(scalar);
}
*blockScalar(scalar) {
switch (this.type) {
case 'space':
case 'comment':
case 'newline':
scalar.props.push(this.sourceToken);
return;
case 'scalar':
scalar.source = this.source;
this.atNewLine = true;
this.indent = 0;
if (this.onNewLine) {
let nl = this.source.indexOf('\n') + 1;
while (nl !== 0) {
this.onNewLine(this.offset + nl);
nl = this.source.indexOf('\n', nl) + 1;
}
}
yield* this.pop();
break;
default:
yield* this.pop();
yield* this.step();
}
}
*blockMap(map) {
const it = map.items[map.items.length - 1];
switch (this.type) {
case 'newline':
this.onKeyLine = false;
if (it.value) {
const end = 'end' in it.value ? it.value.end : undefined;
const last = Array.isArray(end) ? end[end.length - 1] : undefined;
if (last?.type === 'comment')
end?.push(this.sourceToken);
else
map.items.push({ start: [this.sourceToken] });
}
else if (it.sep) {
it.sep.push(this.sourceToken);
}
else {
it.start.push(this.sourceToken);
}
return;
case 'space':
case 'comment':
if (it.value) {
map.items.push({ start: [this.sourceToken] });
}
else if (it.sep) {
it.sep.push(this.sourceToken);
}
else {
if (this.atIndentedComment(it.start, map.indent)) {
const prev = map.items[map.items.length - 2];
const end = prev?.value?.end;
if (Array.isArray(end)) {
Array.prototype.push.apply(end, it.start);
end.push(this.sourceToken);
map.items.pop();
return;
}
}
it.start.push(this.sourceToken);
}
return;
}
if (this.indent >= map.indent) {
const atNextItem = !this.onKeyLine && this.indent === map.indent && it.sep;
let start = [];
if (atNextItem && it.sep && !it.value) {
const nl = [];
for (let i = 0; i < it.sep.length; ++i) {
const st = it.sep[i];
switch (st.type) {
case 'newline':
nl.push(i);
break;
case 'space':
break;
case 'comment':
if (st.indent > map.indent)
nl.length = 0;
break;
default:
nl.length = 0;
}
}
if (nl.length >= 2)
start = it.sep.splice(nl[1]);
}
switch (this.type) {
case 'anchor':
case 'tag':
if (atNextItem || it.value) {
start.push(this.sourceToken);
map.items.push({ start });
this.onKeyLine = true;
}
else if (it.sep) {
it.sep.push(this.sourceToken);
}
else {
it.start.push(this.sourceToken);
}
return;
case 'explicit-key-ind':
if (!it.sep && !includesToken(it.start, 'explicit-key-ind')) {
it.start.push(this.sourceToken);
}
else if (atNextItem || it.value) {
start.push(this.sourceToken);
map.items.push({ start });
}
else {
this.stack.push({
type: 'block-map',
offset: this.offset,
indent: this.indent,
items: [{ start: [this.sourceToken] }]
});
}
this.onKeyLine = true;
return;
case 'map-value-ind':
if (includesToken(it.start, 'explicit-key-ind')) {
if (!it.sep) {
if (includesToken(it.start, 'newline')) {
Object.assign(it, { key: null, sep: [this.sourceToken] });
}
else {
const start = getFirstKeyStartProps(it.start);
this.stack.push({
type: 'block-map',
offset: this.offset,
indent: this.indent,
items: [{ start, key: null, sep: [this.sourceToken] }]
});
}
}
else if (it.value) {
map.items.push({ start: [], key: null, sep: [this.sourceToken] });
}
else if (includesToken(it.sep, 'map-value-ind')) {
this.stack.push({
type: 'block-map',
offset: this.offset,
indent: this.indent,
items: [{ start, key: null, sep: [this.sourceToken] }]
});
}
else if (isFlowToken(it.key) &&
!includesToken(it.sep, 'newline')) {
const start = getFirstKeyStartProps(it.start);
const key = it.key;
const sep = it.sep;
sep.push(this.sourceToken);
delete it.key, delete it.sep;
this.stack.push({
type: 'block-map',
offset: this.offset,
indent: this.indent,
items: [{ start, key, sep }]
});
}
else if (start.length > 0) {
it.sep = it.sep.concat(start, this.sourceToken);
}
else {
it.sep.push(this.sourceToken);
}
}
else {
if (!it.sep) {
Object.assign(it, { key: null, sep: [this.sourceToken] });
}
else if (it.value || atNextItem) {
map.items.push({ start, key: null, sep: [this.sourceToken] });
}
else if (includesToken(it.sep, 'map-value-ind')) {
this.stack.push({
type: 'block-map',
offset: this.offset,
indent: this.indent,
items: [{ start: [], key: null, sep: [this.sourceToken] }]
});
}
else {
it.sep.push(this.sourceToken);
}
}
this.onKeyLine = true;
return;
case 'alias':
case 'scalar':
case 'single-quoted-scalar':
case 'double-quoted-scalar': {
const fs = this.flowScalar(this.type);
if (atNextItem || it.value) {
map.items.push({ start, key: fs, sep: [] });
this.onKeyLine = true;
}
else if (it.sep) {
this.stack.push(fs);
}
else {
Object.assign(it, { key: fs, sep: [] });
this.onKeyLine = true;
}
return;
}
default: {
const bv = this.startBlockValue(map);
if (bv) {
if (atNextItem &&
bv.type !== 'block-seq' &&
includesToken(it.start, 'explicit-key-ind')) {
map.items.push({ start });
}
this.stack.push(bv);
return;
}
}
}
}
yield* this.pop();
yield* this.step();
}
*blockSequence(seq) {
const it = seq.items[seq.items.length - 1];
switch (this.type) {
case 'newline':
if (it.value) {
const end = 'end' in it.value ? it.value.end : undefined;
const last = Array.isArray(end) ? end[end.length - 1] : undefined;
if (last?.type === 'comment')
end?.push(this.sourceToken);
else
seq.items.push({ start: [this.sourceToken] });
}
else
it.start.push(this.sourceToken);
return;
case 'space':
case 'comment':
if (it.value)
seq.items.push({ start: [this.sourceToken] });
else {
if (this.atIndentedComment(it.start, seq.indent)) {
const prev = seq.items[seq.items.length - 2];
const end = prev?.value?.end;
if (Array.isArray(end)) {
Array.prototype.push.apply(end, it.start);
end.push(this.sourceToken);
seq.items.pop();
return;
}
}
it.start.push(this.sourceToken);
}
return;
case 'anchor':
case 'tag':
if (it.value || this.indent <= seq.indent)
break;
it.start.push(this.sourceToken);
return;
case 'seq-item-ind':
if (this.indent !== seq.indent)
break;
if (it.value || includesToken(it.start, 'seq-item-ind'))
seq.items.push({ start: [this.sourceToken] });
else
it.start.push(this.sourceToken);
return;
}
if (this.indent > seq.indent) {
const bv = this.startBlockValue(seq);
if (bv) {
this.stack.push(bv);
return;
}
}
yield* this.pop();
yield* this.step();
}
*flowCollection(fc) {
const it = fc.items[fc.items.length - 1];
if (this.type === 'flow-error-end') {
let top;
do {
yield* this.pop();
top = this.peek(1);
} while (top && top.type === 'flow-collection');
}
else if (fc.end.length === 0) {
switch (this.type) {
case 'comma':
case 'explicit-key-ind':
if (!it || it.sep)
fc.items.push({ start: [this.sourceToken] });
else
it.start.push(this.sourceToken);
return;
case 'map-value-ind':
if (!it || it.value)
fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
else if (it.sep)
it.sep.push(this.sourceToken);
else
Object.assign(it, { key: null, sep: [this.sourceToken] });
return;
case 'space':
case 'comment':
case 'newline':
case 'anchor':
case 'tag':
if (!it || it.value)
fc.items.push({ start: [this.sourceToken] });
else if (it.sep)
it.sep.push(this.sourceToken);
else
it.start.push(this.sourceToken);
return;
case 'alias':
case 'scalar':
case 'single-quoted-scalar':
case 'double-quoted-scalar': {
const fs = this.flowScalar(this.type);
if (!it || it.value)
fc.items.push({ start: [], key: fs, sep: [] });
else if (it.sep)
this.stack.push(fs);
else
Object.assign(it, { key: fs, sep: [] });
return;
}
case 'flow-map-end':
case 'flow-seq-end':
fc.end.push(this.sourceToken);
return;
}
const bv = this.startBlockValue(fc);
if (bv)
this.stack.push(bv);
else {
yield* this.pop();
yield* this.step();
}
}
else {
const parent = this.peek(2);
if (parent.type === 'block-map' &&
((this.type === 'map-value-ind' && parent.indent === fc.indent) ||
(this.type === 'newline' &&
!parent.items[parent.items.length - 1].sep))) {
yield* this.pop();
yield* this.step();
}
else if (this.type === 'map-value-ind' &&
parent.type !== 'flow-collection') {
const prev = getPrevProps(parent);
const start = getFirstKeyStartProps(prev);
fixFlowSeqItems(fc);
const sep = fc.end.splice(1, fc.end.length);
sep.push(this.sourceToken);
const map = {
type: 'block-map',
offset: fc.offset,
indent: fc.indent,
items: [{ start, key: fc, sep }]
};
this.onKeyLine = true;
this.stack[this.stack.length - 1] = map;
}
else {
yield* this.lineEnd(fc);
}
}
}
flowScalar(type) {
if (this.onNewLine) {
let nl = this.source.indexOf('\n') + 1;
while (nl !== 0) {
this.onNewLine(this.offset + nl);
nl = this.source.indexOf('\n', nl) + 1;
}
}
return {
type,
offset: this.offset,
indent: this.indent,
source: this.source
};
}
startBlockValue(parent) {
switch (this.type) {
case 'alias':
case 'scalar':
case 'single-quoted-scalar':
case 'double-quoted-scalar':
return this.flowScalar(this.type);
case 'block-scalar-header':
return {
type: 'block-scalar',
offset: this.offset,
indent: this.indent,
props: [this.sourceToken],
source: ''
};
case 'flow-map-start':
case 'flow-seq-start':
return {
type: 'flow-collection',
offset: this.offset,
indent: this.indent,
start: this.sourceToken,
items: [],
end: []
};
case 'seq-item-ind':
return {
type: 'block-seq',
offset: this.offset,
indent: this.indent,
items: [{ start: [this.sourceToken] }]
};
case 'explicit-key-ind': {
this.onKeyLine = true;
const prev = getPrevProps(parent);
const start = getFirstKeyStartProps(prev);
start.push(this.sourceToken);
return {
type: 'block-map',
offset: this.offset,
indent: this.indent,
items: [{ start }]
};
}
case 'map-value-ind': {
this.onKeyLine = true;
const prev = getPrevProps(parent);
const start = getFirstKeyStartProps(prev);
return {
type: 'block-map',
offset: this.offset,
indent: this.indent,
items: [{ start, key: null, sep: [this.sourceToken] }]
};
}
}
return null;
}
atIndentedComment(start, indent) {
if (this.type !== 'comment')
return false;
if (this.indent <= indent)
return false;
return start.every(st => st.type === 'newline' || st.type === 'space');
}
*documentEnd(docEnd) {
if (this.type !== 'doc-mode') {
if (docEnd.end)
docEnd.end.push(this.sourceToken);
else
docEnd.end = [this.sourceToken];
if (this.type === 'newline')
yield* this.pop();
}
}
*lineEnd(token) {
switch (this.type) {
case 'comma':
case 'doc-start':
case 'doc-end':
case 'flow-seq-end':
case 'flow-map-end':
case 'map-value-ind':
yield* this.pop();
yield* this.step();
break;
case 'newline':
this.onKeyLine = false;
case 'space':
case 'comment':
default:
if (token.end)
token.end.push(this.sourceToken);
else
token.end = [this.sourceToken];
if (this.type === 'newline')
yield* this.pop();
}
}
}

parser$2.Parser = Parser$1;

var publicApi$1 = {};

var composer$1 = composer$2;
var Document$1 = Document$5;
var errors$1 = errors$4;
var log = log$2;
var lineCounter$1 = lineCounter$2;
var parser$1 = parser$2;

function parseOptions(options) {
const prettyErrors = options.prettyErrors !== false;
const lineCounter$1$1 = options.lineCounter || (prettyErrors && new lineCounter$1.LineCounter()) || null;
return { lineCounter: lineCounter$1$1, prettyErrors };
}
function parseAllDocuments$1(source, options = {}) {
const { lineCounter, prettyErrors } = parseOptions(options);
const parser$1$1 = new parser$1.Parser(lineCounter?.addNewLine);
const composer$1$1 = new composer$1.Composer(options);
const docs = Array.from(composer$1$1.compose(parser$1$1.parse(source)));
if (prettyErrors && lineCounter)
for (const doc of docs) {
doc.errors.forEach(errors$1.prettifyError(source, lineCounter));
doc.warnings.forEach(errors$1.prettifyError(source, lineCounter));
}
if (docs.length > 0)
return docs;
return Object.assign([], { empty: true }, composer$1$1.streamInfo());
}
function parseDocument$1(source, options = {}) {
const { lineCounter, prettyErrors } = parseOptions(options);
const parser$1$1 = new parser$1.Parser(lineCounter?.addNewLine);
const composer$1$1 = new composer$1.Composer(options);
let doc = null;
for (const _doc of composer$1$1.compose(parser$1$1.parse(source), true, source.length)) {
if (!doc)
doc = _doc;
else if (doc.options.logLevel !== 'silent') {
doc.errors.push(new errors$1.YAMLParseError(_doc.range.slice(0, 2), 'MULTIPLE_DOCS', 'Source contains multiple documents; please use YAML.parseAllDocuments()'));
break;
}
}
if (prettyErrors && lineCounter) {
doc.errors.forEach(errors$1.prettifyError(source, lineCounter));
doc.warnings.forEach(errors$1.prettifyError(source, lineCounter));
}
return doc;
}
function parse$1(src, reviver, options) {
let _reviver = undefined;
if (typeof reviver === 'function') {
_reviver = reviver;
}
else if (options === undefined && reviver && typeof reviver === 'object') {
options = reviver;
}
const doc = parseDocument$1(src, options);
if (!doc)
return null;
doc.warnings.forEach(warning => log.warn(doc.options.logLevel, warning));
if (doc.errors.length > 0) {
if (doc.options.logLevel !== 'silent')
throw doc.errors[0];
else
doc.errors = [];
}
return doc.toJS(Object.assign({ reviver: _reviver }, options));
}
function stringify$1(value, replacer, options) {
let _replacer = null;
if (typeof replacer === 'function' || Array.isArray(replacer)) {
_replacer = replacer;
}
else if (options === undefined && replacer) {
options = replacer;
}
if (typeof options === 'string')
options = options.length;
if (typeof options === 'number') {
const indent = Math.round(options);
options = indent < 1 ? undefined : indent > 8 ? { indent: 8 } : { indent };
}
if (value === undefined) {
const { keepUndefined } = options ?? replacer ?? {};
if (!keepUndefined)
return undefined;
}
return new Document$1.Document(value, _replacer, options).toString(options);
}

publicApi$1.parse = parse$1;
publicApi$1.parseAllDocuments = parseAllDocuments$1;
publicApi$1.parseDocument = parseDocument$1;
publicApi$1.stringify = stringify$1;

var composer = composer$2;
var Document = Document$5;
var Schema = Schema$3;
var errors = errors$4;
var Alias = Alias$5;
var Node = Node$t;
var Pair = Pair$9;
var Scalar = Scalar$k;
var YAMLMap = YAMLMap$7;
var YAMLSeq = YAMLSeq$7;
var cst = cst$3;
var lexer = lexer$2;
var lineCounter = lineCounter$2;
var parser = parser$2;
var publicApi = publicApi$1;
var visit = visit$6;



var Composer = dist.Composer = composer.Composer;
var Document_1 = dist.Document = Document.Document;
var Schema_1 = dist.Schema = Schema.Schema;
var YAMLError = dist.YAMLError = errors.YAMLError;
var YAMLParseError = dist.YAMLParseError = errors.YAMLParseError;
var YAMLWarning = dist.YAMLWarning = errors.YAMLWarning;
var Alias_1 = dist.Alias = Alias.Alias;
var isAlias = dist.isAlias = Node.isAlias;
var isCollection = dist.isCollection = Node.isCollection;
var isDocument = dist.isDocument = Node.isDocument;
var isMap = dist.isMap = Node.isMap;
var isNode = dist.isNode = Node.isNode;
var isPair = dist.isPair = Node.isPair;
var isScalar = dist.isScalar = Node.isScalar;
var isSeq = dist.isSeq = Node.isSeq;
var Pair_1 = dist.Pair = Pair.Pair;
var Scalar_1 = dist.Scalar = Scalar.Scalar;
var YAMLMap_1 = dist.YAMLMap = YAMLMap.YAMLMap;
var YAMLSeq_1 = dist.YAMLSeq = YAMLSeq.YAMLSeq;
var CST = dist.CST = cst;
var Lexer = dist.Lexer = lexer.Lexer;
var LineCounter = dist.LineCounter = lineCounter.LineCounter;
var Parser = dist.Parser = parser.Parser;
var parse = dist.parse = publicApi.parse;
var parseAllDocuments = dist.parseAllDocuments = publicApi.parseAllDocuments;
var parseDocument = dist.parseDocument = publicApi.parseDocument;
var stringify = dist.stringify = publicApi.stringify;
var visit_1 = dist.visit = visit.visit;
var visitAsync = dist.visitAsync = visit.visitAsync;

exports.Alias = Alias_1;
exports.CST = CST;
exports.Composer = Composer;
exports.Document = Document_1;
exports.Lexer = Lexer;
exports.LineCounter = LineCounter;
exports.Pair = Pair_1;
exports.Parser = Parser;
exports.Scalar = Scalar_1;
exports.Schema = Schema_1;
exports.YAMLError = YAMLError;
exports.YAMLMap = YAMLMap_1;
exports.YAMLParseError = YAMLParseError;
exports.YAMLSeq = YAMLSeq_1;
exports.YAMLWarning = YAMLWarning;
exports.default = dist;
exports.isAlias = isAlias;
exports.isCollection = isCollection;
exports.isDocument = isDocument;
exports.isMap = isMap;
exports.isNode = isNode;
exports.isPair = isPair;
exports.isScalar = isScalar;
exports.isSeq = isSeq;
exports.parse = parse;
exports.parseAllDocuments = parseAllDocuments;
exports.parseDocument = parseDocument;
exports.stringify = stringify;
exports.visit = visit_1;
exports.visitAsync = visitAsync;
