import * as vscode from 'vscode';
import { PythonFunctionLensProvider } from './PythonFunctionLensProvider';
import * as path from 'path';


export function activate(context: vscode.ExtensionContext) {
  const selector = { language: 'python', scheme: 'file' };
  const provider = new PythonFunctionLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(selector, provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('pythonFuncRunner.run', async (uri: vscode.Uri, funcName: string) => {
      const filePath = uri.fsPath;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    const relativePath = workspaceFolder
    ? path.relative(workspaceFolder.uri.fsPath, filePath)
    : filePath;

    const argsInput = await vscode.window.showInputBox({
      prompt: 'Аргументы командной строки для pytest (опционально)',
      placeHolder: '--tb=short -q',
    });

    const commandParts = [`poetry run pytest`, `${relativePath}::${funcName}`];
    if (argsInput) {
      commandParts.push(argsInput);
    }

    const command = commandParts.join(' ');

    const terminal = vscode.window.createTerminal('pytest-run');
    terminal.show();
    terminal.sendText(command);
    })
  );

  context.subscriptions.push(
  vscode.commands.registerCommand('pythonFuncRunner.debug', async (uri: vscode.Uri, funcName: string) => {
    const config = vscode.workspace.getConfiguration('pythonFuncRunner');
    const pythonPath = config.get<string>('pythonPath') ?? 'python';

    const filePath = uri.fsPath;
    const relativePath = vscode.workspace.asRelativePath(filePath);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);

    const argsInput = await vscode.window.showInputBox({
      prompt: 'Аргументы командной строки для pytest (опционально)',
      placeHolder: '--tb=short -q',
    });

    const debugConfig: vscode.DebugConfiguration = {
        name: 'Debug pytest function',
        type: 'python',
        request: 'launch',
        python: pythonPath,
        module: 'pytest',
        args: [`${relativePath}::${funcName}`, ...(argsInput ? argsInput.split(' ') : [])],
        console: 'integratedTerminal',
        justMyCode: true,
        cwd: workspaceFolder?.uri.fsPath ?? path.dirname(filePath),
        env: {
            PYTHONEXECUTABLE: pythonPath,
        },
    };

    vscode.debug.startDebugging(workspaceFolder, debugConfig);
  })
);

}

export function deactivate() {}
