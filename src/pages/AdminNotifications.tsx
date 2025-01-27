import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Notification {
  id: number;
  name: string;
  phone: string;
  email: string;
  description: string;
  createdAt: string;
  isRead: boolean;
}

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: 1,
    name: "Иван Петров",
    phone: "+7 999 123-45-67",
    email: "ivan@example.com",
    description: "Нужна консультация по установке кондиционера в квартире",
    createdAt: "2024-02-20T10:30:00",
    isRead: false
  },
  {
    id: 2,
    name: "Мария Сидорова",
    phone: "+7 999 765-43-21",
    email: "maria@example.com",
    description: "Интересует обслуживание системы кондиционирования",
    createdAt: "2024-02-19T15:45:00",
    isRead: true
  }
];

const AdminNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Commented out real API call, using mock data instead
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // Commented out actual API call
      // const response = await fetch('http://localhost:3000/api/notifications');
      // if (!response.ok) {
      //   throw new Error('Network response was not ok');
      // }
      // return response.json();
      
      // Using mock data
      return mockNotifications;
    },
  });

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
          <ScrollArea className="h-[500px] rounded-md border p-4">
            <div className="space-y-4">
              {notifications?.map((notification) => (
                <Card key={notification.id} className={notification.isRead ? 'bg-gray-50' : 'bg-white'}>
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
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Телефон:</strong> {notification.phone}</p>
                      <p><strong>Email:</strong> {notification.email}</p>
                      <p><strong>Описание:</strong> {notification.description}</p>
                    </div>
                  </CardContent>
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