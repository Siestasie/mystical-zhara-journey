import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Filter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const Shop = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");

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

  const products = [
    {
      id: 1,
      name: "Сплит-система Стандарт",
      description: "Базовая модель для небольших помещений",
      price: 25000,
      category: "Бытовые сплит-системы",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Мобильный кондиционер Комфорт",
      description: "Портативное решение для любого помещения",
      price: 35000,
      category: "Мобильные кондиционеры",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Мульти-сплит система Премиум",
      description: "Для нескольких комнат",
      price: 85000,
      category: "Мульти сплит-системы",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Полупромышленный кондиционер",
      description: "Для коммерческих помещений",
      price: 120000,
      category: "Полупромышленные сплит-системы",
      image: "/placeholder.svg"
    },
    {
      id: 5,
      name: "Система фанкойл",
      description: "Профессиональное решение для больших помещений",
      price: 150000,
      category: "Системы фанкойл-чиллер",
      image: "/placeholder.svg"
    },
    {
      id: 6,
      name: "Прецизионный кондиционер",
      description: "Для серверных и специальных помещений",
      price: 200000,
      category: "Прецизионные кондиционеры",
      image: "/placeholder.svg"
    }
  ];

  const priceRanges = [
    { label: "До 30 000 ₽", value: "0-30000" },
    { label: "30 000 ₽ - 60 000 ₽", value: "30000-60000" },
    { label: "60 000 ₽ - 100 000 ₽", value: "60000-100000" },
    { label: "Более 100 000 ₽", value: "100000+" }
  ];

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === "all" || product.category === selectedCategory;
    
    if (priceRange === "all") return categoryMatch;
    
    const [min, max] = priceRange.split("-").map(Number);
    if (max) {
      return categoryMatch && product.price >= min && product.price <= max;
    } else {
      return categoryMatch && product.price >= min;
    }
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && "Назад"}
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold text-center animate-fade-in">
            Магазин кондиционеров
          </h1>
          <div className="w-[72px]"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Ценовой диапазон" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любая цена</SelectItem>
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="animate-scale-in">
              <CardHeader className="space-y-2">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardTitle className="text-xl sm:text-2xl line-clamp-2">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span className="text-lg sm:text-xl font-bold">{product.price.toLocaleString()} ₽</span>
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => navigate(`/shop/${product.id}`)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Подробнее
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;