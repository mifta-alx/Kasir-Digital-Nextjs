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
  AlertDialogContent, AlertDialogDescription,
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
import {type CategoryFormSchema} from "@/forms/category";
import type {Category, Product} from "@/data/mock";

const ProductsPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [createProductDialogOpen, setCreateProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [uploadedCreateProductImageUrl, setUploadedCreateProductImageUrl]= useState<string | null>(null)
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [productToEdit, setProductToEdit] = useState<string | null>(null);

  const createProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const editProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const { data: products } = api.product.getProducts.useQuery();

  const { mutate: createProduct } = api.product.createProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();
      alert("Product succeessfully created!");
      setCreateProductDialogOpen(false);
      createProductForm.reset();
    },
  });

  const { mutate: editProduct } = api.product.editProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();
      alert("Product succeessfully updated!");
      setEditProductDialogOpen(false);
      editProductForm.reset();
      setProductToEdit(null);
    },
  });
  const { mutate: deleteProductById } =
      api.product.deleteProductById.useMutation({
        onSuccess: async () => {
          await apiUtils.product.getProducts.invalidate();
          alert("Product succeessfully deleted!");
          setProductToDelete(null);
        }
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

  const handleClickEditProduct = (product: Product) => {
    setEditProductDialogOpen(true);
    setProductToEdit(product.id);
    console.log(product)
    editProductForm.reset({
      name: product.name,
      price: product.price,
      categoryId: product.category?.id,
      imageUrl : product.imageUrl,
    });
  };

  const handleSubmitEditProduct = (data: CategoryFormSchema) => {
    if (!productToEdit) {
      return;
    }
    editProduct({
      name: data.name,
      price: data.price,
      categoryId: data.categoryId,
      imageUrl : uploadedCreateProductImageUrl,
      productId: productToEdit,
    });
  };

  const handleClickDeleteProduct = (categoryId: string) => {
    setProductToDelete(categoryId);
  };

  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) {
      return;
    }
    deleteProductById({
      productId: productToDelete,
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

      <div>
        {products?.length === 0 ? (
            <div className="rounded-md border">
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No product found</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Get started by creating your first product
                </p>
              </div>
            </div>
        ) : (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <ProductCatalogCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.imageUrl ?? ""}
            category={product.category.name}
            onEdit={() => handleClickEditProduct(product)}
            onDelete={() => handleClickDeleteProduct(product.id)}
          />
        ))}
      </div>
        )}
      </div>


      <AlertDialog
          open={editProductDialogOpen}
          onOpenChange={setEditProductDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Product</AlertDialogTitle>
          </AlertDialogHeader>
          <Form {...editProductForm}>
            <ProductForm
                onSubmit={handleSubmitEditProduct}
                onChangeImageUrl={setUploadedCreateProductImageUrl}
            />
          </Form>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
                onClick={editProductForm.handleSubmit(handleSubmitEditProduct)}
            >
              Edit Product
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
          open={!!productToDelete}
          onOpenChange={(open) => {
            if (!open) {
              setProductToDelete(null);
            }
          }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleConfirmDeleteProduct}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
