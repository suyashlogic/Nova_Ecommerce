import { LOCALE } from './constants';

export default function formatDateTime(value) {
  return new Date(value).toLocaleString(LOCALE, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
