import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { CategoryFilterCard } from "@/components/shared/category/CategoryFilterCard";
import { CreateOrderSheet } from "@/components/shared/CreateOrderSheet";
import { ProductMenuCard } from "@/components/shared/product/ProductMenuCard";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import type { NextPageWithLayout } from "../_app";
import { Button } from "@/components/ui/button";
import {api} from "@/utils/api";
import {useCartStore} from "@/store/cart";

const DashboardPage: NextPageWithLayout = () => {
  const cartStore = useCartStore()
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);
  const { data: categories } = api.category.getCategories.useQuery();
  const { data: products } = api.product.getProducts.useQuery();

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleAddToCart = (productId: string) => {
    const productToAdd = products?.find(product => product.id === productId)
    if(!productToAdd) return
    cartStore.addToCart({
      name:productToAdd.name,
      productId:productToAdd.id,
      price:productToAdd.price,
      imageUrl:productToAdd.imageUrl ?? ""
    })
  };

  const filteredProducts = useMemo(() => {
    return products?.filter((product) => {
      const categoryMatch =
        selectedCategory === "all" || product.category.id === selectedCategory;

      const searchMatch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, searchQuery, products]);

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Dashboard</DashboardTitle>
            <DashboardDescription>
              Welcome to your Simple POS system dashboard.
            </DashboardDescription>
          </div>
          {!!cartStore.items.length && (
          <Button
            className="animate-in slide-in-from-right"
            onClick={() => setOrderSheetOpen(true)}
          >
            <ShoppingCart /> Cart
          </Button>
          )}
        </div>
      </DashboardHeader>

      <div className="space-y-6">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          <CategoryFilterCard
              name="All"
              productCount={Number(categories?.length)}
              isSelected={selectedCategory === "all"}
              onClick={() => handleCategoryClick("all")}
          />
          {categories?.map((category) => (
            <CategoryFilterCard
              key={category.id}
              name={category.name}
              productCount={category.productCount}
              isSelected={selectedCategory === category.id}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </div>

        <div>
          {filteredProducts?.length === 0 ? (
            <div className="my-8 flex flex-col items-center justify-center">
              <p className="text-muted-foreground text-center">
                No products found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts?.map((product) => (
                <ProductMenuCard
                  key={product.id}
                  productId={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl ?? "https://placehold.co/600x400"}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateOrderSheet
        open={orderSheetOpen}
        onOpenChange={setOrderSheetOpen}
      />
    </>
  );
};

DashboardPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;
