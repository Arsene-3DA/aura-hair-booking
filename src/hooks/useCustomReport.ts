import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  type: 'reservations' | 'revenus' | 'no-shows';
}

export interface ReportData {
  report_date: string;
  status: string;
  service: string;
  total_bookings: number;
  confirmed_bookings: number;
  declined_bookings: number;
  pending_bookings: number;
  no_shows: number;
  total_revenue: number;
  avg_service_price: number;
  unique_stylists: number;
  unique_clients: number;
  year: number;
  month: number;
  week: number;
  day_of_week: number;
}

export interface ChartData {
  date: string;
  value: number;
  label: string;
}

export function useCustomReport(filters: ReportFilters) {
  const [data, setData] = useState<ReportData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDateStr = format(filters.startDate, 'yyyy-MM-dd');
      const endDateStr = format(filters.endDate, 'yyyy-MM-dd');

      // Query reservations data directly and aggregate it
      const { data: reservationsData, error: fetchError } = await supabase
        .from('new_reservations')
        .select(`
          id,
          scheduled_at,
          status,
          created_at,
          services (
            name,
            price
          )
        `)
        .gte('scheduled_at', startDateStr)
        .lte('scheduled_at', endDateStr)
        .order('scheduled_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Process the data to match ReportData interface
      const processedData = processReservationsData(reservationsData || []);
      setData(processedData);
      
      // Préparer les données pour les graphiques selon le type de rapport
      const processedChartData = processDataForChart(processedData, filters.type);
      setChartData(processedChartData);

    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const processReservationsData = (reservations: any[]): ReportData[] => {
    const groupedByDate = new Map<string, any>();

    reservations.forEach(reservation => {
      const date = format(new Date(reservation.scheduled_at), 'yyyy-MM-dd');
      
      if (!groupedByDate.has(date)) {
        groupedByDate.set(date, {
          report_date: date,
          status: 'mixed',
          service: 'Mixed Services',
          total_bookings: 0,
          confirmed_bookings: 0,
          declined_bookings: 0,
          pending_bookings: 0,
          no_shows: 0,
          total_revenue: 0,
          avg_service_price: 0,
          unique_stylists: 1,
          unique_clients: 1,
          year: new Date(reservation.scheduled_at).getFullYear(),
          month: new Date(reservation.scheduled_at).getMonth() + 1,
          week: Math.ceil(new Date(reservation.scheduled_at).getDate() / 7),
          day_of_week: new Date(reservation.scheduled_at).getDay()
        });
      }

      const dayData = groupedByDate.get(date);
      dayData.total_bookings++;
      
      switch (reservation.status) {
        case 'confirmed':
          dayData.confirmed_bookings++;
          break;
        case 'declined':
          dayData.declined_bookings++;
          break;
        case 'pending':
          dayData.pending_bookings++;
          break;
        case 'no_show':
          dayData.no_shows++;
          break;
      }

      if (reservation.services?.price) {
        dayData.total_revenue += Number(reservation.services.price);
      }
    });

    // Calculate average prices
    groupedByDate.forEach(dayData => {
      if (dayData.total_bookings > 0) {
        dayData.avg_service_price = dayData.total_revenue / dayData.total_bookings;
      }
    });

    return Array.from(groupedByDate.values());
  };

  const processDataForChart = (data: ReportData[], type: string): ChartData[] => {
    const groupedData = new Map<string, number>();

    data.forEach(row => {
      const date = row.report_date;
      let value = 0;

      switch (type) {
        case 'reservations':
          value = row.total_bookings;
          break;
        case 'revenus':
          value = Number(row.total_revenue);
          break;
        case 'no-shows':
          value = row.no_shows;
          break;
      }

      const currentValue = groupedData.get(date) || 0;
      groupedData.set(date, currentValue + value);
    });

    return Array.from(groupedData.entries()).map(([date, value]) => ({
      date,
      value,
      label: format(new Date(date), 'dd/MM')
    }));
  };

  return {
    data,
    chartData,
    loading,
    error,
    refetch: fetchReportData
  };
}