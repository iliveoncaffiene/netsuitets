/**
 * @NAPIVersion 2.0
 * @NScriptType UserEventScript
 */

import * as http from 'N/http'
import * as record from 'N/record'
import * as log from 'N/log';
import { EntryPoints } from 'N/types';
function sendProductData(context: EntryPoints.UserEvent.afterSubmitContext) {
    const addressListId = "addressbook";
    var prodNewRecord = context.newRecord;
    var addresses = getSublistObjects(prodNewRecord, addressListId);
    var defaultBilling = addresses.filter(function (a) { return a.defaultbilling; })[0];
    // log.debug("BILLING ADDR", JSON.stringify(defaultBilling));

    var vendorID = prodNewRecord.getValue("entityid");
    var address = defaultBilling.addr1_initialvalue;
    var city = defaultBilling.city_initialvalue;
    var dropdownState = defaultBilling.displaystate_initialvalue;
    var zip = defaultBilling.zip_initialvalue;
    // log.debug("VALUES", "sfdcNum: " + JSON.stringify(sfdcNum) + ", poNum: " + JSON.stringify(poNum));
    var postData: any = { "vendorID": vendorID, "address": address, "city": city, "dropdownState": dropdownState, "zip": zip, "source": "Netsuite", "object": "Vendors" };
    postData = JSON.stringify(postData);
    var header = [];
    header['Content-Type'] = 'application/json';
    header['Accept'] = 'application/json';
    var apiURL = 'http://70.61.44.2:9090/ws/simple/executeGenericWebService';
    try {
        var response = http.post({
            url: apiURL,
            headers: header,
            body: postData
        });
        var newSFID = response.body;
        newSFID = newSFID.replace('\n', '');
    } catch (er02) {
        log.error('ERROR', JSON.stringify(er02));
    }
}

function getSublistObjects(record: record.Record, sublistId: string) {
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

export var afterSubmit: EntryPoints.UserEvent.afterSubmit = sendProductData;
