import { xml2js } from "xml-js";

export const picklistExtract = (info, sObject) => {
    const xmlObject = xml2js(info, {compact: true, alwaysArray: true});
    const valueSettings = {}; 
    const valueSet = xmlObject.CustomField[0].valueSet[0].valueSetDefinition[0].value.map(val => val.fullName[0]._text[0])
    const fullName = xmlObject.CustomField[0].fullName[0]._text[0];
    const label = xmlObject.CustomField[0].label[0]._text[0];
    const required = xmlObject.CustomField[0].required[0]._text[0];
    const trackHistory = xmlObject.CustomField[0].trackHistory[0]._text[0];
    const controllingField = xmlObject.CustomField[0].valueSet[0].controllingField?.[0]?._text?.[0];
    const type = xmlObject.CustomField[0].type[0]._text[0];
    if(!xmlObject.CustomField[0].valueSet[0].valueSettings) {
        return JSON.stringify(
            {valueSet, fullName, label, type, sObject, required, trackHistory, controllingField},
            null,
            4
        );
    } 

    xmlObject.CustomField[0].valueSet[0].valueSettings.forEach(setting => {
        const fieldName = setting.valueName[0]._text[0];
        setting.controllingFieldValue.forEach(control => {
            const controlField = control._text
            const previous = valueSettings[controlField] ?? [];
            previous.push(fieldName);
            valueSettings[controlField] = previous;
        })
    })
    return JSON.stringify(
        {fullName, label, required, trackHistory, controllingField, type, sObject, valueSettings, valueSet},
        null,
        4
    );
}

export const extractBasicInfo = (info) => {
    const xmlObject = xml2js(info, {compact: true, alwaysArray: true});
    const fullName = xmlObject?.CustomField?.[0]?.fullName?.[0]?._text?.[0];
    const type = xmlObject?.CustomField?.[0]?.type?.[0]?._text?.[0];

    if(!fullName) {
        throw Error('Missing required info: fullName');
    }
    if(!type) {
        throw Error('Missing required info: type');
    }
    return {fullName, type};
}

export const extractDefault = (info, sObject) => {
    const xmlObject = xml2js(info, {compact: true, alwaysArray: true});
    const result = {sObject};
    for(let attName in xmlObject.CustomField[0]) {
        if(attName === '_attributes') continue;
        const value = xmlObject.CustomField[0][attName][0]._text[0];
        result[attName] = value;
    }
    return JSON.stringify(result, null, 4);
}