import { LOCALE } from './constants';

export default function formatDate(value) {
  return new Date(value).toLocaleDateString(LOCALE, { year: 'numeric', month: 'short', day: 'numeric' });
}
