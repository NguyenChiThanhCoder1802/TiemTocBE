import { VNPay, ignoreLogger } from "vnpay";
import {env} from "./environment.js";

export const vnpay = new VNPay({
    tmnCode: env.VNP_TMN_CODE,
    secureSecret: env.VNP_HASH_SECRET,
    vnpayHost: env.VNP_HOST,

    testMode: true,
    hashAlgorithm: "SHA512",
    enableLog: true,
    loggerFn: ignoreLogger,

    endpoints: {
        paymentEndpoint: "paymentv2/vpcpay.html",
        queryDrRefundEndpoint: "merchant_webapi/api/transaction",
        getBankListEndpoint: "qrpayauth/api/merchant/get_bank_list",
    }
});