
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CartDropdown = () => {
  const { items, total, removeItem, updateQuantity } = useCart();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {items.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>Корзина</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px] w-full">
          {items.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Корзина пуста
            </div>
          ) : (
            items.map((item) => (
              <DropdownMenuItem key={item.id} className="flex flex-col items-start p-4">
                <div className="flex w-full gap-4">
                  <div className="w-16 h-16 overflow-hidden rounded">
                    <img 
                      src={`http://localhost:3000${item.image[0]}`} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.price.toLocaleString()} ₽ × {item.quantity}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(item.id, item.quantity - 1);
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(item.id, item.quantity + 1);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        className="h-8 w-8 ml-auto"
                        onClick={(e) => {
                          e.preventDefault();
                          removeItem(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        {items.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Итого:</span>
                <span className="font-bold">{total.toLocaleString()} ₽</span>
              </div>
              <Button className="w-full">
                Оформить заказ
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
