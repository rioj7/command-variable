const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const common = require('./out/extension-common');
const utils = require('./utils');

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
  const getProperty = utils.getProperty;
  const fileNotInFolderError = utils.fileNotInFolderError;
  const isString = utils.isString;
  const utf8_to_str = utils.utf8_to_str;
  const range = utils.range;
  const dblQuest = utils.dblQuest;
  const storeStringRemember = common.storeStringRemember;
  const getRememberKey = common.getRememberKey;

  common.activate(context);

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
        result = replaceVariableWithProperties(result, 'selectedText', args, _args => common.concatMapSelections(_args, common.getEditorSelection) );
      }
      result = result.replace(/\$\{workspaceFolder\}/g, m => {
        return common.activeWorkspaceFolderEditorOptional( workspaceFolder => {
          return workspaceFolder.uri.fsPath;
        });
      });
      result = result.replace(/\$\{workspaceFolder:(.+?)\}/g, (m, p1) => {
        let wsf = common.getNamedWorkspaceFolder(p1);
        if (!wsf) { return 'Unknown'; }
        return wsf.uri.fsPath;
      });

      result = await asyncVariable(result, args, common.pickStringRemember);
      result = await asyncVariable(result, args, common.promptStringRemember);
      result = await asyncVariable(result, args, pickFile);
      result = await asyncVariable(result, args, fileContent);
      result = await asyncVariable(result, args, configExpression);
      result = result.replace(/\$\{remember(?:Pick)?:(.+?)\}/g, (m, p1) => {
        return getRememberKey(p1);
      });

      if (!editor) { return result; }
      var fileFSPath = editor.document.uri.fsPath;
      result = result.replace(/\$\{file\}/g, fileFSPath);
      let relativeFile = common.activeWorkspaceFolder( workspaceFolder => {
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
        workspace = common.getNamedWorkspaceFolder(fromWorkspace);
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
      return common.activeWorkspaceFolderEditorOptional( workspaceFolder => {
        return path2Posix(workspaceFolder.uri.path);
      }, undefined, args !== undefined ? args.name : undefined);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.dirSep', () => { return process.platform === 'win32' ? '\\' : '/'; })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.envListSep', () => { return process.platform === 'win32' ? ';' : ':'; })
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
