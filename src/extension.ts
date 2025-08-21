import * as path from 'path';
import * as vscode from 'vscode';
import { PythonFunctionLensProvider } from './PythonFunctionLensProvider';


function getArgsKey(uri: vscode.Uri, qualifiedName: string): string {
  return `${uri.toString()}::${qualifiedName}`;
}

function resolvePythonPath(configPath: string, uri: vscode.Uri): string {
  if (path.isAbsolute(configPath)) return configPath;

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  if (!workspaceFolder) return configPath;

  return path.join(workspaceFolder.uri.fsPath, configPath);
}

export function activate(context: vscode.ExtensionContext) {
  const selector = { language: 'python', scheme: 'file' };
  const provider = new PythonFunctionLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(selector, provider)
  );

  function getOrCreateTerminal(): vscode.Terminal {
    const existing = vscode.window.terminals.find(t => t.name === 'pytest-run');
    return existing ?? vscode.window.createTerminal('pytest-run');
  }
  context.subscriptions.push(
    vscode.commands.registerCommand('pythonFuncRunner.setArgs',
      async (uri: vscode.Uri, qualifiedName: string) => {
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
    vscode.commands.registerCommand('pythonFuncRunner.run',
                                    async (uri: vscode.Uri, funcName: string) => {

      const doc = await vscode.workspace.openTextDocument(uri);
      if (doc.isDirty) {
        await doc.save();
      }
      const filePath = uri.fsPath;
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
      const relativePath = workspaceFolder ? path.relative(workspaceFolder.uri.fsPath, filePath) : filePath;
      const relForPytest = relativePath.split(path.sep).join('/');
      const key = getArgsKey(uri, funcName);
      const argsInput = context.globalState.get<string>(key);
      const rawPythonPath = vscode.workspace.getConfiguration('pythonFuncRunner').get<string>('pythonPath') ?? 'python';
      const pythonPath = resolvePythonPath(rawPythonPath, uri);      const config = vscode.workspace.getConfiguration('pythonFuncRunner');
      const globalArgs = config.get<string>('extraPytestArgs') ?? '';
      const safePythonPath = `"${pythonPath}"`;
      const commandParts = [safePythonPath, '-m', 'pytest'];

      if (globalArgs) {
          commandParts.push(globalArgs);
      }
      if (argsInput) {
          commandParts.push(argsInput);
      }
      commandParts.push(`${relForPytest}::${funcName}`);

      const command = commandParts.join(' ');

      const terminal = getOrCreateTerminal();

      terminal.show();
      terminal.sendText(command);
      })
    );

  context.subscriptions.push(
    vscode.commands.registerCommand('pythonFuncRunner.debug', 
                                    async (uri: vscode.Uri, funcName: string) => {

    const config = vscode.workspace.getConfiguration('pythonFuncRunner');
    const rawPythonPath = config.get<string>('pythonPath') ?? 'python';
    const pythonPath = resolvePythonPath(rawPythonPath, uri);
    const filePath = uri.fsPath;
    const relativePath = vscode.workspace.asRelativePath(filePath);
    const relForPytest = relativePath.split(path.sep).join('/');
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
            `${relForPytest}::${funcName}`,
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
  context.subscriptions.push(
    vscode.commands.registerCommand('pythonFuncRunner.runMain', async (uri: vscode.Uri) => {
      const doc = await vscode.workspace.openTextDocument(uri);
      if (doc.isDirty) {
        await doc.save();
      }
      const key = getArgsKey(uri, '__main__');
      const argsInput = context.globalState.get<string>(key);
      const filePath = uri.fsPath;
      const rawPythonPath = vscode.workspace.getConfiguration('pythonFuncRunner').get<string>('pythonPath') ?? 'python';
      const pythonPath = resolvePythonPath(rawPythonPath, uri);

      const command = [
        `"${pythonPath}"`,
        `"${filePath}"`,
        ...(argsInput ? argsInput.split(' ') : [])
      ].join(' ');

      const terminal = getOrCreateTerminal();
      terminal.show();
      terminal.sendText(command);
    }),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('pythonFuncRunner.debugMain', async (uri: vscode.Uri) => {
      const key = getArgsKey(uri, '__main__');
      const argsInput = context.globalState.get<string>(key);
      const filePath = uri.fsPath;
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
      const rawPythonPath = vscode.workspace.getConfiguration('pythonFuncRunner').get<string>('pythonPath') ?? 'python';
      const pythonPath = resolvePythonPath(rawPythonPath, uri);

      const debugConfig: vscode.DebugConfiguration = {
        name: 'Debug __main__',
        type: 'python',
        request: 'launch',
        program: filePath,
        args: argsInput ? argsInput.split(' ') : [],
        console: 'integratedTerminal',
        justMyCode: true,
        cwd: workspaceFolder?.uri.fsPath ?? path.dirname(filePath),
        env: { PYTHONEXECUTABLE: pythonPath },
      };
      vscode.debug.startDebugging(workspaceFolder, debugConfig);
    }),
  );

}

export function deactivate() {}
