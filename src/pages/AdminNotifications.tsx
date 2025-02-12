import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";



const AdminNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Запрос уведомлений
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

  // Мутация для удаления уведомления
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
    },
    onError: (error) => {
      console.error('Ошибка при удалении уведомления:', error);
    },
  });

  const handleDeleteNotification = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  // Загрузка данных
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">Уведомления</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Уведомления о консультациях</DialogTitle>
          </DialogHeader>
          <ScrollArea className="min-h-[200px] max-h-[80vh] rounded-md border p-4">
            <div className="space-y-4">
              {notifications?.map((notification) => (
                <Card key={notification.id} className={notification.isRead ? 'bg-gray-50' : 'primary'}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        Заявка от {notification.name}
                        {!notification.isRead && (
                          <Badge variant="secondary" className="ml-2">
                            Новая
                          </Badge>
                        )}
                      </CardTitle>
                      <span className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="whitespace-pre-wrap break-words overflow-hidden">
                    <div className="space-y-2">
                      <p>
                        <strong>Телефон:</strong>{" "}
                        <a href={`tel:${notification.phone}`} className="text-blue-500 hover:underline">
                          {notification.phone}
                        </a>
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        <a href={`mailto:${notification.email}`} className="text-blue-500 hover:underline">
                          {notification.email}
                        </a>
                      </p>
                      <p><strong>Описание:</strong> {notification.description}</p>
                      
                      {notification.productUrl && (
                        <p>
                          <strong>Ссылка на товар:</strong>{" "}
                          <a
                            href={notification.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline break-all"
                            style={{ overflowWrap: "break-word", wordBreak: "break-all" }}
                          >
                            {notification.productUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  </CardContent>

                  <Button
                    variant="outline"
                    className="flex items-right gap-2"
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <span className="hidden sm:inline">Удалить уведомление</span>
                  </Button>
                </Card>
              ))}
            </div>
          </ScrollArea>

        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminNotifications;