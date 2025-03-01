
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

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
}

export const OrderHistory = () => {
  const { user } = useAuth();

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user || !user.id) return [];
      
      const response = await fetch(`http://localhost:3000/api/orders/user/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500">Произошла ошибка при загрузке истории заказов</div>;
  }

  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500">У вас пока нет заказов</div>;
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" } } = {
      processing: { label: "В обработке", variant: "secondary" },
      shipped: { label: "Отправлен", variant: "default" },
      delivered: { label: "Доставлен", variant: "outline" },
      cancelled: { label: "Отменен", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "default" };
    
    return (
      <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {orders.map((order: Order) => (
        <Card key={order.id} className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Заказ #{order.id}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {order.created_at && format(new Date(order.created_at), "dd.MM.yyyy, HH:mm")}
              </div>
            </div>
            {getStatusBadge(order.status)}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Товары</h4>
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
              
              <div className="flex justify-between pt-4 border-t">
                <span className="font-medium">Итого:</span>
                <span className="font-bold">{order.total_price.toLocaleString()} ₽</span>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium">Информация о доставке</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Адрес:</strong> {order.shipping_address}</div>
                  <div><strong>Телефон:</strong> {order.contact_phone}</div>
                  {order.comments && (
                    <div><strong>Комментарий:</strong> {order.comments}</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
