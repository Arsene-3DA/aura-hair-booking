/**
 * Formate l'heure au format français "10h00"
 * @param time - Format "HH:MM" ou "HH:mm"
 * @returns Format "10h00"
 */
export const formatTimeToFrench = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const min = minutes.padStart(2, '0');
  return `${hour}h${min}`;
};

/**
 * Formate l'heure ISO au format français "10h00"
 * @param isoTime - Format ISO date string
 * @returns Format "10h00"
 */
export const formatISOTimeToFrench = (isoTime: string): string => {
  const date = new Date(isoTime);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}h${minutes}`;
};

/**
 * Convertit le format français "10h00" vers "HH:MM"
 * @param frenchTime - Format "10h00"
 * @returns Format "10:00"
 */
export const convertFrenchTimeToStandard = (frenchTime: string): string => {
  const match = frenchTime.match(/(\d+)h(\d+)/);
  if (!match) return frenchTime; // Fallback si le format n'est pas reconnu
  
  const hours = parseInt(match[1], 10).toString().padStart(2, '0');
  const minutes = match[2].padStart(2, '0');
  return `${hours}:${minutes}`;
};