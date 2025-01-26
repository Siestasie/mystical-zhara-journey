import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contacts = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <Button
        variant="outline"
        className="mb-8"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Контактная информация</h1>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold mb-1">Телефон</h3>
                  <p className="text-lg">+7 (999) 123-45-67</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold mb-1">Электронная почта</h3>
                  <p className="text-lg">info@aircondition.ru</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-600">
          Мы всегда на связи и готовы ответить на ваши вопросы
        </p>
      </div>
    </div>
  );
};

export default Contacts;