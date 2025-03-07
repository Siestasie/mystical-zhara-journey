
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Package, Phone, Mail, Calendar, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useToast } from "@/hooks/use-toast";

const AdminNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState<{ [key: number]: boolean }>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch notifications
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const response = await fetch('http://localhost:3000/api/notifications');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("Получены уведомления:", data);
        return data;
      } catch (error) {
        console.error("Ошибка при получении уведомлений:", error);
        return [];
      }
    },
    refetchInterval: 15000, // Обновление каждые 15 секунд
    refetchOnWindowFocus: true,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Ошибка при отметке уведомления как прочитанное:', error);
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`http://localhost:3000/api/notifications/${id}/delete`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Удалено",
        description: "Уведомление успешно удалено",
      });
    },
    onError: (error) => {
      console.error('Ошибка при удалении уведомления:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить уведомление",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Mark notifications as read when expanded
    Object.entries(expandedNotifications).forEach(([id, isExpanded]) => {
      if (isExpanded) {
        const notification = notifications?.find(n => n.id === parseInt(id));
        if (notification && !notification.isRead) {
          markAsReadMutation.mutate(parseInt(id));
        }
      }
    });
  }, [expandedNotifications, notifications]);

  const handleDeleteNotification = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  const toggleExpand = (id: number) => {
    setExpandedNotifications((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      return newState;
    });
  };

  // Проверка является ли уведомление заказом
  const isOrderNotification = (description: string) => {
    return description && description.includes('###### НОВЫЙ ЗАКАЗ ######');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2" 
        onClick={() => {
          setIsOpen(true);
          refetch();
        }}
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">Уведомления</span>
        {notifications?.some(n => !n.isRead) && (
          <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
            {notifications.filter(n => !n.isRead).length}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl bg-background dark:bg-gray-800 text-foreground dark:text-white">
          <DialogHeader>
            <DialogTitle>Уведомления о консультациях и заказах</DialogTitle>
          </DialogHeader>
          <ScrollArea className="min-h-[200px] max-h-[80vh] rounded-md border p-4 dark:border-gray-700">
            <div className="space-y-4">
              {!notifications || notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Нет уведомлений
                </div>
              ) : (
                notifications.map((notification) => {
                  const isExpanded = expandedNotifications[notification.id] || false;
                  const isOrder = isOrderNotification(notification.description || '');
                  
                  // Вывод в консоль для отладки
                  console.log(`Уведомление ${notification.id}:`, notification);

                  return (
                    <Card 
                      key={notification.id} 
                      className={`${notification.isRead ? 'bg-muted dark:bg-gray-700' : 'bg-background dark:bg-gray-800 border-l-4 border-l-blue-500'} transition-all text-foreground dark:text-white`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {isOrder ? (
                              <Package className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Bell className="h-5 w-5 text-blue-500" />
                            )}
                            {isOrder ? "Новый заказ" : `Заявка от ${notification.name || "нового клиента"}`}
                            {!notification.isRead && (
                              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Новое
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(notification.createdAt).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">
                                <Phone className="h-4 w-4 inline mr-1 text-gray-500 dark:text-gray-400" />
                                Телефон:
                              </span>{" "}
                              <a href={`tel:${notification.phone}`} className="text-blue-500 hover:underline">
                                {notification.phone || "Не указан"}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">
                                <Mail className="h-4 w-4 inline mr-1 text-gray-500 dark:text-gray-400" />
                                Email:
                              </span>{" "}
                              <a href={`mailto:${notification.email}`} className="text-blue-500 hover:underline">
                                {notification.email || "Не указан"}
                              </a>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="bg-muted dark:bg-gray-700 p-3 rounded-md border dark:border-gray-600">
                              <РасширенноеОтображениеДанных notification={notification} />
                            </div>
                          )}

                          {!isExpanded && (
                            <p className="text-gray-600 dark:text-gray-400 italic">
                              Нажмите "Подробнее" для просмотра полной информации...
                            </p>
                          )}
                        </div>
                      </CardContent>

                      <div className="flex justify-between p-4">
                        <Button 
                          variant="outline" 
                          onClick={() => toggleExpand(notification.id)}
                          className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                        >
                          {isExpanded ? "Свернуть" : "Подробнее"}
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Компонент для отображения всех данных уведомления
const РасширенноеОтображениеДанных = ({ notification }: { notification: any }) => {
  console.log("Отображение данных для:", notification);
  
  return (
    <div className="space-y-4 text-foreground dark:text-white">
      {/* Отображаем адрес */}
      {notification.adress && (
        <div className="flex flex-col">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            <MapPin className="h-4 w-4 inline mr-1" /> 
            Адрес доставки:
          </span>
          <span className="ml-6">{notification.adress}</span>
        </div>
      )}
      
      {/* Отображаем данные о товарах */}
      {notification.itemsproduct && (
        <div className="flex flex-col">
          <span className="font-medium text-gray-700 dark:text-gray-300">Заказанные товары:</span>
          <div className="ml-6 mt-2 bg-gray-100 dark:bg-gray-900 p-2 rounded-md overflow-x-auto whitespace-pre-wrap text-sm">
            {notification.itemsproduct}
          </div>
        </div>
      )}
      
      {/* Если есть JSON-данные в поле items */}
      {notification.items && typeof notification.items === 'string' && notification.items.trim() !== '' && (
        <div className="flex flex-col">
          <span className="font-medium text-gray-700 dark:text-gray-300">Данные товаров (JSON):</span>
          <pre className="ml-6 mt-2 bg-gray-100 dark:bg-gray-900 p-2 rounded-md overflow-x-auto text-xs">
            {notification.items}
          </pre>
        </div>
      )}
      
      {/* Отображаем общую стоимость */}
      {notification.totalprice && (
        <div className="border-t pt-2 mt-4 dark:border-gray-700">
          <div className="flex justify-between">
            <span className="font-bold">Итого:</span>
            <span className="font-bold text-lg">{notification.totalprice} ₽</span>
          </div>
        </div>
      )}
      
      {/* Отображаем комментарии */}
      {notification.comments && (
        <div className="border-t pt-2 mt-4 dark:border-gray-700">
          <span className="font-medium text-gray-700 dark:text-gray-300">Комментарии:</span>
          <p className="ml-6 mt-1 whitespace-pre-wrap">{notification.comments}</p>
        </div>
      )}
      
      {/* Отображаем описание */}
      {notification.description && (
        <div className="border-t pt-2 mt-4 dark:border-gray-700">
          <span className="font-medium text-gray-700 dark:text-gray-300">Дополнительная информация:</span>
          <p className="ml-6 mt-1 whitespace-pre-wrap">{notification.description}</p>
        </div>
      )}
      
      {/* Отображаем все остальные поля */}
      <div className="border-t pt-2 mt-4 dark:border-gray-700">
        <span className="font-medium text-gray-700 dark:text-gray-300">Все поля уведомления:</span>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {Object.entries(notification)
            .filter(([key]) => !['id', 'isRead', 'createdAt', 'name', 'phone', 'email', 'adress', 'itemsproduct', 'items', 'totalprice', 'comments', 'description'].includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <span className="font-medium">{key}:</span>
                <span className="ml-6 text-sm bg-gray-100 dark:bg-gray-900 p-1 rounded-md overflow-x-auto">
                  {typeof value === 'object' 
                    ? JSON.stringify(value) 
                    : String(value)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
