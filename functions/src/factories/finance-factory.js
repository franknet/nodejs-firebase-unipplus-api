const _ = require("lodash");
const NumberUtils = require("../utils/number-parser"); 

function createPayments(extract, bills) { 
    function mergeRight(bill, payment) {
        if (bill["seq"] === payment["seq"]) {
            payment["bankSlipUrl"] = setBankSlipUrl(bill["bankSlipUrl"]);
            payment["reversalDate"] = bill["reversalDate"];
            payment["reversalValue"] = bill["reversalValue"];
        } else {
            payment["reversalDate"] = "";
            payment["reversalValue"] = "";
        }
    }
    let payments = _.uniqBy(_.unionWith(extract, bills, mergeRight), "seq");
    let group = _.groupBy(payments, "docType");
    let total = 0;
    let groups = _.map(group, (value, key) => {
        const paidPerType = setTotalPaid(value, bills);
        total += paidPerType;
        return {
            type: key,
            name: types[key],
            totalPaid: _.round(paidPerType, 2),
            payments: value
        }
    });
    return {
        totalPaid: _.round(total, 2),
        docs: groups
    };
}

function setTotalPaid(payments) {
    
    let total = 0;
    _.forEach(payments, (payment, index) => {
        
        let docValue = _.replace(payment["docValue"], "R$", "");
        let valuePaid = _.replace(payment["valuePaid"], "R$", "");
        let reversalValue = _.replace(payment["reversalValue"], "R$", "");

        let docValueFlt = NumberUtils.stringToFloat(docValue);
        let valuePaidFlt = NumberUtils.stringToFloat(valuePaid);
        let reversalValueFlt = NumberUtils.stringToFloat(reversalValue);
        
        payment["docValue"] = docValueFlt;
        payment["valuePaid"] = valuePaidFlt;
        payment["reversalValue"] = reversalValueFlt;
        payment["difference"] = setDifference(payments, index);
        total += valuePaidFlt;
    });
    return total;
}

const types = {
    MS:	"Mensalidade",	
    PC:	"Parcelamento de mensalidades",
    DF:	"Diferença de mensalidade",	
    TX:	"Taxa de serviços",
    CD:	"Confissão de dívida"
}

function setBankSlipUrl(html) {  
    console.log(html);
    let regex = new RegExp("(?<=AbrirPagamentoBoleto\\(')(.*)(?='\\))", "g");
    let bankSlipId = html.match(regex)[0]; 
    return "/v1/finance/bank_slip?id=" + bankSlipId;
}

function setDifference(payments, index) {
    if (index === 0 ) { return 0 }
    let payment = payments[index];
    let previousPayment = payments[index-1];
    return _.round(payment.docValue - previousPayment.docValue, 2);
}

module.exports = { createPayments }