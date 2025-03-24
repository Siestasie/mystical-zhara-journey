import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

const registerSchema = z
  .object({
    name: z.string().min(2, "Минимум 2 символа"),
    email: z.string().email("Неверный формат email"),
    password: z.string().min(6, "Минимум 6 символов"),
    confirmPassword: z.string().min(6, "Минимум 6 символов"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthDialogsProps {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  isResetPasswordOpen: boolean;
  onLoginClose: () => void;
  onRegisterClose: () => void;
  onResetPasswordClose: () => void;
}

export function AuthDialogs({ isLoginOpen, isRegisterOpen, isResetPasswordOpen, onLoginClose, onRegisterClose, onResetPasswordClose}: AuthDialogsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { setUser } = useAuth();
  const [resendTimer, setResendTimer] = useState(60); // 60 секунд таймер
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    const shouldOpenLogin = sessionStorage.getItem('openLoginDialog');
    if (shouldOpenLogin === 'true') {
      const openLoginEvent = new CustomEvent('open-login-dialog');
      document.dispatchEvent(openLoginEvent);
      sessionStorage.removeItem('openLoginDialog');
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!canResend && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    if (resendTimer === 0) {
      setCanResend(true);
      setResendTimer(60);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [canResend, resendTimer]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const resetPasswordForm = useForm<{ email: string }>({
    resolver: zodResolver(z.object({
      email: z.string().email("Неверный формат email"),
    })),
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://85.192.30.34:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
      
      if (!response.ok) {
        toast({
          title: "Ошибка",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
  
      setUser(result.user);
      toast({
        title: "Успешно",
        description: "Вы успешно вошли!"
      });
      onLoginClose();
    } catch (error) {
      console.error('Ошибка запроса:', error);
      toast({
        title: "Ошибка",
        description: "Что-то пошло не так. Попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://85.192.30.34:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (response.ok) {
        setRegisteredEmail(data.email);
        toast({
          title: "Успешно",
          description: "Регистрация прошла успешно! Пожалуйста, проверьте вашу почту для подтверждения аккаунта."
        });
      } else {
        toast({
          title: "Ошибка",
          description: responseData.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка сервера",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    if (!registeredEmail || !canResend) return;
    
    try {
      setCanResend(false);
      const response = await fetch('http://85.192.30.34:3000/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Письмо с подтверждением отправлено повторно"
        });
      } else {
        setCanResend(true);
        toast({
          title: "Ошибка",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      setCanResend(true);
      toast({
        title: "Ошибка",
        description: "Ошибка при отправке письма",
        variant: "destructive"
      });
    }
  };

  const onResetPassword = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://85.192.30.34:3000/api/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Инструкции по сбросу пароля отправлены на ваш email"
        });
        setShowResetPassword(false);
      } else {
        toast({
          title: "Ошибка",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при отправке запроса",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
            <div className="flex justify-center mt-2">
              <Button 
                type="button" 
                variant="link" 
                className="text-muted-foreground hover:text-primary" 
                onClick={() => {
                  onLoginClose();
                  setShowResetPassword(true);
                }}
              >
                Забыли пароль?
              </Button>
            </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRegisterOpen} onOpenChange={onRegisterClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Регистрация</DialogTitle>
          </DialogHeader>
          {registeredEmail ? (
            <div className="space-y-4">
              <p className="text-center">
                Письмо с подтверждением отправлено на адрес {registeredEmail}
              </p>
              <Button 
                onClick={handleResendVerification}
                className="w-full"
                variant="outline"
                disabled={!canResend}
              >
                {canResend 
                  ? "Отправить письмо повторно" 
                  : `Повторная отправка через ${resendTimer} сек`}
              </Button>
              <Button 
                onClick={() => {
                  setRegisteredEmail(null);
                  registerForm.reset();
                }}
                className="w-full"
              >
                Регистрация нового аккаунта
              </Button>
            </div>
          ) : (
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
                <FormField 
                  control={registerForm.control} 
                  name="confirmPassword" 
                  render={({ field }) => (
                  <FormItem>
                    <FormLabel>Повторите пароль</FormLabel>
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
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Сброс пароля</DialogTitle>
          </DialogHeader>
          <Form {...resetPasswordForm}>
            <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4">
              <FormField
                control={resetPasswordForm.control}
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                Отправить Запрос на сброс пароля
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
