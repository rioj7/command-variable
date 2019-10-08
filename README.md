# Command Variable
Visual Studio Code provides [variable substitution](https://code.visualstudio.com/docs/editor/variables-reference) to be used in `launch.json` and `tasks.json`.

One of the variables allows the [result of a command](https://code.visualstudio.com/docs/editor/variables-reference#_command-variables) to be used with the following syntax: **`${command:commandID}`**

This extension provides a number of commands that give a result based on the current file or the workspace path

* `extension.commandvariable.file.relativeDirDots` : The directory of the current file relative to the workspace root directory with dots as separator. Can be used to specify a Python module.
* `extension.commandvariable.file.filePosix` : The same result as `${file}` but in Posix form. Directory separator '`/`', and drive designation as '`/z/project/`'
* `extension.commandvariable.file.fileDirnamePosix` : The same result as `${fileDirname}` but in Posix form.
* `extension.commandvariable.file.fileAsKey` : Use part of the file path as a key in a map lookup. Can be used in `lauch.json` to select arguments based on filename.
* `extension.commandvariable.file.fileDirBasename` : The basename of the `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename1Up` : The directory name 1 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename2Up` : The directory name 2 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename3Up` : The directory name 3 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename4Up` : The directory name 4 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename5Up` : The directory name 5 Up of `${fileDirname}`
* `extension.commandvariable.workspace.workspaceFolderPosix` : The same result as `${workspaceFolder}` but in Posix form.
* `extension.commandvariable.workspace.folderBasename1Up` : The directory name 1 Up of the workspace root directory. The parent of the workspace folder that is opened with `File > Open Folder...`
* `extension.commandvariable.workspace.folderBasename2Up` : The directory name 2 Up of the workspace root directory.
* `extension.commandvariable.workspace.folderBasename3Up` : The directory name 3 Up of the workspace root directory.
* `extension.commandvariable.workspace.folderBasename4Up` : The directory name 4 Up of the workspace root directory.
* `extension.commandvariable.workspace.folderBasename5Up` : The directory name 5 Up of the workspace root directory.
* `extension.commandvariable.selectedText` : The selected text in the active editor, empty string if nothing selected.
* `extension.commandvariable.selectionStartLineNumber` : Line number of the selection start
* `extension.commandvariable.selectionStartColumnNumber` : Column number of the selection start
* `extension.commandvariable.selectionEndLineNumber` : Line number of the selection end
* `extension.commandvariable.selectionEndColumnNumber` : Column number of the selection end
* `extension.commandvariable.dirSep` : Directory separator for this platform. '\\' on Windows, '/' on other platforms

Because it is not possible to give an extension command arguments, we have to put the arguments in the command name.

## Usage
An example `launch.json` :
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Module",
      "type": "python",
      "request": "launch",
      "console": "integratedTerminal",
      "module": "${command:extension.commandvariable.file.relativeDirDots}.${fileBasenameNoExtension}",
    }
  ]
}
```

You can use a Tasks to [see the value of a variable substitution](https://code.visualstudio.com/docs/editor/variables-reference#_how-can-i-know-a-variables-actual-value).

## FileAsKey

The comamnd `extension.commandvariable.file.fileAsKey` makes it possible to select a string based on the current active file.

The keys of the `args` object are searched for in the path of the active file (directory separator is `/`).

If you have files with the same name use part of the full path to select the correct one like `"/dir1/main.py"` and `"/dir2/main.py"`.
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "name": "Python: Current File",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "args" : ["${input:chooseArgs}"]
    }
  ],
  "inputs": [
    {
      "id": "chooseArgs",
      "type": "command",
      "command": "extension.commandvariable.file.fileAsKey",
      "args": {
        "calculation.py": "-n 4224",
        "client.py": "-i calc-out.yaml"
      }
    }
  ]
}
```
