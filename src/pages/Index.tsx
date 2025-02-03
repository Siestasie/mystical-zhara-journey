import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AirVent, Settings, Wrench, LogIn, UserPlus, Image, Phone, PhoneCall, Mail, ShoppingCart, Cog } from "lucide-react";
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
      {/* Admin Buttons - Only show for admin users */}
      {user?.isAdmin && (
        <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2">
          <AdminNotifications />
          <AdminPanel />
        </div>
      )}

      {/* Theme Toggle and Auth Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 custom-button animate-fade-in"
              onClick={() => navigate('/account-settings')}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Настройки аккаунта</span>
            </Button>
            {user.isAdmin && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2 custom-button animate-fade-in"
                onClick={() => navigate('/shop')}
              >
                <Cog className="h-4 w-4" />
                <span className="hidden sm:inline">Управление товарами</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              className="flex items-center gap-2 custom-button animate-fade-in" 
              onClick={() => {
                logout();
                toast({
                  title: "Успешно",
                  description: "Вы успешно вышли из аккаунта",
                });
              }}
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </>
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
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-test">
            Профессиональные системы кондиционирования
          </h1>
          <p className="text-xl text-ColorP max-w-2xl mx-auto">
            Монтаж, обслуживание и ремонт систем кондиционирования любой сложности
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="custom-button1" onClick={() => navigate("/consultation")}>
              Заказать консультацию <AirVent className="ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              className="custom-button1"
              onClick={() => navigate("/shop")}
            >
              Магазин кондиционеров <ShoppingCart className="ml-2" />
            </Button>
          </div>
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
              <p className="text-ColorP">
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
              <p className="text-ColorP">
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
              <p className="text-ColorP">
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
                    <p className="text-ColorP">
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
                    <p className="text-ColorP">
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
                    <p className="text-ColorP">
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
      <section className="container mx-auto px-4 py-16 bg-background rounded-lg animate-fade-in">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <Button 
            size="lg"
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-6 text-lg h-auto transition duration-200 custom-button"
            onClick={() => navigate("/price-list")}
          >
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

      {/* Reviews Section */}
      <section className="container mx-auto px-4 py-16 animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-12">Отзывы наших клиентов</h2>
        <Carousel className="max-w-4xl mx-auto">
          <CarouselContent>
            <CarouselItem>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">Анна Петрова</h3>
                    <p className="text-ColorP italic">
                      "Отличный сервис! Установили кондиционер быстро и профессионально. 
                      Специалисты очень вежливые и компетентные. Рекомендую!"
                    </p>
                    <div className="flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>

            <CarouselItem>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">Михаил Иванов</h3>
                    <p className="text-ColorP italic">
                      "Заказывал установку кондиционера в офис. Всё сделали очень аккуратно и быстро.
                      Цены адекватные, сервис на высоте. Буду обращаться ещё!"
                    </p>
                    <div className="flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>

            <CarouselItem>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">Елена Сидорова</h3>
                    <p className="text-ColorP italic">
                      "Обратилась для установки кондиционера в квартиру. Очень довольна результатом!
                      Мастера работают чисто и аккуратно. Спасибо за отличную работу!"
                    </p>
                    <div className="flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 animate-fade-in">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Нужна консультация?</h2>
          <p className="text-xl text-ColorP max-w-2xl mx-auto">
            Свяжитесь с нами для получения профессиональной консультации по вашему проекту
          </p>
          <Button size="lg" className="custom-button" variant="secondary" onClick={() => navigate("/consultation")}>
            Оставить заявку
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(var(--card-foregroundF))] text-secondary-foreground py-12 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 - About */}
            <div>
              <h3 className="text-white font-semibold mb-4">О нас</h3>
              <p className="text-gray-300">
                Мы специализируемся на профессиональной установке и обслуживании систем кондиционирования. 
                Наша команда экспертов обеспечивает высочайшее качество работ и индивидуальный подход к каждому клиенту.
              </p>
            </div>

            {/* Column 2 - Service Areas */}
            <div>
              <h3 className="text-white font-semibold mb-4">Зона обслуживания</h3>
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
              <h3 className="text-white font-semibold mb-4">Быстрые ссылки</h3>
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
              <h3 className="text-white font-semibold mb-4">Связаться с нами</h3>
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
