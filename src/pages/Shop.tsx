import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Shop = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const products = [
    {
      id: 1,
      name: "Сплит-система Стандарт",
      description: "Базовая модель для небольших помещений",
      price: "от 25,000 ₽",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Инверторный кондиционер Премиум",
      description: "Энергоэффективное решение для дома",
      price: "от 45,000 ₽",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Мульти-сплит система",
      description: "Для нескольких комнат",
      price: "от 85,000 ₽",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Промышленный кондиционер",
      description: "Для коммерческих помещений",
      price: "от 120,000 ₽",
      image: "/placeholder.svg"
    },
    {
      id: 5,
      name: "Канальный кондиционер",
      description: "Скрытый монтаж в потолке",
      price: "от 95,000 ₽",
      image: "/placeholder.svg"
    },
    {
      id: 6,
      name: "Кассетный кондиционер",
      description: "Для офисов и магазинов",
      price: "от 110,000 ₽",
      image: "/placeholder.svg"
    }
  ];

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
          {/* Empty div to maintain centering */}
          <div className="w-[72px]"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
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
                  <span className="text-lg sm:text-xl font-bold">{product.price}</span>
                  <Button 
                    className="w-full sm:w-auto custom-button"
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