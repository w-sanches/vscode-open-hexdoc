import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('hexdocs-finder.openHexDoc', () => {
		vscode.workspace.findFiles('mix.lock').then((files) => {
			vscode.workspace.openTextDocument(files[0]).then((document) => {
				const libsAndVersions = document
					.getText()
					.split('\n')
					.slice(1, -1)
					.map(toLibAndVersion)
					.filter((string) => string !== '');
				vscode.window.showQuickPick(libsAndVersions, { canPickMany: false })
					.then((pick) => {
						if (pick) {
							const [lib, version] = pick.split(":");
							openDocs(lib, version);
						}
					});
			});
		});
	});

	context.subscriptions.push(disposable);
}
function toLibAndVersion(string: string): string {
	const match = /\s*"(.*)": {:.*, "([.\d]+)"/g.exec(string);
	return match ? match.splice(1).join(':') : '';
}

function openDocs(lib: string, version = '') {
	vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://hexdocs.pm/${lib}/${version}`));
}

export function deactivate() { }
