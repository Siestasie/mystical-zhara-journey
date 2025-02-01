import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";

const AdminPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  let [inputValue, setInputValue] = useState('');

  const { data: visitorCount } = useQuery({
    queryKey: ['visitorCount'],
    queryFn: async () => {
      // This is a placeholder. You'll need to implement actual visitor tracking
      return 100;
    },
  });

  const handleChange = (event) => {
    setInputValue(event.target.value);
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
            <label>
              Введите текст:
              <input
                type="text"
                value={inputValue}
                onChange={handleChange} // Обработчик изменения значения
              />
            </label>
            <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(true)}
              >
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Админ панель</span>
              </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;