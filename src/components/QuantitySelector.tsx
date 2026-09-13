import { Minus, Plus } from 'lucide-react';
import './QuantitySelector.css';

interface Props {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  size?: 'sm' | 'md';
}

export default function QuantitySelector({ quantity, onDecrease, onIncrease, size = 'md' }: Props) {
  return (
    <div className={`qty-selector qty-${size}`}>
      <button onClick={onDecrease} className="qty-btn" aria-label="Decrease">
        <Minus size={size === 'sm' ? 14 : 16} />
      </button>
      <span className="qty-value">{quantity}</span>
      <button onClick={onIncrease} className="qty-btn" aria-label="Increase">
        <Plus size={size === 'sm' ? 14 : 16} />
      </button>
    </div>
  );
}
