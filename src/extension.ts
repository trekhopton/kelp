import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { simpleGit, SimpleGit } from "simple-git";

export function activate(context: vscode.ExtensionContext) {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;

  let disposable = vscode.commands.registerCommand("git3d.start", async () => {
    // 1. Check if user has a folder open
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage(
        "🌿 Kelp Branches: Please open a folder with a Git repo first!",
      );
      return;
    }

    const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const git: SimpleGit = simpleGit(rootPath);

    const columnToShowIn = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (currentPanel) {
      currentPanel.reveal(columnToShowIn);
    } else {
      currentPanel = vscode.window.createWebviewPanel(
        "git3d",
        "Kelp Branches",
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

    // 3. FETCH GIT DATA & SEND TO WEBVIEW
    try {
      // Get last 100 commits with all branches and parent info
      const log = await git.log({
        "--all": null,
        maxCount: 100,
        "--date-order": null,
        format: {
          hash: "%H",
          parents: "%P",
          date: "%ai",
          message: "%s",
          refs: "%D",
          author_name: "%aN",
          author_email: "%ae",
        },
      });

      // Send the data to the frontend
      currentPanel.webview.postMessage({
        command: "loadCommits",
        data: log.all,
      });

      vscode.window.showInformationMessage(
        `🌿 Kelp Loaded: ${log.total} commits found.`,
      );
    } catch (err) {
      vscode.window.showErrorMessage("Error reading Git history: " + err);
    }
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(webview: vscode.Webview, extensionPath: string) {
  const htmlPath = path.join(extensionPath, "media", "webview.html");
  return fs.readFileSync(htmlPath, "utf8");
}

export function deactivate() {}
