import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Phone, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductImageCarousel } from "@/components/product/ProductImageCarousel";
import { ProductEditForm } from "@/components/product/ProductEditForm";
import { useCart } from "@/contexts/CartContext";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { addItem } = useCart();

  const [editProduct, setEditProduct] = useState({
    name: '',
    description: '',
    fullDescription: '',
    price: '',
    category: '',
    specs: [],   // Инициализация как пустой массив
    images: [] as string[]  // Инициализация как пустой массив
  });

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();

      //console.log("Fetched data:", data); // Логируем данные, полученные с сервера

      // Преобразуем строку в массив, если это необходимо
      const specs = Array.isArray(data.specs) ? data.specs : [];
      const images = Array.isArray(data.images) ? data.images : [];

      setEditProduct({
        name: data.name,
        description: data.description,
        fullDescription: data.fullDescription,
        price: data.price.toString(),
        category: data.category,
        specs: specs,   // Гарантируем, что это массив
        images: images, // Гарантируем, что это массив
      });


      console.log('Parsed specs:', specs); 
      console.log('Parsed images:', images);

      return data;
    }
  });

  // Логируем перед рендером компонента
  console.log("Product details:", product);

  // Проверяем и корректируем данные перед использованием .map()
  const specsToRender = Array.isArray(product?.specs) ? product.specs : [];
  const imagesToRender = Array.isArray(product?.images) ? product.images : [];

  

  const handleContactClick = () => {
    toast({
      title: "Заявка принята",
      description: "Наш менеджер свяжется с вами в ближайшее время",
    });
  };

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: calculateDiscountPrice(product.price, product.discount),
        image: product.image
      });
      toast({
        title: "Товар добавлен в корзину",
        description: `${product.name} успешно добавлен в корзину`,
      });
    }
  };

  function calculateDiscountPrice(price: number, percentage: number) {
    if (isNaN(percentage) || percentage < 0) {
      console.error("Введите корректное число!");
      return price; // Возвращаем исходную цену, если процент некорректен
    }
    return Math.round(price * (1 - percentage / 100));
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <Card className="w-full max-w-2xl animate-fade-in">
          <CardHeader>
            <CardTitle>Товар не найден</CardTitle>
            <CardDescription>
              К сожалению, запрашиваемый товар не существует.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Вернуться назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container mx-auto max-w-6xl">
        <Button 
          variant="outline" 
          className="absolute top-4 left-4 custom-button1 hidden lg:flex"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {!isMobile && "Назад"}
        </Button>

        <Card className="animate-fade-in">
          <CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProductImageCarousel images={product.image} productName={product.name} />

              <div className="space-y-4">
                <CardTitle className="text-2xl sm:text-3xl">{product.name}</CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  {product.fullDescription}
                </CardDescription>
                <p className="text-lg font-semibold text-gray-500">
                  Категория: {product.category}
                </p>
                <div className="flex flex-col gap-4">
                  {product.discount > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500 line-through">{product.price} ₽</span>
                      <span className="text-sm text-red-500 font-bold">-{product.discount}%</span>
                    </div>
                  )}
                  <p className="text-xl sm:text-2xl font-bold">{calculateDiscountPrice(product.price, product.discount)} ₽</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="w-full sm:w-auto custom-button1" 
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    В корзину
                  </Button>
                    {user?.isAdmin && (
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto custom-button1"
                        onClick={() => setIsEditOpen(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </Button>
                    )}
                  </div>
                </div>
              </div>
          
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="text-xl font-semibold">Характеристики</h4>
              <ul className="list-disc pl-6 space-y-2">
                {product.specs.map((spec: string, index: number) => (
                  <li key={index} className="text-muted-foreground">{spec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <ProductEditForm
              id={id || ''}
              editProduct={editProduct}
              setEditProduct={setEditProduct}
              onClose={() => setIsEditOpen(false)}
              product={product}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProductDetails;