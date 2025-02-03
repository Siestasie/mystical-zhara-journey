import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Phone, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const queryClient = useQueryClient();
  const [editProduct, setEditProduct] = useState({
    name: '',
    description: '',
    fullDescription: '',
    price: '',
    category: '',
    specs: [''],
    image: ''
  });

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

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();
      setEditProduct({
        name: data.name,
        description: data.description,
        fullDescription: data.fullDescription,
        price: data.price.toString(),
        category: data.category,
        specs: data.specs || [''],
        image: data.image
      });
      return data;
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (productData: typeof editProduct) => {
      const response = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productData,
          price: parseFloat(productData.price)
        }),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast({
        title: "Успешно",
        description: "Товар успешно обновлен",
      });
      setIsEditOpen(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить товар",
        variant: "destructive",
      });
    }
  });

  const handleContactClick = () => {
    toast({
      title: "Заявка принята",
      description: "Наш менеджер свяжется с вами в ближайшее время",
    });
  };

  const handleSpecChange = (index: number, value: string) => {
    const newSpecs = [...editProduct.specs];
    newSpecs[index] = value;
    setEditProduct(prev => ({
      ...prev,
      specs: newSpecs
    }));
  };

  const handleAddSpec = () => {
    setEditProduct(prev => ({
      ...prev,
      specs: [...prev.specs, '']
    }));
  };

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
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          {!isMobile && "Назад"}
        </Button>

        <Card className="animate-fade-in">
          <CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img 
                  src={`http://localhost:3000${product.image}`}
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="space-y-4">
                <CardTitle className="text-2xl sm:text-3xl">{product.name}</CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  {product.fullDescription}
                </CardDescription>
                <p className="text-xl sm:text-2xl font-bold">{product.price.toLocaleString()} ₽</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="w-full sm:w-auto custom-button" 
                    onClick={handleContactClick}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Заказать звонок
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto custom-button"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    В корзину
                  </Button>
                  {user?.isAdmin && (
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto custom-button"
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
            <DialogHeader>
              <DialogTitle>Редактировать товар</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateProductMutation.mutate(editProduct);
            }} className="space-y-4">
              <Input
                placeholder="Название продукта"
                value={editProduct.name}
                onChange={(e) => setEditProduct(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Краткое описание"
                value={editProduct.description}
                onChange={(e) => setEditProduct(prev => ({ ...prev, description: e.target.value }))}
                required
              />
              <Textarea
                placeholder="Полное описание"
                value={editProduct.fullDescription}
                onChange={(e) => setEditProduct(prev => ({ ...prev, fullDescription: e.target.value }))}
                required
              />
              <Input
                type="number"
                placeholder="Цена"
                value={editProduct.price}
                onChange={(e) => setEditProduct(prev => ({ ...prev, price: e.target.value }))}
                required
              />
              <Select
                value={editProduct.category}
                onValueChange={(value) => setEditProduct(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Характеристики:</label>
                {editProduct.specs.map((spec, index) => (
                  <Input
                    key={index}
                    placeholder={`Характеристика ${index + 1}`}
                    value={spec}
                    onChange={(e) => handleSpecChange(index, e.target.value)}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSpec}
                  className="w-full"
                >
                  Добавить характеристику
                </Button>
              </div>

              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setEditProduct(prev => ({
                        ...prev,
                        image: reader.result as string
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />

              <Button type="submit" className="w-full">
                Сохранить изменения
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProductDetails;
