import * as vscode from 'vscode';
import { PythonFunctionLensProvider } from './PythonFunctionLensProvider';
import * as path from 'path';


function getArgsKey(uri: vscode.Uri, qualifiedName: string): string {
  return `${uri.toString()}::${qualifiedName}`;
}

export function activate(context: vscode.ExtensionContext) {
  const selector = { language: 'python', scheme: 'file' };
  const provider = new PythonFunctionLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(selector, provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('pythonFuncRunner.setArgs', async (uri: vscode.Uri, qualifiedName: string) => {
        const key = getArgsKey(uri, qualifiedName);
        const current = context.globalState.get<string>(key) || '';

        const argsInput = await vscode.window.showInputBox({
            prompt: `Set pytest arguments for ${qualifiedName}`,
            value: current,
        });

        if (argsInput !== undefined) {
            await context.globalState.update(key, argsInput);
            vscode.window.showInformationMessage(`Saved args for ${qualifiedName}`);
        }
     })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('pythonFuncRunner.run', async (uri: vscode.Uri, funcName: string) => {

    const filePath = uri.fsPath;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    const relativePath = workspaceFolder ? path.relative(workspaceFolder.uri.fsPath, filePath) : filePath;
    const key = getArgsKey(uri, funcName);
    const argsInput = context.globalState.get<string>(key);
    const pythonPath = vscode.workspace.getConfiguration('pythonFuncRunner').get<string>('pythonPath') ?? 'python';
    const config = vscode.workspace.getConfiguration('pythonFuncRunner');
    const globalArgs = config.get<string>('extraPytestArgs') ?? '';
    const commandParts = [pythonPath, '-m pytest'];

    if (globalArgs) {
        commandParts.push(globalArgs);
    }
    if (argsInput) {
        commandParts.push(argsInput);
    }
    commandParts.push(`${relativePath}::${funcName}`);

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
    const globalArgs = config.get<string>('extraPytestArgs') ?? '';

    const key = getArgsKey(uri, funcName);
    const argsInput = context.globalState.get<string>(key);

    const debugConfig: vscode.DebugConfiguration = {
        name: 'Debug pytest function',
        type: 'python',
        request: 'launch',
        python: pythonPath,
        module: 'pytest',
        args: [
            ...(globalArgs ? globalArgs.split(' ') : []),
            `${relativePath}::${funcName}`,
            ...(argsInput ? argsInput.split(' ') : [])
        ],
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
