import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import "@/additionally.css"
import { priceconditioners } from "@/prices/priceconditioners"

const PriceList = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          className="absolute top-4 left-4 custom-button1 hidden lg:flex"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>

        <div className="bg-card rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center animate-fade-in">
            Прайс-лист на услуги
          </h1>

          <Accordion type="single" collapsible className="w-full">
            {priceconditioners.map((category, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <AccordionTrigger className="text-lg font-semibold text-foreground">
                  {category.category}
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[70%] text-foreground">Услуга</TableHead>
                        <TableHead className="text-right text-foreground">Стоимость (₽)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category.items.map((item, itemIndex) => (
                        <TableRow 
                          key={itemIndex} 
                          className="animate-fade-in"
                          style={{ animationDelay: `${(index + itemIndex + 1) * 0.1}s` }}
                        >
                          <TableCell className="font-medium text-foreground">{item.service}</TableCell>
                          <TableCell className="text-right text-foreground">
                            {item.price.toLocaleString()} ₽
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="text-sm text-muted-foreground mt-6 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
            * Цены указаны приблизительно и могут варьироваться в зависимости от сложности работ
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceList;