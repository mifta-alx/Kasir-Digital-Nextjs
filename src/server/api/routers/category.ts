import {createTRPCRouter, protectedProcedure} from "@/server/api/trpc";
import {z} from "zod";

export const categoryRouter = createTRPCRouter({
    getCategories:protectedProcedure.query(async ({ctx}) => {
    const {db} = ctx
        return await db.category.findMany({
            select:{
                id:true,
                name:true,
                productCount:true
            }
        });
    }),

    createCategory: protectedProcedure.input(
        z.object({
            name: z.string().min(3, "Nama minimum 3 karakter"),
        })
    ).mutation(async ({ctx, input}) => {
        const {db} = ctx
        return await db.category.create({
            data: {
                name: input.name,
            },
            select:{
                id:true,
                name:true,
                productCount:true
            }
        });
    }),

    deleteCategoryById : protectedProcedure.input(
        z.object({
            categoryId:z.string()
        })
    ).mutation(async ({ctx, input}) => {
        const {db} = ctx
        await db.category.delete({
            where: {
                id:input.categoryId,
            }
        })
    }),

    editCategory: protectedProcedure.input(
        z.object({
            categoryId:z.string(),
            name: z.string().min(3, "Nama minimum 3 karakter"),
        })
    ).mutation(async ({ctx, input}) => {
        const {db} = ctx
        await db.category.update({
            where: {
                id:input.categoryId,
            },
            data:{
                name:input.name,
            }
        })
    }),
})