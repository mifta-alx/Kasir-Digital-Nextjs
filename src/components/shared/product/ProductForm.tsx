import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { ProductFormSchema } from "@/forms/product";
import { api } from "@/utils/api";
import { Label } from "@/components/ui/label";
import type { ChangeEvent } from "react";
import {uploadFileToSignedUrl} from "@/lib/supabase";
import {Bucket} from "@/server/bucket";

interface ProductFormProps {
  onSubmit: (data: ProductFormSchema) => void;
  onChangeImageUrl: (imageUrl: string) => void;
}

export const ProductForm = ({
  onSubmit,
  onChangeImageUrl,
}: ProductFormProps) => {
  const form = useFormContext<ProductFormSchema>();
  const { data: categories } = api.category.getCategories.useQuery();

  const { mutateAsync: createSignedImageUrl } =
    api.product.createProductImageUploadSignedUrl.useMutation();

  const imageChangeHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files?.length > 0) {
      const file = files[0];
      if (!file) return;

      const { path, token } = await createSignedImageUrl();

      const imageUrl = await uploadFileToSignedUrl({
          file,
          path,
          token,
          bucket:Bucket.ProductImages,
      });
      onChangeImageUrl(imageUrl)
      alert(imageUrl);
    }
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Price</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value: string) => {
                  field.onChange(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => {
                    return (
                      <SelectItem value={category.id} key={category.id}>
                        {category.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
      <div className="space-y-1">
        <Label>Product Image</Label>
        <input type="file" accept="image/*" onChange={imageChangeHandler}/>
      </div>
    </form>
  );
};
