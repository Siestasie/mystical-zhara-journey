
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { CartDropdown } from "@/components/CartDropdown";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { AddProductDialog } from "@/components/shop/AddProductDialog";

const Shop = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = [
    "Бытовые сплит-системы",
    "Мобильные кондиционеры",
    "Мульти сплит-системы",
    "Полупромышленные сплит-системы",
    "Системы фанкойл-чиллер",
    "Прецизионные кондиционеры",
    "Комплектующие и расходные материалы",
    "Системы для прокладки трасс"
  ];

  // Fix the products fetch
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    }
  });

  // Log products for debugging
  console.log("Products fetched:", products);

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === "all" || product.category === selectedCategory;
    const priceMatch =
      (!minPrice || product.price >= Number(minPrice)) &&
      (!maxPrice || product.price <= Number(maxPrice));
  
    return categoryMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 custom-button1"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && "Назад"}
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold text-center animate-fade-in">
            Магазин кондиционеров
          </h1>
          <div className="flex items-center gap-2">
            <CartDropdown />
            {user?.isAdmin && (
              <Button 
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 custom-button1"
              >
                <Plus className="h-4 w-4" />
                {!isMobile && "Добавить товар"}
              </Button>
            )}
          </div>
        </div>

        <ProductFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          categories={categories}
        />
        
        {isLoading ? (
          <div className="text-center py-10">Загрузка товаров...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">Ошибка при загрузке товаров</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10">Товары не найдены</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <AddProductDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        categories={categories}
      />
    </div>
  );
};

export default Shop;
