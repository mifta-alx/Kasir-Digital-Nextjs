import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createQRIS } from "@/server/xendit";
import { z } from "zod";

export const orderRouter = createTRPCRouter({
  createOrder: protectedProcedure
    .input(
      z.object({
        orderItems: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { orderItems } = input;

      const products = await db.product.findMany({
        where: {
          id: {
            in: orderItems.map((item) => item.productId),
          },
        },
      });

      let subTotal = 0;
      products.forEach(product => {
        const productQuantity = orderItems.find(
          (item) => item.productId === product.id,
        )!.quantity;
        const totalPrice = product.price * productQuantity;
        subTotal += totalPrice;
      });

      const tax = subTotal * 0.1;

      const grandTotal = subTotal + tax;

      const order = await db.order.create({
        data: {
          grandTotal,
          subTotal,
          tax,
        },
      });

      const newOrderItems = await db.orderItem.createMany({
        data: products.map(product => {
          const item = orderItems.find((i) => i.productId === product.id);
          if (!item) {
            throw new Error(
              `Kuantitas untuk produk ${product.id} tidak ditemukan.`,
            );
          }
          return {
            orderId: order.id,
            price: product.price,
            productId: product.id,
            quantity: item?.quantity,
          };
        }),
      });

      const paymentRequest = await createQRIS({
        amount: grandTotal,
        orderId: order.id,
      });

      await db.order.update({
        where: {
          id: order.id,
        },
        data: {
          externalTransactionId: paymentRequest.id,
          paymentMethodId: paymentRequest.paymentMethod.id,
        },
      });

      return {
        order,
        newOrderItems,
        qrString: paymentRequest.paymentMethod.qrCode?.channelProperties?.qrString ?? null,
      };
    }),
});
