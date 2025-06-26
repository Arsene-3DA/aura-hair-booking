
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Calendar, Users, Clock } from 'lucide-react';

interface ActivityData {
  hairdresserId: number;
  hairdresserName: string;
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  workingHours: string;
  lastActivity: string;
  status: 'active' | 'inactive';
  recentBookings: Array<{
    clientName: string;
    service: string;
    time: string;
    status: string;
  }>;
}

const HairdresserActivityTable = () => {
  // Données simulées des activités
  const activitiesData: ActivityData[] = [
    {
      hairdresserId: 1,
      hairdresserName: 'Anna Martin',
      todayBookings: 4,
      weekBookings: 18,
      monthBookings: 72,
      workingHours: '09:00-20:00',
      lastActivity: 'Il y a 5 min',
      status: 'active',
      recentBookings: [
        { clientName: 'Marie Dubois', service: 'Coupe Femme', time: '09:00', status: 'confirmé' },
        { clientName: 'Sophie Laurent', service: 'Couleur', time: '14:00', status: 'nouveau' }
      ]
    },
    {
      hairdresserId: 2,
      hairdresserName: 'Julie Dubois',
      todayBookings: 3,
      weekBookings: 15,
      monthBookings: 58,
      workingHours: '08:30-19:30',
      lastActivity: 'Il y a 2h',
      status: 'active',
      recentBookings: [
        { clientName: 'Pierre Durand', service: 'Soins', time: '10:00', status: 'confirmé' }
      ]
    },
    {
      hairdresserId: 3,
      hairdresserName: 'Marc Rousseau',
      todayBookings: 5,
      weekBookings: 22,
      monthBookings: 89,
      workingHours: '09:00-19:00',
      lastActivity: 'Il y a 1h',
      status: 'active',
      recentBookings: [
        { clientName: 'Thomas Martin', service: 'Coupe Homme', time: '11:30', status: 'confirmé' },
        { clientName: 'Lucas Petit', service: 'Barbe', time: '15:00', status: 'nouveau' }
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-gold-500" />
          Activité des Coiffeurs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coiffeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Horaires</TableHead>
              <TableHead>Aujourd'hui</TableHead>
              <TableHead>Cette semaine</TableHead>
              <TableHead>Ce mois</TableHead>
              <TableHead>Dernière activité</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activitiesData.map((activity) => (
              <TableRow key={activity.hairdresserId}>
                <TableCell>
                  <div className="font-medium">{activity.hairdresserName}</div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={activity.status === 'active' ? 'default' : 'secondary'}
                    className={activity.status === 'active' ? 'bg-green-500 text-white' : ''}
                  >
                    {activity.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    {activity.workingHours}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-800">
                    {activity.todayBookings} RDV
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">
                    {activity.weekBookings} RDV
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-purple-100 text-purple-800">
                    {activity.monthBookings} RDV
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">{activity.lastActivity}</span>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default HairdresserActivityTable;
