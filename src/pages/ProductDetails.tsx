import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Phone, Edit, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const queryClient = useQueryClient();

  const [editProduct, setEditProduct] = useState({
    name: '',
    description: '',
    fullDescription: '',
    price: '',
    category: '',
    specs: [''],
    images: [] as string[]
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProduct(prev => ({
          ...prev,
          images: [reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const nextImage = () => {
    if (product?.image) {
      setCurrentImageIndex((prev) => (prev + 1) % product.image.length);
    }
  };

  const previousImage = () => {
    if (product?.image) {
      setCurrentImageIndex((prev) => (prev - 1 + product.image.length) % product.image.length);
    }
  };

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/products/${id}/image`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: reader.result,
              index: index
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update image');
          }

          const data = await response.json();
          queryClient.invalidateQueries({ queryKey: ['product', id] });
          toast({
            title: "Успешно",
            description: "Изображение обновлено",
          });
        } catch (error) {
          toast({
            title: "Ошибка",
            description: "Не удалось обновить изображение",
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
        images: data.images || []
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
          price: parseFloat(productData.price),
          images: productData.images,
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
          className="absolute top-4 left-4 custom-button1 hidden lg:flex"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {!isMobile && "Назад"}
        </Button>

        <Card className="animate-fade-in">
          <CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img
                  src={`http://localhost:3000${product.image[currentImageIndex]}`}
                  alt={`${product.name} изображение ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => setIsImageFullscreen(true)}
                />
                {product.image.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={previousImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {product.image.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <CardTitle className="text-2xl sm:text-3xl">{product.name}</CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  {product.fullDescription}
                </CardDescription>
                <p className="text-xl sm:text-2xl font-bold">{product.price.toLocaleString()} ₽</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="w-full sm:w-auto custom-button1" 
                    onClick={handleContactClick}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Заказать звонок
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto custom-button1"
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

        <Dialog open={isImageFullscreen} onOpenChange={setIsImageFullscreen}>
          <DialogContent className="max-w-4xl">
            <img
              src={`http://localhost:3000${product.image[currentImageIndex]}`}
              alt={`${product.name} изображение ${currentImageIndex + 1}`}
              className="w-full h-auto"
            />
            {product.image.length > 1 && (
              <div className="flex justify-between absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    previousImage();
                  }}
                  className="bg-white/80 hover:bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="bg-white/80 hover:bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Редактировать товар</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateProductMutation.mutate(editProduct);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
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
                </div>

                <div className="space-y-4">
                  <Textarea
                    placeholder="Полное описание"
                    value={editProduct.fullDescription}
                    onChange={(e) => setEditProduct(prev => ({ ...prev, fullDescription: e.target.value }))}
                    required
                    className="h-[120px]"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Характеристики:</label>
                    <div className="max-h-[150px] overflow-y-auto space-y-2">
                      {editProduct.specs.map((spec, index) => (
                        <Input
                          key={index}
                          placeholder={`Характеристика ${index + 1}`}
                          value={spec}
                          onChange={(e) => handleSpecChange(index, e.target.value)}
                        />
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSpec}
                      className="w-full"
                    >
                      Добавить характеристику
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Изображения товара:</label>
                <div className="grid grid-cols-2 gap-4">
                  {product.image.map((_, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                      <img
                        src={`http://localhost:3000${product.image[index]}`}
                        alt={`Image ${index + 1}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, index)}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

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
