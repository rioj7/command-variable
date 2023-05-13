const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const common = require('./out/extension-common');
const utils = require('./utils');
const YAML = require('./yaml.js');

const PostfixURI = '@URI@';
let gRememberStorePersistentFSPath = undefined;

class FilePickItem {
  constructor() {
    this.uri = undefined;
    this.value = undefined;
  }
  fromURI(uri, display) {
    this.uri = uri;
    this.label = uri.fsPath;
    if (display === 'fileName') {
      this.description = ' $(folder) ' + path.dirname(this.label);
      this.label = path.basename(this.label);
    }
    this.value = uri.fsPath;
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

  common.setAsDesktopExtension();
  common.activate(context);

  readRememberPersistent(getConfig, variableSubstitutionSync_1);

  var replaceVariableWithProperties = (text, varName, args, replaceFunc) => {
    var fieldRegex = new RegExp(`\\$\\{${varName}(\\}|([^a-zA-Z{}]+)(.+?)\\2\\})`, 'g');
    var replaceFuncNewArgs = (m,hasParams,sep,params) => {
      var _args = {...args};
      if (hasParams !== '}') {
        params.split(sep).forEach(p => {
          let eq = p.indexOf('=');
          if (eq === -1) { return; }
          _args[p.substring(0, eq).trim()] = p.substring(eq+1);
        });
      }
      return replaceFunc(_args);
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
  async function transformResult(args, result, textDefault, uriKey) {
    let transformArgs = getProperty(args, 'transform');
    if (transformArgs) {
      args['__result'] = result;
      result = await transform(transformArgs, textDefault, getRememberKey(uriKey+PostfixURI, '__undefined'));
    }
    return result;
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
    let command_args = getProperty(args, 'args');
    if (utils.getProperty(args, "variableSubstArgs")) {
      command_args = await dataStructSubstitution(command_args, args, (s, args) => variableSubstitution(s, args));
      if (command_args === undefined) { return undefined; }
    }
    return vscode.commands.executeCommand(command, command_args);
  }
  async function remember(args) { // make it async so it can be used with asyncVariable
    let result = common.rememberCommand(args, variableSubstitution);
    return transformResult(args, result, '${result}', args.key);
  }
  async function pickStringRemember(args) { // pass variableSubstitution
    return common.pickStringRemember(args, variableSubstitution);
  }
  var asyncVariable = async (text, args, func) => {
    if (text === undefined) { return undefined; }  // escaped a UI element
    let asyncArgs = [];
    let varRE = new RegExp(`\\$\\{${func.name}:(.+?)\\}`, 'g');
    text = text.replace(varRE, (m, p1) => {
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
      asyncArgs.push(nameArgs);
      return m;
    });
    for (let i = 0; i < asyncArgs.length; i++) {
      asyncArgs[i] = await func(asyncArgs[i]);
      if (asyncArgs[i] === undefined) { return undefined; }
    }
    text = text.replace(varRE, (m, p1) => {
      return asyncArgs.shift();
    });
    return text;
  };
  function variableSubstitutionSync_1(result, uri) {
    result = result.replace(/\$\{pathSeparator\}/g, process.platform === 'win32' ? '\\' : '/');
    result = result.replace(/\$\{userHome\}/g, process.platform === 'win32' ? '${env:HOMEDRIVE}${env:HOMEPATH}' : '${env:HOME}');
    result = result.replace(/\$\{env:([^}]+)\}/g, (m, p1) => {
      return getProperty(process.env, p1, '');
    } );
    result = result.replace(/\$\{workspaceFolder\}/g, m => {
      return URIWorkspaceFolder(uri, workspaceFolder => {
        return workspaceFolder.uri.fsPath;
      });
    });
    result = result.replace(/\$\{workspaceFolder:(.+?)\}/g, (m, p1) => {
      let wsf = common.getNamedWorkspaceFolder(p1);
      if (!wsf) { return 'Unknown'; }
      return wsf.uri.fsPath;
    });
    result = result.replace(/\$\{workspaceFolderBasename\}/g, m => {
      return URIWorkspaceFolder(uri, workspaceFolder => {
        return path.basename(workspaceFolder.uri.fsPath);
      });
    });
    return result;
  }
  var variableSubstitution = async (text, args, uri) => {
    args = dblQuest(args, {});
    let stringSubstitution = async (text) => {
      const editor = vscode.window.activeTextEditor;
      if (!uri && editor) { uri = editor.document.uri; }
      if (!isString(text)) { return text; }
      var result = text;
      result = result.replace(/\$\{result\}/g, getProperty(args, '__result', ''));
      if (editor) {
        result = replaceVariableWithProperties(result, 'selectedText', args, _args => common.concatMapSelections(_args, common.getEditorSelection) );
      }
      result = variableSubstitutionSync_1(result, uri);
      result = await asyncVariable(result, args, transform);
      result = await asyncVariable(result, args, command);
      result = await asyncVariable(result, args, pickStringRemember);
      result = await asyncVariable(result, args, common.promptStringRemember);
      result = await asyncVariable(result, args, pickFile);
      result = await asyncVariable(result, args, fileContent);
      result = await asyncVariable(result, args, configExpression);
      result = await asyncVariable(result, args, remember);
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
      result = result.replace(/\$\{file\}/g, fileFSPath);
      const relativeFile = URIWorkspaceFolder(uri, workspaceFolder => {
        const wsfFSPath = workspaceFolder.uri.fsPath;
        if (fileFSPath.startsWith(wsfFSPath)) {
          return fileFSPath.substring(wsfFSPath.length + 1); // remove extra separator;
        }
        return 'Unknown';
      });
      result = result.replace(/\$\{relativeFile\}/g, relativeFile);
      const filePath = uri.path;
      const lastSep = filePath.lastIndexOf('/');
      if (lastSep === -1) { return result; }
      const fileBasename = filePath.substring(lastSep+1);
      result = result.replace(/\$\{fileBasename\}/g, fileBasename);
      const lastDot = fileBasename.lastIndexOf('.');
      const fileBasenameNoExtension = lastDot >= 0 ? fileBasename.substring(0, lastDot) : fileBasename;
      result = result.replace(/\$\{fileBasenameNoExtension\}/g, fileBasenameNoExtension);
      const fileExtname = lastDot >= 0 ? fileBasename.substring(lastDot) : '';
      result = result.replace(/\$\{fileExtname\}/g, fileExtname);
      let fileDirname = fileFSPath.substring(0, fileFSPath.length-(fileBasename.length+1));
      result = result.replace(/\$\{fileDirname\}/g, fileDirname);
      let relativeFileDirname = relativeFile;
      if (relativeFile.endsWith(fileBasename)) {
        relativeFileDirname = relativeFile.substring(0, relativeFile.length-(fileBasename.length+1));
      }
      result = result.replace(/\$\{relativeFileDirname\}/g, relativeFileDirname);
      return result;
    };
    if (Array.isArray(text)) {
      let result = [];
      for (let i = 0; i < text.length; i++) {
        result.push(await stringSubstitution(text[i]));
      }
      return result;
    }
    return await stringSubstitution(text);
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
    if (debug) { console.log(`commandvariable.file.content: readFileContent: after variable substitution: ${args.fileName}`); }
    let uri = vscode.Uri.file(args.fileName);
    if (debug) { console.log(`commandvariable.file.content: readFileContent: test if file exists: ${uri.fsPath}`); }
    if(!fs.existsSync(uri.fsPath)) { return "Unknown"; }
    let contentUTF8 = await vscode.workspace.fs.readFile(uri);
    if (debug) { console.log(`commandvariable.file.content: readFileContent: read file before utf8 conversion`); }
    return utf8_to_str(contentUTF8);
  };
  async function contentValue(args, content) {
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
      expr = await variableSubstitution(expr, args);
      let value = getExpressionFunction(expr, 'commandvariable.file.content')(parsedContent);
      if (value === undefined) { return value; }
      return String(value);
    }
    let key = args.key;
    if (!key) { return content; }
    key = await variableSubstitution(key, args);
    for (const kvLine of content.split(/\r?\n/)) {
      if (kvLine.match(/^\s*(\/\/|#)/)) { continue; }  // check comment lines
      let kvMatch = kvLine.match(/^\s*([^:=]+)[:=](.*)/);
      if (kvMatch && (kvMatch[1] === key) ) { return kvMatch[2]; }
    }
  }
  const argsContentValue = async (args, getContentFunc, keyRememberDflt, debugCmd) => {
    args = dblQuest(args, {});
    let debug = getProperty(args, 'debug');
    if (debug) { console.log(`commandvariable.${debugCmd}: debug logs enabled`); }
    let content = await getContentFunc(args, debug);
    if (debug) { console.log(`commandvariable.${debugCmd}: content: ${content}`); }
    let value = await contentValue(args, content);
    if (debug) { console.log(`commandvariable.${debugCmd}: content to value: ${value}`); }
    let result = "Unknown";
    if (value) { result = value; }
    else {
      if (args.default) { result = args.default; }
    }
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
    if (debug) { console.log(`commandvariable.config.expression: getConfigVariable: from: ${args.configVariable}`); }
    if (!isString(args.configVariable)) return "Unknown";
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
  /** @param {vscode.Uri[]} uriList @param {Object} args */
  function constructFilePickList(uriList, args) {
    let addEmpty    = getProperty(args, 'addEmpty', false);
    let addAsk      = getProperty(args, 'addAsk', false);
    let display     = getProperty(args, 'display', "fullPath");

    let pickList = uriList.map(u => new FilePickItem().fromURI(u, display));
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
    let placeHolder = getProperty(args, 'description', 'Select a file');
    let keyRemember = getProperty(args, 'keyRemember', 'pickFile');
    let showDirs = getProperty(args, 'showDirs', false);
    let acceptIfOneFile = getProperty(args, 'acceptIfOneFile', false);
    if (globExclude === 'undefined') globExclude = undefined;
    if (globExclude === 'null') globExclude = null;
    let ignoreFocusOut = {ignoreFocusOut:true};

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
      let folderPath = picked.value;
      if (picked.askValue) {
        folderPath = await vscode.window.showInputBox(ignoreFocusOut);
        if (!folderPath) { return undefined; }
      }
      if (picked.askWorkspace) {
        fromWorkspace = true;
      } else {
        globInclude = new vscode.RelativePattern(vscode.Uri.file(await variableSubstitution(folderPath, args)), globInclude);
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
      globInclude = new vscode.RelativePattern(workspace, globInclude);
    }

    return vscode.workspace.findFiles(globInclude, globExclude, maxResults)
      .then( uriList => {
        if (showDirs) {
          let unique = new Set();
          uriList.forEach( uri => unique.add(path.dirname(uri.fsPath)) );
          uriList = Array.from(unique).map( p => vscode.Uri.file(p) );
        }
        if (acceptIfOneFile && uriList.length === 1) {
          return new FilePickItem().fromURI(uriList[0]);
        }
        return vscode.window.showQuickPick(constructFilePickList(uriList.sort( (a,b) => a.path<b.path?-1:(b.path<a.path?1:0) ), args), {placeHolder});
      })
      .then(async picked => {
        if (!picked) { return undefined; }
        if (picked.askValue) {
          picked.value = await vscode.window.showInputBox(ignoreFocusOut);
          if (picked.value !== undefined && picked.value.length > 0) {
            picked.uri = vscode.Uri.file(picked.value);
          }
        }
        if (picked.value === undefined) { return undefined; }
        let kvPairs = {};
        kvPairs[keyRemember] = picked.value;
        kvPairs[keyRemember+PostfixURI] = picked.uri;
        let result = storeStringRemember2({key: keyRemember}, kvPairs);
        result = await transformResult(args, result, '${file}', keyRemember);
        return getProperty(args, 'empty', false) ? '' : result;
      });
  }
  async function pickFile(args) {
    args = dblQuest(args, {});
    if (common.checkEscapedUI(args)) { return undefined; }
    return common.storeEscapedUI(await _pickFile(args));
  }
  context.subscriptions.push(vscode.commands.registerCommand('extension.commandvariable.file.pickFile', pickFile));
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
    text = await variableSubstitution(text, args, uri);
    key = await variableSubstitution(key, args, uri);
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
    return storeStringRemember2({ key }, text);
  }
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.inTerminal', async args => {
      if (!args) { args = {}; }
      let command = getProperty(args, 'command');
      if (!command) { return; }
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
          let regexp = new RegExp(getProperty(pattern, 'regexp', '^(.*)$'));
          let labelRepl = getProperty(pattern, 'label', '$1');
          if (!labelRepl) { return 'Unknown'; }
          let valueRepl = getProperty(pattern, 'value', labelRepl);
          let jsonRepl = getProperty(pattern, 'json');
          const getValue = line => {
            if (jsonRepl) {
              let capture = line.replace(regexp, jsonRepl);
              if (capture) {
                return JSON.parse(capture);
              }
            }
            return line.replace(regexp, valueRepl);
          };
          for (const line of content.split(/\r?\n/)) {
            if (!line.match(regexp)) { continue; }
            options.push( [line.replace(regexp, labelRepl), getValue(line)] );
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
