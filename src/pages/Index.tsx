import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AirVent, Settings, Wrench, LogIn, UserPlus, DollarSign, Image, Phone, PhoneCall, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthDialogs } from "@/components/auth/AuthDialogs";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import Vk_Icon from "@/assets/Icon_Vk.svg";
import Telegram_Icon from "@/assets/Icon_Telegram.svg";
import Whatsapp_Icon from "@/assets/Icon_Whatsapp.svg";
import AdminNotifications from "@/pages/AdminNotifications";
import AdminPanel from "@/pages/AdminPanel";
import "@/additionally.css";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Admin Buttons */}
      <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2">
        <AdminNotifications />
        <AdminPanel />
      </div>

      {/* Theme Toggle and Auth Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <Button 
            variant="outline" 
            className="flex items-center gap-2 custom-button animate-fade-in" 
            onClick={() => {
              logout();
              toast.success('Вы успешно вышли из аккаунта');
            }}
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Выйти</span>
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 custom-button animate-fade-in" 
              onClick={() => setIsLoginOpen(true)}
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Войти</span>
            </Button>
            <Button 
              className="flex items-center gap-2 custom-button1 animate-fade-in" 
              onClick={() => setIsRegisterOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Регистрация</span>
            </Button>
          </>
        )}
      </div>

      <AuthDialogs
        isLoginOpen={isLoginOpen}
        isRegisterOpen={isRegisterOpen}
        onLoginClose={() => setIsLoginOpen(false)}
        onRegisterClose={() => setIsRegisterOpen(false)}
      />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 animate-fade-in">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Профессиональные системы кондиционирования
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Монтаж, обслуживание и ремонт систем кондиционирования любой сложности
          </p>
          <Button size="lg" className="mt-8 custom-button1" onClick={() => navigate("/consultation")}>
            Заказать консультацию <AirVent className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-16 animate-fade-in">
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

      <Separator className="h-px bg-border w-full my-8" />

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 animate-fade-in">
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

      <Separator className="h-px bg-border w-full my-8" />

      {/* Quick Access Buttons Section */}
      <section className="container mx-auto px-4 py-16 bg-accent rounded-lg animate-fade-in">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <Button 
            size="lg"
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-6 text-lg h-auto transition duration-200 custom-button"
            onClick={() => navigate("/price-list")}
          >
            <DollarSign className="h-6 w-6" />
            Прайс-Лист
          </Button>
          
          <Button 
            size="lg"
            variant="secondary"
            className="w-full md:w-auto px-8 py-6 text-lg h-auto custom-button"
            onClick={() => navigate("/gallery")}
          >
            <Image className="h-6 w-6" />
            Галерея
          </Button>
          
          <Button 
            size="lg"
            variant="secondary"
            className="w-full md:w-auto px-8 py-6 text-lg h-auto custom-button"
            onClick={() => navigate("/contacts")}
          >
            <Phone className="h-6 w-6" />
            Контактная информация
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 animate-fade-in">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Нужна консультация?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Свяжитесь с нами для получения профессиональной консультации по вашему проекту
          </p>
          <Button size="lg" className="custom-button" variant="secondary" onClick={() => navigate("/consultation")}>
            Оставить заявку
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 - About */}
            <div>
              <h3 className="text-lg font-semibold mb-4">О нас</h3>
              <p className="text-gray-300">
                Мы специализируемся на профессиональной установке и обслуживании систем кондиционирования. 
                Наша команда экспертов обеспечивает высочайшее качество работ и индивидуальный подход к каждому клиенту.
              </p>
            </div>

            {/* Column 2 - Service Areas */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Зона обслуживания</h3>
              <ul className="space-y-2 text-gray-300">
                <li>г. Мариуполь</li>
                <li>Мангуш</li>
                <li>Сартана</li>
                <li>Талаковка</li>
                <li>Гнутово</li>
              </ul>
            </div>

            {/* Column 3 - Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Быстрые ссылки</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/price-list");
                    }}
                    className="text-gray-300 hover:text-white"
                  >
                    Прайс-лист
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/gallery");
                    }}
                    className="text-gray-300 hover:text-white"
                  >
                    Галерея
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/contacts");
                    }}
                    className="text-gray-300 hover:text-white"
                  >
                    Контактная информация
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4 - Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Связаться с нами</h3>
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-gray-300">
                  <PhoneCall className="h-4 w-4" />
                  +7 (999) 123-45-67
                </p>
                <p className="flex items-center gap-2 text-gray-300">
                  <Mail className="h-4 w-4" />
                  info@aircondition.ru
                </p>
                <div className="flex gap-4 mt-4">
                  <a 
                    href="#" // TODO: Add VK link
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white"
                  >
                    <img src={Vk_Icon} alt="VK" className="h-6 w-6 custom-button" />
                  </a>
                  <a 
                    href="#" // TODO: Add WhatsApp link
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white"
                  >
                    <img src={Whatsapp_Icon} alt="WhatsApp" className="h-6 w-6 custom-button" />
                  </a>
                  <a 
                    href="#" // TODO: Add Telegram link
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white"
                  >
                    <img src={Telegram_Icon} alt="Telegram" className="h-6 w-6 custom-button" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

