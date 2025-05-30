import {addMinutes} from "date-fns";
import { PaymentRequest } from "xendit-node"

export const xenditPaymentRequestClient = new PaymentRequest({
    secretKey:process.env.XENDIT_MONEY_IN_KEY!
})

type CreateQRISParams = {
    amount:number;
    orderId:string;
    expiresAt?:Date;
}

export const createQRIS = async(params:CreateQRISParams) => {
    return await xenditPaymentRequestClient.createPaymentRequest({
        data:{
            currency: "IDR",
            amount: params.amount,
            referenceId: params.orderId, // id order database kita
            paymentMethod:{
                reusability : "ONE_TIME_USE",
                type:"QR_CODE",
                qrCode:{
                    channelCode : "DANA",
                    channelProperties: {
                        expiresAt:params.expiresAt ?? addMinutes(new Date, 15)
                    }
                },
                referenceId:params.orderId,
            }
        }
    });
};