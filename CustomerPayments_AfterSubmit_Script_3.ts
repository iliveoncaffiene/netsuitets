/**
 * @NAPIVersion 2.1
 * @NScriptType UserEventScript
*/
import * as http from 'N/http'
import * as record from 'N/record'
import * as log from 'N/log';
import { EntryPoints } from 'N/types';
var apiUrl = 'http://12.176.134.134:9090/ws/simple/executeNSRequest';
var applyListId = "apply";
export var afterSubmit: EntryPoints.UserEvent.afterSubmit = function sendProductData(context) {
    const prodNewRecord = context.newRecord;
    // var addresses = getSublistObjects(prodNewRecord, addressListId);
    // var defaultBilling = addresses.filter(function (a) { return a.defaultbilling; })[0];
    // log.debug("BILLING ADDR", JSON.stringify(defaultBilling));
    const internalId = prodNewRecord.getValue("id");
    prodNewRecord.getFields
    // var vendorID = prodNewRecord.getValue("entityid");
    // var address = defaultBilling.addr1_initialvalue;
    // var city = defaultBilling.city_initialvalue;
    // var dropdownState = defaultBilling.displaystate_initialvalue;
    // var zip = defaultBilling.zip_initialvalue;
    // log.debug("VALUES", "sfdcNum: " + JSON.stringify(sfdcNum) + ", poNum: " + JSON.stringify(poNum));
    const applyRows = getSublistObjects(prodNewRecord, applyListId);
    const invoices = applyRows.map(r => {
        const invoice = record.load({ id: r["internalid"], type: record.Type.INVOICE });
        const salesForceId = invoice.getValue({ fieldId: "custbodysalesforce_order_id" });
        const amountRemaining = invoice.getValue({ fieldId: "amountremaining" });
        const amountPaid = invoice.getValue({ fieldId: "amountpaid" });
        const invoiceId = r["internalid"];
        return { salesForceId, amountRemaining, amountPaid, invoiceId };
    })
        .filter(r => !!r.salesForceId);
    if (invoices.length > 0) {
        // log.debug("APPLY FIELDS", JSON.stringify(test));
        // log.debug("LISTS", lists.join(", "));
        var postData = { parentRecordId: internalId, invoiceRecords: invoices, "object": "Customer Payments" };
        try {
            var response = postJson(postData);
            var newSFID = response.body;
            newSFID = newSFID.replace('\n', '');
        }
        catch (er02) {
            log.error('ERROR', JSON.stringify(er02));
        }
    }
};
function postJson(json) {
    var header = [];
    header['Content-Type'] = 'application/json';
    header['Accept'] = 'application/json';
    return http.post({
        url: apiUrl,
        headers: header,
        body: JSON.stringify(json)
    });
}
function getSublistObjects(record: record.Record, sublistId: string): { [key: string]: record.FieldValue }[] {
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
function getSublistFields(record, sublistId) {
    var subListFields = record.getSublistFields({ sublistId: sublistId });
    var rowCount = record.getLineCount({ sublistId: sublistId });
    var list = [];
    for (var r = 0; r < rowCount; r++) {
        var obj = {};
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