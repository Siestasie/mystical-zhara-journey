
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Package, Phone, Mail, Link, Calendar } from "lucide-react";
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
        console.log("Fetched notifications:", data);
        return data;
      } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }
    },
    refetchInterval: 15000, // Refresh every 15 seconds
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

  // Check if notification is an order
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
                  
                  // Debug log to check notification data structure
                  console.log(`Notification ${notification.id}:`, notification);

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

                          {isExpanded ? (
                            <div className="bg-muted dark:bg-gray-700 p-3 rounded-md border dark:border-gray-600">
                              {isOrder ? (
                                <OrderNotificationContent notification={notification} />
                              ) : (
                                <p className="whitespace-pre-wrap break-words text-foreground dark:text-white">
                                  {notification.description || "Без описания"}
                                </p>
                              )}
                            </div>
                          ) : (
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

// Component for formatting order notification content
const OrderNotificationContent = ({ notification }: { notification: any }) => {
  console.log("OrderNotificationContent received:", notification);
  
  // If we have items directly in the notification, use those
  if (notification.items && Array.isArray(notification.items) && notification.items.length > 0) {
    console.log("Using direct items from notification:", notification.items);
    return (
      <div className="space-y-4">
        {/* Address */}
        {notification.address && (
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">Адрес доставки:</span>
            <span className="text-gray-800 dark:text-gray-200">{notification.address}</span>
          </div>
        )}
        
        {/* Items */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 dark:text-gray-300">Товары:</h4>
          <div className="space-y-4 mt-2">
            {notification.items.map((item: any, index: number) => (
              <div key={index} className="bg-background dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Количество: {item.quantity} шт.</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Цена: {item.price ? item.price.toLocaleString() : 0} ₽</p>
                  </div>
                  <p className="font-bold text-foreground dark:text-white">{item.price && item.quantity ? (item.price * item.quantity).toLocaleString() : 0} ₽</p>
                </div>
                {item.id && (
                  <div className="mt-2 flex items-center gap-1">
                    <Link className="h-4 w-4 text-blue-500" />
                    <a 
                      href={`/shop/${item.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Перейти к товару
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Total */}
        {notification.total !== undefined && (
          <div className="flex justify-between items-center border-t pt-2 mt-2 dark:border-gray-700">
            <span className="font-medium text-gray-700 dark:text-gray-300">Итого:</span>
            <span className="font-bold text-lg text-foreground dark:text-white">{notification.total.toLocaleString()} ₽</span>
          </div>
        )}
        
        {/* Comments */}
        {notification.comments && notification.comments !== "Комментариев нет" && (
          <div className="border-t pt-2 mt-2 dark:border-gray-700">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Комментарии к заказу:</h4>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mt-1">{notification.comments}</p>
          </div>
        )}
      </div>
    );
  }

  // Fallback to parsing the description if items aren't directly available
  const description = notification.description || '';
  console.log("Parsing description:", description);
  
  // Split description into sections
  const sections = description.split("======");
  console.log("Sections found:", sections.length);
  
  // Extract important data for display
  const contactInfoSection = sections.find(s => s && s.includes("КОНТАКТНАЯ ИНФОРМАЦИЯ"));
  const totalInfoSection = sections.find(s => s && s.includes("ИТОГОВАЯ ИНФОРМАЦИЯ"));
  const commentsSection = sections.find(s => s && s.includes("КОММЕНТАРИИ К ЗАКАЗУ"));
  
  // Find the section with ordered products
  const orderItemsSection = sections.find(s => s && s.includes("ЗАКАЗАННЫЕ ТОВАРЫ"));
  console.log("Order items section:", orderItemsSection);
  
  // Function to extract and format order items
  const renderOrderItems = () => {
    if (!orderItemsSection) {
      console.log("N" + orderItemsSection);
      console.log("No order items section found in description");
      return <p className="text-gray-500 dark:text-gray-400">Информация о товарах недоступна</p>;
    }
    
    // Check if section contains actual items data - handle trimming
    let itemsText = "";
    if (orderItemsSection.includes("ЗАКАЗАННЫЕ ТОВАРЫ")) {
      // Extract text after header
      itemsText = orderItemsSection.split("ЗАКАЗАННЫЕ ТОВАРЫ")[1].trim();
      console.log("Items text after extraction:", itemsText);
    }
    
    if (!itemsText) {
      console.log("Items text is empty");
      return <p className="text-gray-500 dark:text-gray-400">Информация о товарах недоступна</p>;
    }
    
    // Try to match product items using regex
    const itemsPattern = /\[Товар \d+\]([^[]+)/g;
    const itemsMatches = [...itemsText.matchAll(itemsPattern)];
    console.log("Items matches count:", itemsMatches.length);
    
    // If no matches using regex pattern, display raw text
    if (itemsMatches.length === 0) {
      console.log("No item matches found with regex, displaying raw");
      return (
        <div className="bg-background dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
          <p className="whitespace-pre-wrap text-foreground dark:text-white">{itemsText}</p>
        </div>
      );
    }
    
    // If we found matches, display them in a structured way
    return (
      <div className="space-y-4 mt-2">
        {itemsMatches.map((match, index) => {
          const itemText = match[1].trim();
          
          // Extract item data
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
          
          // Extract product ID from URL
          let productId = null;
          if (url) {
            const productIdMatch = url.match(/\/shop\/(\d+)/);
            if (productIdMatch) {
              productId = productIdMatch[1];
            }
          }
          
          return (
            <div key={index} className="bg-background dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Количество: {quantity}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Цена: {price}</p>
                </div>
                <p className="font-bold">{sum}</p>
              </div>
              {productId && (
                <div className="mt-2 flex items-center gap-1">
                  <Link className="h-4 w-4 text-blue-500" />
                  <a 
                    href={`/shop/${productId}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
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
  
  // Formatted address display
  const getAddressFromSection = (section: string | undefined) => {
    if (!section) return null;
    const addressMatch = section.match(/• Адрес доставки: ([^\n]+)/);
    return addressMatch ? addressMatch[1] : null;
  };
  
  // Get total order sum
  const getTotalFromSection = (section: string | undefined) => {
    if (!section) return null;
    const totalMatch = section.match(/• Общая сумма заказа: ([^\n]+)/);
    return totalMatch ? totalMatch[1] : null;
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
  const comments = getCommentsFromSection(commentsSection);
  
  return (
    <div className="space-y-4">
      {address && (
        <div className="flex items-start gap-2">
          <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">Адрес доставки:</span>
          <span className="text-gray-800 dark:text-gray-200">{address}</span>
        </div>
      )}
      
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 dark:text-gray-300">Товары:</h4>
        {renderOrderItems()}
      </div>
      
      {totalAmount && (
        <div className="flex justify-between items-center border-t pt-2 mt-2 dark:border-gray-700">
          <span className="font-medium text-gray-700 dark:text-gray-300">Итого:</span>
          <span className="font-bold text-lg">{totalAmount}</span>
        </div>
      )}
      
      {comments && (
        <div className="border-t pt-2 mt-2 dark:border-gray-700">
          <h4 className="font-medium text-gray-700 dark:text-gray-300">Комментарии к заказу:</h4>
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mt-1">{comments}</p>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
