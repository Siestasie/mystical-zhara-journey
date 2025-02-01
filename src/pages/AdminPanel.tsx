import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart } from "lucide-react";
import { number } from "zod";

const AdminPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  let [inputdiscount, setInputdiscount] = useState('');

  const { data: visitorCount } = useQuery({
    queryKey: ['visitorCount'],
    queryFn: async () => {
      // This is a placeholder. You'll need to implement actual visitor tracking
      return 100;
    },
  });

  const handleChange = (event) => {
    setInputdiscount(event.target.value);
    updateDiscount
    console.log(inputdiscount)
  };

  const updateDiscount = async (Discount) => {
    try {
      const response = await fetch('http://localhost:3000/api/update-discount', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Discount: inputdiscount }), // Отправка нового значения Discount
      });
      console.log(typeof inputdiscount)

      const result = await response.json();
  
      if (response.ok) {
        console.log('Discount успешно обновлен:', result);
      } else {
        console.error('Ошибка при обновлении Discount:', result.error);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <BarChart className="h-4 w-4" />
        <span className="hidden sm:inline">Админ панель</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Панель администратора</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Статистика посещений</h3>
                <p className="text-3xl font-bold text-purple-600">{visitorCount} посетителей</p>
              </CardContent>
            </Card>
            <div className="space-y-2">
              <label htmlFor="adminInput" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Введите скидку:
              </label>
              <Input
                id="adminInput"
                type="text"
                value={inputdiscount}
                className="w-full transition-colors focus:border-purple-500"
                placeholder="Введите ваш текст..."
              />
            </div>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900"
              onClick={handleChange}
            >
              <BarChart className="h-4 w-4" />
              <span>Применить</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;