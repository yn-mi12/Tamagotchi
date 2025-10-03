const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const disposable = vscode.commands.registerCommand('Tamagotchi.hello', function () {
		// vscode.window.showInformationMessage('Hello World from Tamagotchi!');
		const provider = new ViewProvider(context.extensionUri);
		vscode.window.registerWebviewViewProvider('Tamagotchi.view', provider);
	});

	context.subscriptions.push(disposable);
}

class ViewProvider {
	/**
	 * @param {vscode.Uri} extensionUri
	 */
	constructor(extensionUri) {
		this.extensionUri = extensionUri;
	}

	/**
	 * @param {vscode.WebviewView} webviewView
	 * @param {vscode.WebviewViewProviderOptions} _webviewViewOptions
	 * @param {vscode.CancellationToken} _token
	 */
	resolveWebviewView(webviewView, _webviewViewOptions, _token) {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.extensionUri]
		};
		webviewView.webview.html = getHtmlForWebview(webviewView.webview);
	}
}

function getHtmlForWebview(webview){
	
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
