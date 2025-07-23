# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.1] - 2025-07-23

### Added
- `Args` CodeLens button for classes — now you can set launch arguments for test classes separately.
- Persistent launch arguments are now stored per test function and class.

### Changed
- CodeLens rendering logic updated to accommodate three buttons: Run, Debug, and Args.
- Fix paths for run in Windows default vscode bash
- Keep runs in single terminal instead of create new each time

---

## [0.1.0] - 2025-07-21

### Added
- Initial release of **Pytest Run Assistant**.
- CodeLens for running and debugging individual test functions and test classes.
- Per-function argument configuration via `Args` input prompt.
- Global configuration: `pythonPath`, `extraPytestArgs`

