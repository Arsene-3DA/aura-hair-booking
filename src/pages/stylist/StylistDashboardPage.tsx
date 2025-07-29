import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useStylistStats } from '@/hooks/useStylistStats';
import { KPICard } from '@/components/stylist/KPICard';
import { DashboardSkeleton } from '@/components/stylist/SkeletonLoader';
import { Calendar, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

const StylistDashboardPage = () => {
  const { userProfile } = useRoleAuth();
  const stats = useStylistStats(userProfile?.user_id);

  // Memoized revenue data for better performance
  const revenueData = useMemo(() => [
    { date: '1 Jan', revenue: 250 },
    { date: '5 Jan', revenue: 180 },
    { date: '10 Jan', revenue: 320 },
    { date: '15 Jan', revenue: 290 },
    { date: '20 Jan', revenue: 410 },
    { date: '25 Jan', revenue: 350 },
    { date: '30 Jan', revenue: 480 },
  ], []);

  if (stats.loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Bonjour {userProfile?.full_name || 'Styliste'}, voici un aperçu de votre activité
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Rendez-vous aujourd'hui"
          value={stats.totalToday}
          icon={Calendar}
          change="+2 par rapport à hier"
          changeType="positive"
        />
        <KPICard
          title="Confirmés"
          value={stats.confirmed}
          icon={CheckCircle}
          change={`${Math.round((stats.confirmed / stats.totalToday) * 100) || 0}% du total`}
          changeType="positive"
        />
        <KPICard
          title="En attente"
          value={stats.pending}
          icon={Clock}
          change="À valider"
          changeType="neutral"
        />
        <KPICard
          title="No-show 30j"
          value={stats.noShow30d}
          icon={AlertTriangle}
          change="-1 ce mois"
          changeType="positive"
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenus des 30 derniers jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}€`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}€`, 'Revenus']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StylistDashboardPage;