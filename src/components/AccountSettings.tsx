import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AccountSettings = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");

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
        }),
      });

      if (response.ok) {
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
            <CardTitle>Изменить пароль</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                type="password"
                placeholder="Текущий пароль"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Новый пароль"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button type="submit">Изменить пароль</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Дополнительная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInfoUpdate} className="space-y-4">
              <Input
                type="tel"
                placeholder="Телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Адрес"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Button type="submit">Обновить информацию</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountSettings;