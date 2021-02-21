const vscode = require('vscode');
const path = require('path');
let UUID = require('./uuid');

function activate(context) {
  const getProperty = (obj, prop, deflt) => { return obj.hasOwnProperty(prop) ? obj[prop] : deflt; };
  const errorMessage = (msg, noObject) => { vscode.window.showErrorMessage(msg); return noObject ? noObject : "Unknown";};
  const fileNotInFolderError = (noObject) => errorMessage('File not in Multi-root Workspace', noObject);
  const isString = obj => typeof obj === 'string';
  function utf8_to_str (src, off, lim) {  // https://github.com/quicbit-js/qb-utf8-to-str-tiny
    lim = lim == null ? src.length : lim
    for (var i = off || 0, s = ''; i < lim; i++) {
      var h = src[i].toString(16)
      if (h.length < 2) h = '0' + h
      s += '%' + h
    }
    return decodeURIComponent(s)
  }
  function range(size, startAt = 0) { return [...Array(size).keys()].map(i => i + startAt); }  // https://stackoverflow.com/a/10050831/9938317
  const activeTextEditorVariable = (action, args, noEditor) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return errorMessage('No editor', noEditor); }
    return action(editor, args);
  };
  const activeWorkspaceFolder = (action, noWorkSpace) => {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) { return errorMessage('No folder open', noWorkSpace); }
    return activeTextEditorVariable( editor => {
      let folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
      return folder ? action(folder, editor) : fileNotInFolderError(noWorkSpace);
    });
  };
  var basenameNUp = function (dirUriPath, n) {
    const rootParts = dirUriPath.split('/');
    if (n > rootParts.length-2) { vscode.window.showErrorMessage('Not enough parent directories'); return "Unknown"; }
    return rootParts[rootParts.length - (n+1)];
  };
  var workspaceFolderBasenameNUp = function (n) {
    return activeWorkspaceFolder( workspaceFolder => {
      return basenameNUp(workspaceFolder.uri.path, n);
    });
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
  var variableSubstitution = (text, args) => {
    args = args || {};
    let stringSubstitution = (text, workspaceFolder, editor) => {
      var var_workspaceFolder = workspaceFolder.uri.fsPath;
      var result = text.replace("${workspaceFolder}", var_workspaceFolder);
      var var_file = editor.document.uri.fsPath;
      result = result.replace("${file}", var_file);
      var var_relativeFile = var_file.replace(var_workspaceFolder, '');
      if (var_relativeFile !== var_file) {
        var_relativeFile = var_relativeFile.substring(1); // remove extra separator
      }
      result = result.replace("${relativeFile}", var_relativeFile);
      result = replaceVariableWithProperties(result, 'selectedText', args, _args => concatMapSelections(_args, getEditorSelection) );
      const path = editor.document.uri.path;
      const lastSep = path.lastIndexOf('/');
      if (lastSep === -1) { return result; }
      const fileBasename = path.substring(lastSep+1);
      result = result.replace("${fileBasename}", fileBasename);
      const lastDot = fileBasename.lastIndexOf('.');
      const fileBasenameNoExtension = lastDot >= 0 ? fileBasename.substring(0, lastDot) : fileBasename;
      result = result.replace("${fileBasenameNoExtension}", fileBasenameNoExtension);
      return result;
    };
    return activeWorkspaceFolder( (workspaceFolder, editor) => {
      if (Array.isArray(text)) {
        return text.map( t => stringSubstitution(t, workspaceFolder, editor));
      }
      return stringSubstitution(text, workspaceFolder, editor);
    });
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
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.fileAsKey', (args) => {
      return activeTextEditorVariable( (editor, _args) => {
        const path = editor.document.uri.path;
        for (const key in _args) {
          if (_args.hasOwnProperty(key)) {
            if (path.indexOf(key) !== -1) { return variableSubstitution(_args[key], _args);}
          }
        }
        return "Unknown";
      }, args);
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
  const readFileContent = async (args) => {
    if (!isString(args.fileName)) return "Unknown";
    // variables are not substituted
    return activeWorkspaceFolder( async (workspaceFolder, editor) => {
      args.fileName = args.fileName.replace("${workspaceFolder}", workspaceFolder.uri.fsPath);
      let contentUTF8 = await vscode.workspace.fs.readFile(vscode.Uri.file(args.fileName));
      return utf8_to_str(contentUTF8);
    });
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
  function contentValue(args, fileContent) {
    let jsonExpr = args.json;
    if (jsonExpr) {
      let value = getExpressionFunction(jsonExpr)(JSON.parse(fileContent));
      if (value === undefined) { return value; }
      return String(value);
    }
    let key = args.key;
    if (!key) { return fileContent; }
    for (const kvLine of fileContent.split(/\r?\n/)) {
      if (kvLine.match(/^\s*(\/\/|#)/)) { continue; }  // check comment lines
      let kvMatch = kvLine.match(/^\s*([^:=]+)[:=](.*)/);
      if (kvMatch && (kvMatch[1] === key) ) { return kvMatch[2]; }
    }
  }
  const fileContent = async (args) => {
    let content = await readFileContent(args);
    let value = contentValue(args, content);
    if (value) { return value; }
    if (args.default) { return args.default; }
    return "Unknown";
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
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.pickFile', args => {
      args = args || {};
      let globInclude = getProperty(args, 'include', '**/*');
      let globExclude = getProperty(args, 'exclude', 'undefined');
      let maxResults  = getProperty(args, 'maxResults', undefined);
      if (globExclude === 'undefined') globExclude = undefined;
      if (globExclude === 'null') globExclude = null;

      return vscode.workspace.findFiles(globInclude, globExclude, maxResults).then( uriList => {
        return vscode.window.showQuickPick(uriList.map(u => u.fsPath));
      });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.workspace.workspaceFolderPosix', () => {
      return activeWorkspaceFolder( workspaceFolder => {
        return path2Posix(workspaceFolder.uri.path);
      });
    })
  );
  context.subscriptions.push( ...range(5, 1).map(
    i => vscode.commands.registerCommand(`extension.commandvariable.workspace.folderBasename${i}Up`,
        () => workspaceFolderBasenameNUp(i) )) );
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
  let pickRemember = { __not_yet: "I don't remember" };
  async function pickStringRemember(args) {
    const result = await vscode.window.showQuickPick(
      getProperty(args, 'options', ['item1', 'item2']), {
      placeHolder: getProperty(args, 'description', 'Choose:')
    });
    if (result !== undefined) {
      pickRemember[getProperty(args, 'key', '__unknown')] = result;
    }
    return result !== undefined ? result : getProperty(args, 'default', 'Escaped');
  }
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.pickStringRemember', (args) => { return pickStringRemember(args); })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.rememberPick', (args) => { return getProperty(pickRemember, getProperty(args, 'key', '__unknown'), pickRemember['__not_yet']); })
  );
  let dateTimeFormat = (args) => {
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
  let UUIDFormat = (args) => UUID.generate();
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.UUID', args => UUIDFormat(args))
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('extension.commandvariable.UUIDInEditor', function (editor, edit, args) {
      edit.replace(editor.selection, UUIDFormat(args));
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.transform', args => {
      if (!args) { args = {}; }
      let text    = getProperty(args, 'text', "");
      let find    = getProperty(args, 'find');
      let replace = getProperty(args, 'replace', "");
      let flags   = getProperty(args, 'flags', "");
      text = variableSubstitution(text, args);
      if (find) {
        text = text.replace(new RegExp(find, flags), replace);
      }
      return text;
    })
  );
};

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
