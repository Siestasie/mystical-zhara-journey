
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface OrderFormData {
  name: string;
  phone: string;
  address: string;
  comments: string;
}

export const CartDropdown = () => {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderData, setOrderData] = useState<OrderFormData>({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    comments: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const cleanDescription = (description: string) => {
    return description.replace(/<\/?pre>/g, "\n\n"); 
  };  
  

  const handleOrder = async () => {
    if (!orderData.name || !orderData.phone || !orderData.address) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }
  
    try {      
      const response = await fetch('http://localhost:3000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: orderData.name,
          phone: orderData.phone,
          email: user?.email || "-",
          description: cleanDescription(
  `###### НОВЫЙ ЗАКАЗ ######\n
  ====== КОНТАКТНАЯ ИНФОРМАЦИЯ ======\n
  • Имя заказчика: ${orderData.name}\n
  • Телефон: ${orderData.phone}\n
  • Email: ${user?.email || "-"}\n
  • Адрес доставки: ${orderData.address}\n
  \n
  ====== ЗАКАЗАННЫЕ ТОВАРЫ ======\n
  ${items.map((item, index) => `
  [Товар ${index + 1}]\n
  ▶ Наименование: ${item.name}\n
  ▶ Количество: ${item.quantity} шт.\n
  ▶ Цена за шт.: ${item.price.toLocaleString()} ₽\n
  ▶ Сумма: ${(item.price * item.quantity).toLocaleString()} ₽\n
  ▶ Ссылка на товар: http://localhost:8080/products/${item.id}\n
  -------------------\n`).join('')}
  \n
  ====== ИТОГОВАЯ ИНФОРМАЦИЯ ======\n
  • Общая сумма заказа: ${total.toLocaleString()} ₽\n
  \n
  ====== КОММЕНТАРИИ К ЗАКАЗУ ======\n
  ${orderData.comments || "Комментариев нет"}\n`
          )
        }),
      });
  
      if (!response.ok) {
        throw new Error('Ошибка при отправке заказа');
      }
  
      toast({
        title: "Заказ успешно отправлен!",
        description: "Наш менеджер свяжется с вами в ближайшее время",
      });
  
      clearCart();
      setShowOrderDialog(false);
    } catch (error) {
      toast({
        title: "Ошибка!",
        description: "Не удалось отправить заказ. Попробуйте позже.",
        variant: "destructive",
      });
    }
  };
  

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-4 w-4" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {items.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80">
          <DropdownMenuLabel>Корзина</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[300px] w-full">
            {items.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Корзина пуста
              </div>
            ) : (
              items.map((item) => (
                <DropdownMenuItem key={item.id} className="flex flex-col items-start p-4">
                  <div className="flex w-full gap-4">
                    <div className="w-16 h-16 overflow-hidden rounded">
                      <img 
                        src={`http://localhost:3000${item.image[0]}`} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.price.toLocaleString()} ₽ × {item.quantity}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            updateQuantity(item.id, item.quantity - 1);
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            updateQuantity(item.id, item.quantity + 1);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="h-8 w-8 ml-auto"
                          onClick={(e) => {
                            e.preventDefault();
                            removeItem(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>
          {items.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="p-4">
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Итого:</span>
                  <span className="font-bold">{total.toLocaleString()} ₽</span>
                </div>
                <Button className="w-full" onClick={() => setShowOrderDialog(true)}>
                  Оформить заказ
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Оформление заказа</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Имя <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Введите ваше имя"
                value={orderData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Телефон <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+7 (999) 999-99-99"
                value={orderData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Адрес доставки <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="Укажите адрес доставки"
                value={orderData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Комментарии к заказу</Label>
              <Textarea
                id="comments"
                name="comments"
                placeholder="Укажите дополнительные пожелания, например: нужна установка кондиционера"
                value={orderData.comments}
                onChange={handleInputChange}
                className="min-h-[100px]"
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleOrder}
              disabled={!orderData.name || !orderData.phone || !orderData.address}
            >
              Подтвердить заказ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
