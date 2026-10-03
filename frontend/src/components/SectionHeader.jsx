import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function SectionHeader({ title, subtitle, linkTo, linkLabel = 'View all' }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="text-muted-nova mb-0">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="section-link">
          {linkLabel} <Icon name="arrowRight" size={16} />
        </Link>
      )}
    </div>
  );
}
