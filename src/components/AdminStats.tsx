
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Scissors, Calendar, TrendingUp } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useReservations } from '@/hooks/useReservations';

const AdminStats = () => {
  const { users, getAllUsers } = useUsers();
  const { reservations, getReservations } = useReservations();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCoiffeurs: 0,
    totalClients: 0,
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    blockedUsers: 0
  });

  useEffect(() => {
    const loadData = async () => {
      await getAllUsers();
      await getReservations();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const coiffeurs = users.filter(u => u.role === 'coiffeur');
      const clients = users.filter(u => u.role === 'client');
      const blocked = users.filter(u => u.status === 'bloque');
      
      const pending = reservations.filter(r => r.status === 'en_attente');
      const confirmed = reservations.filter(r => r.status === 'confirmee');

      setStats({
        totalUsers: users.length,
        totalCoiffeurs: coiffeurs.length,
        totalClients: clients.length,
        totalReservations: reservations.length,
        pendingReservations: pending.length,
        confirmedReservations: confirmed.length,
        blockedUsers: blocked.length
      });
    }
  }, [users, reservations]);

  const statCards = [
    {
      title: "Total Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Coiffeurs",
      value: stats.totalCoiffeurs,
      icon: Scissors,
      color: "text-purple-600"
    },
    {
      title: "Clients",
      value: stats.totalClients,
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Réservations",
      value: stats.totalReservations,
      icon: Calendar,
      color: "text-orange-600"
    },
    {
      title: "En attente",
      value: stats.pendingReservations,
      icon: Calendar,
      color: "text-yellow-600"
    },
    {
      title: "Confirmées",
      value: stats.confirmedReservations,
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Utilisateurs bloqués",
      value: stats.blockedUsers,
      icon: Users,
      color: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
