const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const common = require('./out/extension-common');
const utils = require('./utils');
const YAML = require('./yaml.js');

let gRememberStorePersistentFSPath = undefined;

/** @param {string} text */
function regexpEscape(text) {
  return text.replace(/[[\]*|(){}\\.?^$+]/g, m => `\\${m}`);
}

class FilePickItem {
  constructor() {
    this.uri = undefined;
    this.value = undefined;
    this.label = '***';
  }
  /** @param {vscode.Uri} uri @param {string} [display] @param {vscode.Uri} [folderPath] @param {Object} [args] @param {Object} [transform] */
  async fromURI(uri, display, folderPath, args, transform) {
    this.uri = uri;
    this.label = uri.fsPath;
    this.value = uri.fsPath;
    this.description = undefined;
    if (display === 'fileName') {
      this.description = ' $(folder) ' + path.dirname(this.label);
      this.label = path.basename(this.label);
    }
    if (display === 'relativePath') {
      let description = '';
      let workspace = vscode.workspace.getWorkspaceFolder(uri);
      if (!folderPath && workspace) { // we searched over all workspaces
        folderPath = workspace.uri;
      }
      if (folderPath) {
        description = folderPath.fsPath;
        if (workspace) {
          description = `\${ws:${workspace.name}}` + description.substring(workspace.uri.fsPath.length);
        }
        this.label = this.label.substring(folderPath.fsPath.length + 1);
      }
      this.description = ' $(folder) ' + description;
    }
    if (display === 'transform') {
      args = utils.dblQuest(args, {});
      async function applyTransform(uri, args, property, defaultValue, level=0) {
        if (level === 4) { return defaultValue; }
        let transformArgs = utils.getProperty(args, property);
        if (transformArgs) {
          if (utils.isString(transformArgs)) {
            return applyTransform(uri, args, transformArgs, defaultValue, level+1);
          }
          return await transform(transformArgs, '${file}', uri);
        }
        return defaultValue;
      }
      this.value = await applyTransform(uri, args, 'valueTransform', this.value);
      this.label = await applyTransform(uri, args, 'labelTransform', this.label);
      this.description = await applyTransform(uri, args, 'descriptionTransform', this.description);
    }
    return this;
  }
  empty() {
    this.label = '*** Empty ***';
    this.value = '';
    return this;
  }
  ask() {
    this.label = '*** Ask ***';
    this.askValue = true;
    return this;
  }
}

class FolderPickItem {
  fromString(path, labelTransform) {
    let label = undefined;
    let hasLabel = false;
    if (utils.isObject(path)) { ({path, label} = path); hasLabel = true; }
    this.label = path;
    this.value = path;
    if (labelTransform.maxLength > 0) {
      for (const apply of labelTransform.transform) {
        if (apply === 'useLabel') {
          if (hasLabel) {
            this.label = label;
          }
          continue;
        }
        if (this.label.length <= labelTransform.maxLength) { break; }
        if (apply === 'hasLabel') {
          if (hasLabel) {
            this.label = label;
          }
          continue;
        }
        if (apply === 'removeWorkspacePath') {
          let workspace = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(path));
          if (workspace) {
            this.label = this.label.substring(workspace.uri.fsPath.length+1);
          }
          continue;
        }
        if (apply === 'clipMiddle') {
          this.label = `${this.label.slice(0, labelTransform.takeStart)}.....${this.label.slice(-labelTransform.takeEnd)}`;
          continue;
        }
      }
    }
    return this;
  }
  ask() {
    this.label = '*** Ask ***';
    this.askValue = true;
    return this;
  }
  workspace() {
    this.label = '*** Workspace ***';
    this.askWorkspace = true;
    return this;
  }
}

function readRememberPersistent(getConfig, variableSubstitutionSync_1) {
  let rememberPersistentFile = getConfig().get("remember.persistent.file");
  if (!rememberPersistentFile) { return; }
  gRememberStorePersistentFSPath = variableSubstitutionSync_1(rememberPersistentFile);
  let content = undefined;
  try {
    content = fs.readFileSync(gRememberStorePersistentFSPath, 'utf8');
  } catch (error) { }
  if (!content) { return; }
  let json = JSON.parse(content);
  let rememberStore = common.getRememberStore();
  for (const key of Object.keys(json)) {
    rememberStore[key] = json[key];
  }
}

function activate(context) {
  const getProperty = utils.getProperty;
  const fileNotInFolderError = utils.fileNotInFolderError;
  const isString = utils.isString;
  const utf8_to_str = utils.utf8_to_str;
  const range = utils.range;
  const dblQuest = utils.dblQuest;
  const storeStringRemember = common.storeStringRemember;
  const storeStringRemember2 = common.storeStringRemember2;
  const getRememberKey = common.getRememberKey;
  const getConfig = () => vscode.workspace.getConfiguration("commandvariable", null);
  const getExpressionFunction = common.getExpressionFunction;
  const filterRegex = '((?:\\|\\w+(?:\\([^)]+\\))?)*)';

  common.setAsDesktopExtension();
  common.activate(context);

  readRememberPersistent(getConfig, variableSubstitutionSync_1);

  var replaceVariableWithProperties = (text, varName, args, replaceFunc) => {
    var fieldRegex = new RegExp(`\\$\\{${varName}(?:([^a-zA-Z{}|]+)(.+?)\\1)?${filterRegex}\\}`, 'g');
    var replaceFuncNewArgs = (m,sep,params,filter) => {
      var _args = {...args};
      if (sep !== undefined) {
        params.split(sep).forEach(p => {
          let eq = p.indexOf('=');
          if (eq === -1) { return; }
          _args[p.substring(0, eq).trim()] = p.substring(eq+1);
        });
      }
      return applyFilter(replaceFunc(_args), filter);
    };
    return text.replace(fieldRegex, replaceFuncNewArgs);
  };
  function URIWorkspaceFolder(uri, action) {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) { return utils.errorMessage('No folder open'); }
    let wsf = undefined;
    if (folders.length > 1) {
      if (!uri) { return utils.errorMessage('Use the name of the Workspace Folder'); }
      wsf = vscode.workspace.getWorkspaceFolder(uri);
    }
    if (!wsf) {
      wsf = folders[0];  // choose first folder in the list
    }
    return action(wsf);
  }
  /** @param {object} args @param {string[] | string} result @param {string} textDefault @param {string} uriKey @returns {Promise<string>} */
  async function transformResult(args, result, textDefault, uriKey) {
    let transformArgs = getProperty(args, 'transform');
    if (transformArgs) {
      let numTransfoms = 1; // in case there are no URIs transform string
      let indexName = getProperty(transformArgs, 'indexName', '');
      let uris = getRememberKey(uriKey+common.PostfixURI, '__undefined');
      let getURI = idx => undefined;
      let getResult = idx => result;
      if (utils.isArray(result)) {
        if (!(utils.isArray(uris) && result.length === uris.length)) { return 'ArraysDoNotMatch'; }
        getResult = idx => result[idx];
      }
      if (utils.isArray(uris)) {
        getURI = idx => uris[idx];
        numTransfoms = uris.length;
      }
      let __result = [];
      for (let index = 0; index < numTransfoms; ++index) {
        transformArgs['__result'] = getResult(index);
        storeStringRemember2({key: `__index__${indexName}`}, index.toString());
        __result.push(await transform(transformArgs, textDefault, getURI(index)));
      }
      result = __result;
    }
    return utils.isArray(result) ? result.join(getProperty(args, 'separator', ' ')) : result;
  }
  async function dataStructSubstitution(v, cbData, callback) {
    if (isString(v)) {
      return callback(v, cbData);
    }
    if (Array.isArray(v)) {
      let result = [];
      for (const v1 of v) {
        let v1a = await dataStructSubstitution(v1, cbData, callback);
        if (v1a === undefined) { return undefined; }
        result.push(v1a);
      }
      return result;
    }
    if (utils.isObject(v)) {
      let result = {};
      for (const key in v) {
        if (v.hasOwnProperty(key)) {
          let v1a = await dataStructSubstitution(v[key], cbData, callback);
          if (v1a === undefined) { return undefined; }
          result[key] = v1a;
        }
      }
      return result;
    }
    return v;
  }
  async function command(args) {
    let command = getProperty(args, 'command');
    if (!command) { return 'Unknown'; }
    command = await variableSubstitution(command, args);
    let command_args = getProperty(args, 'args');
    if (utils.getProperty(args, "variableSubstArgs")) {
      command_args = await dataStructSubstitution(command_args, args, (s, args) => variableSubstitution(s, args));
      if (command_args === undefined) { return undefined; }
    }
    return vscode.commands.executeCommand(command, command_args);
  }
  async function remember(args) { // make it async so it can be used with asyncVariable
    let result = await common.rememberCommand(args, variableSubstitution);
    return transformResult(args, result, '${result}', args.key);
  }
  async function pickStringRemember(args) { // pass variableSubstitution
    return common.pickStringRemember(args, variableSubstitution);
  }
  /** @param {string} text @param {string} filter */
  function applyFilter(text, filter) {
    if (filter.length === 0) { return text; }
    for (const f of filter.split('|')) {
      if (f.length === 0) { continue; }
      if (f === 'regexEscape') { text = regexpEscape(text); continue; }
      if (f === 'upperCase') { text = text.toUpperCase(); continue; }
      if (f === 'lowerCase') { text = text.toLowerCase(); continue; }
    }
    return text;
  }
  /** @callback ReplaceCB */
  /** @param {string} text @param {string} variableRegex @param {number} capGroupCount @param {string | ReplaceCB} replacement */
  function variableReplaceAndFilter(text, variableRegex, capGroupCount, replacement) {
    let varRE = new RegExp(`\\$\\{${variableRegex}${filterRegex}\\}`, 'g');
    text = text.replace(varRE, (m, ...ppp) => {
      ppp.splice(capGroupCount+1); // only retain capture groups - remove arguments: offset, string, groups
      let filter = ppp.pop();
      ppp.unshift(m); // replacement funcs want 'm' as first argument
      // let _replacement = isString(replacement) ? replacement : replacement(...ppp);
      // typescript generates some vague errors so we have to rewrite
      let _replacement = typeof replacement === 'string' ? replacement : replacement.apply(null, ppp);
      return applyFilter(_replacement, filter);
    });
    return text;
  }
  var asyncVariable = async (text, args, uri, func) => {
    if (text === undefined) { return undefined; }  // escaped a UI element
    let asyncArgs = [];
    let varRE = new RegExp(`\\$\\{${func.name}:(.+?)${filterRegex}\\}`, 'g');
    text = text.replace(varRE, (m, p1, filter) => {
      let deflt = undefined;
      if (func.name === 'command') { deflt = { command: p1 }; }
      if (func.name === 'remember') {
        deflt = { key: p1 };
        let checkStr = '__'+common.gRememberPropertyCheckEscapedUI;
        if (p1.indexOf(checkStr) !== -1) {
          deflt['key'] = p1.replace(checkStr, '');
          deflt[common.gRememberPropertyCheckEscapedUI] = true;
        }
      }
      let nameArgs = getProperty(getProperty(args, func.name, {}), p1, deflt);
      if (!nameArgs) { return 'Unknown'; }
      if (isString(filter) && filter.length > 0) {
        nameArgs['__filter'] = filter;
      }
      asyncArgs.push(nameArgs);
      return m;
    });
    for (let i = 0; i < asyncArgs.length; i++) {
      let filter = asyncArgs[i]['__filter'];
      delete asyncArgs[i]['__filter'];
      asyncArgs[i] = await func(asyncArgs[i]);
      if (filter) {
        asyncArgs[i] = await variableSubstitution(asyncArgs[i], args, uri);
      }
      if (asyncArgs[i] === undefined) { return undefined; }
    }
    text = text.replace(varRE, (m, p1, filter) => {
      return applyFilter(asyncArgs.shift(), filter);
    });
    return text;
  };
  function variableSubstitutionSync_1(result, uri) {
    result = variableReplaceAndFilter(result, 'pathSeparator', 0, process.platform === 'win32' ? '\\' : '/');
    result = variableReplaceAndFilter(result, 'userHome', 0, m => variableSubstitutionSync_1(process.platform === 'win32' ? '${env:HOMEDRIVE}${env:HOMEPATH}' : '${env:HOME}', uri));
    result = variableReplaceAndFilter(result, 'env:(.+?)', 1, (m, p1) => {
      return getProperty(process.env, p1, '');
    } );
    result = variableReplaceAndFilter(result, 'workspaceFolder', 0, m => {
      return URIWorkspaceFolder(uri, workspaceFolder => {
        return workspaceFolder.uri.fsPath;
      });
    });
    result = variableReplaceAndFilter(result, 'workspaceFolder:(.+?)(:nomsg)?', 2, (m, p1, p2) => {
      if (p2) { common.setShowErrMsg(false); }
      let wsf = common.getNamedWorkspaceFolder(p1);
      if (p2) { common.setShowErrMsg(true); }
      if (!wsf) { return 'Unknown'; }
      return wsf.uri.fsPath;
    });
    result = variableReplaceAndFilter(result, 'workspaceFolderBasename', 0, m => {
      return URIWorkspaceFolder(uri, workspaceFolder => {
        return path.basename(workspaceFolder.uri.fsPath);
      });
    });
    return result;
  }
  var variableSubstitution = async (text, args, uri) => {
    args = dblQuest(args, {});
    let stringSubstitution = async (text) => {
      if (!isString(text)) { return text; }
      const editor = vscode.window.activeTextEditor;
      if (!uri && editor) { uri = editor.document.uri; }
      var result = text;
      result = result.replace('${index}', getRememberKey('__index__', '__zero'));
      result = result.replace(/\$\{index:(.+?)\}/g, (m, p1) => {
        return getRememberKey(`__index__${p1}`, '__zero');
      });
      if (new RegExp(/\$\{result[}|]/).test(result)) {
        let __result = await variableSubstitution(getProperty(args, '__result', ''), args, uri);
        result = variableReplaceAndFilter(result, 'result', 0, __result);
      }
      if (editor) {
        result = replaceVariableWithProperties(result, 'selectedText', args, _args => common.concatMapSelections(_args, common.getEditorSelection) );
      }
      result = variableSubstitutionSync_1(result, uri);
      result = await asyncVariable(result, args, uri, transform);
      result = await asyncVariable(result, args, uri, command);
      result = await asyncVariable(result, args, uri, pickStringRemember);
      result = await asyncVariable(result, args, uri, common.promptStringRemember);
      result = await asyncVariable(result, args, uri, pickFile);
      result = await asyncVariable(result, args, uri, openDialog);
      result = await asyncVariable(result, args, uri, saveDialog);
      result = await asyncVariable(result, args, uri, fileContent);
      result = await asyncVariable(result, args, uri, configExpression);
      result = await asyncVariable(result, args, uri, jsExpression);
      result = await asyncVariable(result, args, uri, remember);
      // TODO Deprecated 2021-10
      if (result !== undefined) {
        result = result.replace(/\$\{rememberPick:(.+?)\}/g, (m, p1) => {
          common.showDeprecationMessage(common.gDeprecationRememberPickVariable);
          return getRememberKey(p1);
        });
      }
      if (result === undefined) { return undefined; }

      if (!uri) { return result; }
      const fileFSPath = uri.fsPath;
      result = variableReplaceAndFilter(result, 'file', 0, fileFSPath);
      const relativeFile = URIWorkspaceFolder(uri, workspaceFolder => {
        const wsfFSPath = workspaceFolder.uri.fsPath;
        if (fileFSPath.startsWith(wsfFSPath)) {
          return fileFSPath.substring(wsfFSPath.length + 1); // remove extra separator;
        }
        return 'Unknown';
      });
      result = variableReplaceAndFilter(result, 'relativeFile', 0, relativeFile);
      const filePath = uri.path;
      const lastSep = filePath.lastIndexOf('/');
      if (lastSep === -1) { return result; }
      const fileBasename = filePath.substring(lastSep+1);
      result = variableReplaceAndFilter(result, 'fileBasename', 0, fileBasename);
      const lastDot = fileBasename.lastIndexOf('.');
      const fileBasenameNoExtension = lastDot >= 0 ? fileBasename.substring(0, lastDot) : fileBasename;
      result = variableReplaceAndFilter(result, 'fileBasenameNoExtension', 0, fileBasenameNoExtension);
      const fileExtname = lastDot >= 0 ? fileBasename.substring(lastDot) : '';
      result = variableReplaceAndFilter(result, 'fileExtname', 0, fileExtname);
      let fileDirname = fileFSPath.substring(0, fileFSPath.length-(fileBasename.length+1));
      result = variableReplaceAndFilter(result, 'fileDirname', 0, fileDirname);
      let relativeFileDirname = relativeFile;
      if (relativeFile.endsWith(fileBasename)) {
        relativeFileDirname = relativeFile.substring(0, relativeFile.length-(fileBasename.length+1));
      }
      result = variableReplaceAndFilter(result, 'relativeFileDirname', 0, relativeFileDirname);
      return result;
    };
    let stringSubstitutionDepthN = async (text) => {
      if (!isString(text)) { return text; }
      while (text.indexOf('${') >= 0) {
        let newText = await stringSubstitution(text);
        if (newText === undefined) { return undefined; }
        if (newText === text) { break; }
        text = newText;
      }
      return text;
    };
    if (Array.isArray(text)) {
      let result = [];
      for (let i = 0; i < text.length; i++) {
        result.push(await stringSubstitutionDepthN(text[i]));
      }
      return result;
    }
    return await stringSubstitutionDepthN(text);
  };
  const nonPosixPathRegEx = new RegExp('^/([a-zA-Z]):/');
  var lowerCaseDriveLetter = p => p.replace(nonPosixPathRegEx, match => match.toLowerCase() );
  var path2Posix = p => lowerCaseDriveLetter(p).replace(nonPosixPathRegEx, '/$1/');
  var relative_FileOrDirname_Posix = (get_dirname) => {
    return common.activeWorkspaceFolder( (workspaceFolder, editor) => {
      const rootPath = lowerCaseDriveLetter(workspaceFolder.uri.path);
      let documentPath = lowerCaseDriveLetter(editor.document.uri.path);
      if (get_dirname) { documentPath = path.dirname(documentPath); }
      if (documentPath.indexOf(rootPath) !== 0) { return fileNotInFolderError(); } // should never happen here
      return documentPath.substring(rootPath.length + 1);
    });
  };
  var dot_dir_separator = p => p.replace(/\//g, () => ".");
  var fileDirnameNUp = function (n, posix, relative) {
    return common.activeWorkspaceFolder( (workspaceFolder, editor) => {
      let filePath;
      if (posix) { filePath = path2Posix(editor.document.uri.path); }
      else { filePath = editor.document.uri.fsPath; }
      for (let i = 0; i < n+1; ++i) { // 1 more to get filename out
        filePath = path.dirname(filePath);
      }
      if (relative) {
        let rootPath;
        if (posix) { rootPath = path2Posix(workspaceFolder.uri.path); }
        else { rootPath = workspaceFolder.uri.fsPath; }
        filePath = filePath.substring(rootPath.length + 1);
      }
      return filePath;
    });
  };
  var workspaceFolderNUp = function (n, posix, args) {
    args = common.checkIfArgsIsLaunchConfig(args);
    return common.activeWorkspaceFolderEditorOptional( workspaceFolder => {
      let filePath;
      if (posix) { filePath = path2Posix(workspaceFolder.uri.path); }
      else { filePath = workspaceFolder.uri.fsPath; }
      for (let i = 0; i < n; ++i) {
        let newFilePath = path.dirname(filePath);
        if (newFilePath === filePath) { return common.notEnoughParentDirectories(); }
        filePath = newFilePath;
      }
      return filePath;
    }, undefined, args !== undefined ? args.name : undefined);
  };
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.relativeFilePosix', () => {
      return relative_FileOrDirname_Posix(false);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.relativeFileDots', () => {
      return dot_dir_separator(relative_FileOrDirname_Posix(false));
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.relativeFileDotsNoExtension', () => {
      let relativeFile = relative_FileOrDirname_Posix(false);
      let lastSeparator = relativeFile.lastIndexOf('/');
      if (lastSeparator < 0) { lastSeparator = 0; }
      let lastDot = relativeFile.lastIndexOf('.');
      if (lastDot > lastSeparator+1) {  // file has an extension
        relativeFile = relativeFile.substring(0, lastDot);
      }
      return dot_dir_separator(relativeFile);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.relativeFileDirnamePosix', () => {
      return relative_FileOrDirname_Posix(true);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.relativeDirDots', () => {
      return dot_dir_separator(relative_FileOrDirname_Posix(true));
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.filePosix', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showErrorMessage('No editor'); return "Unknown"; }
      return path2Posix(editor.document.uri.path);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.fileDirnamePosix', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showErrorMessage('No editor'); return "Unknown"; }
      const documentDirName = path.dirname(editor.document.uri.path);
      return path2Posix(documentDirName);
    })
  );
  const getFileAsKeyPath = async (args, debug) => {
    let cmdVariable = getProperty(args, '@useCommand');
    if (cmdVariable) {
      if (debug) { console.log(`commandvariable.file.fileAsKey: use command variable: ${cmdVariable}`); }
      let cmdMatch = cmdVariable.match(/^\$\{command:(.*)\}$/);
      if (!cmdMatch) { return undefined; }
      if (debug) { console.log(`commandvariable.file.fileAsKey: execute command: ${cmdMatch[1]}`); }
      /** @type string */
      let path = await vscode.commands.executeCommand(cmdMatch[1]);
      if (debug) { console.log(`commandvariable.file.fileAsKey: execute command result: ${path}`); }
      return path.replace(/\\/g, '/');
    }
    return common.activeTextEditorVariable( editor => editor.document.uri.path );
  };
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.fileAsKey', async (args) => {
      let debug = getProperty(args, '@debug', false);
      if (debug) { console.log("commandvariable.file.fileAsKey: debug logs enabled"); }
      let path = await getFileAsKeyPath(args, debug);
      if (debug) { console.log(`commandvariable.file.fileAsKey: path used: ${path}`); }
      let deflt = getProperty(args, '@default', 'Unknown');
      if (debug) { console.log(`commandvariable.file.fileAsKey: default value: ${deflt}`); }
      for (const key in args) {
        if (args.hasOwnProperty(key) && (!key.startsWith('@')) && path) {
          if (debug) { console.log(`commandvariable.file.fileAsKey: try key: ${key}`); }
          if (path.indexOf(key) !== -1) {
            if (debug) { console.log(`commandvariable.file.fileAsKey: before variable substitution: ${args[key]}`); }
            let subst = await variableSubstitution(args[key], args);
            if (debug) { console.log(`commandvariable.file.fileAsKey: after variable substitution: ${subst}`); }
            return subst;
          }
        }
      }
      if (debug) { console.log("commandvariable.file.fileAsKey: return default"); }
      return deflt;
    })
  );
  context.subscriptions.push( ...range(5, 1).map(
    i => vscode.commands.registerCommand(`extension.commandvariable.file.fileDirname${i}Up`,
        () => fileDirnameNUp(i) )) );
  context.subscriptions.push( ...range(5, 1).map(
    i => vscode.commands.registerCommand(`extension.commandvariable.file.relativeFileDirname${i}Up`,
        () => fileDirnameNUp(i, false, true) )) );
  context.subscriptions.push( ...range(5, 1).map(
    i => vscode.commands.registerCommand(`extension.commandvariable.file.fileDirname${i}UpPosix`,
        () => fileDirnameNUp(i, true) )) );
  context.subscriptions.push( ...range(5, 1).map(
    i => vscode.commands.registerCommand(`extension.commandvariable.file.relativeFileDirname${i}UpPosix`,
        () => fileDirnameNUp(i, true, true) )) );
  const readFileContent = async (args, debug) => {
    if (debug) { console.log(`commandvariable.file.content: readFileContent: from: ${args.fileName}`); }
    if (!isString(args.fileName)) return "Unknown";
    // variables are not substituted by VSC
    args.fileName = await variableSubstitution(args.fileName, args);
    if (args.fileName === undefined) { return undefined; }
    if (debug) { console.log(`commandvariable.file.content: readFileContent: after variable substitution: ${args.fileName}`); }
    let uri = vscode.Uri.file(args.fileName);
    if (debug) { console.log(`commandvariable.file.content: readFileContent: test if file exists: ${uri.fsPath}`); }
    if(!fs.existsSync(uri.fsPath)) { return "Unknown"; }
    let contentUTF8 = await vscode.workspace.fs.readFile(uri);
    if (debug) { console.log(`commandvariable.file.content: readFileContent: read file before utf8 conversion`); }
    return utf8_to_str(contentUTF8);
  };
  async function contentValue(args, content, debug, debugCmd) {
    let expr = undefined;
    let parsedContent = undefined;
    if (args.json) {
      expr = args.json;
      parsedContent = JSON.parse(content);
    } else if (args.yaml) {
      expr = args.yaml;
      parsedContent = YAML.parse(content);
    }
    if (expr) {
      if (debug) { console.log(`commandvariable.${debugCmd}: expression: ${expr}`); }
      expr = await variableSubstitution(expr, args);
      if (debug) { console.log(`commandvariable.${debugCmd}: expression: after variable substitution: ${expr}`); }
      if (expr === undefined) { return undefined; }
      let value = getExpressionFunction(expr, 'commandvariable.file.content')(parsedContent);
      if (value === undefined) { return null; }
      return String(value);
    }
    let key = args.key;
    if (!key) { return content; }
    key = await variableSubstitution(key, args);
    if (key === undefined) { return undefined; }
    for (const kvLine of content.split(/\r?\n/)) {
      if (kvLine.match(/^\s*(\/\/|#)/)) { continue; }  // check comment lines
      let kvMatch = kvLine.match(/^\s*([^:=]+)[:=](.*)/);
      if (kvMatch && (kvMatch[1] === key) ) { return kvMatch[2]; }
    }
    return null;
  }
  const argsContentValue = async (args, getContentFunc, keyRememberDflt, debugCmd) => {
    args = dblQuest(args, {});
    let debug = getProperty(args, 'debug');
    if (debug) { console.log(`commandvariable.${debugCmd}: debug logs enabled`); }
    let content = await getContentFunc(args, debug);
    if (content === undefined) { return undefined; }
    if (debug) { console.log(`commandvariable.${debugCmd}: content: ${content}`); }
    let value = await contentValue(args, content, debug, debugCmd);
    if (debug) { console.log(`commandvariable.${debugCmd}: content to value: ${value}`); }
    if (value === undefined) { return undefined; }
    let result = "Unknown";
    if (!(value === null || value === undefined)) { result = value; }
    else {
      if (args.default !== undefined) { result = args.default; }
    }
    if (debug) { console.log(`commandvariable.${debugCmd}: result: ${result}`); }
    let keyRemember = getProperty(args, 'keyRemember', keyRememberDflt);
    storeStringRemember({key: keyRemember}, result);
    return result;
  };
  const fileContent = async (args) => {
    return await argsContentValue(args, readFileContent, 'fileContent', 'file.content');
  };
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.content', async (args) => {
      return await fileContent(args);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.contentInEditor', async (args) => {
      const editor = vscode.window.activeTextEditor;
      const content = await fileContent(args);
      editor.edit( editBuilder => { editBuilder.replace(editor.selection, content); });
    })
  );
  const getConfigVariable = async (args, debug) => {
    if (!isString(args.configVariable)) { args.configVariable = "editor.fontSize"; }
    if (debug) { console.log(`commandvariable.config.expression: getConfigVariable: from: ${args.configVariable}`); }
    // variables are not substituted by VSC
    args.configVariable = await variableSubstitution(args.configVariable, args);
    if (debug) { console.log(`commandvariable.config.expression: getConfigVariable: after variable substitution: ${args.configVariable}`); }
    let configSplit = args.configVariable.split('.');
    configSplit = [configSplit[0], configSplit.slice(1).join('.')]
    return JSON.stringify(vscode.workspace.getConfiguration(configSplit[0], null).get(configSplit[1]));
  };
  const configExpression = async (args) => {
    args = dblQuest(args, {});
    args.json = args.expression; // we use the 'json' property in the 'contentValue' function
    return await argsContentValue(args, getConfigVariable, 'configExpression', 'config.expression');
  };
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.config.expression', async (args) => {
      return await configExpression(args);
    })
  );
  const jsExpression = async (args) => {
    return configExpression(args);
  };
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.js.expression', async (args) => {
      return jsExpression(args);
    })
  );
  /** @param {vscode.Uri[]} uriList @param {Object} args */
  async function constructFilePickList(uriList, args, folderPath) {
    let addEmpty    = getProperty(args, 'addEmpty', false);
    let addAsk      = getProperty(args, 'addAsk', false);
    let display     = getProperty(args, 'display', "relativePath");

    let pickList = [];
    for (const u of uriList) {
      pickList.push(await new FilePickItem().fromURI(u, display, folderPath, args, transform));
    }
    if (display === 'transform') {
      let unique = new Set();
      let pickListUnique = [];
      // using pickList.forEach() works but the type of picklist will be any[] and that generates a type error
      for (const fpi of pickList) {
        if (!unique.has(fpi.value)) {
          unique.add(fpi.value);
          pickListUnique.push(fpi);
        }
      }
      pickList = pickListUnique;
    }
    if (addAsk) { pickList.unshift(new FilePickItem().ask()); }
    if (addEmpty) { pickList.unshift(new FilePickItem().empty()); }
    return pickList;
  }
  /** @param {string[]} predef */
  function constructFolderPickList(predef, labelTransform) {
    let pickList = predef.map(p => new FolderPickItem().fromString(p, labelTransform));
    pickList.push(new FolderPickItem().ask());
    pickList.push(new FolderPickItem().workspace());
    return pickList;
  }
  async function _pickFile(args) {
    let globInclude = getProperty(args, 'include', '**/*');
    let globExclude = getProperty(args, 'exclude', 'undefined');
    let maxResults  = getProperty(args, 'maxResults', undefined);
    let fromFolder  = getProperty(args, 'fromFolder');
    let fromWorkspace = getProperty(args, 'fromWorkspace', false);
    let canPickMany = getProperty(args, 'multiPick', false) || getProperty(args, 'canPickMany', false);
    let placeHolder = getProperty(args, 'description', canPickMany ? 'Select 1 or more files' : 'Select a file');
    let showDirs = getProperty(args, 'showDirs', false);
    let acceptIfOneFile = getProperty(args, 'acceptIfOneFile', false);
    if (globExclude === 'undefined') globExclude = undefined;
    if (globExclude === 'null') globExclude = null;
    let ignoreFocusOut = {ignoreFocusOut:true};
    let folderPath = undefined;

    if (fromFolder) {
      let picked = undefined;
      let fixedDir = getProperty(fromFolder, 'fixed');
      if (fixedDir) {
        picked = {value: fixedDir};
      } else {
        let predefined = getProperty(fromFolder, 'predefined', []);
        const config = getConfig();
        const labelClipPoint = config.get("file.pickFile.labelClipPoint");
        let labelMaximumLength = Math.max(0, config.get("file.pickFile.labelMaximumLength"));
        labelMaximumLength = labelMaximumLength < 10 ? 0 : labelMaximumLength;
        let takeStart = undefined;
        let takeEnd = undefined;
        if (labelMaximumLength > 0) {
          let maxLengthAdjust = labelMaximumLength-5;
          let validClip = Math.min(maxLengthAdjust, Math.abs(labelClipPoint));
          if (labelClipPoint >= 0) {
            takeStart = validClip;
            takeEnd = maxLengthAdjust - validClip;
          } else {
            takeStart = maxLengthAdjust - validClip;
            takeEnd = validClip;
          }
        }
        let labelTransform = {maxLength: labelMaximumLength, takeStart, takeEnd, transform: getProperty(fromFolder, 'labelTransform', [])};
        picked = await vscode.window.showQuickPick(constructFolderPickList(predefined, labelTransform), {placeHolder: "Select a folder"});
      }
      if (!picked) { return undefined; }
      folderPath = picked.value;
      if (picked.askValue) {
        folderPath = await vscode.window.showInputBox(ignoreFocusOut);
        if (!folderPath) { return undefined; }
      }
      if (picked.askWorkspace) {
        fromWorkspace = true;
      } else {
        folderPath = vscode.Uri.file(await variableSubstitution(folderPath, args));
        globInclude = new vscode.RelativePattern(folderPath, globInclude);
      }
    }
    if (fromWorkspace) {
      let workspace = undefined;
      if (isString(fromWorkspace)) {
        workspace = common.getNamedWorkspaceFolder(fromWorkspace);
      } else {
        workspace = await vscode.window.showWorkspaceFolderPick(ignoreFocusOut);
      }
      if (!workspace) { return undefined; }
      folderPath = workspace.uri;
      globInclude = new vscode.RelativePattern(workspace, globInclude);
    }

    let picked = await vscode.workspace.findFiles(globInclude, globExclude, maxResults)
      // @ts-ignore
      .then( uriList => {
        if (showDirs) {
          let unique = new Set();
          uriList.forEach( uri => unique.add(path.dirname(uri.fsPath)) );
          uriList = Array.from(unique).map( p => vscode.Uri.file(p) );
        }
        if (acceptIfOneFile && uriList.length === 1) {
          return new FilePickItem().fromURI(uriList[0]);
        }
        return vscode.window.showQuickPick(constructFilePickList(uriList.sort( (a,b) => a.path<b.path?-1:(b.path<a.path?1:0) ), args, folderPath), {placeHolder, canPickMany});
      });
    if (picked !== undefined && !canPickMany) { picked = [ picked ]; }
    return savePickedURI(picked, args, 'pickFile')
  }
  /** @param {any[]} picked @param {object} args @param {string} keyRememberDefault */
  async function savePickedURI(picked, args, keyRememberDefault) {
    if (!picked) { return undefined; }
    for (let pck of picked) {
      if (pck.askValue) {
        let ignoreFocusOut = {ignoreFocusOut:true};
        pck.value = await vscode.window.showInputBox(ignoreFocusOut);
        if (pck.value !== undefined && pck.value.length > 0) {
          pck.uri = vscode.Uri.file(pck.value);
        }
      }
      if (pck.value === undefined) { return undefined; }
    }
    let separator = getProperty(args, 'separator', ' ');
    let values = picked.map(pck => pck.value);
    let keyRemember = getProperty(args, 'keyRemember', keyRememberDefault);
    let kvPairs = {};
    kvPairs[keyRemember] = values.join(separator);
    kvPairs[keyRemember+common.PostfixURI] = picked.map(pck => pck.uri);
    storeStringRemember2({key: keyRemember}, kvPairs);
    let result = await transformResult(args, values, '${file}', keyRemember);
    return getProperty(args, 'empty', false) ? '' : result;
  }
  async function pickFile(args) {
    args = dblQuest(args, {});
    if (common.checkEscapedUI(args)) { return undefined; }
    return common.storeEscapedUI(await _pickFile(args));
  }
  context.subscriptions.push(vscode.commands.registerCommand('extension.commandvariable.file.pickFile', pickFile));

  async function _osFileDialog(mode, args, dialogCB) {
    let options = {};
    let canSelect = getProperty(args, 'canSelect', 'files');
    options['canSelectFiles'] = canSelect == 'files';
    options['canSelectFolders'] = canSelect == 'folders';
    options['canSelectMany'] = getProperty(args, 'canSelectMany');
    let defaultUri = getProperty(args, 'defaultUri');
    if (defaultUri !== undefined) {
      defaultUri = vscode.Uri.file(await variableSubstitution(defaultUri, args));
    }
    options['defaultUri'] = defaultUri;
    options['filters'] = getProperty(args, 'filters');
    let labelProp = `${mode}Label`;
    options[labelProp] = getProperty(args, labelProp);
    options['title'] = getProperty(args, 'title');
    let picked = undefined;
    let resultDialog = await dialogCB(options);
    if (resultDialog) {
      if (!utils.isArray(resultDialog)) {
        resultDialog = [ resultDialog ]
      }
      picked = resultDialog.map(uri => { return {value: uri.fsPath, uri}; });
    }
    return savePickedURI(picked, args, `${mode}Dialog`);
  }
  async function osFileDialog(mode, args, dialogCB) {
    args = dblQuest(args, {});
    if (common.checkEscapedUI(args)) { return undefined; }
    return common.storeEscapedUI(await _osFileDialog(mode, args, dialogCB));
  }
  async function openDialog(args) { return await osFileDialog('open', args, vscode.window.showOpenDialog); }
  async function saveDialog(args) { return await osFileDialog('save', args, vscode.window.showSaveDialog); }
  context.subscriptions.push(vscode.commands.registerCommand('extension.commandvariable.file.openDialog', openDialog));
  context.subscriptions.push(vscode.commands.registerCommand('extension.commandvariable.file.saveDialog', saveDialog));
  context.subscriptions.push(
    // TODO Deprecated 2022-03
    vscode.commands.registerCommand('extension.commandvariable.workspace.workspaceFolderPosix', args => { return workspaceFolderNUp(0, true, args); })
  );
  context.subscriptions.push( ...range(6).map(
    i => vscode.commands.registerCommand(`extension.commandvariable.workspace.folder${utils.nUp(i)}`,
        args => workspaceFolderNUp(i, false, args) )) );
  context.subscriptions.push( ...range(6).map(
    i => vscode.commands.registerCommand(`extension.commandvariable.workspace.folder${utils.nUp(i)}Posix`,
        args => workspaceFolderNUp(i, true, args) )) );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.dirSep', () => { return process.platform === 'win32' ? '\\' : '/'; })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.envListSep', () => { return process.platform === 'win32' ? ';' : ':'; })
  );
  context.subscriptions.push(vscode.commands.registerCommand('extension.commandvariable.transform', transform));
  async function transform(args, textDefault, uri) {
    args = dblQuest(args, {});
    let text    = getProperty(args, 'text', dblQuest(textDefault, ''));
    let find    = getProperty(args, 'find');
    let replace = getProperty(args, 'replace', "");
    let flags   = getProperty(args, 'flags', "");
    let key     = getProperty(args, 'key', 'transform');
    let apply   = getProperty(args, 'apply');
    let saveToFile = getProperty(args, 'saveToFile');
    text = await variableSubstitution(text, args, uri);
    key = await variableSubstitution(key, args, uri);
    saveToFile = await variableSubstitution(saveToFile, args, uri);
    if (!apply) {
      apply = [ {find, replace, flags} ]
    }
    for (const fr of apply) {
      find = await variableSubstitution(getProperty(fr, 'find'), args, uri);
      if (text && find) {
        flags = await variableSubstitution(getProperty(fr, 'flags', ""), args, uri);
        let regex = new RegExp(find, flags);
        if (!regex.test(text)) { continue; }
        replace = await variableSubstitution(getProperty(fr, 'replace', ""), args, uri);
        regex.lastIndex = 0;
        text = text.replace(regex, replace);
      }
    }
    if (saveToFile) {
      let uri = vscode.Uri.file(saveToFile);
      await vscode.workspace.fs.writeFile(uri, new Uint8Array(utils.str_to_utf8_array(text)));
      return savePickedURI([{value: uri.fsPath, uri}], args, key);
    }
    return storeStringRemember2({ key }, text);
  }
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.inTerminal', async args => {
      if (!args) { args = {}; }
      let command = getProperty(args, 'command');
      if (!command) { return; }
      let when = getProperty(args, 'when');
      if (when) {
        let fileExists = 'file.exists ';
        if (when.startsWith(fileExists)) {
          let filePath = await variableSubstitution(when.substring(fileExists.length), args);
          try {
            await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
          } catch (error) {
            return;
          }
        }
      }
      let cmdArgs = getProperty(args, 'args');
      let result = await vscode.commands.executeCommand(command, cmdArgs);
      if (!isString(result)) { return; }
      await vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { "text": result });
      if (getProperty(args, 'addCR', false)) {
        await vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { "text": "\u000D" });
      }
    })
  );
  // ***** An extended version for desktop
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.pickStringRemember', async args => {
      args = common.checkIfArgsIsLaunchConfig(args);
      if (!args) { args = {}; }
      let fileName = getProperty(args, 'fileName');
      if (fileName) {
        let fileFormat = getProperty(args, 'fileFormat', 'pattern');
        let content = await readFileContent(args, getProperty(args, 'debug'));
        let options = getProperty(args, 'options', []);
        if (fileFormat === 'pattern') {
          let pattern = getProperty(args, 'pattern', {});
          let regexp = new RegExp(getProperty(pattern, 'regexp', '^(.*)$'), getProperty(pattern, 'flags', ''));
          let labelRepl = getProperty(pattern, 'label', '$1');
          let valueRepl = getProperty(pattern, 'value', labelRepl);
          let jsonRepl = getProperty(pattern, 'json');
          let option = getProperty(pattern, 'option', {label: labelRepl, value: valueRepl, json: jsonRepl});
          let patternMatch = getProperty(pattern, 'match', 'line');
          let splitRegexp = getProperty(pattern, 'split-regexp');
          let splitFlags = getProperty(pattern, 'split-flags', 'gm');
          if (splitRegexp !== undefined) { patternMatch = 'split'; }
          const convertString = (s, cbData) => cbData.line.replace(cbData.regexp, s);
          const resolveOption = async (option, cbData) => {
            option = await dataStructSubstitution(option, cbData, convertString);
            if (option.json !== undefined && isString(option.json) && option.json.length > 0) {
              option.value = JSON.parse(option.json);
            }
            return option;
          };
          let optionStrings = [];
          if (patternMatch === 'line') {
            optionStrings = content.split(/\r?\n/);
          } else if (patternMatch === 'split') {
            let regexp = new RegExp(splitRegexp, splitFlags);
            let prevIndex = 0;
            let match;
            while ((match = regexp.exec(content)) !== null) {
              optionStrings.push(content.slice(prevIndex, match.index));
              prevIndex = match.index;
            }
            optionStrings.push(content.slice(prevIndex));
          } else {
            let match;
            while ((match = regexp.exec(content)) !== null) {
              optionStrings.push(match[0]);
            }
          }
          for (const line of optionStrings) {
            regexp.lastIndex = 0;
            if (!line.match(regexp)) { continue; }
            try {
              options.push(await resolveOption(option, {line, regexp}));
            } catch (e) {
              break;
            }
          }
        }
        if (fileFormat === 'json') {
          const jsonOption = getProperty(args, 'jsonOption', {});
          const data = JSON.parse(content);
          const convertString = (s, cbData) => {
            s = s.replace(/(__itemIdx__)/g, 'contentExt.$1');
            let func = getExpressionFunction(s, 'commandvariable.pickStringRemember');
            if (func === undefined) {
              throw new Error("Illegal expression");
            }
            return func(cbData.data, { __itemIdx__: cbData.index });
          };
          for (let index = 0; index < 10000; index++) {
            try {
              options.push(await dataStructSubstitution(jsonOption, {data, index}, convertString));
            } catch (e) {
              break;
            }
          }
        }
        args.options = options;
      }
      return common.pickStringRemember(args, variableSubstitution);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.remember', async args => {
      return remember(common.checkIfArgsIsLaunchConfig(args));
    })
  );
  // ******************************************************************
};

function deactivate() {
  if (gRememberStorePersistentFSPath) {
    let rememberStore = common.getRememberStore();
    delete rememberStore["empty"];
    for (const key of Object.keys(rememberStore)) {
      if (key.startsWith('__')) {
        delete rememberStore[key];
      }
    }
    try {
      fs.writeFileSync(gRememberStorePersistentFSPath, JSON.stringify(rememberStore), {encoding: 'utf8', mode: 0o600});
    } catch (error) {}
  }
}

module.exports = {
  activate,
  deactivate
}
