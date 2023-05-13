# Change Log

## [1.53.0] 2023-05-13
### Added
- `commandvariable.remember.persistent.file`: (setting) persistent storage for `remember` in local file system

## [1.52.1] 2023-05-05
### Modified
- `promptStringRemember`: on next call, with given key, use remembered/previous value as default

## [1.52.0] 2023-04-24
### Added
- `pickStringRemember`: read options from a JSON file

## [1.51.0] 2023-04-24
### Added
- `pickStringRemember`: multi pick - `dependsOn` : perform group validation based on picked items, filter picked items in output based on other picked items
### Modified
- `pickStringRemember`: remember previous multi pick items persistent (global or workspace)

## [1.50.0] 2023-04-22
### Added
- `pickStringRemember`: multi pick items and remember previous multi pick
- `pickStringRemember`: create (named) item groups with optional `minCount` and `maxCount` constraint

## [1.49.2] 2023-04-04
### Modified
- `transform` only perform variable substitution on `replace` when `find` is found in `text`

## [1.49.1] 2023-02-11
### Add
- `pickStringRemember`: options can be an object, variables can be shown resolved in pick list
- <code>&dollar;{command:<em>name</em>}</code> : variable substitution in `args` of command

## [1.47.0] 2023-01-14
### Add
- `pickFile` and `remember` : transform the result, use part of the picked file path
- `pickFile` : property `empty` to return empty string, silent pick, use pick result in `remember` command/variable
- `transform` : apply a sequence of find-replace operations

## [1.46.2] 2023-01-11
### Fixed
- `transform` : use of variables allowed in all properties

## [1.46.1] 2023-01-08
### Fixed
- `transform` : use of variables allowed in all properties

## [1.46.0] 2023-01-06
### Fixed
- `pickFile` : use of variables allowed in `fromFolder` filepaths

## [1.45.0] 2022-11-04
### Added
- `pickFile` : `acceptIfOneFile` to automatically accept the file if pickList has 1 entry

## [1.44.0] 2022-11-03
### Added
- `pickFile` : transform label for `fromFolder` pickList if path is too long

## [1.43.0] 2022-11-02
### Added
- variables : <code>&dollar;{env:<em>name</em>}</code>, <code>&dollar;{pathSeparator}</code>, <code>&dollar;{userHome}</code>
- `file.content` : extract an expression value from a YAML file

## [1.42.2] 2022-09-22
### Modified
- `promptStringRemember`: allow to escape when a default is set, show default in inputbox

## [1.42.1] 2022-09-03
### Added
- `extension.commandvariable.number` : from range of numbers - sequence of numbers with step or random number
- `remember` command and variable can retrieve last value of named `number`: `key` format is <code>number-<em>name</em></code>
### Modified
- README: mark `pickStringRemember`, `promptStringRemember` and `remember` as Web commands

## [1.41.0] 2022-08-24
### Added
- `${workspaceFolderBasename}`
- `key` of `remember` command can have variables

## [1.40.0] 2022-07-06
### Added
- `transform` stores the result for a given key
- `{transform:name}` transform command as variable
- `checkEscapedUI` for compound task/launch

## [1.38.0] 2022-07-01
### Added
- `extension.commandvariable.workspace.folderBasename`: basename of workspace root of current file
- `extension.commandvariable.workspace.folder`: workspace root of current file

## [1.37.0] 2022-07-01
### Added
- `pickStringRemember` remember transformed value or not
- `${remember}` remember variable can have a named argument, so you can also store values
- deprecation messages for `rememberPick` (variable and command) (once per session)
### Modified
- `README`: prevent KaTex Markdown to recognize a math expression

## [1.36.1] 2022-06-15
### Fixed
- `pickStringRemember` error "`text.replace` is not a function" when using multiple values to store.

## [1.36.0] 2022-05-24
### Added
- `pickFile` property `fromFolder` has a `fixed` option (no picklist)

## [1.35.1] 2022-05-13
### Fixed
- `pickStringRemember` in the `remember` storage the `value` string after variable substitution is stored.
- if you escape a UI element in a variable the result of the variable substitution will be `undefined`

## [1.35.0] 2022-05-11
### Added
- `pickFile` can now pick directory
- `pickStringRemember` values may contain variables

## [1.34.2] 2022-05-07
### Fixed
- `${workspaceFolder}` also works if current editor is not part of a workspace

## [1.34.0] 2022-04-07
### Added
- `commandvariable.pickStringRemember` read options from a file

## [1.33.0] 2022-03-17
### Added
- `extension.commandvariable.setClipboard` set the content of the clipboard

## [1.32.1] 2022-03-08
### Fixed
- if VSC `${command}` variable is used in launch config string the launch config is passed as argument, add workaround/check

## [1.32.0] 2022-03-06
### Added
- variable `${command}` in argument strings

## [1.31.0] 2022-03-06
### Added
- `workspace.folderPosix`
- <code>workspace.folder<em>N</em>Up</code>
- <code>workspace.folder<em>N</em>UpPosix</code>
- add `CHANGELOG.md`
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
