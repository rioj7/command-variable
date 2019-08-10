# Command Variable
Visual Studio Code provides [variable substitution](https://code.visualstudio.com/docs/editor/variables-reference) to be used in `launch.json` and `tasks.json`.

One of the variables allows the [result of a command](https://code.visualstudio.com/docs/editor/variables-reference#_command-variables) to be used with the following syntax: **`${command:commandID}`**

This extension provides a number of commands that give a result based on the current file or the workspace path

* `extension.commandvariable.file.relativeDirDots` : The directory of the current file relative to the workspace root directory with dots as separator. Can be used to specify a Python module.
* `extension.commandvariable.workspace.folderBasename1Up` : The directory name 1 Up of the workspace root directory. The parent of the workspace folder that is opened with `File > Open Folder...`
* `extension.commandvariable.workspace.folderBasename2Up` : The directory name 2 Up of the workspace root directory.
* `extension.commandvariable.workspace.folderBasename3Up` : The directory name 3 Up of the workspace root directory.
* `extension.commandvariable.workspace.folderBasename4Up` : The directory name 4 Up of the workspace root directory.
* `extension.commandvariable.workspace.folderBasename5Up` : The directory name 5 Up of the workspace root directory.

Becasue it is not possible to give an extension command arguments, we have to put the arguments in the command name.

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
