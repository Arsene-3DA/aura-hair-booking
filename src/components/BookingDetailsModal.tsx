
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, Calendar, Clock, Scissors } from 'lucide-react';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: number;
    time: string;
    clientName: string;
    phone: string;
    email: string;
    service: string;
    status: string;
    date?: string;
    comments?: string;
  } | null;
}

const BookingDetailsModal = ({ isOpen, onClose, booking }: BookingDetailsModalProps) => {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-gold-500" />
            Détails de la réservation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className="bg-gradient-gold text-white">
              {booking.time}
            </Badge>
            <Badge variant={booking.status === 'confirmé' ? 'default' : 'secondary'}>
              {booking.status}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{booking.clientName}</p>
                <p className="text-sm text-gray-600">Client</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{booking.phone}</p>
                <p className="text-sm text-gray-600">Téléphone</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{booking.email}</p>
                <p className="text-sm text-gray-600">Email</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Scissors className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{booking.service}</p>
                <p className="text-sm text-gray-600">Service demandé</p>
              </div>
            </div>
            
            {booking.date && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{booking.date}</p>
                  <p className="text-sm text-gray-600">Date</p>
                </div>
              </div>
            )}
            
            {booking.comments && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Commentaires :</p>
                <p className="text-sm text-gray-600">{booking.comments}</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1">
              Appeler le client
            </Button>
            <Button className="flex-1 bg-gradient-gold text-white">
              Confirmer RDV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsModal;
