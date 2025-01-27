import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

const AdminPanel = () => {
  const { data: visitorCount } = useQuery({
    queryKey: ['visitorCount'],
    queryFn: async () => {
      // This is a placeholder. You'll need to implement actual visitor tracking
      return 100;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Панель администратора</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Статистика посещений</h3>
              <p className="text-3xl font-bold text-purple-600">{visitorCount} посетителей</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;