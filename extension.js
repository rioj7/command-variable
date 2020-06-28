const vscode = require('vscode');
const path = require('path');

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
  const nonPosixPathRegEx = new RegExp('^/([a-zA-Z]):/');
  var path2Posix = p => p.replace(nonPosixPathRegEx, '/$1/');
  var relative_FileOrDirname_Posix = (get_dirname) => {
    return activeWorkspaceFolder( (workspaceFolder, editor) => {
      const rootPath = workspaceFolder.uri.path;
      let documentPath = editor.document.uri.path;
      if (get_dirname) { documentPath = path.dirname(editor.document.uri.path); }
      if (documentPath.indexOf(rootPath) !== 0) { return fileNotInFolderError(); } // should never happen here
      return documentPath.substring(rootPath.length + 1);
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
            if (path.indexOf(key) !== -1) { return _args[key];}
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
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.fileDirBasename1Up', () => {
      return fileDirBasenameNUp(1);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.fileDirBasename2Up', () => {
      return fileDirBasenameNUp(2);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.fileDirBasename3Up', () => {
      return fileDirBasenameNUp(3);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.fileDirBasename4Up', () => {
      return fileDirBasenameNUp(4);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.fileDirBasename5Up', () => {
      return fileDirBasenameNUp(5);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.content', async (args) => {
      if (!isString(args.fileName)) return "Unknown";
      let contentUTF8 = await vscode.workspace.fs.readFile(vscode.Uri.file(args.fileName));
      return utf8_to_str(contentUTF8);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.workspace.workspaceFolderPosix', () => {
      return activeWorkspaceFolder( workspaceFolder => {
        return path2Posix(workspaceFolder.uri.path);
      });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.workspace.folderBasename1Up', () => {
      return workspaceFolderBasenameNUp(1);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.workspace.folderBasename2Up', () => {
      return workspaceFolderBasenameNUp(2);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.workspace.folderBasename3Up', () => {
      return workspaceFolderBasenameNUp(3);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.workspace.folderBasename4Up', () => {
      return workspaceFolderBasenameNUp(4);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.workspace.folderBasename5Up', () => {
      return workspaceFolderBasenameNUp(5);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.selectedText', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showErrorMessage('No editor'); return "Unknown"; }
      var selectStart = editor.document.offsetAt(editor.selection.start);
      var selectEnd = editor.document.offsetAt(editor.selection.end);
      var docText = editor.document.getText();
      return docText.substring(selectStart, selectEnd);
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
};

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
