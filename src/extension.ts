import * as VSCode from 'vscode';
import { spawn } from 'child_process';

export function activate(context: VSCode.ExtensionContext) {
	const disposable = VSCode.commands.registerCommand('open-hexdoc.openHexDoc', () => {
		VSCode.workspace.findFiles('mix.lock').then(([mixFile]) => {
			VSCode.workspace.openTextDocument(mixFile).then((document) => {
				findElixirVersion((elixirVersion: string) => {
					const libsAndVersions = document
						.getText()
						.split('\n')
						.slice(1, -1)
						.map(toLibAndVersion)
						.filter((string: string) => string !== '');

					libsAndVersions.unshift(elixirVersion);

					VSCode.window.showQuickPick(libsAndVersions, { canPickMany: false })
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
	const elixirVersion = spawn('elixir', ['-v']);

	elixirVersion.stdout.on('data', (data: string) => {
		const match = /Elixir ([0-9]+\.[0-9]+\.[0-9]+(?:-rc\.?[0-9]+)?)/g.exec(data);
		const version = match ? `elixir:${match.splice(1)}` : '';

		callback(version);
	});
}

function toLibAndVersion(string: string): string {
	const match = /\s*"(.*)": \{:.*,\s:[^,]*,\s*"([^"]+)/g.exec(string);

	return match ? match.splice(1).join(':') : '';
}

async function openDocs(lib: string, version = '') {
	await fetch(`https://hexdocs.pm/${lib}/${version}`)
		.then(() => VSCode.commands.executeCommand('vscode.open', VSCode.Uri.parse(`https://hexdocs.pm/${lib}/${version}`)))
		.catch(() => VSCode.commands.executeCommand('vscode.open', VSCode.Uri.parse(`https://hexdocs.pm/${lib}`)));
}

export function deactivate() { }
