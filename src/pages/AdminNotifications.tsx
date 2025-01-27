import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: number;
  name: string;
  phone: string;
  email: string;
  description: string;
  createdAt: string;
  isRead: boolean;
}

const AdminNotifications = () => {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/notifications');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json() as Promise<Notification[]>;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Уведомления о консультациях</h1>
      <ScrollArea className="h-[600px] rounded-md border p-4">
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
    </div>
  );
};

export default AdminNotifications;