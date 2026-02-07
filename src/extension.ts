import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;

  let disposable = vscode.commands.registerCommand("git3d.start", () => {
    const columnToShowIn = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (currentPanel) {
      currentPanel.reveal(columnToShowIn);
    } else {
      currentPanel = vscode.window.createWebviewPanel(
        "git3d",
        "Git 3D Visualiser",
        columnToShowIn || vscode.ViewColumn.One,
        {
          enableScripts: true,
          // Restrict the webview to only loading content from our extension's directory
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, "media")),
          ],
        },
      );

      // Set the HTML content
      currentPanel.webview.html = getWebviewContent(
        currentPanel.webview,
        context.extensionPath,
      );

      // Handle panel closing
      currentPanel.onDidDispose(
        () => {
          currentPanel = undefined;
        },
        null,
        context.subscriptions,
      );
    }
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(webview: vscode.Webview, extensionPath: string) {
  const htmlPath = path.join(extensionPath, "media", "webview.html");
  return fs.readFileSync(htmlPath, "utf8");
}

export function deactivate() {}
