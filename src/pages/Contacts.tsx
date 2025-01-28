import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/additionally.css"

const Contacts = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 p-8">
      <Button
        variant="outline"
        className="mb-8 custom-button1"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-foreground animate-fade-in">
          Контактная информация
        </h1>
        
        <Card className="mb-8 animate-scale-in">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <Phone className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold mb-1 text-foreground">Телефон</h3>
                  <p className="text-lg text-foreground">+7 (999) 123-45-67</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Mail className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold mb-1 text-foreground">Электронная почта</h3>
                  <p className="text-lg text-foreground">info@aircondition.ru</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Мы всегда на связи и готовы ответить на ваши вопросы
        </p>
      </div>
    </div>
  );
};

export default Contacts;