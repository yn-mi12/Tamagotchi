const { ActivityType } = require('./commons/activities.ts');
const { Pet } = require('./commons/pet.ts');
const vscode = require('vscode');

/**
 * Registers the Tamagotchi view in the sidebar
 * @param {vscode.ExtensionContext} context
 */
function registerTamagotchiView (context) {
	const provider = new ViewProvider(context.extensionUri, context);
	const disposable = vscode.window.registerWebviewViewProvider('Tamagotchi.view', provider);
	context.subscriptions.push(disposable);
	context.globalState.update('tamagotchiViewProvider', provider);
}

function deserializePet(data) {
	if (!data) return null;
	const pet = new Pet(data.name, data.type);
	pet.hunger = data.hunger;
	pet.happiness = data.happiness;
	pet.health = data.health;
	return pet;
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
			//TODO user input and options later
			try {
				let newPet = new Pet('First', 'someType');
				console.log(newPet);

				await context.globalState.update('pet', newPet);
				registerTamagotchiView(context);
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
				//TODO fix this later
				await context.globalState.update('pet', undefined);
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
				let existingPetData = context.globalState.get('pet');
				let existingPet = deserializePet(existingPetData);
				console.log(existingPet);

				existingPet.performActivity(ActivityType.Play);
				await context.globalState.update('pet', existingPet);

				const provider = context.globalState.get('tamagotchiViewProvider');
				if (provider) provider.updateState('play');

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
				let existingPetData = context.globalState.get('pet');
				let existingPet = deserializePet(existingPetData);
				console.log(existingPet);

				existingPet.performActivity(ActivityType.Feed);
				await context.globalState.update('pet', existingPet);

				const provider = context.globalState.get('tamagotchiViewProvider');
				if (provider) provider.updateState('feed');
				
				return;
			} catch (err) {
				console.error("Could not reveal webview:", err);
			}
		}),
		vscode.commands.registerCommand('Tamagotchi.sleep', async () => {
			if(!context.globalState.get('tamagotchiCreated')){
				vscode.window.showInformationMessage('No Tamagotchi to put to sleep! Create one first.');
				return;
			}
			vscode.window.showInformationMessage('Putting Tamagotchi to sleep!');
			try{
				let existingPetData = context.globalState.get('pet');
				let existingPet = deserializePet(existingPetData);
				existingPet.performActivity(ActivityType.Sleep);
				await context.globalState.update('pet', existingPet);
				
				const provider = context.globalState.get('tamagotchiViewProvider');
				if (provider) provider.updateState('sleep');
				
				return;
			} catch (err) {
				console.error("Could not reveal webview:", err);
			}
		})
	);
	//is it necessary? ig yes
	if(context.globalState.get('tamagotchiCreated')){
		let existingPetData = context.globalState.get('pet');
		let existingPet = deserializePet(existingPetData);
		console.log(existingPet);

		existingPet.performActivity(ActivityType.Idle);
		context.globalState.update('pet', existingPet);
		
		const provider = context.globalState.get('tamagotchiViewProvider');
		if (provider) provider.updateState('idle');
				
		return;
	}
}

class ViewProvider {
	/**
	 * @param {vscode.Uri} extensionUri
	 * @param {vscode.ExtensionContext} context
	 */
	constructor(extensionUri, context) {
		this.extensionUri = extensionUri;
		this.context = context;
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

		webviewView.webview.onDidReceiveMessage(async (message) => {
			if(message.command === 'getState'){
				const pet = await context.globalState.get('pet') || null;
				webviewView.webview.postMessage({ command: 'stateData', pet });
			}
		});
	}

	updateState(state) {
		if (this._view) {
			this._view.webview.postMessage({ command: 'setState', state });
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
