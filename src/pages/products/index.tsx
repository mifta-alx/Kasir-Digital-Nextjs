import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "../_app";
import { type ReactElement, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductMenuCard } from "@/components/shared/product/ProductMenuCard";
import { ProductCatalogCard } from "@/components/shared/product/ProductCatalogCard";
import { api } from "@/utils/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { type ProductFormSchema, productFormSchema } from "@/forms/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductForm } from "@/components/shared/product/ProductForm";

const ProductsPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [createProductDialogOpen, setCreateProductDialogOpen] = useState(false);
  const [uploadedCreateProductImageUrl, setUploadedCreateProductImageUrl]= useState<string | null>(null)

  const { data: products } = api.product.getProducts.useQuery();

  const { mutate: createProduct } = api.product.createProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();
      alert("Product succeessfully created!");
      setCreateProductDialogOpen(false);
      createProductForm.reset();
    },
  });

  const createProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const handleSubmitCreateProduct = (data: ProductFormSchema) => {
    if(!uploadedCreateProductImageUrl) {
      alert("Please upload product image first")
      return
    }

    createProduct({
      name: data.name,
      price: data.price,
      categoryId: data.categoryId,
      imageUrl : uploadedCreateProductImageUrl
    });
  };
  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Product Management</DashboardTitle>
            <DashboardDescription>
              View, add, edit, and delete products in your inventory.
            </DashboardDescription>
          </div>

          <AlertDialog
            open={createProductDialogOpen}
            onOpenChange={setCreateProductDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Product</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Product</AlertDialogTitle>
              </AlertDialogHeader>
              <Form {...createProductForm}>
                <ProductForm
                  onSubmit={handleSubmitCreateProduct}
                  onChangeImageUrl={setUploadedCreateProductImageUrl}
                />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  onClick={createProductForm.handleSubmit(
                    handleSubmitCreateProduct,
                  )}
                >
                  Create Product
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <ProductCatalogCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.imageUrl ?? ""}
            category={product.category.name}
            onEdit={() => void 0}
            onDelete={() => void 0}
          />
        ))}
      </div>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
