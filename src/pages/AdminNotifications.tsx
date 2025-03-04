
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Package, Phone, Mail, Link, Calendar, MapPin, Tag, DollarSign, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";

const AdminNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState<{ [key: number]: boolean }>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { theme } = useTheme();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/notifications');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  // Mutation for deleting notification
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

  const handleDeleteNotification = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  const toggleExpand = (id: number) => {
    setExpandedNotifications((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Check if notification is an order
  const isOrderNotification = (description: string) => {
    return description?.includes('###### НОВЫЙ ЗАКАЗ ######');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  return (
    <>
      <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsOpen(true)}>
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">Уведомления</span>
        {notifications?.some(n => !n.isRead) && (
          <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
            {notifications.filter(n => !n.isRead).length}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Уведомления о консультациях и заказах</DialogTitle>
          </DialogHeader>
          <ScrollArea className="min-h-[200px] max-h-[80vh] rounded-md border p-4">
            <div className="space-y-4">
              {notifications?.length > 0 ? (
                notifications.map((notification) => {
                  const isExpanded = expandedNotifications[notification.id] || false;
                  const isOrder = isOrderNotification(notification.description || '');

                  return (
                    <Card 
                      key={notification.id} 
                      className={`${notification.isRead ? 'bg-card dark:bg-card' : 'bg-background dark:bg-background border-l-4 border-l-blue-500'} transition-all`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {isOrder ? (
                              <Package className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Bell className="h-5 w-5 text-blue-500" />
                            )}
                            {isOrder ? "Новый заказ" : `Заявка от ${notification.name}`}
                            {!notification.isRead && (
                              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                Новое
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                              <span className="text-foreground font-medium">
                                <Phone className="h-4 w-4 inline mr-1 text-muted-foreground" />
                                Телефон:
                              </span>{" "}
                              <a href={`tel:${notification.phone}`} className="text-blue-500 hover:underline">
                                {notification.phone}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-foreground font-medium">
                                <Mail className="h-4 w-4 inline mr-1 text-muted-foreground" />
                                Email:
                              </span>{" "}
                              <a href={`mailto:${notification.email}`} className="text-blue-500 hover:underline">
                                {notification.email}
                              </a>
                            </div>
                          </div>

                          {isExpanded ? (
                            <div className="bg-muted/50 dark:bg-muted/20 p-3 rounded-md border">
                              {isOrder ? (
                                <OrderNotificationContent description={notification.description} />
                              ) : (
                                <p className="whitespace-pre-wrap break-words">{notification.description}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground italic">Нажмите "Подробнее" для просмотра полной информации...</p>
                          )}
                        </div>
                      </CardContent>

                      <div className="flex justify-between p-4">
                        <Button variant="outline" onClick={() => toggleExpand(notification.id)}>
                          {isExpanded ? "Свернуть" : "Подробнее"}
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteNotification(notification.id)}>
                          Удалить
                        </Button>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  Нет уведомлений
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Component for formatting order content
const OrderNotificationContent = ({ description }: { description: string }) => {
  if (!description) {
    return <p className="text-muted-foreground">Информация о заказе отсутствует</p>;
  }

  // Parse sections
  const sections = description.split("======");
  
  // Extract order items
  const renderOrderItems = () => {
    const orderItemsSection = sections.find(s => s.includes("ЗАКАЗАННЫЕ ТОВАРЫ"));
    if (!orderItemsSection) return null;

    // Split into individual items (by [Товар X] pattern)
    const itemsPattern = /\[Товар \d+\]([^[]+)/g;
    const itemsMatches = [...orderItemsSection.matchAll(itemsPattern)];
    
    if (itemsMatches.length === 0) {
      return <p className="text-muted-foreground">Список товаров пуст</p>;
    }
    
    return (
      <div className="space-y-4 mt-2">
        {itemsMatches.map((match, index) => {
          const itemText = match[1].trim();
          
          // Extract product data
          const nameMatch = itemText.match(/▶ Наименование: ([^\n]+)/);
          const quantityMatch = itemText.match(/▶ Количество: ([^\n]+)/);
          const priceMatch = itemText.match(/▶ Цена за шт\.: ([^\n]+)/);
          const sumMatch = itemText.match(/▶ Сумма: ([^\n]+)/);
          const urlMatch = itemText.match(/▶ Ссылка на товар: ([^\n]+)/);
          
          const name = nameMatch ? nameMatch[1] : "Неизвестный товар";
          const quantity = quantityMatch ? quantityMatch[1] : "";
          const price = priceMatch ? priceMatch[1] : "";
          const sum = sumMatch ? sumMatch[1] : "";
          const url = urlMatch ? urlMatch[1].trim() : null;
          
          // Extract product ID from URL for correct linking
          let productId = null;
          if (url) {
            const productIdMatch = url.match(/\/shop\/(\d+)/);
            if (productIdMatch) {
              productId = productIdMatch[1];
            }
          }
          
          return (
            <div key={index} className="bg-background dark:bg-background/50 p-3 rounded border">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-500" />
                    <p className="font-medium">{name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span>Количество:</span> <Badge variant="outline">{quantity}</Badge>
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> {price}
                  </p>
                </div>
                <p className="font-bold">{sum}</p>
              </div>
              {productId && (
                <div className="mt-2 flex items-center gap-1">
                  <Link className="h-4 w-4 text-blue-500" />
                  <a 
                    href={`/shop/${productId}`} 
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Перейти к товару
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Extract important data for display
  const contactInfoSection = sections.find(s => s.includes("КОНТАКТНАЯ ИНФОРМАЦИЯ"));
  const totalInfoSection = sections.find(s => s.includes("ИТОГОВАЯ ИНФОРМАЦИЯ"));
  const commentsSection = sections.find(s => s.includes("КОММЕНТАРИИ К ЗАКАЗУ"));
  
  // Format the address
  const getAddressFromSection = (section: string | undefined) => {
    if (!section) return null;
    const addressMatch = section.match(/• Адрес доставки: ([^\n]+)/);
    return addressMatch ? addressMatch[1] : null;
  };
  
  // Get order total
  const getTotalFromSection = (section: string | undefined) => {
    if (!section) return null;
    const totalMatch = section.match(/• Общая сумма заказа: ([^\n]+)/);
    return totalMatch ? totalMatch[1] : null;
  };

  // Get customer name
  const getNameFromSection = (section: string | undefined) => {
    if (!section) return null;
    const nameMatch = section.match(/• Имя заказчика: ([^\n]+)/);
    return nameMatch ? nameMatch[1] : null;
  };
  
  // Get comments
  const getCommentsFromSection = (section: string | undefined) => {
    if (!section) return null;
    // Take all text after section heading
    const comments = section.replace("КОММЕНТАРИИ К ЗАКАЗУ", "").trim();
    return comments !== "Комментариев нет" ? comments : null;
  };
  
  const address = getAddressFromSection(contactInfoSection);
  const totalAmount = getTotalFromSection(totalInfoSection);
  const customerName = getNameFromSection(contactInfoSection);
  const comments = getCommentsFromSection(commentsSection);
  
  return (
    <div className="space-y-4">
      {customerName && (
        <div className="flex items-start gap-2">
          <span className="font-medium text-foreground min-w-[120px]">Имя заказчика:</span>
          <span className="text-foreground">{customerName}</span>
        </div>
      )}

      {address && (
        <div className="flex items-start gap-2">
          <span className="font-medium text-foreground min-w-[120px] flex items-center">
            <MapPin className="h-4 w-4 mr-1 inline" />
            Адрес доставки:
          </span>
          <span className="text-foreground">{address}</span>
        </div>
      )}
      
      <div className="space-y-2">
        <h4 className="font-medium text-foreground flex items-center">
          <Package className="h-4 w-4 mr-1 inline" />
          Товары:
        </h4>
        {renderOrderItems()}
      </div>
      
      {totalAmount && (
        <div className="flex justify-between items-center border-t pt-2 mt-2">
          <span className="font-medium text-foreground">Итого:</span>
          <span className="font-bold text-lg">{totalAmount}</span>
        </div>
      )}
      
      {comments && (
        <div className="border-t pt-2 mt-2">
          <h4 className="font-medium text-foreground flex items-center">
            <MessageSquare className="h-4 w-4 mr-1 inline" />
            Комментарии к заказу:
          </h4>
          <p className="text-foreground whitespace-pre-wrap mt-1">{comments}</p>
        </div>
      )}
      
      {/* Hidden original description for telegram bot */}
      <div className="hidden">{description}</div>
    </div>
  );
};

export default AdminNotifications;
