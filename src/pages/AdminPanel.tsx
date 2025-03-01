
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Check, Package } from "lucide-react";
import { toast } from "sonner";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  selected: boolean;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
}

interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: string;
  shipping_address: string;
  contact_phone: string;
  comments?: string;
  created_at: string;
  items: OrderItem[];
  userName?: string;
}

const AdminPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputDiscount, setInputDiscount] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [discountTarget, setDiscountTarget] = useState<'all' | 'selected'>('all');
  const [pricelistDiscount, setPricelistDiscount] = useState('');
  const [activeTab, setActiveTab] = useState("discounts");

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
    
    // Fetch orders for the orders tab
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/orders/all");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error("Ошибка при загрузке заказов");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Ошибка при загрузке заказов");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Статус заказа успешно обновлен");
        // Update the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        toast.error("Ошибка при обновлении статуса заказа");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Ошибка при обновлении статуса заказа");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputDiscount(event.target.value);
  };

  const handleChangePricelist = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPricelistDiscount(event.target.value);
  };

  const updateDiscount = (id: number, discount: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, discount: parseFloat(discount.toFixed(2)) } : p))
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
  
    const updatedProducts = discountTarget === 'all' 
      ? products.map((p) => ({ ...p, discount: parseFloat(numericDiscount.toFixed(2)) })) 
      : products.map((p) => (p.selected ? { ...p, discount: parseFloat(numericDiscount.toFixed(2)) } : p));
  
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

  const updatePriceListDiscount = async () => {
    const numericDiscount = parseInt(pricelistDiscount);
    const response = await fetch("http://localhost:3000/api/update-discount-Pricelist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Discount: numericDiscount }),
    });

    if (response.ok) {
      toast.success(`Скидка ${numericDiscount}% успешно применена`);
    } else {
      toast.error("Ошибка при обновлении скидок");
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" } } = {
      processing: { label: "В обработке", variant: "secondary" },
      shipped: { label: "Отправлен", variant: "default" },
      delivered: { label: "Доставлен", variant: "success" },
      cancelled: { label: "Отменен", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "default" };
    
    return (
      <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
    );
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="discounts">Управление скидками</TabsTrigger>
              <TabsTrigger value="orders">Управление заказами</TabsTrigger>
            </TabsList>
            
            <TabsContent value="discounts" className="mt-0">
              {/* Контейнер для размещения панелей скидок */}
              <div className="flex flex-col sm:flex-row gap-4 overflow-hidden">
                {/* Панель 1 для управления скидками */}
                <Card className="w-full sm:max-w-[350px]">
                  <CardContent className="p-3 space-y-2">
                    <h3 className="text-lg font-semibold">Управление скидками</h3>
                    <Input
                      type="number"
                      step="0.01"
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
                      step="0.01"
                      value={pricelistDiscount}
                      onChange={handleChangePricelist}
                      className="w-full"
                      placeholder="Введите процент скидки..."
                    />
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={updatePriceListDiscount}
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
                            step="0.01"
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
            </TabsContent>
            
            <TabsContent value="orders" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Управление заказами</h3>
                <Button onClick={fetchOrders} variant="outline" size="sm" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Обновить
                </Button>
              </div>
              
              {loading && <p className="text-center py-4">Загрузка заказов...</p>}
              
              {!loading && orders.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">Заказы не найдены</p>
              )}
              
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="w-full">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold">Заказ #{order.id}</h4>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.created_at && format(new Date(order.created_at), "dd.MM.yyyy, HH:mm")}
                          </p>
                          {order.userName && (
                            <p className="text-sm"><span className="font-medium">Пользователь:</span> {order.userName}</p>
                          )}
                        </div>
                        
                        <div className="mt-2 md:mt-0">
                          <Select 
                            defaultValue={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Изменить статус" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="processing">В обработке</SelectItem>
                              <SelectItem value="shipped">Отправлен</SelectItem>
                              <SelectItem value="delivered">Доставлен</SelectItem>
                              <SelectItem value="cancelled">Отменен</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium">Товары</h5>
                        <div className="divide-y">
                          {order.items && order.items.map((item) => (
                            <div key={item.id} className="py-2 flex justify-between">
                              <div>
                                <div>{item.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.quantity} × {item.price.toLocaleString()} ₽
                                </div>
                              </div>
                              <div className="font-medium">
                                {(item.price * item.quantity).toLocaleString()} ₽
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4 border-t mt-4">
                        <span className="font-medium">Итого:</span>
                        <span className="font-bold">{order.total_price.toLocaleString()} ₽</span>
                      </div>

                      <div className="space-y-2 pt-4 border-t mt-4">
                        <h5 className="font-medium">Информация о доставке</h5>
                        <div className="space-y-1 text-sm">
                          <div><strong>Адрес:</strong> {order.shipping_address}</div>
                          <div><strong>Телефон:</strong> {order.contact_phone}</div>
                          {order.comments && (
                            <div><strong>Комментарий:</strong> {order.comments}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;
