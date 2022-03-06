# Change Log

## [Unreleased]
### Added

## [1.31.0] 2022-03-06
### Added
- `workspace.folderPosix`
- <code>workspace.folder<em>N</em>Up</code>
- <code>workspace.folder<em>N</em>UpPosix</code>
### Deprecated
- `workspace.workspaceFolderPosix`

## [1.30.0] 2022-02-11
### Added
- `config.expression`
- variable <code>${configExpression:<em>name</em>}</code>

## [1.29.0] 2021-12-08
### Added
- `file.relativeFileDots`
- `file.relativeFileDotsNoExtension`

## [1.28.0] 2021-12-07
### Added
- web extension supports more commands

## [1.27.0] 2021-10-24
### Added
- web extension supports `date` commands (issue [#25](https://github.com/rioj7/command-variable/issues/25))

## [1.26.0] 2021-10-24
### Added
- `file.content` properties `key` and `json` can contain variables
- `remember` can store _key_-_value_ pair(s)
- `remember` store has a default content for key `empty`, an empty string

## [1.25.0] 2021-10-16
### Added
- variable <code>${fileContent:<em>name</em>}</code> (also for key-value and json property)
- command `remember`
### Deprecated
- `rememberPick`

## [1.24.0] 2021-10-02
### Added
- `pickFile` can remember the picked file by key (`"keyRemember"`)

## [1.23.0] 2021-09-28
### Added
- `pickFile` can be used in a variable: <code>${pickFile:<em>name</em>}</code>
- `pickFile` has property `description`

## [1.22.0] 2021-09-07
### Added
- `pickStringRemember` can store multiple values with 1 pick

## [1.21.0] 2021-09-03
### Added
- `promptStringRemember` command and variable

## [1.20.0] 2021-08-21
### Added
- `pickStringRemember` can be used in a variable: <code>${pickStringRemember:<em>name</em>}</code>
- `rememberPick` can be used in a variable: <code>${rememberPick:<em>key</em>}</code>

## [1.19.0] 2021-05-24
### Added
- `inTerminal` : type result of command in the terminal

## [1.18.2] 2021-04-21
### Added
- `fileAsKey` : debug log (`@debug`)
- `string.replaceAll()` is not supported on VSC remote

## [1.18.0] 2021-04-21
### Added
- `pickStringRemember` can now also work with <code>[<em>label</em>,<em>value</em>]</code> tuples

## [1.17.0] 2021-04-20
### Added
- `fileAsKey` : get file path from command (`@useCommand`)
- `fileAsKey` : set default value if no key matches (`@default`)

## [1.16.2] 2021-03-19
### Added
- update uuid.js to v4.2.8 and allow different output formats

## [1.16.1] 2021-03-18
### Added
- VSCode Server (Remote SSH) does not support `??` and `?.`

## [1.16.0] 2021-03-17
### Added
- `pickFile` : can be limited to a Workspace folder or any other folder
- `pickFile` : change how the file paths are displayed
- `pickFile` : can ask for a path via additional entry

## [1.15.0] 2021-03-17
### Added
- `pickFile` : can return an emty string via additional entry

## [1.14.0] 2021-03-17
### Added
- In Multi Root Workspace you need to name the workspace in certain cases. In the variable or arguments.
- `${workspaceFolder}` and <code>${workspaceFolder:<em>name</em>}</code> now also work if no file currently open.
- everywhere a variable is allowed now all variables are allowed. (not all are usefull everywhere)
- process `${selectedText}` first so selected text could contain variable descriptions (maybe useful to somebody).
