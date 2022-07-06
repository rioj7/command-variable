# Command Variable

Visual Studio Code provides [variable substitution](https://code.visualstudio.com/docs/editor/variables-reference) to be used in `launch.json` and `tasks.json`.

One of the variables allows the [result of a command](https://code.visualstudio.com/docs/editor/variables-reference#_command-variables) to be used with the following syntax: **`${command:commandID}`**

Not all commands are supported yet in the web extension version. Supported commands are marked with : (**Web**)

## Table of contents

* [Commands](#commands)
* [Usage](#usage)
* [FileAsKey](#fileaskey)
* [File Content](#file-content)
* [File Content Key Value pairs](#file-content-key-value-pairs)
* [File Content JSON Property](#file-content-json-property)
* [File Content Multiple Key-Values/Properties](#file-content-multiple-key-valuesproperties)
* [File Content in Editor](#file-content-in-editor)
* [Config Expression](#config-expression)
* [Pick File](#pick-file)
* [remember](#remember)
* [pickStringRemember](#pickstringremember)
* [promptStringRemember](#promptstringremember)
* [Multicursor and text](#multicursor-and-text)
* [inTerminal](#interminal)
* [setClipboard](#setclipboard)
* [Transform](#transform)
* [Variables](#variables)
  * [`${workspaceFolder}`](#workspacefolder-variable)
  * [`${selectedText}`](#selectedtext-variable)
  * [`${pickStringRemember}`](#pickstringremember-variable)
  * [`${promptStringRemember}`](#promptstringremember-variable)
  * [`${pickFile}`](#pickfile-variable)
  * [`${command}`](#command-variable)
* [`checkEscapedUI`](#checkescapedui)
* [Workspace name in `argument`](#workspace-name-in-argument)
* [UUID](#uuid)
* [dateTime](#datetime)
* [Credits](#credits)

## Commands

This extension provides a number of commands that give a result based on the current file or the workspace path or that produce a result based on arguments

* `extension.commandvariable.file.relativeDirDots` : The directory of the current file relative to the workspace root directory with dots as separator. Can be used to specify a Python module.
* `extension.commandvariable.file.relativeFileDots` : The same result as `${relativeFile}` but with dots as separator.
* `extension.commandvariable.file.relativeFileDotsNoExtension` : The same result as `${relativeFile}` but with dots as separator and no file extension. Can be used to specify a Python module.
* `extension.commandvariable.file.filePosix` : The same result as `${file}` but in Posix form. Directory separator '`/`', and drive designation as '`/z/project/`'
* `extension.commandvariable.file.fileDirnamePosix` : The same result as `${fileDirname}` but in Posix form.
* `extension.commandvariable.file.fileDirname1Up` : The directory path 1 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirname2Up` : The directory path 2 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirname3Up` : The directory path 3 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirname4Up` : The directory path 4 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirname5Up` : The directory path 5 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirname1UpPosix` : The same result as `${extension.commandvariable.file.fileDirname1Up}` but in Posix form.
* `extension.commandvariable.file.fileDirname2UpPosix` : The same result as `${extension.commandvariable.file.fileDirname2Up}` but in Posix form.
* `extension.commandvariable.file.fileDirname3UpPosix` : The same result as `${extension.commandvariable.file.fileDirname3Up}` but in Posix form.
* `extension.commandvariable.file.fileDirname4UpPosix` : The same result as `${extension.commandvariable.file.fileDirname4Up}` but in Posix form.
* `extension.commandvariable.file.fileDirname5UpPosix` : The same result as `${extension.commandvariable.file.fileDirname5Up}` but in Posix form.
* `extension.commandvariable.file.relativeFileDirname1Up` : The directory path 1 Up of `${relativeFileDirname}`
* `extension.commandvariable.file.relativeFileDirname2Up` : The directory path 2 Up of `${relativeFileDirname}`
* `extension.commandvariable.file.relativeFileDirname3Up` : The directory path 3 Up of `${relativeFileDirname}`
* `extension.commandvariable.file.relativeFileDirname4Up` : The directory path 4 Up of `${relativeFileDirname}`
* `extension.commandvariable.file.relativeFileDirname5Up` : The directory path 5 Up of `${relativeFileDirname}`
* `extension.commandvariable.file.relativeFileDirnamePosix` : The same result as `${relativeFileDirname}` but in Posix form.
* `extension.commandvariable.file.relativeFileDirname1UpPosix` : The same result as `${extension.commandvariable.file.relativeFileDirname1Up}` but in Posix form.
* `extension.commandvariable.file.relativeFileDirname2UpPosix` : The same result as `${extension.commandvariable.file.relativeFileDirname2Up}` but in Posix form.
* `extension.commandvariable.file.relativeFileDirname3UpPosix` : The same result as `${extension.commandvariable.file.relativeFileDirname3Up}` but in Posix form.
* `extension.commandvariable.file.relativeFileDirname4UpPosix` : The same result as `${extension.commandvariable.file.relativeFileDirname4Up}` but in Posix form.
* `extension.commandvariable.file.relativeFileDirname5UpPosix` : The same result as `${extension.commandvariable.file.relativeFileDirname5Up}` but in Posix form.
* `extension.commandvariable.file.relativeFilePosix` : The same result as `${relativeFile}` but in Posix form.
* `extension.commandvariable.file.fileAsKey` : Use part of the file path as a key in a map lookup. Can be used in `lauch.json` to select arguments based on filename, see [example](#fileaskey).
* `extension.commandvariable.file.fileDirBasename` : (**Web**) The basename of the `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename1Up` : (**Web**) The directory name 1 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename2Up` : (**Web**) The directory name 2 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename3Up` : (**Web**) The directory name 3 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename4Up` : (**Web**) The directory name 4 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename5Up` : (**Web**) The directory name 5 Up of `${fileDirname}`
* `extension.commandvariable.file.content` : The content of the given file name. Use "inputs", see [example](#file-content). Or the value of a Key-Value pair, see [example](#file-content-key-value-pairs). Or the value of a JSON file property, see [example](#file-content-json-property).
* `extension.commandvariable.config.expression` : Apply a JavaScript expression to the content of a configuration variable in `settings.json`. Use it to extract an array element or property from an object, see [example](#config-expression).
* `extension.commandvariable.file.contentInEditor` : The same as `extension.commandvariable.file.content` to be used for keybindings. Result will be inserted in the current editor.
* `extension.commandvariable.file.pickFile` : Show a Quick Pick selection box with file paths that match an **include** and an **exclude** glob pattern. Use "inputs", see [example](#pick-file).
* `extension.commandvariable.workspace.folder` : The path of the workspace root directory of the current file. `${workspaceFolder}` does not give this path in Multi Root workspaces. You can target a particular workspace by [supplying a `name` in the arguments](#workspace-name-in-argument).
* `extension.commandvariable.workspace.folder1Up` : The directory path 1 Up of the workspace root directory of the current file. The parent of the workspace root folder.
* `extension.commandvariable.workspace.folder2Up` : The directory path 2 Up of the workspace root directory of the current file.
* `extension.commandvariable.workspace.folder3Up` : The directory path 3 Up of the workspace root directory of the current file.
* `extension.commandvariable.workspace.folder4Up` : The directory path 4 Up of the workspace root directory of the current file.
* `extension.commandvariable.workspace.folder5Up` : The directory path 5 Up of the workspace root directory of the current file.
* `extension.commandvariable.workspace.workspaceFolderPosix` : **deprecated** - identical to `extension.commandvariable.workspace.folderPosix`
* `extension.commandvariable.workspace.folderPosix` : The same result as `extension.commandvariable.workspace.folder` but in Posix form. You can target a particular workspace by [supplying a `name` in the arguments](#workspace-name-in-argument).
* `extension.commandvariable.workspace.folder1UpPosix` : The same result as `extension.commandvariable.workspace.folder1Up` but in Posix form.
* `extension.commandvariable.workspace.folder2UpPosix` : The same result as `extension.commandvariable.workspace.folder2Up` but in Posix form.
* `extension.commandvariable.workspace.folder3UpPosix` : The same result as `extension.commandvariable.workspace.folder3Up` but in Posix form.
* `extension.commandvariable.workspace.folder4UpPosix` : The same result as `extension.commandvariable.workspace.folder4Up` but in Posix form.
* `extension.commandvariable.workspace.folder5UpPosix` : The same result as `extension.commandvariable.workspace.folder5Up` but in Posix form.
* `extension.commandvariable.workspace.folderBasename` : (**Web**) The directory name of the workspace root directory of the current file. You can get info for a particular workspace by [supplying a `name` in the arguments](#workspace-name-in-argument).
* `extension.commandvariable.workspace.folderBasename1Up` : (**Web**) The directory name 1 Up of the workspace root directory of the current file.
* `extension.commandvariable.workspace.folderBasename2Up` : (**Web**) The directory name 2 Up of the workspace root directory of the current file.
* `extension.commandvariable.workspace.folderBasename3Up` : (**Web**) The directory name 3 Up of the workspace root directory of the current file.
* `extension.commandvariable.workspace.folderBasename4Up` : (**Web**) The directory name 4 Up of the workspace root directory of the current file.
* `extension.commandvariable.workspace.folderBasename5Up` : (**Web**) The directory name 5 Up of the workspace root directory of the current file.
* `extension.commandvariable.selectedText` : (**Web**) The selected text in the active editor, empty string if nothing selected. Supports [multicursor](#multicursor-and-text).
* `extension.commandvariable.selectionStartLineNumber` : (**Web**) Line number of the selection start
* `extension.commandvariable.selectionStartColumnNumber` : (**Web**) Column number of the selection start
* `extension.commandvariable.selectionEndLineNumber` : (**Web**) Line number of the selection end
* `extension.commandvariable.selectionEndColumnNumber` : (**Web**) Column number of the selection end
* `extension.commandvariable.currentLineText` : (**Web**) The text of the line in the active editor where the selection starts or where the cursor is. Supports [multicursor](#multicursor-and-text).
* `extension.commandvariable.dirSep` : Directory separator for this platform. '\\' on Windows, '/' on other platforms
* `extension.commandvariable.envListSep` : Environment variable list separator for this platform. ';' on Windows, ':' on other platforms
* `extension.commandvariable.pickStringRemember` : like [Input variable pickString](https://code.visualstudio.com/docs/editor/variables-reference#_input-variables) but it remembers the picked item by a key, configured by strings or [_label_,_value_] tuples, see [example](#pickstringremember).
* `extension.commandvariable.promptStringRemember` : like [Input variable promptString](https://code.visualstudio.com/docs/editor/variables-reference#_input-variables) but it remembers the entered string by a key, see [example](#promptstringremember).
* `extension.commandvariable.remember` : retreive a [remembered](#remember) pickString, promptString, pickFile or fileContent by key and/or store _key_-_value_ pair(s).
* `extension.commandvariable.rememberPick` : **deprecated** - identical to `extension.commandvariable.remember`, it is not only picks that are remembered
* `extension.commandvariable.dateTime` : (**Web**) language-sensitive format of current date and time (using a Locale), see [example](#datetime)
* `extension.commandvariable.dateTimeInEditor` : (**Web**) language-sensitive format of current date and time (using a Locale) to be used for keybindings
* `extension.commandvariable.transform` : make a custom variable by echoing static text or transform the content of a variable with a Regular Expression Find-Replace, see [example](#transform).
* `extension.commandvariable.UUID` : (**Web**) generate a UUID v4 (from random numbers) with different output formats, see [example](#uuid)
* `extension.commandvariable.UUIDInEditor` : (**Web**) generate a UUID v4 (from random numbers) to be used for keybindings
* `extension.commandvariable.inTerminal` : type the string result of a command in the terminal (optional with Carriage Return), see [example](#interminal).
* `extension.commandvariable.setClipboard` : (**Web**) set the content of the clipboard, see [example](#setclipboard).

We can give an extension command arguments with `input variables`, but for single numeric arguments putting the argument in the command name is simpler.

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
      "module": "${command:extension.commandvariable.file.relativeFileDotsNoExtension}",
    }
  ]
}
```

You can use a Task to [see the value of a variable substitution](https://code.visualstudio.com/docs/editor/variables-reference#_how-can-i-know-a-variables-actual-value).

## FileAsKey

The command `extension.commandvariable.file.fileAsKey` makes it possible to select a string based on part of a file path. The file path can be taken from the current active editor or by executing a command.

The keys of the `args` object are searched for in the path of the active file (directory separator is `/`).

If you have files with the same name use part of the full path to select the correct one like `"/dir1/main.py"` and `"/dir2/main.py"`.

The `args` property can contain a few special keys:

* `@useCommand` : the value is a [command variable](https://code.visualstudio.com/docs/editor/variables-reference#_command-variables) that describes the command to execute to get the file path to use.<br/>Example for [CMake build projects](https://code.visualstudio.com/docs/cpp/CMake-linux): `"@useCommand": "${command:cmake.launchTargetPath}"`
* `@default` : the string to return when none of the keys is found in the file path (default: `Unknown`)

The value strings may contain [variables](#variables). If you use the variable `${selectedText}` you have to embed the properties `separator` and `filterSelection` in the variable, example `${selectedText##separator=@@##filterSelection=index%3===1##}`.

### Example

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

## File Content

Sometimes you want to use the result of a shell script (batch file). Setting environment variables will not work because they modify only the child shell.

If you store the content in a file you can retrieve this with the `extension.commandvariable.file.content` command.

The content of the file is assumed to be encoded with UTF-8.

The supported arguments:

* `fileName` : specifies the file to read. Supports [variables](#variables), like `${workspaceFolder}`, <code>&dollar;{workspaceFolder:<em>name</em>}</code>, <code>&dollar;{pickFile:<em>name</em>}</code> and <code>&dollar;{remember:<em>key</em>}</code>
* `keyRemember` : (Optional) If you want to [remember](#remember) the value for later use. (default: `"fileContent"`)

Can be used as [variable](#variables) <code>&dollar;{fileContent:<em>name</em>}</code>

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo FileContent",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:fileContent}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "fileContent",
      "type": "command",
      "command": "extension.commandvariable.file.content",
      "args": {
        "fileName": "c:\\temp\\result.txt"
      }
    }
  ]
}
```

## File Content Key Value pairs

If you have a file that contains key-value pairs and you want the value for a given key you can use the command `extension.commandvariable.file.content`.

The supported arguments:

* `fileName` : specifies the file to read, see [File Content](#file-content).
* `key` : specifies for which key you want the value. Can contain [variables](#variables).
* `default` : (Optional) If the key is not found and you have defined `default` that string is returned else `"Unknown"` is returned.
* `keyRemember` : (Optional) If you want to [remember](#remember) the value for later use. (default: `"fileContent"`)

Can be used as [variable](#variables) <code>&dollar;{fileContent:<em>name</em>}</code>

### Key-Value files

A key-value file consists of lines that contain key-value pairs.

The file can contain comments and empty lines. A comment line starts with `#` or `//`. You can have whitespace before the comment characters.

A key-value pair is a line in the file that specifies the key and the value separated by a character. The supported separators are `:` and `=`. The line is split with the following regular expression: `^\s*([^:=]+)(?:[:=])(.*)`

The non-capturing group `(?:)` is only needed in this Markdown file to [prevent detection of a Markdown link](https://github.com/microsoft/vscode/issues/103846).

Everything, after the starting whitespace, before the first separator is the key, everything after the separator is the value. You can have a separator character in the value. Only the first separator is important.

### Example

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo FileContentKey",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:fileContentKey}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "fileContentKey",
      "type": "command",
      "command": "extension.commandvariable.file.content",
      "args": {
        "fileName": "${workspaceFolder}/key-values.txt",
        "key": "PLUGIN",
        "default": "special-plugin"
      }
    }
  ]
}
```

**key-values.txt**
```txt
// a few key values
PLUGIN=cool-pugin
THEME=new-school
```

## File Content JSON Property

If you have a JSON file and you want the value for a given property you can use the command `extension.commandvariable.file.content`.

The supported arguments:

* `fileName` : specifies the file to read, see [File Content](#file-content).
* `json` : specifies a JavaScript expression that gets the property you want from the variable `content`. The variable `content` is the parsed JSON file. The JavaScript expression can contain [variables](#variables) like `${remember:foobar}`
* `default` : (Optional) If the JavaScript expression fails and you have defined `default` that string is returned else `"Unknown"` is returned.
* `keyRemember` : (Optional) If you want to [remember](#remember) the value for later use. (default: `"fileContent"`)

The JSON file can be an array and you can address the elements with: `content[3]`

Can be used as [variable](#variables) <code>&dollar;{fileContent:<em>name</em>}</code>

### Example

You have a JSON configuration file in your workspace:

**`config.json`**

```json
{
  "log": "foobar.log",
  "server1": {
    "port": 5011
  },
  "server2": {
    "port": 5023
  }
}
```

In your `tasks.json` you want to use the server1 port value.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo Server1Port",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:configServer1Port}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "configServer1Port",
      "type": "command",
      "command": "extension.commandvariable.file.content",
      "args": {
        "fileName": "${workspaceFolder}/config.json",
        "json": "content.server1.port",
        "default": "4321",
        "keyRemember": "ServerPort"
      }
    }
  ]
}
```

## File Content Multiple Key-Values/Properties

If the file contains multiple key-values or properties you want in your task or launch you can remember the picked file and use the same path in another `extension.commandvariable.file.content` use.

You have the follwing configuration files in your workspace:

**`server1-config.json`**

```json
{
  "log": "foobar1.log",
  "server": {
    "port": 5011,
    "publicCryptKey": "01234abcd"
  }
}
```

**`server2-config.json`**

```json
{
  "log": "foobar2.log",
  "server": {
    "port": 5023,
    "publicCryptKey": "9876zyxw"
  }
}
```

Use it in your `tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo ServerPortAndCryptKey",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:configServerPort}",
        "${input:configServerCryptKey}",
        "${input:serverURL}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "configServerPort",
      "type": "command",
      "command": "extension.commandvariable.file.content",
      "args": {
        "fileName": "${pickFile:config}",
        "json": "content.server.port",
        "default": "4321",
        "keyRemember": "ServerPort",
        "pickFile": {
          "config": {
            "include": "**/*.json",
            "exclude": ".vscode/*.json",
            "keyRemember": "configFile"
          }
        }
      }
    },
    {
      "id": "configServerCryptKey",
      "type": "command",
      "command": "extension.commandvariable.file.content",
      "args": {
        "fileName": "${remember:configFile}",
        "json": "content.server.publicCryptKey"
      }
    },
    {
      "id": "serverURL",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": { "text": "https://example.org:${remember:ServerPort}/" }
    }
  ]
}
```

## File Content in Editor

If you want the (partial) result of an external program inserted in the editor you can use the command `extension.commandvariable.file.contentInEditor`. This command uses the same arguments as `extension.commandvariable.file.content`.

Most likely you want to call the program first to write the output to a file that you read and extract the parts you want. For this you can use the extension [multi-command](https://marketplace.visualstudio.com/items?itemName=ryuta46.multi-command).

1. Define a task that runs the external command
1. Define a multi-command that calls the task and then `extension.commandvariable.file.contentInEditor`
1. Define a key binding that calls the multi-command

Add to **`.vscode/tasks.json`**

```json
    {
      "label": "get Timestamp",
      "type": "shell",
      "command": "echo timestamp=2021-04-01 12:34 >${workspaceFolder}/timequery.txt",
      "problemMatcher": []
    }
```

Add to **`.vscode/settings.json`**

```json
  "multiCommand.commands": [
    {
      "command": "multiCommand.insertTimestamp",
      "interval": 500,
      "sequence": [
        { "command": "workbench.action.tasks.runTask",
          "args": "get Timestamp"
        },
        { "command": "extension.commandvariable.file.contentInEditor",
          "args": {
            "fileName": "${workspaceFolder}/timequery.txt",
            "key": "timestamp",
            "default": "Query failed"
          }
        }
      ]
    }
  ]
```

Add to **`keybindings.json`**

```json
{
    "key": "F1", // or any other key combo
    "command": "extension.multiCommand.execute",
    "args": { "command": "multiCommand.insertTimestamp" },
    "when": "editorTextFocus"
}
```

## Config Expression

If you have an array or object as configuration variable content (`settings.json`) and you want a particular element of the array or the value for a given object property you can use the command `extension.commandvariable.config.expression`.

The supported arguments:

* `configVariable` : specifies the settings variable to read. Supports [variables](#variables).
* `expression` : specifies a JavaScript expression that has the value of the `configVariable` in the variable `content`. The JavaScript expression can contain [variables](#variables) like `${remember:foobar}` or <code>&dollar;{pickStringRemember:<em>name</em>}</code>
* `default` : (Optional) If the JavaScript expression fails and you have defined `default` that string is returned else `"Unknown"` is returned.
* `keyRemember` : (Optional) If you want to [remember](#remember) the value for later use. (default: `"configExpression"`)

If the `configVariable` is an array you can address the elements with: `content[3]`

If the `configVariable` is an object you can address a property with: `content.inputDir`

Any expression is allowed that does not have a function call. All arithmetic operators, comparison operators, ...

Can be used as [variable](#variables) <code>&dollar;{configExpression:<em>name</em>}</code>

### Example

You have the following variable in `settings.json`:

```json
{
  "someExt.servers": {
    "log": "foobar.log",
    "server1": {
      "port": 5011
    },
    "server2": {
      "port": 5023
    }
  }
}
```

In your `tasks.json` you want to use the server1 port value.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo Server1Port",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:configServer1Port}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "configServer1Port",
      "type": "command",
      "command": "extension.commandvariable.config.expression",
      "args": {
        "configVariable": "someExt.servers",
        "expression": "content.server1.port",
        "default": "4321",
        "keyRemember": "ServerPort"
      }
    }
  ]
}
```

If you want to select the server from a pick list you can change the `inputs` part:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo Server1Port",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:configServerPort}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "configServerPort",
      "type": "command",
      "command": "extension.commandvariable.config.expression",
      "args": {
        "configVariable": "someExt.servers",
        "expression": "content.server${pickStringRemember:serverNr}.port",
        "pickStringRemember": {
          "serverNr": {
            "description": "Which server to use?",
            "options": [
              ["development", "1"],
              ["live", "2"]
            ]
          }
        },
        "default": "4321",
        "keyRemember": "ServerPort"
      }
    }
  ]
}
```

## Pick File

If you want to pick a file and use it in your `launch.json` or `tasks.json` you can use the `extension.commandvariable.file.pickFile` command.

This command uses [`vscode.workspace.findFiles`](https://code.visualstudio.com/api/references/vscode-api#workspace.findFiles) to get a list of files to show in a Quick Pick selection box.

You can set the following properties to this command:

* `include` : a [Glob Pattern](https://code.visualstudio.com/api/references/vscode-api#GlobPattern) that defines the files to search for (default: `"**/*"`)
* `exclude` : a Glob Pattern that defines files and folders to exclude. (default: `"undefined"`)

    Two special strings are possible to pass special values:
    * `"undefined"` to set the `exclude` argument to `undefined` to use default excludes
    * `"null"` to set the `exclude` argument to `null` to use **no** excludes

    **Known problem**: `exclude` is not working as expected under Windows. Excluded files are put at the end of the list.

* `keyRemember` : (Optional) If you want to [remember](#remember) the filepath for later use. (default: `"pickFile"`)
* `description` : (Optional) A text shown in the pick list box. (default: `"Select a file"`)
* `maxResults` : Limit the number of files to choose from. Must be a number (no `"` characters). (default: no limits)
* `addEmpty` : [ `true` | `false` ] If `true`: add an entry to the list (`*** Empty ***`) that will return an empty string when selected. (default: `false`)
* `addAsk` : [ `true` | `false` ] If `true`: add an entry to the list (`*** Ask ***`) that will open an Input Box where you enter the path to be returned. (default: `false`)
* `display` : How do you want to see the files displayed (default: `"fullPath"`)
    * `"fullpath"` : show the file full path, if path is big it can be clipped by the selection box
    * `"fileName"` : show the file name followed by the directory path of the file, the Fuzzy Search is now only on the file name and file extension.
* `fromWorkspace` : [ <code>"<em>name</em>"</code> | `true` | `false` ] - limit the `include` pattern relative to a workspace (default: `false`)
    * if <code>"<em>name</em>"</code>: find the workspace with that name
    * If `true`: show a Pick List of Workspaces to choose from
* `fromFolder` : (Optional) Object with the properties:
    * `predefined` : (Optional) An array with file system paths of directories to limit the `include` pattern relative to that directory. Do not enter folder paths that are root folders in this workspace.
    * `fixed` : (Optional) A string with a file system directory path to limit the `include` pattern relative to that directory. Do not enter folder paths that are root folders in this workspace. You do not get a pick list. On Windows it is not possible to specify a directory path in the `include` Glob Pattern.

    Show a Pick list of folders specified in the property `predefined` and 2 additional entries

    * `*** Ask ***` : open an Input Box where you enter the path of the folder
    * `*** Workspace ***` : show a Pick List of Workspaces

    ```json
    "fromFolder": {
      "predefined": [
        "C:\\temp\\log",
        "D:\\Data\\GPR\\2021"
      ]
    }
    ```
* `showDirs` : [ `true` | `false` ] If `true`: Show the directories that contain files that are found. The result of the pick is a directory path. (default: `false`)
* [`checkEscapedUI`](#checkescapedui) : (Optional) [ `true` | `false` ] Check if in a compound task/launch a previous UI has been escaped, if `true` behave as if this UI is escaped. This will not start the task/launch. (default: `false`)

Example:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo FilePick",
      "type": "shell",
      "command": "echo",
      "args": [
        "${input:filePick}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "filePick",
      "type": "command",
      "command": "extension.commandvariable.file.pickFile",
      "args": {
        "include": "**/*.{htm,html,xhtml}",
        "exclude": "**/{scratch,backup}/**"
      }
    }
  ]
}
```

## remember

It can be useful to store key-value pairs to be used later. The value of the key is remembered for this session of Visual Studio Code.

Some commands in this extension can store key-value pairs: [`pickStringRemember`](#pickstringremember), [`promptStringRemember`](#promptstringremember), `file.content` (json, key-value), `file.pickFile`.

The stored value is retreived with a command or a variable. In the same task/launch config or in a different one, or in a keybinding.

The command `extension.commandvariable.remember` is used to retreive a value for a particular key or store _key_-_value_ pair(s).

The `args` property of this command is an object with the properties:

* `store` : (Optional) an object with _key_-_value_ pair(s). Every _key_-_value_ is stored in the `remember` storage.
* `key` : (Optional) the name of the key to retreive from the remember store. (default: `"empty"`)
* [`checkEscapedUI`](#checkescapedui) : (Optional) [ `true` | `false` ] Check if in a compound task/launch a previous UI has been escaped, if `true` behave as if this UI is escaped. This will not start the task/launch. (default: `false`)

If you need to construct a new string with the value you can use the [variable](#variables): <code>&dollar;{remember:<em>key</em>}</code>. This can only be used in `args` properties of commands in this extension. The `inputs` list of `launch.json` and `tasks.json` or in `keybindings` or extensions that call commands with arguments ([Multi Command](https://marketplace.visualstudio.com/items?itemName=ryuta46.multi-command)). You can modify the value with the [`transform`](#transform) command.

The default content of the remember store:

* `empty` : `""`, the empty string, useful if you want to store the value(s) but not return some string in `pickStringRemember`

The example is a bit contrived but it shows how you can store _key_-_value_ pair(s) in a launch config or task without using a stored value, the result of the `${input:rememberConfig}` is the empty string. This enables you to store values in a launch config to be used in a `prelaunchTask` in `tasks.json`.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "DoSomething",
      "type": "shell",
      "command": "${config:python.pythonPath}${input:rememberConfig}",
      "args": [
        "${input:remember.path}",
        "${input:remember.name}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "rememberConfig",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": {
        "store": {"path":"server","name":"boya","user":"Mememe","option":"yeah"}
      }
    },
    {
      "id": "remember.path",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "path" }
    },
    {
      "id": "remember.name",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "name" }
    }
  ]
}
```

## pickStringRemember

The command `extension.commandvariable.pickStringRemember` look a lot like the [Input variable `pickString`](https://code.visualstudio.com/docs/editor/variables-reference#_input-variables).

The configuration attributes need to be passed to the command in the `args` attribute.

The command has the following configuration attributes:

* `description` : Shown some context for the input.
* `default` : Value returned if the user does not make a choice.  
  (**Not in Web**) It can contain [variables](#variables).
* `options` : An array that can contain the following elements:
  * `string` : The label in the pickList and the value returned are this string.
  * <code>[<em>label</em>,<em>value</em>]</code> tuple : The label in the pickList is the first element of the tuple, the second element is the value returned and the description in the pickList.  
  The _`value`_ can be an object with _key_-_value_ pair(s). Every _key_-_value_ is stored in the `remember` storage. `pickStringRemember` returns the value from the `remember` storage for the `key` argument of the command (see example).  
  If you only want to store some key-value pairs you can set the `key` argument of the command to `"empty"`. The command will then return an empty string (see [`remember`](#remember) command).
* `key` : (Optional) Used to store and retrieve a particular pick. (default: `pickString` )  
  The value can later be retrieved with the [`remember`](#remember) command or [`${remember}`](#variable-remember) variable.
* `rememberTransformed` : (**Not in Web**) if _`value`_ contains variables they are transformed in the result of the command. If `true` we store the transformed string. If `false` we store the _`value`_ string as given in the `options` property. (default: `false` )
* `fileName` : (**Not in Web**) A string, with possible [variables](#variables), specifying a file path that contains additional options. The options in the file are matched using the `pattern` attribute and appended to the already specified `options`. The file is assumed to have an UTF-8 encoding.
* `pattern` : (**Not in Web**) An object describing a line to match in the file containing the _label_ and optional _value_ of the option. Optional if all attributes have the default value.  
  The object has the following attributes:
  * `regexp` : (Optional) A regular expression describing a line with capture groups for the _label_ and _value_ for the option. (default: `^(.*)$` )
  * `label`: (Optional) A string containing capture group references <code>&dollar;<em>n</em></code> (like `$1`) that makes up the _label_ in the pickList. (default: `$1` )
  * `value`: (Optional) A string containing capture group references <code>&dollar;<em>n</em></code> (like `$1`) that makes up the _value_ in the pickList. (default: the same as `label`)
  * `json`: (Optional) A string containing a capture group reference <code>&dollar;<em>n</em></code> (like `$1`) that makes up the _value_ object in the pickList. You have to write the `regexp` to recognize a possible JSON object string. (default: `undefined` )
* [`checkEscapedUI`](#checkescapedui) : (Optional) [ `true` | `false` ] Check if in a compound task/launch a previous UI has been escaped, if `true` behave as if this UI is escaped. This will not start the task/launch. (default: `false`)

(**Not in Web**) The `value` string can contain [variables](#variables), so you can add a pickFile or promptString or .... and use that result.  
&nbsp;&nbsp;&nbsp;&nbsp;`["pick directory", "${pickFile:someDir}"]`

If you Escape the UI and a `default` property is given the UI is not marked as Escaped.  
(**Not in Web**) If the `default` property contains variables that have a UI they can be Escaped and that will be remembered.

### Examples

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Task 1",
      "type": "shell",
      "command": "dostuff1",
      "args": ["-p", "${input:pickPath}"]
    },
    {
      "label": "Task 2",
      "type": "shell",
      "command": "dostuff2",
      "args": ["-p", "${input:rememberPath}"]
    },
    {
      "label": "Do Task 1 and 2",
      "dependsOrder": "sequence",
      "dependsOn": ["Task 1", "Task 2"],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "pickPath",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "key": "path",
        "options": [ "path/to/directory/A", "path/to/Z" ],
        "description": "Choose a path"
      }
    },
    {
      "id": "rememberPath",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "path" }
    }
  ]
}
```

An example of choosing a port number in a launch configuration:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Service1",
      "type": "python",
      "request": "attach",
      "connect": {
        "host": "127.0.0.1",
        "port": "${input:envType}"
      }
    }
  ],
  "inputs": [
    {
      "id": "envType",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which env do you want to debug?",
        "options": [
          ["development", "5000"],
          ["staging", "5100"],
          ["live", "5200"]
        ],
        "default": "5000"
      }
    }
  ]
}
```

If you have additional options in a file:

* the line is not a comment, does not start with a `#` character
* the separator of _label_ and _value_ is a `=`
* _value_ can be a JSON object

```json
{
  "version": "0.2.0",
  "configurations": [
    // see previous example
  ],
  "inputs": [
    {
      "id": "envType",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which env do you want to debug?",
        "options": [
          ["development", "5000"],
          ["staging", "5100"],
          ["live", "5200"]
        ],
        "default": "5000",
        "fileName": "${workspaceFolder}/dynamic-env.txt",
        "pattern": {
          "regexp": "^\\s*(?!#)([^=]+?)\\s*=\\s*(?:(\\{.+\\})|(.+))$",
          "label": "$1",
          "json": "$2",
          "value": "$3"
        }
      }
    }
  ]
}
```

An example task that picks multiple values:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Do some project",
      "type": "process",
      "command": "echo",
      "args": [
        "${input:selectProject.path}",
        "${input:selectProject.name}",
        "${input:selectProject.link}",
        "${input:selectProject.anyOther}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "selectProject.path",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "key": "path",
        "options": [
          ["project1", {"path":"p1","name":"n1","link":"lnk1","anyOther":"any1"}],
          ["project2", {"path":"p2","name":"n2","link":"lnk2","anyOther":"any2"}]
         ],
        "description": "Pick a project"
      }
    },
    {
      "id": "selectProject.name",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "name" }
    },
    {
      "id": "selectProject.link",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "link" }
    },
    {
      "id": "selectProject.anyOther",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "anyOther" }
    }
  ]
}
```

If you have a `src` directory with a lot of subdirs and you want to run `cpplint` on all or only on a subdir you can add a `pickFile` variable as the value of a `pickString`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "cpp lint",
      "type": "shell",
      "command": "cpplint ${input:selectDir}"
    }
  ],
  "inputs": [
    {
      "id": "selectDir",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which directory to Lint for C++?",
        "options": [
          ["Use previous directory", "${remember:lintPath}"],
          ["All", "all"],
          ["Pick directory", "${pickFile:srcSubDir}"]
        ],
        "rememberTransformed": true,
        "key": "lintPath",
        "pickFile": {
          "srcSubDir": {
            "description": "Which directory?",
            "include": "src/**/*.{cpp,h}",
            "showDirs": true,
            "keyRemember": "srcSubDir"
          }
        }
      }
    }
  ]
}
```

## promptStringRemember

`extension.commandvariable.promptStringRemember` has the same configuration attributes as the [Input variable promptString](https://code.visualstudio.com/docs/editor/variables-reference#_input-variables).
`extension.commandvariable.promptStringRemember` also has the configuration attributes:
* `key` : (Optional) It is used to store and retrieve a particular entered string. (default: `promptString` )
* [`checkEscapedUI`](#checkescapedui) : (Optional) [ `true` | `false` ] Check if in a compound task/launch a previous UI has been escaped, if `true` behave as if this UI is escaped. This will not start the task/launch. (default: `false`)


The configuration attributes need to be passed to the command in the `args` attribute. The **`key`** attribute is optional if you only have one prompt to remember or every prompt can use the same **`key`** name.

The string can later be retrieved with the [`remember`](#remember) command or variable.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Task 1",
      "type": "shell",
      "command": "dostuff1",
      "args": ["-p", "${input:promptPath}"]
    },
    {
      "label": "Task 2",
      "type": "shell",
      "command": "dostuff2",
      "args": ["-p", "${input:rememberPath}"]
    },
    {
      "label": "Do Task 1 and 2",
      "dependsOrder": "sequence",
      "dependsOn": ["Task 1", "Task 2"],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "promptPath",
      "type": "command",
      "command": "extension.commandvariable.promptStringRemember",
      "args": {
        "key": "path",
        "description": "Enter a path"
      }
    },
    {
      "id": "rememberPath",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "path" }
    }
  ]
}
```

## Multicursor and text

The commands `extension.commandvariable.selectedText` and `extension.commandvariable.currentLineText` combine the content in case of multi cursors. The default separator used is `"\n"`.

The selections are sorted in the order they appear in the file.

You can change the separator by specifying an argument object for the command with a property `"separator"`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo (selected:currentLine) Text",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:multiCursorText}" ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "multiCursorText",
      "type": "command",
      "command": "extension.commandvariable.selectedText",
      "args": { "separator": "@--@" }
    }
  ]
}
```

## inTerminal

The command `extension.commandvariable.inTerminal` types the string result of a command in the terminal and optional types a Carriage Return.

The command `extension.commandvariable.inTerminal` has an argument that is an object with the following properties:

* `command` : the command to execute
* `args` : (Optional) the argument (string, array or object) for the `command`
* `addCR` : (Optional) boolean: end the text from the `command` with a Carriage Return (`\u000D`) (default: `false`)

If you want to use the value of a standard variable in the terminal you have to use the command `extension.commandvariable.transform` in the `extension.commandvariable.inTerminal` arguments. An example:

```json
  {
    "key": "ctrl+i f5",  // or any other combo
    "command": "extension.commandvariable.inTerminal",
    "args": {
      "command": "extension.commandvariable.transform",
      "args": { "text": "${relativeFile}" }
    }
  }
```

## setClipboard

The command `extension.commandvariable.setClipboard` sets the content of the clipboard with the string property `text` of the `args` object.

```json
  {
    "key": "ctrl+i f6",  // or any other combo
    "command": "extension.commandvariable.setClipboard",
    "args": { "text": "This is the new clipboard content" }
  }
```

## Transform

Sometimes you want to modify a variable before you use it. Change the filename of the file in the editor to construct a different filename.

The transform you can apply to fields in snippets is not supported in the variables in the task and launch json files.

With the command `extension.commandvariable.transform` you can find-replace with Regular Expression a selection of variables combined with static text.

The command can be used with the `${input:}` variable and has the following arguments:

* `text` : the string where you want to apply a find-replace. It can contain a selection of [variables](#variables) and literal text.
* `find` : (Optional) the Regular Expression to search in `text`. Can contain capture groups. If no `find` argument there is no `find-replace` operation.
* `replace` : (Optional) the replace string of what is matched by `find`, can contain group references (`$1`), default (`""`)
* `flags` : (Optional) the flags to be used in the Regular Expression, like `gims`, default (`""`)
* `key` : (Optional) It is used to [store and retrieve](#remember) the transformed string. (default: `transform` )
* `separator` : (Optional) the string used to join the (multi cursor) selections for `${selectedText}`, default (`"\n"`)
* `filterSelection` : (Optional) a JavaScript expression that allows which (multi cursor) selections to use for `${selectedText}`, default (`"true"`) all are selected.<br/>The expression can use the following variables:
    * `index` : the 0-base sequence number of the selection
    * `value` : the text of the selection
    * `numSel` : number of selections (or cursors)

    The `index` is 0-based to make (modulo) calculations easier. The first `index` is 0.

### Custom variables

We can use this command to construct custom variables by setting the `text` argument and not defining a `find` argument. The `id` of the `inputs` record is the name of the variable.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Node",
      "runtimeArgs": ["user", "${input:TEST_USER}"],
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Chrome",
      "url": "http://localhost:3000?${input:TEST_USER}",
    }
  ],
  "inputs": [
    {
      "id": "TEST_USER",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": { "text": "BobSmith" }
    }
  ]
}
```

## Variables

Many strings of commands support variables.

VSC does not perform [variable substitution](https://code.visualstudio.com/docs/editor/variables-reference) in the strings of the `inputs` fields, so currently only a selection of variables is replicated here:

* `${selectedText}` : a joined string constructed from the (multi cursor) selections.<br/>You can [overide the used properties by embedding them in the variable](#selectedtext-variable)
* `${workspaceFolder}` : the path of the workspace folder opened in VS Code containing the current file.
* <code>&dollar;{workspaceFolder:<em>name</em>}</code> : the path of the workspace folder with the specified _name_ opened in VS Code
* `${file}` : the current opened file (the file system path)
* `${relativeFile}` : the current opened file relative to workspaceFolder
* `${fileBasename}` : the current opened file's basename
* `${fileBasenameNoExtension}` : the current opened file's basename with no file extension
* `${fileExtname}` : the current opened file's extension
* `${fileDirname}` : the current opened file's dirname
* `${relativeFileDirname}` : the current opened file's dirname relative to workspaceFolder
* <code>&dollar;{pickStringRemember:<em>name</em>}</code> : use the [`pickStringRemember`](#pickstringremember) command as a variable, arguments are part of the [`pickStringRemember` property of the (parent) command](#pickstringremember-variable)
* <code>&dollar;{promptStringRemember:<em>name</em>}</code> : use the [`promptStringRemember`](#promptstringremember) command as a variable, arguments are part of the [`promptStringRemember` property of the (parent) command](#promptstringremember-variable)
* <code>&dollar;{remember:<em>key</em>}</code> : use the [remember](#remember) command as a variable,  
  _`key`_ is first tested as a named argument object property (like `pickStringRemember`), arguments are part of the `remember` property of the (parent) command.  
  If not found _`key`_ is a key in the remeber store. _`key`_ matches:
    * `key` argument of the `pickStringRemember` or `promptStringRemember` variable/command
    * `keyRemember` argument of the `pickFile` or `fileContent` variable/command
    * or a key used in storing multiple values in the remember command.

  You can add the [`checkEscapedUI`](#checkescapedui) property to the _`key`_ name if it is not a named argument object like <code>&dollar;{remember:<em>key</em>__checkEscapedUI}</code>.
* <code>&dollar;{pickFile:<em>name</em>}</code> : use the [`pickFile`](#pick-file) command as a variable, arguments are part of the [`pickFile` property of the (parent) command](#pickfile-variable)
* <code>&dollar;{fileContent:<em>name</em>}</code> : use the [`file.content`](#file-content) command ([File Content Key Value pairs](#file-content-key-value-pairs), [File Content JSON Property](#file-content-json-property) ) as a variable, arguments are part of the `fileContent` property of the (parent) command. (works the same as <code>&dollar;{pickStringRemember:<em>name</em>}</code>)
* <code>&dollar;{configExpression:<em>name</em>}</code> : use the [`config.expression`](#config-expression) command as a variable, arguments are part of the `configExpression` property of the (parent) command (works the same as <code>&dollar;{pickStringRemember:<em>name</em>}</code>)
* <code>&dollar;{command:<em>name</em>}</code> : use the result of a command as a variable. `name` can be a commandID or a named argument object property (like `pickStringRemember`), arguments are part of the [`command` property of the (parent) command](#command-variable)

The variables are processed in the order mentioned. This means that if the selected text contains variable descriptions they are handled as if typed in the text.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo first part fileBaseNameNoExtension",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:firstPart}" ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "firstPart",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": {
        "text": "${fileBasenameNoExtension}",
        "find": "(.*?)-.*",
        "replace": "$1",
      }
    }
  ]
}
```

### workspaceFolder Variable

The variable `${workspaceFolder}` is only valid in certain cases:

| File Open | Workspace | `${workspaceFolder}` |
| ---- | ---------  | --- |
| No   | No         | `"Unknown"` and Error: `"No Folder"` |
| No   | Folder     | Path of the open folder |
| No   | Multi Root | `"Unknown"` and Error: `"Use workspace name"` |
| Yes  | No         | `"Unknown"` and Error: `"No Folder"` |
| Yes  | Folder     | Path of the open folder |
| Yes  | Multi Root | Path of the workspace containing current file or first workspace in the list |

An example:

```
${workspaceFolder:server}
```

The variable <code>&dollar;{workspaceFolder:<em>name</em>}</code> is only invalid when there is no folder open.

In most cases the _name_ is the basename of the workspace folder path (last directory name).

If you have 2 workspaces with the same (folder base)name you can't target the second one by name only. You have to use more parts of the directory path to make the name unique. Use the `/` as path separator on all platforms. The _name_ is tested to be at the end of the workspace folder path (using `/` as separator).

An example:

```
${workspaceFolder:/websiteA/server}
```

### selectedText Variable

If you only have 1 selection you don't need the properties `separator` and `filterSelection`.

For the [transform](#transform) command you can define the properties `separator` and `filterSelection` in the `args` property of the command.

```json
      "args": {
        "text": "${selectedText}",
        "separator": "@-@",
        "filterSelection": "index%2===1",
      }
```

And you can define/overrule the properties by embedding them in the variable:

<code>&dollar;{selectedText <em>separator</em> <em>properties</em> <em>separator</em>}</code>

All _`separator`_'s used in a variable need to be the same.

The _`separator`_ is a string of 1 or more characters that are not part of the a to z alfabet or `{}`, in regular expression `[^a-zA-Z{}]+`. Choose a character string that is not used in the values of the _`properties`_ part. If you need to use more than 1 character do not use all the same character, it can lead to non conformant properties description that is still parsed. The reason is that JavaScript does not have non-backtrack greedy quantifiers. Currently the variable is matched with 1 regular expression. This makes everything easy to implement.

The _`properties`_ are the properties you want separated with the _`separator`_ string. Each property is defined as:

<code><em>propertyName</em>=<em>value</em></code>

Everyting between `=` and the next _`separator`_ is the _`value`_

The above example can be written as

```json
      "args": {
        "text": "${selectedText#separator=@-@#filterSelection=index%2===1#}"
      }
```

A few examples of `filterSelection` expressions

* every other **odd** selection : `"filterSelection": "index%2===1"`
* every selection containing `foo` or `bar` : `"filterSelection": "value.match(/foo|bar/)"`
* the before last selection : `"filterSelection": "index===numSel-2"`

You can use multiple `${selectedText}` variables that have different properties:

```json
      "args": {
        "text": "${selectedText#filterSelection=index===3#} ${selectedText#filterSelection=index===1#}"
      }
```

### pickStringRemember Variable

If you want to add an entry you pick from a list use the variable: <code>&dollar;{pickStringRemember:<em>name</em>}</code>

_`name`_ is the property name of the `pickStringRemember` property of the `args` object of the command.

Because the command has no way to determine if it is called from which workspace `tasks.json` or `launch.json` file or from a key binding the arguments for `pickStringRemember` have to be part of the arguments of the command.

See the command [`extension.commandvariable.pickStringRemember`](#pickstringremember) for the arguments you can use.

An example shows faster how it is to be used compared to a lot of text.

```json
"inputs": [
  {
    "id": "appSelect",
    "type": "command",
    "command": "extension.commandvariable.transform",
    "args": {
      "text": "We are using ${pickStringRemember:appName} on port ${pickStringRemember:portNum}",
      "pickStringRemember": {
        "appName": {
            "description": "What APP are you running?",
            "options": [ "client", "server", "stresstest", "pentest", "unittest" ],
            "default": "server"
        },
        "portNum": {
          "description": "What protocol?",
          "options": [
            ["http", "80"],
            ["http over proxy", "8080"],
            ["ftp", "21"]
          ],
          "default": "80"
        }
      }
    }
  }
]
```

### promptStringRemember Variable

The `promptStringRemember` variable works the same as the [`pickStringRemember` variable](#pickstringremember-variable).
If you want to add an entry you type on the keyboard use the variable: <code>&dollar;{promptStringRemember:<em>name</em>}</code>

_`name`_ is the property name of the `promptStringRemember` property of the `args` object of the command.

Because the command has no way to determine if it is called from which workspace `tasks.json` or `launch.json` file or from a key binding the arguments for `promptStringRemember` have to be part of the arguments of the command.

See the command [`extension.commandvariable.promptStringRemember`](#promptstringremember) for the arguments you can use.

### pickFile Variable

The `pickFile` variable works the same as the [`pickStringRemember` variable](#pickstringremember-variable).
If you want a file path use the variable: <code>&dollar;{pickFile:<em>name</em>}</code>

_`name`_ is the property name of the `pickFile` property of the `args` object of the command.

Because the command has no way to determine if it is called from which workspace `tasks.json` or `launch.json` file or from a key binding the arguments for `pickFile` have to be part of the arguments of the command.

See the command [`extension.commandvariable.pickFile`](#pick-file) for the arguments you can use.

An example: you have a number of key-value files and you want to select which environment to use 

```json
{
  "version": "0.2.0",
  "tasks": [
    {
      "label": "echo theme name",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:themeName}" ]
    }
  ],
  "inputs": [
    {
      "id": "themeName",
      "type": "command",
      "command": "extension.commandvariable.file.content",
      "args": {
        "fileName": "${pickFile:environ}",
        "key": "THEME",
        "pickFile": {
          "environ": {
            "description": "Which environment?",
            "include": "**/*environ*",
            "display": "fileName"
          }
        }
      }
    }
  ]
}
```

### command Variable

If you want to transform result of a command you use the <code>&dollar;{command:<em>name</em>}</code> variable in the `text` property of the `extension.commandvariable.transform` command.

`name` can be a commandID or a named argument object property (like `pickStringRemember`)

### CommandID

If the command does not use arguments you place the commandID directly in the variable.

```json
{
  "version": "0.2.0",
  "tasks": [
    {
      "label": "echo relative file no ext with dots - first dir removed",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:relativeNoExtDotsBaseOff}" ]
    }
  ],
  "inputs": [
    {
      "id": "relativeNoExtDotsBaseOff",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": {
        "text": "${command:extension.commandvariable.file.relativeFileDotsNoExtension}",
        "find": "^[^.]+\\."
      }
    }
  ]
}
```

### Named Arguments

If the command uses arguments you have to put these in the arguments of the parent command in the property `command`. (Just like with the [<code>&dollar;{pickStringRemember:<em>name</em>}</code> variable](#pickstringremember-variable))

The named arguments have the following properties:

* `command` : the commandID to execute
* `args` : the arguments for this commandID

```json
{
  "version": "0.2.0",
  "tasks": [
    {
      "label": "echo top 2 workspace folder names",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:workspaceTop2Folders}" ]
    }
  ],
  "inputs": [
    {
      "id": "workspaceTop2Folders",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": {
        "text": "${command:folderPosix}",
        "find": "^.*/([^/]+/[^/]+)$",
        "replace": "$1",
        "command": {
          "folderPosix": {
            "command": "extension.commandvariable.workspace.folderPosix",
            "args": { "name": "server" }
          }
        }
      }
    }
  ]
}
```

## checkEscapedUI

If you have a task/launch that uses variables that have a UI and you Escape the UI the task/launch is not executed.

If you have a compound [task](#https://code.visualstudio.com/docs/editor/tasks#_compound-tasks)/[launch](#https://code.visualstudio.com/docs/editor/debugging#_compound-launch-configurations) you want to also terminate all following tasks/launches. All UI elements in this extension (`pickFile`, `pickString` and `promptString`), as command or variable, record if they are Escaped. They can test if there has been an Escaped UI and behave as if Escaped themself. Also the `remember` [command](#remember) and [variable](#variables) can test for an Escaped UI and behave as being an Escaped UI.

You don't add the `checkEscapedUI` property to the first UI in the compound task/launch because it would check if the previous run was Escaped.

### Example

This example uses simple `echo` tasks to keep it short.

```json
{
  "version": "0.2.0",
  "tasks": [
    {
      "label": "Task 1",
      "type": "shell",
      "command": "echo",
      "args": [ "Task 1 using envType: ${input:envType}" ],
      "problemMatcher": []
    },
    {
      "label": "Task 2",
      "type": "shell",
      "command": "echo",
      "args": [ "Task 2 with envMessage: ${input:envMessage}" ],
      "problemMatcher": []
    },
    {
      "label": "Task 3",
      "type": "shell",
      "command": "echo",
      "args": [ "Task 3 with message: ${input:transformEnvMessage}" ],
      "problemMatcher": []
    },
    {
      "label": "Task Sequence",
      "dependsOrder": "sequence",
      "dependsOn": ["Task 1", "Task 2", "Task 3"],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "envType",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which env do you want to debug?",
        "key": "envType",
        "options": [
          ["development", "5000"],
          ["staging", "5100"],
          ["live", "5200"]
        ]
      }
    },
    {
      "id": "envMessage",
      "type": "command",
      "command": "extension.commandvariable.promptStringRemember",
      "args": {
        "key": "envMessage",
        "description": "Enter message",
        "checkEscapedUI": true
      }
    },
    {
      "id": "transformEnvMessage",
      "type": "command",
      "command": "extension.commandvariable.transform",
      "args": {
        "text": "${remember:envMessage__checkEscapedUI}",
        "find": "(\\d+)",
        "replace": "Number($1)"
      }
    }
  ]
}
```

## Workspace name in `argument`

The commands

* `extension.commandvariable.workspace.folder`
* `extension.commandvariable.workspace.folderPosix`
* <code>extension.commandvariable.workspace.folder<em>N</em>Up</code>
* <code>extension.commandvariable.workspace.folder<em>N</em>UpPosix</code>
* <code>extension.commandvariable.workspace.folderBasename</code>
* <code>extension.commandvariable.workspace.folderBasename<em>N</em>Up</code>

allow to get the information from a different workspace by specifying the name or last parts of the file path of the workspace directory. This can also be done when there is no editor active.

You supply the name in the arguments of the command. You have to use an `${input}` variable.

```json
{
  "version": "0.2.0",
  "tasks": [
    {
      "label": "echo server name",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:server1Up}" ]
    }
  ],
  "inputs": [
    {
      "id": "server1Up",
      "type": "command",
      "command": "extension.commandvariable.workspace.folderBasename1Up",
      "args": { "name": "server" }
    }
  ]
}
```

If you have 2 workspaces with the same (folder base)name you can't target the second one by name only. You have to use more parts of the directory path to make the name unique. Use the `/` as path separator on all platforms. The `name` argument is tested to be at the end of the workspace folder path (using `/` as separator). An example of an `args` property is:

```json
"args": { "name": "/websiteA/server" }
```

## UUID

The commands `extension.commandvariable.UUID` and `extension.commandvariable.UUIDInEditor` generate a v4 UUID.

It has the following arguments:

* `output` : can change the output format (default: `hexString`):

    * `hexString` : `a0e0f130-8c21-11df-92d9-95795a3bcd40`
    * `hexNoDelim` : `a0e0f1308c2111df92d995795a3bcd40`
    * `bitString` : `101000001110000 ... 1100110101000000`
    * `urn` : `urn:uuid:a0e0f130-8c21-11df-92d9-95795a3bcd40`

* `use` : which UUID to use (default: `new`):
    * `new` : generate a new UUID
    * `previous`, `prev` : use the previous generated UUID

In this example the 3 printed UUIDs are all different

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo UUIDs",
      "type": "shell",
      "command": "echo",
      "args": [
        "${command:extension.commandvariable.UUID}",
        "${input:uuid-hexnodelim}",
        "${input:uuid-urn}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "uuid",
      "type": "command",
      "command": "extension.commandvariable.UUID"
    },
    {
      "id": "uuid-hexnodelim",
      "type": "command",
      "command": "extension.commandvariable.UUID",
      "args": { "output": "hexNoDelim" }
    },
    {
      "id": "uuid-urn",
      "type": "command",
      "command": "extension.commandvariable.UUID",
      "args": { "output": "urn" }
    },
    {
      "id": "uuid-bits",
      "type": "command",
      "command": "extension.commandvariable.UUID",
      "args": { "output": "bitString" }
    }
  ]
}
```

## dateTime

For `keybindings.json` use `extension.commandvariable.dateTimeInEditor`.

For `launch.json` and `tasks.json` use `extension.commandvariable.dateTime`.

This command uses [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat) to create a language-sensitive format of current date and time.

The `locale` and `options` command arguments are the arguments for the [`Intl.DateTimeFormat constructor`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/DateTimeFormat) and are optional.

The `locale` command argument can be a single string or an array of strings of language tags. If not specified the browser default locale is used.

The `template` command argument is an optional template string that uses the same placeholder syntax as the [Javascript template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals). You can add as many literal text as needed.

The only expressions valid are the `type` values returned by the [`Intl.DateTimeFormat.prototype.formatToParts()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts) method. See first example.

If there is no `template` command argument the value parts of the `Intl.DateTimeFormat.prototype.formatToParts()` are joined. See second example.

### Example 1
```json
  {
    "key": "ctrl+shift+alt+f4",
    "when": "editorTextFocus",
    "command": "extension.commandvariable.dateTimeInEditor",
    "args": {
      "locale": "en-US",
      "options": {
        "year": "numeric",
        "month": "2-digit",
        "day": "2-digit",
        "hour12": false,
        "hour": "2-digit",
        "minute": "2-digit",
        "second": "2-digit"
      },
      "template": "${year}/${month}/${day}-${hour}:${minute}:${second}"
    }
  }
```
The result is
```
2020/03/19-18:01:18
```
### Example 2

You can use a different locale and number system and use the long format:
```json
  {
    "key": "ctrl+shift+alt+f5",
    "when": "editorTextFocus",
    "command": "extension.commandvariable.dateTimeInEditor",
    "args": {
      "locale": "fr-FR-u-nu-deva",
      "options": {
        "dateStyle": "full",
        "timeStyle": "full"
      }
    }
  }
```
The result is
```
jeudi १९ mars २०२० à १७:५९:५७ heure normale d’Europe centrale
```

### Example 3

For `launch.json` and `tasks.json` use the `inputs` attribute:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo date",
      "type": "shell",
      "command": "echo",
      "args": [ "${input:shortDate}" ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "shortDate",
      "type": "command",
      "command": "extension.commandvariable.dateTime",
      "args": {
        "locale": "es-ES",
        "options": {
          "weekday": "long",
          "year": "numeric",
          "month": "2-digit",
          "day": "2-digit",
          "hour12": false,
          "hour": "2-digit",
          "minute": "2-digit",
          "second": "2-digit"
        },
        "template": "${weekday}__${year}${month}${day}T${hour}${minute}${second}"
      }
    }
  ]
}
```
The result is:
```
jueves__20200319T184634
```

# Credits

* uses [UUID node module by LiosK](https://www.npmjs.com/package/uuidjs)
