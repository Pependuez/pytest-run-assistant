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

## Requirements

* Python environment with `pytest` installed
* VS Code Python extension (for debugging support)

## How It Works

The extension parses Python files and adds CodeLens above test functions (`def test_...`) and test classes (`class Test...`). Clicking:

* Run: runs the test using pytest in the terminal
* Debug: starts a debug session with debugpy
* Args: allows you to define test-specific launch arguments
