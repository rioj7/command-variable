const vscode = require('vscode');
const path = require('path');

function activate(context) {
  var workspaceFolderBasenameNUp = function(n) {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) { vscode.window.showErrorMessage('No folder open'); return "Unknown"; }
    const rootParts = folders[0].uri.path.split('/');
    if (n > rootParts.length-2) { vscode.window.showErrorMessage('Not enough parent directories'); return "Unknown"; }
    return rootParts[rootParts.length - (n+1)];
  }
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.commandvariable.file.relativeDirDots', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showErrorMessage('No editor'); return "Unknown"; }
      const folders = vscode.workspace.workspaceFolders;
      if (!folders) { vscode.window.showErrorMessage('No folder open'); return "Unknown"; }
      const rootPath = folders[0].uri.path;
      const documentDirName = path.dirname(editor.document.uri.path);
      if (documentDirName.indexOf(rootPath) !== 0) { vscode.window.showErrorMessage('File not in workspace folder'); return "Unknown"; }
      return documentDirName.substring(rootPath.length + 1).replace(/\//g, () => ".");
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
};

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
