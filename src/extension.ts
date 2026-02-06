import * as vscode from "vscode";
import * as path from "path";

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
  // We must load the Three.js library from a local file for security
  // Create a folder named 'media' in your root and put 'three.min.js' there,
  // OR use a CDN (easier for prototyping, shown below).

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Git 3D</title>
    <style>
        body { margin: 0; overflow: hidden; background-color: #1e1e1e; }
        canvas { display: block; }
    </style>
</head>
<body>
    <div id="container"></div>
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.160.0/build/three.module.js"
            }
        }
    </script>
    <script type="module">
        import * as THREE from 'three';

        // 1. Scene Setup
        const scene = new THREE.Scene();
        // Add some fog to blend into VS Code background
        scene.fog = new THREE.FogExp2(0x1e1e1e, 0.002);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // 2. Add a Cube (representing a Git Commit)
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // 3. Animation Loop
        function animate() {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        }

        // Handle Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    </script>
</body>
</html>`;
}

export function deactivate() {}
