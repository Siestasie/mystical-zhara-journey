
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AccountSettings = () => {
  const { user, setUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [name, setName] = useState(user?.name || "");
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled || false);
  const [deliveryNotes, setDeliveryNotes] = useState(user?.deliveryNotes || "");
  const [alternativePhone, setAlternativePhone] = useState(user?.alternativePhone || "");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Пароль успешно изменен");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error("Ошибка при изменении пароля");
      }
    } catch (error) {
      toast.error("Ошибка при изменении пароля");
    }
  };

  const handleInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/update-user-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          phone,
          address,
          name,
          notificationsEnabled,
          deliveryNotes,
          alternativePhone,
        }),
      });

      if (response.ok) {
        const updatedUser = {
          ...user!,
          phone,
          address,
          name,
          notificationsEnabled,
          deliveryNotes,
          alternativePhone,
        };
        setUser(updatedUser);
        toast.success("Информация успешно обновлена");
      } else {
        toast.error("Ошибка при обновлении информации");
      }
    } catch (error) {
      toast.error("Ошибка при обновлении информации");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInfoUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Основной телефон</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Основной телефон"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternativePhone">Дополнительный телефон</Label>
                <Input
                  id="alternativePhone"
                  type="tel"
                  placeholder="Дополнительный телефон"
                  value={alternativePhone}
                  onChange={(e) => setAlternativePhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Адрес"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryNotes">Примечания к доставке</Label>
                <Textarea
                  id="deliveryNotes"
                  placeholder="Особые пожелания к доставке"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
                <Label htmlFor="notifications">Получать уведомления о заказах</Label>
              </div>

              <Button type="submit">Обновить информацию</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Изменить пароль</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Текущий пароль</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Текущий пароль"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Новый пароль"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <Button type="submit">Изменить пароль</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountSettings;
