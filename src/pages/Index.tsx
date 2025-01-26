import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AirVent, Settings, Wrench, LogIn, UserPlus, DollarSign, Image, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthDialogs } from "@/components/auth/AuthDialogs";

const Index = () => {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Auth Buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsLoginOpen(true)}>
          <LogIn className="h-4 w-4" />
          Войти
        </Button>
        <Button className="flex items-center gap-2" onClick={() => setIsRegisterOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Регистрация
        </Button>
      </div>

      <AuthDialogs
        isLoginOpen={isLoginOpen}
        isRegisterOpen={isRegisterOpen}
        onLoginClose={() => setIsLoginOpen(false)}
        onRegisterClose={() => setIsRegisterOpen(false)}
      />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Профессиональные системы кондиционирования
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Монтаж, обслуживание и ремонт систем кондиционирования любой сложности
          </p>
          <Button size="lg" className="mt-8" onClick={() => navigate("/consultation")}>
            Заказать консультацию <AirVent className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <Button 
            variant="outline" 
            size="lg" 
            className="flex items-center gap-2"
            onClick={() => navigate("/price-list")}
          >
            <DollarSign className="h-5 w-5" />
            Прайс-Лист
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AirVent className="h-6 w-6" />
                Монтаж и установка
              </CardTitle>
              <CardDescription>Профессиональная установка</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Установка кондиционеров и монтаж мультизональных систем любой сложности
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Техническое обслуживание
              </CardTitle>
              <CardDescription>Регулярный сервис</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Чистка, дезинфекция и профилактическое обслуживание систем кондиционирования
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-6 w-6" />
                Ремонт и диагностика
              </CardTitle>
              <CardDescription>Оперативный ремонт</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Диагностика неисправностей и ремонт систем кондиционирования всех типов
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Наши услуги</h2>
        <Carousel className="max-w-3xl mx-auto">
          <CarouselContent>
            <CarouselItem>
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-semibold">Проектирование</h3>
                    <p className="text-gray-600">
                      Профессиональное проектирование мультизональных систем кондиционирования
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
            <CarouselItem>
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-semibold">Монтаж</h3>
                    <p className="text-gray-600">
                      Качественный монтаж систем кондиционирования с гарантией
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
            <CarouselItem>
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-semibold">Обслуживание</h3>
                    <p className="text-gray-600">
                      Регулярное техническое обслуживание и чистка кондиционеров
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* Quick Access Buttons Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 rounded-lg">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <Button 
            size="lg"
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-6 text-lg h-auto"
            onClick={() => navigate("/price-list")}
          >
            <DollarSign className="h-6 w-6" />
            Прайс-Лист
          </Button>
          
          <Button 
            size="lg"
            variant="secondary"
            className="w-full md:w-auto px-8 py-6 text-lg h-auto"
            onClick={() => navigate("/gallery")}
          >
            <Image className="h-6 w-6" />
            Галерея
          </Button>
          
          <Button 
            size="lg"
            variant="secondary"
            className="w-full md:w-auto px-8 py-6 text-lg h-auto"
            onClick={() => navigate("/contacts")}
          >
            <Phone className="h-6 w-6" />
            Контактная информация
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Нужна консультация?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Свяжитесь с нами для получения профессиональной консультации по вашему проекту
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/consultation")}>
            Оставить заявку
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
