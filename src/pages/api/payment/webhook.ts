import { db } from "@/server/db";
import type { NextApiHandler } from "next";

type XenditWebhookBody = {
  event: "payment.succeeded";
  data: {
    id: string;
    amount: number;
    payment_request_id: string;
    reference_id: string;
    status: "SUCCEEDED" | "FAILED";
  };
};

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }
  const body = req.body as XenditWebhookBody;

  const order = await db.order.findUnique({
    where: {
      id: body.data.reference_id,
    },
  });

  if (!order) {
    return res.status(404).send("Order not found");
  }

  if (body.data.status !== "SUCCEEDED") {
    //update error menjadi failed
    return res.status(200).send("Payment not succeeded");
  }
  try {
  await db.order.update({
    where: {
      id: order.id,
    },
    data: {
      paidAt: new Date(),
      status: "PROCESSING",
    },
  });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
  return res.status(200).end();
};
export default handler;
