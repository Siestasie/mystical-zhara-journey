import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Console } from "console";

const Shop = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    fullDescription: '',
    price: '',
    category: '',
    specs: [''],
    image: [] as string[],
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

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: {
      name: string;
      description: string;
      fullDescription: string;
      price: string;
      category: string;
      specs: string[];
      image: string[]; // Изменили image на image (массив)
    }) => {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productData,
          price: parseFloat(productData.price),
          image: productData.image, // Отправляем массив изображений
        }),
      });

      
      console.log(response.json)
      if (!response.ok) throw new Error('Failed to add product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Продукт успешно добавлен');
      
      setNewProduct({
        name: '',
        description: '',
        fullDescription: '',
        price: '',
        category: '',
        specs: [''],
        image: [] // Сбрасываем массив изображений
      });
  
      setIsOpen(false);
    },
    onError: () => {
      toast.error('Ошибка при добавлении продукта');
    }
  });
  

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Продукт успешно удален');
    },
    onError: () => {
      toast.error('Ошибка при удалении продукта');
    }
  });

  const handleAddSpec = () => {
    setNewProduct(prev => ({
      ...prev,
      specs: [...prev.specs, '']
    }));
  };

  const handleSpecChange = (index: number, value: string) => {
    const newSpecs = [...newProduct.specs];
    newSpecs[index] = value;
    setNewProduct(prev => ({
      ...prev,
      specs: newSpecs
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProductMutation.mutate(newProduct);
  };

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Мин. цена"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full sm:w-[120px]"
            />
            <Input
              type="number"
              placeholder="Макс. цена"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full sm:w-[120px]"
            />
          </div>

        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="animate-scale-in">
              <CardHeader className="space-y-2">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={`http://localhost:3000${product.image[0]}`}
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardTitle className="text-xl sm:text-2xl line-clamp-2">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex gap-2 w-full">
                    <Button className="w-full sm:w-auto custom-button1" onClick={() => navigate(`/shop/${product.id}`)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Подробнее
                    </Button>
                    {user?.isAdmin && (
                      <>
                        <Button className="custom-button1" variant="outline" onClick={() => navigate(`/shop/${product.id}`)}>
                          Редактировать
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => deleteProductMutation.mutate(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <span className="text-lg sm:text-xl font-bold">{product.price.toLocaleString()} ₽</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Добавить новый товар</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Название продукта"
              value={newProduct.name}
              onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              placeholder="Краткое описание"
              value={newProduct.description}
              onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
              required
            />
            <Textarea
              placeholder="Полное описание"
              value={newProduct.fullDescription}
              onChange={(e) => setNewProduct(prev => ({ ...prev, fullDescription: e.target.value }))}
              required
            />
            <Input
              type="number"
              placeholder="Цена"
              value={newProduct.price}
              onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
              required
            />
            <Select
              value={newProduct.category}
              onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
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
              {newProduct.specs.map((spec, index) => (
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
                <Plus className="h-4 w-4 mr-2" />
                Добавить характеристику
              </Button>
            </div>

            <Input
              type="file"
              accept="image/*"
              multiple // Позволяет выбрать несколько файлов
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                
                if (files.length > 3) {
                  alert("Вы можете загрузить не более 3 изображений.");
                  return;
                }

                const readers = files.map(file => {
                  return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                  });
                });

                Promise.all(readers).then((image) => {
                  // Добавляем новые изображения к существующим
                  setNewProduct(prev => ({ 
                    ...prev, 
                    image: [...prev.image, ...image] 
                  }));
                });
              }}
            />

            <div className="mt-4">
              {newProduct.image.length > 0 && (
                <div className="flex gap-2">
                  {newProduct.image.map((image, index) => (
                    <div key={index} className="w-20 h-20 overflow-hidden rounded-md">
                      <img src={image} alt={`Uploaded image ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>


            <Button type="submit" className="w-full">
              Добавить продукт
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shop;