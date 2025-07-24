# Pytest Run Assistant

**Pytest Run Assistant** is a Visual Studio Code extension that adds handy CodeLens buttons above each `pytest` test function and test class. It allows you to **run**, **debug**, and **configure launch arguments** for each test individually.

## Features

- CodeLens buttons for test functions and classes:
  - ▶ **Run**
  - 🐞 **Debug**
  - ⚙️ **Args** – configure launch arguments for a specific test
- Stores individual launch arguments per test
- Runs tests using `pytest` in the integrated terminal
- Debugs using VS Code's built-in debugger and `debugpy`
- Supports configuration for Python and Pytest paths

## Configuration

Add the following to your `settings.json`:

```json
{
  "pythonFuncRunner.pythonPath": "/path/to/python",
  "pythonFuncRunner.extraRunArgs": "-v",
}
```
or

just find in settings `@ext:Pependuez.pytest-run-assistant`

### How to find out python path

The easiest way — if you're using Poetry — is to run:

```bash
poetry env info

```

Look for the Executable: field in the output (works on all systems).

Alternatively, you can use the following commands to find the Python executable in an activated environment:
macOS / Linux:
```bash
which python
```

Windows (Command Prompt):
```bash
where python
```

Windows (PowerShell):
```shell
Get-Command python
```
You can also try locating the executable manually in .venv or .pyenv directories under your home folder.



## Requirements

* Python environment with `pytest` installed
* VS Code Python extension (for debugging support)

## How It Works

The extension parses Python files and adds CodeLens above test functions (`def test_...`) and test classes (`class Test...`). Clicking:

* Run: runs the test using pytest in the terminal
* Debug: starts a debug session with debugpy
* Args: allows you to define test-specific launch arguments

## Repository

You can find the source code on GitHub:
[https://github.com/pependuez/pytest-run-assistant](https://github.com/pependuez/pytest-run-assistant)

## Feedback

I’m open to suggestions, feature requests, and feedback of any kind — including criticism.
If you find a bug, have an idea, or just want to share your experience, feel free to open an issue or discussion on GitHub.
Also, if you find this extension useful, a star or a rating on the marketplace is always appreciated!
