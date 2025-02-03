import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: string;
  image?: string;
}

const Blog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [newPost, setNewPost] = useState({ 
    title: "", 
    content: "",
    image: "" 
  });
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery<BlogPost[]>({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/blog-posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    }
  });

  const addPostMutation = useMutation({
    mutationFn: async (postData: typeof newPost) => {
      const response = await fetch('http://localhost:3000/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error('Failed to add post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({
        title: "Успешно",
        description: "Пост успешно добавлен",
      });
      setIsOpen(false);
      setNewPost({ title: "", content: "", image: "" });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить пост",
        variant: "destructive",
      });
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          {user?.isAdmin && (
            <Button 
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Добавить пост
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="animate-fade-in">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  Автор: {post.author} | {new Date(post.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.image && (
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <img 
                      src={`http://localhost:3000${post.image}`}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="whitespace-pre-wrap">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый пост</DialogTitle>
            </DialogHeader>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                addPostMutation.mutate(newPost);
              }}
              className="space-y-4"
            >
              <Input
                placeholder="Заголовок"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <Textarea
                placeholder="Содержание"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                required
                className="min-h-[200px]"
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <Button type="submit" className="w-full">
                Опубликовать
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Blog;