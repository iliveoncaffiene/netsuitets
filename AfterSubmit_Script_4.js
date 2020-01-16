define(["require", "exports", "N/http", "N/record", "N/log"], function (require, exports, http, record, log) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var apiUrl = 'http://12.176.134.134:9090/ws/simple/executeNSRequest';
    exports.afterSubmit = function sendProductData(context) {
        var addressListId = "addressbook";
        var prodNewRecord = context.newRecord;
        var SFDC_Account_ID = prodNewRecord.getValue("custentitysalesforce_account_id");
        if (SFDC_Account_ID) {
            var addresses = getSublistObjects(prodNewRecord, addressListId);
            var internalid = prodNewRecord.getValue("id");
            var bad_address = prodNewRecord.getValue("custentity_bad_address");
            var brand_c = prodNewRecord.getValue("custentity_brand_customer");
            var departmentRecord = record.load({ id: brand_c, type: record.Type.DEPARTMENT });
            var department_name = departmentRecord.getValue("name");
            var frequency_per_month = prodNewRecord.getValue("custentity_frequency_per_month");
            var caller_id = prodNewRecord.getValue("custentity_who_are_you_speaking_with");
            var comm_frequency = prodNewRecord.getValue("custentity_comm_frequency");
            var customer_bad_review = prodNewRecord.getValue("custentity_customer_bad_review");
            var customer_bad_review_notes = prodNewRecord.getValue("custentity_customer_bad_review_notes");
            var customer_chargeback = prodNewRecord.getValue("custentity_customer_chargeback");
            var customer_in_external_collections = prodNewRecord.getValue("custentity_customer_in_collections");
            var customer_in_internal_collections = prodNewRecord.getValue("custentity_cust_internal_collections");
            var dnis_name = prodNewRecord.getValue("custentity_dnis_name");
            var comments = prodNewRecord.getValue("comments");
            var fax = prodNewRecord.getValue("fax");
            var flagged_customer = prodNewRecord.getValue("custentity_flagged_customer");
            var flagged_customer_note = prodNewRecord.getValue("custentity_flagged_customer_note");
            var SFDC_Account_ID_1 = prodNewRecord.getValue("custentitysalesforce_account_id");
            var phone = prodNewRecord.getValue("phone");
            var mobilePhone = prodNewRecord.getValue("mobilephone");
            var terms = prodNewRecord.getValue("terms");
            var website = prodNewRecord.getValue("url");
            var ent_terms = prodNewRecord.getValue("custentity_enterprise_terms");
            var Sync_Error = prodNewRecord.getValue("custentitysalesforce_sync_error");
            // log.debug("VALUES", "sfdcNum: " + JSON.stringify(sfdcNum) + ", poNum: " + JSON.stringify(poNum));
            var postData = {
                internalid: internalid,
                bad_address: bad_address,
                department_name: department_name,
                frequency_per_month: frequency_per_month,
                caller_id: caller_id,
                comm_frequency: comm_frequency,
                customer_bad_review: customer_bad_review,
                customer_bad_review_notes: customer_bad_review_notes,
                customer_chargeback: customer_chargeback,
                customer_in_external_collections: customer_in_external_collections,
                customer_in_internal_collections: customer_in_internal_collections,
                dnis_name: dnis_name,
                comments: comments,
                fax: fax,
                flagged_customer: flagged_customer,
                flagged_customer_note: flagged_customer_note,
                SFDC_Account_ID: SFDC_Account_ID_1,
                ent_terms: ent_terms,
                phone: phone,
                mobilePhone: mobilePhone,
                terms: terms,
                website: website,
                addresses: addresses.map(function (a) {
                    return {
                        defaultbilling: a.defaultbilling,
                        address: a.addr1_initialvalue,
                        city: a.city_initialvalue,
                        state: a.displaystate_initialvalue,
                        zip: a.zip_initialvalue,
                        label: a.label,
                        id: a.internalid
                    };
                }),
                Sync_Error: Sync_Error,
                "object": "Customer"
            };
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
