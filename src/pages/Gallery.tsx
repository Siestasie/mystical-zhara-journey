import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/additionally.css"

const Gallery = () => {
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

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-foreground animate-fade-in">Наши проекты</h1>
        <p className="text-xl text-muted-foreground text-center mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          В этом разделе представлены фотографии наших выполненных работ по установке и обслуживанию систем кондиционирования
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div
              key={index}
              className="aspect-square bg-card rounded-lg flex items-center justify-center animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-muted-foreground">Фото {index}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;