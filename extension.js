import * as vscode from 'vscode'
import { extractFile, createField } from './index.js'

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context) {
	const extractCurrentFile = vscode.commands.registerCommand('field-handler-sf.extractCurrentFile', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active file open');
			return;
		}

		const document = editor.document;
		const path = editor.document.uri.fsPath;
		const text = document.getText();

		const { fileName, fullpath } = await extractFile(path, text);
        const fileUri = vscode.Uri.file(fullpath);

		const action = await vscode.window.showInformationMessage(
			`File created: \n${fileName}`,
			'Open File'
		);

		if (action === 'Open File') {
			vscode.window.showTextDocument(fileUri);
		}
	});

	const createFieldCmd = vscode.commands.registerCommand('field-handler-sf.createField', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active file open');
			return;
		}

		const document = editor.document;
		const path = editor.document.uri.fsPath;
		const text = document.getText();

		const { fileName, fullpath } = await createField(path, text);
        const fileUri = vscode.Uri.file(fullpath);

		const action = await vscode.window.showInformationMessage(
			`File created: \n${fileName}`,
			'Open File'
		);

		if (action === 'Open File') {
			vscode.window.showTextDocument(fileUri);
		}
	});

	context.subscriptions.push(extractCurrentFile, createFieldCmd);
}

export function deactivate() {}
