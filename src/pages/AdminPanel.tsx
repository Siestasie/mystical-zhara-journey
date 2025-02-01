import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const AdminPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputdiscount, setInputdiscount] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    fullDescription: '',
    price: '',
    category: '',
    specs: [''],
    image: '/placeholder.svg'
  });

  const queryClient = useQueryClient();

  const { data: products } = useQuery({
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
      image: string;
    }) => {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productData,
          price: parseFloat(productData.price)
        }),
      });
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
        image: '/placeholder.svg'
      });
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputdiscount(event.target.value);
  };

  const updateDiscount = async () => {
    try {
      const numericDiscount = parseFloat(inputdiscount);
      
      if (isNaN(numericDiscount)) {
        toast.error("Пожалуйста, введите корректное число");
        return;
      }

      const response = await fetch('http://localhost:3000/api/update-discount', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Discount: numericDiscount }),
      });

      if (response.ok) {
        toast.success('Скидка успешно обновлена');
        setInputdiscount('');
      } else {
        toast.error('Ошибка при обновлении скидки');
      }
    } catch (error) {
      toast.error('Произошла ошибка при отправке данных');
      console.error('Ошибка:', error);
    }
  };

  // ... keep existing code (JSX return statement)

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <BarChart className="h-4 w-4" />
        <span className="hidden sm:inline">Админ панель</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Панель администратора</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Управление скидкой</h3>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={inputdiscount}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Введите процент скидки..."
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={updateDiscount}
                  >
                    Применить скидку
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Добавить новый продукт</h3>
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

                  <Button type="submit" className="w-full">
                    Добавить продукт
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Существующие продукты</h3>
                <div className="space-y-4">
                  {products?.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-500">{product.category}</p>
                        <p className="text-sm font-medium">{product.price} ₽</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteProductMutation.mutate(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;
