import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, TrendingUp, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useCustomReport, ReportFilters } from '@/hooks/useCustomReport';
import { cn } from "@/lib/utils";

const AdminReports = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date()
  });
  
  const [reportType, setReportType] = useState<'reservations' | 'revenus' | 'no-shows'>('reservations');

  const filters: ReportFilters = {
    startDate: dateRange?.from || new Date(2024, 0, 1),
    endDate: dateRange?.to || new Date(),
    type: reportType
  };

  const { data, chartData, loading, error } = useCustomReport(filters);

  const exportToPDF = async () => {
    try {
      // Lazy load pdfmake pour réduire la taille du bundle principal
      const pdfMake = (await import('pdfmake/build/pdfmake')).default;
      const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
      
      // Initialiser pdfMake
      pdfMake.vfs = pdfFonts.pdfMake.vfs;

      const docDefinition = {
        content: [
          {
            text: 'Rapport Administrateur',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          {
            text: `Période: ${format(filters.startDate, 'dd/MM/yyyy', { locale: fr })} - ${format(filters.endDate, 'dd/MM/yyyy', { locale: fr })}`,
            style: 'subheader',
            margin: [0, 0, 0, 10]
          },
          {
            text: `Type de rapport: ${reportType}`,
            style: 'subheader',
            margin: [0, 0, 0, 20]
          },
          {
            text: 'Résumé des données:',
            style: 'subheader',
            margin: [0, 0, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                ['Date', 'Réservations totales', 'Confirmées', 'Revenus'],
                ...data.slice(0, 10).map(row => [
                  format(new Date(row.report_date), 'dd/MM/yyyy', { locale: fr }),
                  row.total_bookings.toString(),
                  row.confirmed_bookings.toString(),
                  `$${row.total_revenue} CAD`
                ])
              ]
            },
            layout: 'lightHorizontalLines'
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true
          },
          subheader: {
            fontSize: 14,
            bold: true
          }
        }
      };

      pdfMake.createPdf(docDefinition).download(`rapport-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      // Fallback: simple alert ou toast
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'reservations': return 'Réservations';
      case 'revenus': return 'Revenus';
      case 'no-shows': return 'No-shows';
      default: return type;
    }
  };

  const totalBookings = data.reduce((sum, row) => sum + row.total_bookings, 0);
  const totalRevenue = data.reduce((sum, row) => sum + Number(row.total_revenue), 0);
  const totalNoShows = data.reduce((sum, row) => sum + row.no_shows, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Rapports personnalisés</h1>
        <p className="text-muted-foreground">
          Générez et exportez des rapports détaillés sur l'activité de votre salon
        </p>
      </div>

      {/* Filtres */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtres du rapport</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Sélection de la période */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Période</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd LLL y", { locale: fr })} -{" "}
                          {format(dateRange.to, "dd LLL y", { locale: fr })}
                        </>
                      ) : (
                        format(dateRange.from, "dd LLL y", { locale: fr })
                      )
                    ) : (
                      <span>Sélectionner une période</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Type de rapport */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Type de rapport</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reservations">Réservations</SelectItem>
                  <SelectItem value="revenus">Revenus</SelectItem>
                  <SelectItem value="no-shows">No-shows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bouton export */}
            <div className="flex items-end">
              <Button onClick={exportToPDF} className="gap-2">
                <Download className="h-4 w-4" />
                Exporter PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Sur la période sélectionnée
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)} CAD</div>
            <p className="text-xs text-muted-foreground">
              Revenus générés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-shows</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNoShows}</div>
            <p className="text-xs text-muted-foreground">
              Rendez-vous manqués
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Chargement des données...</div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64 text-red-500">
              Erreur: {error}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique linéaire */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution - {getReportTypeLabel(reportType)}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Graphique en barres */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par jour</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table des données détaillées */}
      {data.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Données détaillées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Total</th>
                    <th className="text-left p-2">Confirmées</th>
                    <th className="text-left p-2">En attente</th>
                    <th className="text-left p-2">Refusées</th>
                    <th className="text-left p-2">No-shows</th>
                    <th className="text-left p-2">Revenus</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 20).map((row, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">{format(new Date(row.report_date), 'dd/MM/yyyy', { locale: fr })}</td>
                      <td className="p-2">{row.total_bookings}</td>
                      <td className="p-2">{row.confirmed_bookings}</td>
                      <td className="p-2">{row.pending_bookings}</td>
                      <td className="p-2">{row.declined_bookings}</td>
                      <td className="p-2">{row.no_shows}</td>
                      <td className="p-2">${Number(row.total_revenue).toFixed(2)} CAD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminReports;