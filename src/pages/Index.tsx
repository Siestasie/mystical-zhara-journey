import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Добро пожаловать в будущее
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Откройте для себя новые возможности с нашей инновационной платформой
          </p>
          <Button size="lg" className="mt-8">
            Начать <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Инновации</CardTitle>
              <CardDescription>Передовые технологии</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Используйте самые современные решения для развития вашего бизнеса
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Простота</CardTitle>
              <CardDescription>Интуитивный интерфейс</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Легкое управление и понятная навигация для всех пользователей
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Надежность</CardTitle>
              <CardDescription>Проверенные решения</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Гарантированная стабильность и безопасность ваших данных
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Наши преимущества</h2>
        <Carousel className="max-w-3xl mx-auto">
          <CarouselContent>
            {Array.from({ length: 3 }).map((_, index) => (
              <CarouselItem key={index}>
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-semibold">
                        Преимущество {index + 1}
                      </h3>
                      <p className="text-gray-600">
                        Описание преимущества, которое делает наш продукт уникальным
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Готовы начать?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Присоединяйтесь к нам сегодня и откройте новые возможности
          </p>
          <Button size="lg" variant="secondary">
            Связаться с нами
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;