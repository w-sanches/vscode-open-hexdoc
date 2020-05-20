import * as vscode from 'vscode';
const got = require('got');

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('open-hexdoc.openHexDoc', () => {
		vscode.workspace.findFiles('mix.lock').then((files) => {
			vscode.workspace.openTextDocument(files[0]).then((document) => {
				findElixirVersion((elixirVersion: string) => {
					const libsAndVersions = document
						.getText()
						.split('\n')
						.slice(1, -1)
						.map(toLibAndVersion)
						.filter((string: string) => string !== '');

					libsAndVersions.unshift(elixirVersion);

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
	});

	context.subscriptions.push(disposable);
}

function findElixirVersion(callback: Function) {
	const { spawn } = require('child_process');
	const elixirVersion = spawn('elixir', ['-v']);

	elixirVersion.stdout.on('data', (data: string) => {
		const match = /Elixir ([0-9]+\.[0-9]+\.[0-9]+)/g.exec(data);
		const version = match ? `elixir:${match.splice(1)}` : '';

		callback(version);
	});
}

function toLibAndVersion(string: string): string {
	const match = /\s*"(.*)": {:.*, "([.\d]+)"/g.exec(string);
	return match ? match.splice(1).join(':') : '';
}

async function openDocs(lib: string, version = '') {
	await got(`https://hexdocs.pm/${lib}/${version}`)
		.then(() => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://hexdocs.pm/${lib}/${version}`)))
		.catch(() => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://hexdocs.pm/${lib}`)));

}

export function deactivate() { }
