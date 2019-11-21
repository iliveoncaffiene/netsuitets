/**
 * @NAPIVersion 2.0
 * @NScriptType UserEventScript
 */

import * as http from 'N/http'
import * as record from 'N/record'
import * as log from 'N/log';
import { EntryPoints } from 'N/types';

const apiUrl: string = 'http://104.41.154.217:9090/ws/simple/executeNSRequest';
const applyListId = "apply";

export var afterSubmit: EntryPoints.UserEvent.afterSubmit = function sendProductData(context: EntryPoints.UserEvent.afterSubmitContext) {
    var prodNewRecord = context.newRecord;

    var internalId = prodNewRecord.getValue("id");

    var applyRows = getSublistObjects(prodNewRecord, applyListId);
    var invoices = applyRows.map(r => {
        let invoice = record.load({ id: r["internalid"], type: record.Type.INVOICE });
        let salesForceId = invoice.getValue({ fieldId: "custbody_celigo_sfnc_salesforce_id" });
        let amountRemaining = invoice.getValue({ fieldId: "amountremaining" });
        let amountPaid = invoice.getValue({ fieldId: "amountpaid" });
        let total = invoice.getValue({ fieldId: "origtotal" });
        let invoiceId = r["internalid"];
        return { salesForceId, amountRemaining, amountPaid, invoiceId, total };
    });

    var postData = { parentRecordId: internalId, invoiceRecords: invoices };
    
    try {
        var response = postJson(postData);
        var newSFID = response.body;
        newSFID = newSFID.replace('\n', '');
    } catch (er02) {
        log.error('ERROR', JSON.stringify(er02));
    }
}

function postJson(json: any) {
    var header = [];
    header['Content-Type'] = 'application/json';
    header['Accept'] = 'application/json';
    return http.post({
        url: apiUrl,
        headers: header,
        body: JSON.stringify(json)
    });
}

function getSublistObjects(record: record.Record, sublistId: string) {
    var subListFields = record.getSublistFields({ sublistId: sublistId });
    var rowCount = record.getLineCount({ sublistId: sublistId });

    var list: { [key: string]: record.FieldValue }[] = [];

    for (var r = 0; r < rowCount; r++) {
        var obj: { [key: string]: record.FieldValue } = {};
        for (var f = 0; f < subListFields.length; f++) {
            var value = record.getSublistValue({
                sublistId: sublistId,
                fieldId: subListFields[f],
                line: r
            });
        
            obj[subListFields[f]] = value;
        }
        list.push(obj);
    }

    return list;
}

function getSublistFields(record: record.Record, sublistId: string) {
    var subListFields = record.getSublistFields({ sublistId: sublistId });
    var rowCount = record.getLineCount({ sublistId: sublistId });

    var list: { [key: string]: record.Field }[] = [];

    for (var r = 0; r < rowCount; r++) {
        var obj: { [key: string]: record.Field } = {};
        for (var f = 0; f < subListFields.length; f++) {
            var field = record.getSublistField({
                sublistId: sublistId,
                fieldId: subListFields[f],
                line: r
            });
        
            obj[subListFields[f]] = field;
        }
        list.push(obj);
    }

    return list;
}
