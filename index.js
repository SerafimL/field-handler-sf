import fs from "node:fs";
import {picklistCreate, createDefault} from "./createXml/create.js";
import { picklistExtract, extractBasicInfo, extractDefault } from "./extractXml/extract.js";
import { input, close } from "./utils/interaction.js";

const extract = (type, info, sObject) => {
    if(type === "Picklist") return picklistExtract(info, sObject);
    return extractDefault(info, sObject);
}

const create = (type, info) => {
    if(type === "Picklist") return picklistCreate(info);
    return createDefault(info);
}

const getInfoObj = (mode, info) => {
    if(mode === ".json") return JSON.parse(info);
    else if(mode === ".xml") return extractBasicInfo(info);
    throw new Error("file extension not supported");
}

const main = async () => {
    const path = await input("Path (json, xml): ");
    const mode = path.match(/\.([^.]*)$/)?.[0]?.toLowerCase();
    const info = fs.readFileSync(path, "utf8");
    const infoObj = getInfoObj(mode, info);
    const { type, fullName } = infoObj;
    const sObject = (mode === ".json" ? infoObj.sObject : path.match(/\/([^/]+)\/[^/]+\/[^/]+$/)?.[1]) ?? "";
    const template = (mode === ".json" ? create(type, info) : extract(type, info, sObject));
    const { objectsFolder, extractionFolder } = JSON.parse(fs.readFileSync("config.json", "utf8"));
    const directoty = `${mode === ".json" ? objectsFolder : extractionFolder}${sObject ? `/${sObject}` : ""}${mode === ".json" ? "/fields" : "/extractions"}`;
    fs.mkdirSync(directoty, { recursive: true }, err => {
        if (err) throw Error(err);
    });
    const fileName = mode === ".json" ? `${fullName}.field-meta.xml` : `${fullName}.json`;
    fs.writeFile(`${directoty}/${fileName}`, template, err => {
        if (err) throw Error(err);
        console.log(`file written successfully: ${directoty}/${fileName}`);
    });
    close();
}

main();