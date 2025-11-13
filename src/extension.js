const { Pet } = require('./commons/pet.ts');
const vscode = require('vscode');

/** @type {ViewProvider | undefined} */
let viewProvider;

/**
 * Registers the Tamagotchi view in the sidebar
 * @param {vscode.ExtensionContext} context
 */
function registerView (context) {
	viewProvider = new ViewProvider(context.extensionUri, context);
	const disposable = vscode.window.registerWebviewViewProvider('Tamagotchi.view', viewProvider);
	context.subscriptions.push(disposable);
}

function deserializePet(data) {
	if (!data) return null;
	const pet = new Pet(data.name, data.type);
	pet.hunger = data.hunger;
	pet.happiness = data.happiness;
	pet.health = data.health;
	pet.currentActivity = data.currentActivity;
	return pet;
}

async function performPetAction(context, activity, message) {
    if (!context.globalState.get('tamagotchiExists')) {
        vscode.window.showInformationMessage('No pets! Create one first.');
        return;
    }

    let petData = context.globalState.get('pet');
    let pet = deserializePet(petData);
	//console.log(pet);

	message = message.replace('{name}', pet.name);
	vscode.window.showInformationMessage(message);

    pet.performActivity(activity);
    await context.globalState.update('pet', pet);

    if (viewProvider){
		viewProvider.updateState({pet});
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	//TODO show some default view if no pet exists

	registerView(context);

	if(context.globalState.get('tamagotchiExists')){
		let existingPetData = context.globalState.get('pet');
		let existingPet = deserializePet(existingPetData);
		if(existingPet){
			console.log(existingPet);

			existingPet.performActivity("idle");
			context.globalState.update('pet', existingPet);
		}
	}


	context.subscriptions.push(
		vscode.commands.registerCommand('Tamagotchi.create', async () => {
			if(context.globalState.get('tamagotchiCreated')){
				vscode.window.showInformationMessage('Tamagotchi already created!');
				return;
			}
			vscode.window.showInformationMessage('Tamagotchi Created!');
			await context.globalState.update('tamagotchiExists', true);
			//TODO user input and options later
			try {
				let newPet = new Pet('First', 'someType');
				await context.globalState.update('pet', newPet);

				if(viewProvider) viewProvider.updateState('idle');
			} catch (err) {
				console.error("Could not reveal webview:", err);
			}
		}),

		//TODO fix this later
		vscode.commands.registerCommand('Tamagotchi.delete', async () => {
			try{
				await performPetAction(context, "delete", 'Deleted your pet {name}!');
				await context.globalState.update('tamagotchiExists', false);
				await context.globalState.update('pet', undefined);
				return;
			} catch (err) {
				console.error("Could not reveal webview:", err);
			}
		}),

		vscode.commands.registerCommand('Tamagotchi.play', async () => {
			await performPetAction(context, "play", 'Playing with {name}!');
		}),

		vscode.commands.registerCommand('Tamagotchi.feed', async () => {
			await performPetAction(context, "feed", 'Feeding {name}!');
		}),

		// current sprite has only 4 states
		vscode.commands.registerCommand('Tamagotchi.sleep', async () => {
			await performPetAction(context, "sleep", '{name} is going to sleep!');
		}),
	);
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
				const pet = await this.context.globalState.get('pet') || null;
				webviewView.webview.postMessage({ command: 'stateData', pet });
			}
		});
	}

	updateState(data) {
		if (this._view) {
			console.log(data);
			this._view.webview.postMessage({ command: 'setState', pet: data.pet});
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
