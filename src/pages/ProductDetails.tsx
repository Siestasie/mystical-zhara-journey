import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Phone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  const products = [
    {
      id: 1,
      name: "Сплит-система Стандарт",
      description: "Базовая модель для небольших помещений",
      fullDescription: "Идеальное решение для квартир и небольших офисов площадью до 25 м². Работает на охлаждение и обогрев. Имеет базовый набор функций, включая режим осушения и ночной режим работы.",
      price: "от 25,000 ₽",
      specs: [
        "Площадь охлаждения: до 25 м²",
        "Мощность охлаждения: 2.6 кВт",
        "Уровень шума: от 24 дБ",
        "Энергоэффективность: класс A",
        "Гарантия: 3 года"
      ],
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Инверторный кондиционер Премиум",
      description: "Энергоэффективное решение для дома",
      fullDescription: "Современный инверторный кондиционер с расширенным набором функций. Поддерживает точную регулировку температуры, имеет встроенный очиститель воздуха и Wi-Fi модуль для удаленного управления.",
      price: "от 45,000 ₽",
      specs: [
        "Площадь охлаждения: до 35 м²",
        "Мощность охлаждения: 3.5 кВт",
        "Уровень шума: от 19 дБ",
        "Энергоэффективность: класс A++",
        "Гарантия: 5 лет"
      ],
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Мульти-сплит система",
      description: "Для нескольких комнат",
      fullDescription: "Система кондиционирования для всего дома. Позволяет подключить до 5 внутренних блоков к одному наружному. Каждый блок управляется независимо, что обеспечивает максимальный комфорт в каждой комнате.",
      price: "от 85,000 ₽",
      specs: [
        "Количество внутренних блоков: до 5",
        "Общая мощность: до 12 кВт",
        "Уровень шума: от 21 дБ",
        "Энергоэффективность: класс A+",
        "Гарантия: 5 лет"
      ],
      image: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Промышленный кондиционер",
      description: "Для коммерческих помещений",
      fullDescription: "Мощная система кондиционирования для больших помещений. Идеально подходит для торговых центров, производственных помещений и складов. Обеспечивает равномерное распределение воздуха и стабильную температуру.",
      price: "от 120,000 ₽",
      specs: [
        "Площадь охлаждения: до 150 м²",
        "Мощность охлаждения: 14 кВт",
        "Расход воздуха: 2000 м³/ч",
        "Энергоэффективность: класс A",
        "Гарантия: 3 года"
      ],
      image: "/placeholder.svg"
    },
    {
      id: 5,
      name: "Канальный кондиционер",
      description: "Скрытый монтаж в потолке",
      fullDescription: "Система кондиционирования с возможностью скрытого монтажа. Идеально подходит для помещений с подвесными потолками. Обеспечивает равномерное распределение воздуха по всему помещению через систему воздуховодов.",
      price: "от 95,000 ₽",
      specs: [
        "Площадь охлаждения: до 80 м²",
        "Мощность охлаждения: 8 кВт",
        "Напор вентилятора: до 100 Па",
        "Энергоэффективность: класс A",
        "Гарантия: 3 года"
      ],
      image: "/placeholder.svg"
    },
    {
      id: 6,
      name: "Кассетный кондиционер",
      description: "Для офисов и магазинов",
      fullDescription: "Встраиваемый в потолок кондиционер с возможностью распределения воздуха в четырех направлениях. Идеально подходит для помещений с большой площадью и высокой проходимостью.",
      price: "от 110,000 ₽",
      specs: [
        "Площадь охлаждения: до 100 м²",
        "Мощность охлаждения: 10 кВт",
        "4-стороннее распределение воздуха",
        "Энергоэффективность: класс A+",
        "Гарантия: 3 года"
      ],
      image: "/placeholder.svg"
    }
  ];

  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-2xl animate-fade-in">
          <CardHeader>
            <CardTitle>Товар не найден</CardTitle>
            <CardDescription>
              К сожалению, запрашиваемый товар не существует.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleContactClick = () => {
    toast({
      title: "Заявка принята",
      description: "Наш менеджер свяжется с вами в ближайшее время",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <Card className="animate-fade-in">
          <CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-[300px] object-cover rounded-lg"
                />
              </div>
              <div>
                <CardTitle className="text-3xl mb-4">{product.name}</CardTitle>
                <CardDescription className="text-lg mb-4">
                  {product.fullDescription}
                </CardDescription>
                <p className="text-2xl font-bold mb-4">{product.price}</p>
                <div className="flex gap-4">
                  <Button className="custom-button" onClick={handleContactClick}>
                    <Phone className="mr-2 h-4 w-4" />
                    Заказать звонок
                  </Button>
                  <Button variant="outline" className="custom-button">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    В корзину
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h4 className="text-xl font-semibold mb-4">Характеристики</h4>
            <ul className="list-disc pl-6 space-y-2">
              {product.specs.map((spec, index) => (
                <li key={index} className="text-muted-foreground">{spec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetails;