import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import "@/additionally.css"

const PriceList = () => {
  const navigate = useNavigate();

  const priceList = [
    { service: "Монтаж сплит-системы (стандартный)", price: 8000 },
    { service: "Демонтаж кондиционера", price: 3000 },
    { service: "Техническое обслуживание (базовое)", price: 4000 },
    { service: "Дозаправка фреоном", price: 3500 },
    { service: "Чистка и дезинфекция", price: 2500 },
    { service: "Диагностика неисправностей", price: 1500 },
    { service: "Ремонт электроники", price: 5000 },
    { service: "Замена компрессора", price: 15000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          className="mb-8 flex items-center gap-2 custom-button1"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Прайс-лист на услуги
          </h1>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[70%]">Услуга</TableHead>
                <TableHead className="text-right">Стоимость (₽)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceList.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.service}</TableCell>
                  <TableCell className="text-right">
                    {item.price.toLocaleString()} ₽
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="text-sm text-gray-500 mt-6 text-center">
            * Цены указаны приблизительно и могут варьироваться в зависимости от сложности работ
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceList;