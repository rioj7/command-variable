const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
let UUID = require('./uuid');

class FilePickItem {
  fromURI(uri, display) {
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
  fromString(path) {
    this.label = path;
    this.value = path;
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

function activate(context) {
  const getProperty = (obj, prop, deflt) => { return obj.hasOwnProperty(prop) ? obj[prop] : deflt; };
  const errorMessage = (msg, noObject) => { vscode.window.showErrorMessage(msg); return noObject ? noObject : "Unknown";};
  const fileNotInFolderError = (noObject) => errorMessage('File not in Multi-root Workspace', noObject);
  const isString = obj => typeof obj === 'string';
  const isArray = obj => Array.isArray(obj);
  const isObject = obj => (typeof obj === 'object') && !isArray(obj);
  function utf8_to_str (src, off, lim) {  // https://github.com/quicbit-js/qb-utf8-to-str-tiny
    lim = lim == null ? src.length : lim;
    for (var i = off || 0, s = ''; i < lim; i++) {
      var h = src[i].toString(16);
      if (h.length < 2) h = '0' + h;
      s += '%' + h;
    }
    return decodeURIComponent(s);
  }
  function range(size, startAt = 0) { return [...Array(size).keys()].map(i => i + startAt); }  // https://stackoverflow.com/a/10050831/9938317
  function dblQuest(value, deflt) { return value !== undefined ? value : deflt; }
  var getNamedWorkspaceFolder = (name, workspaceFolder, editor) => {
    const folders = dblQuest(vscode.workspace.workspaceFolders, []);
    if (!name) {
      if (editor) { return workspaceFolder; }
      if (folders.length === 1) { return workspaceFolder; }
      errorMessage('Use the name of the Workspace Folder in the variable or argument');
      return undefined;
    }
    let filterPred = w => w.name === name;
    if (name.indexOf('/') >= 0) { filterPred = w => w.uri.path.endsWith(name); }
    let wsfLst = folders.filter(filterPred);
    if (wsfLst.length === 0) {
      errorMessage(`Workspace not found with name: ${name}`);
      return undefined;
    }
    return wsfLst[0];
  };
  const activeTextEditorVariable = (action, args, noEditor, editorOptional) => {
    const editor = vscode.window.activeTextEditor;
    if (!editorOptional) {
      if (!editor) { return errorMessage('No editor', noEditor); }
    }
    return action(editor, args);
  };
  const activeWorkspaceFolder = (action, noWorkSpace, editorOptional) => {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) { return errorMessage('No folder open', noWorkSpace); }
    return activeTextEditorVariable( editor => {
      let folder = undefined;
      if (editor) {
        folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
      } else {
        folder = folders[0];  // choose first folder in the list
      }
      return folder ? action(folder, editor) : fileNotInFolderError(noWorkSpace);
    }, undefined, undefined, editorOptional);
  };
  const activeWorkspaceFolderEditorOptional = (action, noWorkSpace, workspaceName) => {
    const editorOptional = true;
    return activeWorkspaceFolder( (workspaceFolder, editor) => {
      workspaceFolder = getNamedWorkspaceFolder(workspaceName, workspaceFolder, editor);
      if (!workspaceFolder) { return 'Unknown'; }
      return action(workspaceFolder, editor);
    }, noWorkSpace, editorOptional);
  };
  var basenameNUp = function (dirUriPath, n) {
    const rootParts = dirUriPath.split('/');
    if (n > rootParts.length-2) { vscode.window.showErrorMessage('Not enough parent directories'); return "Unknown"; }
    return rootParts[rootParts.length - (n+1)];
  };
  var workspaceFolderBasenameNUp = function (n, args) {
    return activeWorkspaceFolderEditorOptional( workspaceFolder => {
      return basenameNUp(workspaceFolder.uri.path, n);
    }, undefined, args !== undefined ? args.name : undefined);
  };
  var fileDirBasenameNUp = function (n) {
    return activeTextEditorVariable( editor => {
      const path = editor.document.uri.path;
      const lastSep = path.lastIndexOf('/');
      if (lastSep === -1) { return "Unknown"; }
      return basenameNUp(path.substring(0, lastSep), n);
    });
  };
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
  var asyncVariable = async (text, args, func) => {
    let asyncArgs = [];
    let varRE = new RegExp(`\\$\\{${func.name}:(.+?)\\}`, 'g');
    text = text.replace(varRE, (m, p1) => {
      let nameArgs = getProperty(getProperty(args, func.name, {}), p1);
      if (!nameArgs) { return 'Unknown'; }
      asyncArgs.push(nameArgs);
      return m;
    });
    for (let i = 0; i < asyncArgs.length; i++) {
      asyncArgs[i] = await func(asyncArgs[i]);
    }
    text = text.replace(varRE, (m, p1) => {
      return asyncArgs.shift();
    });
    return text;
  };
  var variableSubstitution = async (text, args) => {
    args = dblQuest(args, {});
    let stringSubstitution = async (text) => {
      const editor = vscode.window.activeTextEditor;
      var result = text;
      if (editor) {
        result = replaceVariableWithProperties(result, 'selectedText', args, _args => concatMapSelections(_args, getEditorSelection) );
      }
      result = result.replace(/\$\{workspaceFolder\}/g, m => {
        return activeWorkspaceFolderEditorOptional( workspaceFolder => {
          return workspaceFolder.uri.fsPath;
        });
      });
      result = result.replace(/\$\{workspaceFolder:(.+?)\}/g, (m, p1) => {
        let wsf = getNamedWorkspaceFolder(p1);
        if (!wsf) { return 'Unknown'; }
        return wsf.uri.fsPath;
      });

      result = await asyncVariable(result, args, pickStringRemember);
      result = await asyncVariable(result, args, promptStringRemember);
      result = await asyncVariable(result, args, pickFile);
      result = await asyncVariable(result, args, fileContent);
      result = result.replace(/\$\{remember(?:Pick)?:(.+?)\}/g, (m, p1) => {
        return getRememberKey(p1);
      });

      if (!editor) { return result; }
      var fileFSPath = editor.document.uri.fsPath;
      result = result.replace(/\$\{file\}/g, fileFSPath);
      let relativeFile = activeWorkspaceFolder( workspaceFolder => {
        return fileFSPath.substring(workspaceFolder.uri.fsPath.length + 1); // remove extra separator;
      });
      result = result.replace(/\$\{relativeFile\}/g, relativeFile);
      const path = editor.document.uri.path;
      const lastSep = path.lastIndexOf('/');
      if (lastSep === -1) { return result; }
      const fileBasename = path.substring(lastSep+1);
      result = result.replace(/\$\{fileBasename\}/g, fileBasename);
      const lastDot = fileBasename.lastIndexOf('.');
      const fileBasenameNoExtension = lastDot >= 0 ? fileBasename.substring(0, lastDot) : fileBasename;
      result = result.replace(/\$\{fileBasenameNoExtension\}/g, fileBasenameNoExtension);
      const fileExtname = lastDot >= 0 ? fileBasename.substring(lastDot) : '';
      result = result.replace(/\$\{fileExtname\}/g, fileExtname);
      let fileDirname = fileFSPath.substring(0, fileFSPath.length-(fileBasename.length+1));
      result = result.replace(/\$\{fileDirname\}/g, fileDirname);
      let relativeFileDirname = relativeFile.substring(0, relativeFile.length-(fileBasename.length+1));
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
    return activeWorkspaceFolder( (workspaceFolder, editor) => {
      const rootPath = lowerCaseDriveLetter(workspaceFolder.uri.path);
      let documentPath = lowerCaseDriveLetter(editor.document.uri.path);
      if (get_dirname) { documentPath = path.dirname(documentPath); }
      if (documentPath.indexOf(rootPath) !== 0) { return fileNotInFolderError(); } // should never happen here
      return documentPath.substring(rootPath.length + 1);
    });
  };
  var fileDirnameNUp = function (n, posix, relative) {
    return activeWorkspaceFolder( (workspaceFolder, editor) => {
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
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.relativeFilePosix', () => {
      return relative_FileOrDirname_Posix(false);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.relativeFileDirnamePosix', () => {
      return relative_FileOrDirname_Posix(true);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.relativeDirDots', () => {
      return relative_FileOrDirname_Posix(true).replace(/\//g, () => ".");
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
      let path = await vscode.commands.executeCommand(cmdMatch[1]);
      if (debug) { console.log(`commandvariable.file.fileAsKey: execute command result: ${path}`); }
      return path.replace(/\\/g, '/');
    }
    return activeTextEditorVariable( editor => editor.document.uri.path );
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
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.fileDirBasename', () => {
      return fileDirBasenameNUp(0);
    })
  );
  context.subscriptions.push( ...range(5, 1).map(
    i => vscode.commands.registerCommand(`extension.commandvariable.file.fileDirBasename${i}Up`,
        () => fileDirBasenameNUp(i) )) );
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
  function getExpressionFunction(expr) {
    try {
      return Function(`"use strict";return (function calcexpr(content) {
        return ${expr};
      })`)();
    }
    catch (ex) {
      vscode.window.showErrorMessage("extension.commandvariable.file.content: Incomplete expression");
    }
  }
  async function contentValue(args, content) {
    let jsonExpr = args.json;
    if (jsonExpr) {
      jsonExpr = await variableSubstitution(jsonExpr, args);
      let value = getExpressionFunction(jsonExpr)(JSON.parse(content));
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
  const fileContent = async (args) => {
    args = dblQuest(args, {});
    let debug = getProperty(args, 'debug');
    if (debug) { console.log("commandvariable.file.content: debug logs enabled"); }
    let content = await readFileContent(args, debug);
    if (debug) { console.log(`commandvariable.file.content: content: ${content}`); }
    let value = await contentValue(args, content);
    if (debug) { console.log(`commandvariable.file.content: content to value: ${value}`); }
    let result = "Unknown";
    if (value) { result = value; }
    else {
      if (args.default) { result = args.default; }
    }
    let keyRemember = getProperty(args, 'keyRemember', 'fileContent');
    storeStringRemember({key: keyRemember}, result);
    return result;
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
  function constructFolderPickList(predef) {
    let pickList = predef.map(p => new FolderPickItem().fromString(p));
    pickList.push(new FolderPickItem().ask());
    pickList.push(new FolderPickItem().workspace());
    return pickList;
  }
  async function pickFile(args) {
    args = args || {};
    let globInclude = getProperty(args, 'include', '**/*');
    let globExclude = getProperty(args, 'exclude', 'undefined');
    let maxResults  = getProperty(args, 'maxResults', undefined);
    let fromFolder  = getProperty(args, 'fromFolder');
    let fromWorkspace = getProperty(args, 'fromWorkspace', false);
    let placeHolder = getProperty(args, 'description', 'Select a file');
    let keyRemember = getProperty(args, 'keyRemember', 'pickFile');
    if (globExclude === 'undefined') globExclude = undefined;
    if (globExclude === 'null') globExclude = null;
    let ignoreFocusOut = {ignoreFocusOut:true};

    if (fromFolder) {
      let predefined = getProperty(fromFolder, 'predefined', []);
      let picked = await vscode.window.showQuickPick(constructFolderPickList(predefined), {placeHolder: "Select a folder"});
      if (!picked) { return undefined; }
      let folderPath = picked.value;
      if (picked.askValue) {
        folderPath = await vscode.window.showInputBox(ignoreFocusOut);
        if (!folderPath) { return undefined; }
      }
      if (picked.askWorkspace) {
        fromWorkspace = true;
      } else {
        globInclude = new vscode.RelativePattern(vscode.Uri.file(folderPath), globInclude);
      }
    }
    if (fromWorkspace) {
      let workspace = undefined;
      if (isString(fromWorkspace)) {
        workspace = getNamedWorkspaceFolder(fromWorkspace);
      } else {
        workspace = await vscode.window.showWorkspaceFolderPick(ignoreFocusOut);
      }
      if (!workspace) { return undefined; }
      globInclude = new vscode.RelativePattern(workspace, globInclude);
    }

    return vscode.workspace.findFiles(globInclude, globExclude, maxResults)
      .then( uriList => vscode.window.showQuickPick(constructFilePickList(uriList.sort( (a,b) => a.path<b.path?-1:(b.path<a.path?1:0) ), args), {placeHolder}))
      .then( picked => {
        if (!picked) { return undefined; }
        if (picked.askValue) { return vscode.window.showInputBox(ignoreFocusOut); }
        return picked.value;
      })
      .then( value => {
        if (!value) { return undefined; }
        return storeStringRemember({key: keyRemember}, value);
      });
  }
  context.subscriptions.push(vscode.commands.registerCommand('extension.commandvariable.file.pickFile', pickFile));
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.workspace.workspaceFolderPosix', (args) => {
      return activeWorkspaceFolderEditorOptional( workspaceFolder => {
        return path2Posix(workspaceFolder.uri.path);
      }, undefined, args !== undefined ? args.name : undefined);
    })
  );
  context.subscriptions.push( ...range(5, 1).map(
    i => vscode.commands.registerCommand(`extension.commandvariable.workspace.folderBasename${i}Up`,
        (args) => workspaceFolderBasenameNUp(i, args) )) );
  function getExpressionFunctionFilterSelection(expr) {
    try {
      return Function(`"use strict";return (function calcexpr(value, index, numSel) {
        return ${expr};
      })`)();
    }
    catch (ex) {
      vscode.window.showErrorMessage("extension.commandvariable.selectedText: Incomplete expression");
    }
  }
  let concatMapSelections = function (args, map_func) {
    args = args || {};
    let separator = getProperty(args, 'separator', '\n');
    let selectionFilter = getExpressionFunctionFilterSelection(getProperty(args, 'filterSelection', 'true'));
    return activeTextEditorVariable( editor => {
      let numSel = editor.selections.length;
      return editor.selections.sort((a, b) => { return a.start.compareTo(b.start); })
          .map( s => map_func(editor, s) )
          .filter ( (value, index) => selectionFilter(value, index, numSel))
          .join(separator);
    });
  };
  const getEditorSelection = (editor, selection) => {
    var document = editor.document;
    var selectStart = document.offsetAt(selection.start);
    var selectEnd = document.offsetAt(selection.end);
    return document.getText().substring(selectStart, selectEnd);
  };
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.selectedText', args => {
      return concatMapSelections(args, getEditorSelection);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.currentLineText', args => {
      return concatMapSelections(args, (editor, selection) => {
        return editor.document.lineAt(selection.start).text;
      });
    })
  );
  var positionLineColumn = function (kind, lineChar) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { vscode.window.showErrorMessage('No editor'); return '1'; }
    var position = (kind==='start') ? editor.selection.start : editor.selection.end;
    return (( lineChar==='line' ? position.line : position.character ) + 1 ).toString();
  };
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.selectionStartLineNumber', () => { return positionLineColumn('start', 'line'); })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.selectionStartColumnNumber', () => { return positionLineColumn('start', 'column'); })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.selectionEndLineNumber', () => { return positionLineColumn('end', 'line'); })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.selectionEndColumnNumber', () => { return positionLineColumn('end', 'column'); })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.dirSep', () => { return process.platform === 'win32' ? '\\' : '/'; })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.envListSep', () => { return process.platform === 'win32' ? ';' : ':'; })
  );
  function toString(obj) {
    if (isString(obj)) { return obj; }
    if (isObject(obj)) {
      let elements = [];
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          elements.push(`${key}="${obj[key]}"`);
        }
      }
      return elements.join(', ');
    }
    return obj.toString();
  }
  let rememberStore = { __not_yet: "I don't remember", empty: "" };
  async function pickStringRemember(args) {
    let qpItems = [];
    for (const option of getProperty(args, 'options', ['item1', 'item2'])) {
      let qpItem = undefined;
      if (isString(option)) {
        qpItem = {value:option, label:option};
      }
      if (isArray(option) && (option.length === 2)) {
        qpItem = {value:option[1], label:option[0], description:toString(option[1])};
      }
      if (qpItem) { qpItems.push(qpItem); }
    }
    let result = await vscode.window.showQuickPick(qpItems, { placeHolder: getProperty(args, 'description', 'Choose:') });
    return storeStringRemember(args, result);
  }
  function storeStringRemember(args, result) {
    if (result !== undefined) {
      let argkey = getProperty(args, 'key', '__unknown');
      if (!isString(result)) {
        result = result.value;
        if (isObject(result)) {
          for (const vkey in result) {
            if (result.hasOwnProperty(vkey)) {
              rememberStore[vkey] = result[vkey];
            }
          }
          return getRememberKey(argkey);
        }
      }
      rememberStore[argkey] = result;
    }
    return result !== undefined ? result : getProperty(args, 'default', 'Escaped');
  }
  async function promptStringRemember(args) {
    let result = await vscode.window.showInputBox({ prompt: getProperty(args, 'description', 'Enter:'), password: getProperty(args, 'password', false) });
    return storeStringRemember(args, result);
  }
  function getRememberKey(key) { return getProperty(rememberStore, key, rememberStore['__not_yet']); }
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.pickStringRemember', args => { return pickStringRemember(args); })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.promptStringRemember', args => { return promptStringRemember(args); })
  );
  function rememberCommand(args) {
    args = dblQuest(args, {});
    args.key = getProperty(args, 'key', 'empty');
    return storeStringRemember(args, { value: getProperty(args, 'store', {}) });
  }
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.remember', args => rememberCommand(args) )
  );
  context.subscriptions.push(
    // TODO Deprecated 2021-10
    vscode.commands.registerCommand('extension.commandvariable.rememberPick', args => rememberCommand(args) )
  );
  let dateTimeFormat = (args) => {
    args = dblQuest(args, {});
    let locale = getProperty(args, 'locale', undefined);
    let options = getProperty(args, 'options', undefined);
    let template = getProperty(args, 'template', undefined);
    let parts = new Intl.DateTimeFormat(locale, options).formatToParts(new Date());
    if (!template) { return parts.map(({type, value}) => value).join(''); }
    let dateTimeFormatParts = {};
    parts.forEach(({type, value}) => { dateTimeFormatParts[type] = value; });
    return template.replace(/\${(\w+)}/g, (match, p1) => { return getProperty(dateTimeFormatParts, p1, ''); });
  };
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.dateTime', args => dateTimeFormat(args))
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.commandvariable.dateTimeInEditor', function (editor, edit, args) {
      edit.replace(editor.selection, dateTimeFormat(args));
    })
  );
  let uuidv4 = undefined;
  let UUIDFormat = args => {
    args = dblQuest(args, {});
    if (getProperty(args, 'use', 'new') === 'new') { uuidv4 = UUID.genV4(); }
    if (!uuidv4) { return 'Unknown'; }
    switch (getProperty(args, 'output', 'hexString')) {
      case 'hexString': return uuidv4.hexString;
      case 'hexNoDelim': return uuidv4.hexNoDelim;
      case 'bitString': return uuidv4.bitString;
      case 'urn': return uuidv4.urn;
    }
    return 'Unknown';
  };
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.UUID', args => UUIDFormat(args))
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.commandvariable.UUIDInEditor', function (editor, edit, args) {
      edit.replace(editor.selection, UUIDFormat(args));
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.transform', async (args) => {
      if (!args) { args = {}; }
      let text    = getProperty(args, 'text', "");
      let find    = getProperty(args, 'find');
      let replace = getProperty(args, 'replace', "");
      let flags   = getProperty(args, 'flags', "");
      text = await variableSubstitution(text, args);
      if (find) {
        text = text.replace(new RegExp(find, flags), replace);
      }
      return text;
    })
  );
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
};

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
