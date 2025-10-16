const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Register the webview provider during activation
	const provider = new ViewProvider(context.extensionUri);
	const webviewDisposable = vscode.window.registerWebviewViewProvider('Tamagotchi.view', provider);

	context.subscriptions.push(webviewDisposable);
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
			localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')]
		};
		webviewView.webview.html = getHtmlForWebview(webviewView.webview, this.extensionUri);
	}
}

/** 
This function returns the HTML for the webview
* @param {vscode.Webview} webview
* @param {vscode.Uri} extensionUri
*/
function getHtmlForWebview(webview, extensionUri){
	try{
		const path = require('path');
		const fs = require('fs');
		const indexPath = path.join(extensionUri.fsPath, 'media', 'index.html');
		let html = fs.readFileSync(indexPath, 'utf8');

		const baseUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media'));
		html = html.replace(/{{baseUri}}/g, baseUri.toString());
		return html;
	}
	catch(err){
		console.error(err);
		return `<h1>Error loading HTML</h1><p>${err.message}</p>`;
	}
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
