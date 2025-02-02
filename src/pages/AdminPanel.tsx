import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart } from "lucide-react";
import { toast } from "sonner";

const AdminPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputdiscount, setInputdiscount] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputdiscount(event.target.value);
  };

  const updateDiscount = async () => {
    try {
      const numericDiscount = parseFloat(inputdiscount);
      
      if (isNaN(numericDiscount)) {
        toast.error("Пожалуйста, введите корректное число");
        return;
      }

      const response = await fetch('http://localhost:3000/api/update-discount', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Discount: numericDiscount }),
      });

      if (response.ok) {
        toast.success('Скидка успешно обновлена');
        setInputdiscount('');
      } else {
        toast.error('Ошибка при обновлении скидки');
      }
    } catch (error) {
      toast.error('Произошла ошибка при отправке данных');
      console.error('Ошибка:', error);
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
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Панель администратора</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Управление скидкой</h3>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={inputdiscount}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Введите процент скидки..."
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={updateDiscount}
                  >
                    Применить скидку
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;