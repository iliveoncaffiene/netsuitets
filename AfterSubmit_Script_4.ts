/**
 * @NAPIVersion 2.1
 * @NScriptType UserEventScript
*/
import * as http from 'N/http'
import * as record from 'N/record'
import * as log from 'N/log';
import { EntryPoints } from 'N/types';
const apiUrl = 'http://12.176.134.134:9090/ws/simple/executeNSRequest';
export var afterSubmit: EntryPoints.UserEvent.afterSubmit = function sendProductData(context) {
    const addressListId = "addressbook";
    const prodNewRecord = context.newRecord;
    const SFDC_Account_ID = prodNewRecord.getValue("custentitysalesforce_account_id");
    if (SFDC_Account_ID) {
        const addresses = getSublistObjects(prodNewRecord, addressListId);
        const internalid = prodNewRecord.getValue("id");
        const bad_address = prodNewRecord.getValue("custentity_bad_address");
        const brand_c = prodNewRecord.getValue("custentity_brand_customer");
        const departmentRecord = record.load({ id: brand_c, type: record.Type.DEPARTMENT });
        const department_name = departmentRecord.getValue("name")
        const frequency_per_month = prodNewRecord.getValue("custentity_frequency_per_month");
        const caller_id = prodNewRecord.getValue("custentity_who_are_you_speaking_with");
        const comm_frequency = prodNewRecord.getValue("custentity_comm_frequency");
        const customer_bad_review = prodNewRecord.getValue("custentity_customer_bad_review");
        const customer_bad_review_notes = prodNewRecord.getValue("custentity_customer_bad_review_notes");
        const customer_chargeback = prodNewRecord.getValue("custentity_customer_chargeback");
        const customer_in_external_collections = prodNewRecord.getValue("custentity_customer_in_collections");
        const customer_in_internal_collections = prodNewRecord.getValue("custentity_cust_internal_collections");
        const dnis_name = prodNewRecord.getValue("custentity_dnis_name");
        const comments = prodNewRecord.getValue("comments");
        const fax = prodNewRecord.getValue("fax");
        const flagged_customer = prodNewRecord.getValue("custentity_flagged_customer");
        const flagged_customer_note = prodNewRecord.getValue("custentity_flagged_customer_note");
        const SFDC_Account_ID = prodNewRecord.getValue("custentitysalesforce_account_id");
        const phone = prodNewRecord.getValue("phone");
        const mobilePhone = prodNewRecord.getValue("mobilephone");
        const terms = prodNewRecord.getValue("terms");
        const website = prodNewRecord.getValue("url");
        const ent_terms = prodNewRecord.getValue("custentity_enterprise_terms");
        const Sync_Error = prodNewRecord.getValue("custentitysalesforce_sync_error");
 
        // log.debug("VALUES", "sfdcNum: " + JSON.stringify(sfdcNum) + ", poNum: " + JSON.stringify(poNum));
        const postData = {
            internalid,
            bad_address,
            department_name,
            frequency_per_month,
            caller_id,
            comm_frequency,
            customer_bad_review,
            customer_bad_review_notes,
            customer_chargeback,
            customer_in_external_collections,
            customer_in_internal_collections,
            dnis_name,
            comments,
            fax,
            flagged_customer,
            flagged_customer_note,
            SFDC_Account_ID,
            ent_terms,
            phone,
            mobilePhone,
            terms,
            website,
            addresses: addresses.map(a => {
                return {
                    defaultbilling: a.defaultbilling,
                    address: a.addr1_initialvalue,
                    city: a.city_initialvalue,
                    state: a.displaystate_initialvalue,
                    zip: a.zip_initialvalue,
                    label: a.label,
                    id: a.internalid
                }
            }),
            Sync_Error,
            "object": "Customer"
        };
        try {
            const response = postJson(postData);
            let newSFID = response.body;
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