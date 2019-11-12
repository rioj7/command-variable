const vscode = require('vscode');
const path = require('path');

function activate(context) {
  const errorMessage = (msg, noObject) => { vscode.window.showErrorMessage(msg); return noObject ? noObject : "Unknown";};
  const fileNotInFolderError = (noObject) => errorMessage('File not in Multi-root Workspace', noObject);
  const activeTextEditorVariable = (action, args, noEditor) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return errorMessage('No editor', noEditor); }
    return action(editor, args);
  };
  const activeWorkspaceFolder = (action, noWorkSpace) => {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) { return errorMessage('No folder open', noWorkSpace); }
    return activeTextEditorVariable( editor => {
      let folder = vscode.workspace.getWorkspaceFolder(editor.document.uri)
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
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.relativeDirDots', () => {
      return activeWorkspaceFolder( (workspaceFolder, editor) => {
        const rootPath = workspaceFolder.uri.path;
        const documentDirName = path.dirname(editor.document.uri.path);
        if (documentDirName.indexOf(rootPath) !== 0) { return fileNotInFolderError(); } // should never happen here
        return documentDirName.substring(rootPath.length + 1).replace(/\//g, () => ".");
      });
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
};

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
