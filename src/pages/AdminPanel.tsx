import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Check } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  selected: boolean;
}

const AdminPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputDiscount, setInputDiscount] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [discountTarget, setDiscountTarget] = useState<'all' | 'selected'>('all'); 

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputDiscount(event.target.value);
  };

  const updateDiscount = (id: number, discount: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, discount } : p))
    );
  };

  const toggleSelect = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const applyDiscount = async () => {
    const numericDiscount = parseFloat(inputDiscount);
    if (isNaN(numericDiscount)) {
      toast.error("Введите корректное число");
      return;
    }

    const updatedProducts = discountTarget === 'all' ? 
      products.map((p) => ({ ...p, discount: numericDiscount })) : 
      products.map((p) => (p.selected ? { ...p, discount: numericDiscount } : p));

    setProducts(updatedProducts);

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/update-discounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: updatedProducts }),
      });

      if (response.ok) {
        toast.success(`Скидка ${numericDiscount}% успешно применена`);
      } else {
        toast.error("Ошибка при обновлении скидок");
      }
    } catch (error) {
      toast.error("Ошибка при отправке данных");
      console.error("Ошибка:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <DialogContent className="sm:max-w-[800px] p-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Панель администратора</DialogTitle>
          </DialogHeader>

          {/* Контейнер для размещения панелей */}
          <div className="flex flex-col sm:flex-row gap-4 overflow-hidden">
            {/* Панель 1 для управления скидками */}
            <Card className="w-full sm:max-w-[350px]">
              <CardContent className="p-3 space-y-2">
                <h3 className="text-lg font-semibold">Управление скидками</h3>
                <Input
                  type="number"
                  value={inputDiscount}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Введите процент скидки..."
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    className={`flex-1 ${discountTarget === 'all' ? 'bg-blue-500 text-white' : ''}`}
                    onClick={() => setDiscountTarget('all')}
                  >
                    Всем товарам
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex-1 ${discountTarget === 'selected' ? 'bg-blue-500 text-white' : ''}`}
                    onClick={() => setDiscountTarget('selected')}
                  >
                    Выбранным
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={applyDiscount}
                  disabled={loading}
                >
                  Применить скидку
                </Button>
              </CardContent>
            </Card>

            {/* Панель 2 для дополнительных настроек */}
            <Card className="w-full sm:max-w-[350px]">
              <CardContent className="p-3 space-y-2">
                <h3 className="text-lg font-semibold">Дополнительные настройки скидок</h3>
                <Input
                  type="number"
                  value={inputDiscount}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Введите процент скидки..."
                />
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={applyDiscount}
                  disabled={loading}
                >
                  Применить скидку
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Список товаров */}
          <h3 className="text-lg font-semibold mt-4">Товары</h3>
          <div className="space-y-4">
            {products.map((p) => {
              const discountedPrice = p.price - (p.price * (p.discount / 100));
              return (
                <Card key={p.id} className="p-2">
                  <CardContent className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3 w-full">
                      {/* Квадратный чекбокс */}
                      <div
                        className={`w-6 h-6 flex items-center justify-center border-2 rounded-md cursor-pointer transition-all 
                        ${p.selected ? "bg-blue-500 border-blue-500" : "border-gray-400 hover:border-blue-400"}`}
                        onClick={() => toggleSelect(p.id)}
                      >
                        {p.selected && <Check className="text-white w-4 h-4" />}
                      </div>

                      <div className="flex-1 flex items-center">
                        <span className="text-sm">{p.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm line-through text-gray-500">{p.price}₽</span>
                        <span className="text-sm text-green-500 font-semibold">{discountedPrice.toFixed(2)}₽</span>
                      </div>

                      <Input
                        type="number"
                        value={p.discount}
                        onChange={(e) => updateDiscount(p.id, Number(e.target.value))}
                        className="w-16 h-8 text-sm text-center"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;
