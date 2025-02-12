
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string[];
    discount: number;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Продукт успешно удален');
    },
    onError: () => {
      toast.error('Ошибка при удалении продукта');
    }
  });

  function calculateDiscountPrice(price, percentage) {
    if (isNaN(percentage) || percentage < 0) {
        console.error("Введите корректное число!");
        return price; // Возвращаем исходную цену, если процент некорректен
    }

    // Рассчитываем цену со скидкой
    return Math.round(price * (1 - percentage / 100));
  }

  return (
    <Card className="animate-scale-in">
      <CardHeader className="space-y-2">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img 
            src={`http://localhost:3000${product.image[0]}`}
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardTitle className="text-xl sm:text-2xl line-clamp-2">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex gap-2 w-full">
            <Button className="w-full sm:w-auto custom-button1" onClick={() => navigate(`/shop/${product.id}`)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Подробнее
            </Button>
            {user?.isAdmin && (
              <>
                <Button className="custom-button1" variant="outline" onClick={() => navigate(`/shop/${product.id}`)}>
                  Редактировать
                </Button>
                <Button variant="destructive" size="icon" onClick={() => deleteProductMutation.mutate(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <span className="text-lg sm:text-xl font-bold">{calculateDiscountPrice(product.price, product.discount)} ₽</span>
        </div>
      </CardContent>
    </Card>
  );
};
