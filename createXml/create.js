import { js2xml } from "xml-js";

/**@param {Object} info*/
export const createDefault = (info) => {
    let parameters = JSON.parse(info);
    const xmlObject = {
        "_declaration": {"_attributes": {"version": "1.0","encoding": "UTF-8"}},
        "CustomField": [{"_attributes": {"xmlns": "http://soap.sforce.com/2006/04/metadata"}}]
    }
    for(let param in parameters) {
        if(param === "sObject") continue;
        const value = parameters[param];
        xmlObject.CustomField[0][param] = [{"_text": [value]}]
    }
    const result = js2xml(xmlObject, {compact: true, spaces: 4});
    return result;
}

const picklistTemplate = ({
    fullName, 
    label, 
    valueSet, 
    controlledValues, 
    controllingField, 
    controlMap, 
    restricted, 
    required, 
    trackHistory}) => `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${fullName}</fullName>
    <externalId>false</externalId>
    <label>${label}</label>
    <required>${required ?? false}</required>
    <trackHistory>${trackHistory ?? false}</trackHistory>
    <trackTrending>false</trackTrending>
    <type>Picklist</type>
    <valueSet>${controllingField ? `
        <controllingField>${controllingField}</controllingField>` : ''}
        <restricted>${restricted ?? true}</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>${valueSet.map(val => `
            <value>
                <fullName>${val}</fullName>
                <default>false</default>
                <label>${val}</label>
            </value>`).join('')}
        </valueSetDefinition>${!controllingField || controlledValues?.lenght < 1 ? '' : controlledValues.map(val => `
        <valueSettings>${controlMap?.[val]?.map(sett => `
            <controllingFieldValue>${sett}</controllingFieldValue>`)?.join('')}
            <valueName>${val}</valueName>
        </valueSettings>`)?.join('') ?? ''}
    </valueSet>
</CustomField>
`
/**@param {string} info*/
export const picklistCreate = (info) => {
    let parameters = JSON.parse(info);
    parameters.fullName = parameters.fullName;
    const { valueSettings } = parameters;
    const valuesSet = new Set();
    Object.keys(valueSettings ?? {}).forEach(control => {
        valueSettings[control].forEach(val => {
            valuesSet.add(val);
        })
    })
    const controlledValues = Array.from(valuesSet);
    parameters.controlledValues = controlledValues;
    parameters.valueSet = parameters.valueSet ?? controlledValues;
    parameters.controlMap = controlledValues.reduce(
        (agg, cur) => ({...agg, [cur]: Object.keys(valueSettings).filter(control => valueSettings[control].includes(cur))})
    , {})
    return picklistTemplate(parameters)
}
