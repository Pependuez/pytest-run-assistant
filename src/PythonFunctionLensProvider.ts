import * as vscode from 'vscode';

export class PythonFunctionLensProvider implements vscode.CodeLensProvider {
  private codeLenses: vscode.CodeLens[] = [];
  private testFuncRegex = /^\s*def (test_\w+)\(/;
  private testClassRegex = /^\s*class (Test\w*)\b/;

  public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    this.codeLenses = [];

    let currentClass: { name: string, indent: number } | null = null;

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const text = line.text;

      const classMatch = this.testClassRegex.exec(text);
      if (classMatch) {
        const name = classMatch[1];
        const indent = line.firstNonWhitespaceCharacterIndex;
        currentClass = { name, indent };

        const position = new vscode.Position(i, 0);
        const range = new vscode.Range(position, position);

        this.codeLenses.push(
          new vscode.CodeLens(range, {
            title: '▶ Run class',
            command: 'pythonFuncRunner.run',
            arguments: [document.uri, name],
          }),
          new vscode.CodeLens(range, {
            title: '🐞 Debug class',
            command: 'pythonFuncRunner.debug',
            arguments: [document.uri, name],
          })
        );

        continue;
      }

      if (
        currentClass &&
        line.firstNonWhitespaceCharacterIndex <= currentClass.indent &&
        text.trim() !== ''
      ) {
        currentClass = null;
      }

      const funcMatch = this.testFuncRegex.exec(text);
      if (funcMatch) {
        const funcName = funcMatch[1];
        const position = new vscode.Position(i, 0);
        const range = new vscode.Range(position, position);

        const qualifiedName = currentClass
          ? `${currentClass.name}::${funcName}`
          : funcName;

        this.codeLenses.push(
          new vscode.CodeLens(range, {
            title: '▶ Run',
            command: 'pythonFuncRunner.run',
            arguments: [document.uri, qualifiedName],
          }),
          new vscode.CodeLens(range, {
            title: '🐞 Debug',
            command: 'pythonFuncRunner.debug',
            arguments: [document.uri, qualifiedName],
          }),
          new vscode.CodeLens(range, {
            title: '⚙ Args',
            command: 'pythonFuncRunner.setArgs',
            arguments: [document.uri, qualifiedName],
          })
        );
      }
    }

    return this.codeLenses;
  }
}
