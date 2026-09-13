import { Loader2 } from 'lucide-react';
import './Spinner.css';

export default function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="spinner-wrap">
      <Loader2 className="spinner-spin" size={40} />
      <p className="spinner-label">{label}</p>
    </div>
  );
}
