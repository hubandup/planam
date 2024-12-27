import { format, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export const isDatePassed = (date) => {
  if (!date) return false;
  return isBefore(new Date(date), startOfDay(new Date()));
};

export const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
};

export const getDateClassName = (date) => {
  return isDatePassed(date) ? 'text-red-500' : 'text-gray-500';
};