const { ActivityType } = require('./activities.ts');
const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function registerTamagotchiView (activity, context) {
	const provider = new ViewProvider(context.extensionUri);
	const disposable = vscode.window.registerWebviewViewProvider('Tamagotchi.view', provider);
	context.subscriptions.push(disposable);

	provider.setState(activity);
}


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('Tamagotchi.create', async () => {
			if(context.globalState.get('tamagotchiCreated')){
				vscode.window.showInformationMessage('Tamagotchi already created!');
				return;
			}
			vscode.window.showInformationMessage('Tamagotchi Created!');
			await context.globalState.update('tamagotchiCreated', true);
			try {
				registerTamagotchiView(ActivityType.Idle,context);
				return;
			} catch (err) {
				console.error("Could not reveal webview:", err);
			}
		}),
		vscode.commands.registerCommand('Tamagotchi.delete', async () => {
			if(!context.globalState.get('tamagotchiCreated')){
				vscode.window.showInformationMessage('No Tamagotchi to delete!');
				return;
			}
			vscode.window.showInformationMessage('Tamagotchi Deleted!');
			await context.globalState.update('tamagotchiCreated', false);
			try{
				registerTamagotchiView(ActivityType.Delete,context);
				return;
			} catch (err) {
				console.error("Could not reveal webview:", err);
			}
		}),
		vscode.commands.registerCommand('Tamagotchi.play', async () => {
			if(!context.globalState.get('tamagotchiCreated')){
				vscode.window.showInformationMessage('No Tamagotchi to play with! Create one first.');
				return;
			}
			vscode.window.showInformationMessage('Playing with Tamagotchi!');
			try{
				registerTamagotchiView(ActivityType.Play,context);
				return;
			} catch (err) {
				console.error("Could not reveal webview:", err);
			}
		}),
		vscode.commands.registerCommand('Tamagotchi.feed', async () => {
			if(!context.globalState.get('tamagotchiCreated')){
				vscode.window.showInformationMessage('No Tamagotchi to feed! Create one first.');
				return;
			}
			vscode.window.showInformationMessage('Feeding Tamagotchi!');
			try{
				registerTamagotchiView(ActivityType.Feed,context);
				return;
			} catch (err) {
				console.error("Could not reveal webview:", err);
			}
		})
	);
	if(context.globalState.get('tamagotchiCreated')){
		registerTamagotchiView(ActivityType.Idle,context);
	}
}

class ViewProvider {
	/**
	 * @param {vscode.Uri} extensionUri
	 */
	constructor(extensionUri) {
		this.extensionUri = extensionUri;
		this._view = undefined;
	}

	/**
	 * @param {vscode.WebviewView} webviewView
	 * @param {vscode.WebviewViewProviderOptions} _webviewViewOptions
	 * @param {vscode.CancellationToken} _token
	 */
	resolveWebviewView(webviewView, _webviewViewOptions, _token) {
		this._view = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')]
		};
		webviewView.webview.html = getHtmlForWebview(webviewView.webview, this.extensionUri);
	}

	setState(activityType) {
		if (this._view) {
			this._view.webview.postMessage({
				command: 'setState',
				state: activityType
			});
		}
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
