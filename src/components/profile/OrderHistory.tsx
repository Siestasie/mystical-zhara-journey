
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Order {
  id: number;
  user_id: number;
  status: string;
  order_date: string;
  total_price: number;
  items: {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    name: string;
  }[];
}

export function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`http://localhost:3000/api/orders/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return <div className="p-4 text-center">Загрузка истории заказов...</div>;
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            История заказов
          </CardTitle>
          <CardDescription>У вас пока нет заказов</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-6">
          <p className="mb-4">Ваша история заказов будет отображаться здесь</p>
          <Button onClick={() => navigate("/shop")}>Перейти в магазин</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          История заказов
        </CardTitle>
        <CardDescription>Список ваших заказов</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>№ заказа</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>№{order.id}</TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell>{order.total_price.toLocaleString()} ₽</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'completed' ? 'Выполнен' :
                     order.status === 'processing' ? 'В обработке' :
                     order.status === 'cancelled' ? 'Отменен' : 'Новый'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {order.items.map((item) => (
                      <Button
                        key={item.id}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => navigate(`/shop/${item.product_id}`)}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        {item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
