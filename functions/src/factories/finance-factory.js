const _ = require("lodash");
const NumberUtils = require("../utils/number-parser"); 

const PAYMENT_TYPE = {
    MS:	"Mensalidade",	
    PC:	"Parcelamento de mensalidades",
    DF:	"Diferença de mensalidade",	
    TX:	"Taxa de serviços",
    CD:	"Confissão de dívida"
}

function createPayments(extract, bills) { 
    var totalPaid = 0;
    var payments = [];

    // join extract and bills list, and add new fields
    _.forEach(_.reverse(extract), (payment, index) => {
        let paymentSeq = payment["seq"];
        let bill = _.find(bills, { "seq": paymentSeq });
        if (bill !== undefined) {
            payment["bankSlipUrl"] = setBankSlipUrl(bill["bankSlipUrl"]);
            payment["reversalDate"] = bill["reversalDate"];
            payment["reversalValue"] = bill["reversalValue"];
        } else {
            payment["reversalDate"] = "";
            payment["reversalValue"] = "";
        }

        let docValue = _.replace(payment["docValue"], "R$", "");
        let valuePaid = _.replace(payment["valuePaid"], "R$", "");
        let reversalValue = _.replace(payment["reversalValue"], "R$", "");

        let docValueFlt = NumberUtils.stringToFloat(docValue);
        let valuePaidFlt = NumberUtils.stringToFloat(valuePaid);
        let reversalValueFlt = NumberUtils.stringToFloat(reversalValue);

        totalPaid += valuePaidFlt;
        payment["status"] = payment["status"] === "OK" ? `Pago no dia ${payment["paymentDate"]}` : `Vence no dia ${payment["dueDate"]}`;
        payment["seq"] = paymentSeq.split("/").reverse().join("/");
        payment["docValue"] = docValueFlt;
        payment["valuePaid"] = valuePaidFlt;
        payment["reversalValue"] = reversalValueFlt;

        payments.push(payment);
    });

    let groups = _.map(_.groupBy(payments, "docType"), (groupPayments, groupType) => {
        let totalGroupValue = 0;

        // Calulate doc value difference, and total paid by group
        _.forEach(groupPayments, (payment, index) => {
            let nextPayment = extract[index + 1];
            totalGroupValue += payment["valuePaid"];
            let difference = setDifference(payment, nextPayment);
            payment["name"] = PAYMENT_TYPE[groupType], 
            payment["difference"] = {
                "code": getDifferenceStatusCode(difference),
                "value": difference,
            }; 
        });

        return {
            "totalPaid": totalGroupValue,
            "type": groupType,
            "name": PAYMENT_TYPE[groupType], 
            "payments": groupPayments
        }
    });

    return {
        "totalPaid": _.round(totalPaid, 2),
        "groups": groups
    };
}

function getDifferenceStatusCode(difference) {
    if (difference > 0) {
        return -1;
    } 
    if (difference < 0) {
        return 1;
    } 
    return 0;
}

function setBankSlipUrl(html) {  
    let regex = new RegExp("(?<=AbrirPagamentoBoleto\\(')(.*)(?='\\))", "g");
    let bankSlipId = html.match(regex)[0]; 
    return "/v1/finance/bank_slip?id=" + bankSlipId;
}

function setDifference(payment, nextPayment) { 
    if (nextPayment === undefined) { return 0; }
    let currentDocValue = payment["docValue"];
    let nextDocValue = nextPayment["docValue"];
    return _.round(currentDocValue - nextDocValue, 2);
}

module.exports = { createPayments }