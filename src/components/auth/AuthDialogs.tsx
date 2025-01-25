import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthDialogsProps {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  onLoginClose: () => void;
  onRegisterClose: () => void;
}

export function AuthDialogs({ isLoginOpen, isRegisterOpen, onLoginClose, onRegisterClose }: AuthDialogsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    console.log("Login data:", data);
    // Здесь будет логика входа после подключения Supabase
    setIsLoading(false);
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    console.log("Register data:", data);
    // Здесь будет логика регистрации после подключения Supabase
    setIsLoading(false);
  };

  return (
    <>
      <Dialog open={isLoginOpen} onOpenChange={onLoginClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Вход в систему</DialogTitle>
          </DialogHeader>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input className="pl-9" placeholder="email@example.com" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input className="pl-9" type="password" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                Войти
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRegisterOpen} onOpenChange={onRegisterClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Регистрация</DialogTitle>
          </DialogHeader>
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input className="pl-9" placeholder="Иван Иванов" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input className="pl-9" placeholder="email@example.com" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input className="pl-9" type="password" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                Зарегистрироваться
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}