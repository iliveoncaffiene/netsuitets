/**
 * @NAPIVersion 2.0
 * @NScriptType UserEventScript
 */
define(["require", "exports", "N/http", "N/record", "N/log"], function (require, exports, http, record, log) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var apiUrl = 'http://104.41.154.217:9090/ws/simple/executeNSRequest';
    var applyListId = "apply";
    exports.afterSubmit = function sendProductData(context) {
        var prodNewRecord = context.newRecord;
        var internalId = prodNewRecord.getValue("id");
        var applyRows = getSublistObjects(prodNewRecord, applyListId);
        var invoices = applyRows.map(function (r) {
            var invoice = record.load({ id: r["internalid"], type: record.Type.INVOICE });
            var salesForceId = invoice.getValue({ fieldId: "custbody_celigo_sfnc_salesforce_id" });
            var amountRemaining = invoice.getValue({ fieldId: "amountremaining" });
            var amountPaid = invoice.getValue({ fieldId: "amountpaid" });
            var total = invoice.getValue({ fieldId: "origtotal" });
            var invoiceId = r["internalid"];
            return { salesForceId: salesForceId, amountRemaining: amountRemaining, amountPaid: amountPaid, invoiceId: invoiceId, total: total };
        });
        var postData = { parentRecordId: internalId, invoiceRecords: invoices };
        try {
            var response = postJson(postData);
            var newSFID = response.body;
            newSFID = newSFID.replace('\n', '');
        }
        catch (er02) {
            log.error('ERROR', JSON.stringify(er02));
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
    function getSublistObjects(record, sublistId) {
        var subListFields = record.getSublistFields({ sublistId: sublistId });
        var rowCount = record.getLineCount({ sublistId: sublistId });
        var list = [];
        for (var r = 0; r < rowCount; r++) {
            var obj = {};
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
});
