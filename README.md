# Command Variable
Visual Studio Code provides [variable substitution](https://code.visualstudio.com/docs/editor/variables-reference) to be used in `launch.json` and `tasks.json`.

One of the variables allows the [result of a command](https://code.visualstudio.com/docs/editor/variables-reference#_command-variables) to be used with the following syntax: **`${command:commandID}`**

This extension provides a number of commands that give a result based on the current file or the workspace path

* `extension.commandvariable.file.relativeDirDots` : The directory of the current file relative to the workspace root directory with dots as separator. Can be used to specify a Python module.
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
* `extension.commandvariable.file.fileAsKey` : Use part of the file path as a key in a map lookup. Can be used in `lauch.json` to select arguments based on filename.
* `extension.commandvariable.file.fileDirBasename` : The basename of the `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename1Up` : The directory name 1 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename2Up` : The directory name 2 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename3Up` : The directory name 3 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename4Up` : The directory name 4 Up of `${fileDirname}`
* `extension.commandvariable.file.fileDirBasename5Up` : The directory name 5 Up of `${fileDirname}`
* `extension.commandvariable.file.content` : The content of the given file name. Use "inputs", see [example](#file-content). Or the value of a Key-Value pair, see [example](#file-content-key-value-pairs). Or the value of a JSON file property, see [example](#file-content-json-property).
* `extension.commandvariable.file.pickFile` : Show a Quick Pick selection box with file paths that match an **include** and an **exclude** glob pattern. Use "inputs", see [example](#pick-file).
* `extension.commandvariable.workspace.workspaceFolderPosix` : The same result as `${workspaceFolder}` but in Posix form.
* `extension.commandvariable.workspace.folderBasename1Up` : The directory name 1 Up of the workspace root directory. The parent of the workspace folder that is opened with `File > Open Folder...`
* `extension.commandvariable.workspace.folderBasename2Up` : The directory name 2 Up of the workspace root directory.
* `extension.commandvariable.workspace.folderBasename3Up` : The directory name 3 Up of the workspace root directory.
* `extension.commandvariable.workspace.folderBasename4Up` : The directory name 4 Up of the workspace root directory.
* `extension.commandvariable.workspace.folderBasename5Up` : The directory name 5 Up of the workspace root directory.
* `extension.commandvariable.selectedText` : The selected text in the active editor, empty string if nothing selected. Supports [multicursor](#multicursor-and-text).
* `extension.commandvariable.selectionStartLineNumber` : Line number of the selection start
* `extension.commandvariable.selectionStartColumnNumber` : Column number of the selection start
* `extension.commandvariable.selectionEndLineNumber` : Line number of the selection end
* `extension.commandvariable.selectionEndColumnNumber` : Column number of the selection end
* `extension.commandvariable.currentLineText` : The text of the line in the active editor where the selection starts or where the cursor is. Supports [multicursor](#multicursor-and-text).
* `extension.commandvariable.dirSep` : Directory separator for this platform. '\\' on Windows, '/' on other platforms
* `extension.commandvariable.envListSep` : Environment variable list separator for this platform. ';' on Windows, ':' on other platforms
* `extension.commandvariable.pickStringRemember` : the same as [Input variable pickString](https://code.visualstudio.com/docs/editor/variables-reference#_input-variables) but it remembers the picked item by a key
* `extension.commandvariable.rememberPick` : retreive a remembered pick by key
* `extension.commandvariable.dateTime` : language-sensitive format of current date and time (using a Locale)
* `extension.commandvariable.dateTimeInEditor` : language-sensitive format of current date and time (using a Locale) to be used for keybindings
* `extension.commandvariable.transform` : make a custom variable by echoing static text or transform the content of a variable with a Regular Expression Find-Replace, see [example](#transform).
* `extension.commandvariable.UUID` : generate a UUID v4 (from random numbers)
* `extension.commandvariable.UUIDInEditor` : generate a UUID v4 (from random numbers) to be used for keybindings

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
      "module": "${command:extension.commandvariable.file.relativeDirDots}.${fileBasenameNoExtension}",
    }
  ]
}
```

You can use a Tasks to [see the value of a variable substitution](https://code.visualstudio.com/docs/editor/variables-reference#_how-can-i-know-a-variables-actual-value).

## FileAsKey

The command `extension.commandvariable.file.fileAsKey` makes it possible to select a string based on the current active file.

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

The value strings may contain variables. See the [transform command](#transform) for the supported variables.

## File Content

Sometimes you want to use the result of a shell script (batch file). Setting environment variables will not work because they modify only the child shell.

If you store the content in a file you can retrieve this with the `extension.commandvariable.file.content` command.

The content of the file is assumed to be encoded with UTF-8.

VSC does not substitute [variables](https://code.visualstudio.com/docs/editor/variables-reference) in `"inputs"` part of `tasks.json`. 

The extension supports the variable `${workspaceFolder}` in the filename specifcation. 

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

If you have a file that contains key-value pairs and you want the value for a given key you can use the command `extension.commandvariable.file.content`. The argument `"key"` specifies for which key you want the value. If the key is not found and you have a `"default"` argument that string is returned else `"Unknown"` is returned.

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

If you have a JSON file and you want the value for a given property you can use the command `extension.commandvariable.file.content`. The argument `"json"` specifies a JavaScript expression that gets the property you want from the variable `content`. The variable `content` is the parsed JSON file. If the JavaScript expression fails and you have a `"default"` argument that string is returned else `"Unknown"` is returned.

The JSON file can be an array and you can address the elements with: `content[3]`

### Example

You have a JSON configuration file in your workspace:

**config.json**

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

In your `task.json` you want to use the server1 port value.

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
        "default": "4321"
      }
    }
  ]
}
```

## Pick File

If you want to pick a file and use it in your `launch.json` or `tasks.json` you can use the `extension.commandvariable.file.pickFile` command.

This command uses [`vscode.workspace.findFiles`](https://code.visualstudio.com/api/references/vscode-api#workspace.findFiles) to get a list of files to show in a Quick Pick selection box.

You can set the following arguments to this command:

* `include` : a [Glob Pattern](https://code.visualstudio.com/api/references/vscode-api#GlobPattern) that defines the files to search for (default: `"**/*"`)
* `exclude` : a Glob Pattern that defines files and folders to exclude. (default: `"undefined"`)

    Two special strings are possible to pass special values:
    * `"undefined"` to set the `exclude` argument to `undefined` to use default excludes
    * `"null"` to set the `exclude` argument to `null` to use **no** excludes

    **Known problem**: `exclude` is not working as expected under Windows. Excluded files are put at the end of the list.

* `maxResults` : Limit the number of files to choose from. Must be a number (no `"` characters). (default: no limits)

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

## pickStringRemember and rememberPick

`pickStringRemember` has the same configuration attributes as the [Input variable pickString](https://code.visualstudio.com/docs/editor/variables-reference#_input-variables). And both commands have configuration attribute **`key`**. The **`key`** is used to store and retrieve a particular pick.

The configuration attributes need to be passed to the command in the `args` attribute. The **`key`** attribute is optional if you only have one pick to remember or every pick can use the same **`key`** name.

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
      "command": "extension.commandvariable.rememberPick",
      "args": { "key": "path" }
    }
  ]
}
```

## Multicursor and text

The commands `extension.commandvariable.selectedText` and `extension.commandvariable.currentLineText` combine the content in case of multi cursors. The default separator used is `"\n"`.

The selections are sorted in the order they appear in the file.

You can change the separator by specifying an argument object for the command with a property `"separator"`:

```
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

## Transform

Sometimes you want to modify a variable before you use it. Change the filename of the file in the editor to construct a different filename.

The transform you can apply to fields in snippets is not supported in the variables in the task and launch json files.

With the command `extension.commandvariable.transform` you can find-replace with Regular Expression a selection of variables.

The command can be used with the `${input:}` variable an dhas the following arguments:

* `text` : the string where you want to apply a find-replace. It can contain a selection of other variables (see next section)
* `find` : the Regular Expression to search in `text`. Can contain capture groups.
* `replace` : the replace string of what is matched by `find`, can contain group references (`$1`), default (`""`)
* `flags` : the flags to be used in the Regular Expression, like `gims`, default (`""`)

The variables that can be used in the text are:

* `${workspaceFolder}` : the path of the folder opened in VS Code
* `${file}` : the current opened file (the file system path)
* `${relativeFile}` : the current opened file relative to workspaceFolder
* `${fileBasename}` : the current opened file's basename
* `${fileBasenameNoExtension}` : the current opened file's basename with no file extension

VSC does not support variable substitution in the strings of the `inputs` fields, so currently only a selection of variables is replicated here.

```
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

The `text` property can contain any text with variables.

### Custom variables

We can use this command to construct custom variables by setting the `text` argument and not defining a `find` argument. The `id` of the `inputs` record is the name of the variable.

```
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
