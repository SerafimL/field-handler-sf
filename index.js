import fs from "node:fs";
import {picklistCreate, createDefault} from "./createXml/create.js";
import { picklistExtract, extractBasicInfo, extractDefault } from "./extractXml/extract.js";
import path from 'path';
import * as vscode from 'vscode'

/** 
 * @param {object} info
 * @param {string} type
 * @param {string} sObject
*/
const extract = (type, info, sObject) => {
    if(type === "Picklist") return picklistExtract(info, sObject);
    return extractDefault(info, sObject);
}

/** 
 * @param {object} info
 * @param {string} type
*/
const create = (type, info) => {
    if(type === "Picklist") return picklistCreate(info);
    return createDefault(info);
}

/** 
 * @param {object} info
 * @param {string} mode
*/
const getInfoObj = (mode, info) => {
    if(mode === ".json") return JSON.parse(info);
    else if(mode === ".xml") return extractBasicInfo(info);
    throw new Error("file extension not supported");
}

/** 
 * @param {string} info
 * @param {string} filePath
*/
export const extractFile = async (filePath, info) => {

    const mode = path.extname(filePath);
    if(mode !== ".xml") {
        vscode.window.showErrorMessage("file extension not supported for creation");
        return;
    }
    const infoObj = getInfoObj(mode, info);
    const { fullName } = infoObj;
    const folderPath = path.dirname(path.dirname(filePath));
    const sObject = path.basename(folderPath);
    
    const template = extract(infoObj.type, info, sObject);
    const directoty = `${folderPath}/extractions`;
    fs.mkdirSync(directoty, { recursive: true });
    const fileName = `${fullName}.json`;
    fs.writeFile(`${directoty}/${fileName}`, template, err => {
        if (err) {
            console.error(err);
            vscode.window.showErrorMessage(err.message);
            return;
        }
        console.log(`file written successfully: ${directoty}/${fileName}`);
    });
        const fileUri = vscode.Uri.file(`${directoty}/${fileName}`);

    const action = await vscode.window.showInformationMessage(
        `File created: \n${fileName}`,
        'Open File'
    );

    if (action === 'Open File') {
        vscode.window.showTextDocument(fileUri);
    }
}

/** 
 * @param {string} info
 * @param {string} filePath
*/
export const createField = async (filePath, info) => {
    const mode = path.extname(filePath);
    if(mode !== ".json") {
        vscode.window.showErrorMessage("file extension not supported for creation");
        return;
    }
    const infoObj = getInfoObj(mode, info);
    const { fullName, type, sObject } = infoObj;
    const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    const template = create(type, info);
    const directoty = `${folderPath}/force-app/main/default/objects/Case/fields`;
    const fileName = `${fullName}.field-meta.xml`;
    fs.writeFile(`${directoty}/${fileName}`, template, err => {
        if (err) {
            console.error(err);
            vscode.window.showErrorMessage(err.message);
            return;
        }
        console.log(`file written successfully: ${directoty}/${fileName}`);
    });
    const fileUri = vscode.Uri.file(`${directoty}/${fileName}`);

    const action = await vscode.window.showInformationMessage(
        `File created: \n${fileName}`,
        'Open File'
    );

    if (action === 'Open File') {
        vscode.window.showTextDocument(fileUri);
    }
}
