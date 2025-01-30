import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft} from "lucide-react";

const Shop = () => {
  const navigate = useNavigate();

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
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <Button 
          variant="outline" 
          className="mb-6 hidden lg:flex"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        
        <h1 className="text-4xl font-bold mb-8 text-center animate-fade-in">Магазин кондиционеров</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="animate-scale-in">
              <CardHeader>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardTitle className="mt-4">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">{product.price}</span>
                  <Button className="custom-button">
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