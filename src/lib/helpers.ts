/* Helper utilities for the Food Delivery app */

/* ---------- Currency formatting ---------- */
export function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/* ---------- Order status helpers ---------- */
export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
] as const;

export function nextStatus(current: string): string {
  const idx = ORDER_STATUSES.indexOf(current as (typeof ORDER_STATUSES)[number]);
  if (idx === -1 || idx === ORDER_STATUSES.length - 1) return current;
  return ORDER_STATUSES[idx + 1];
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case 'Pending':
      return 'badge badge-warning';
    case 'Confirmed':
      return 'badge badge-info';
    case 'Preparing':
      return 'badge badge-warning';
    case 'Out for Delivery':
      return 'badge badge-info';
    case 'Delivered':
      return 'badge badge-success';
    default:
      return 'badge';
  }
}

/* ---------- Star rating rendering ---------- */
export function ratingStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let stars = '★'.repeat(full);
  if (half) stars += '☆';
  return stars.padEnd(5, '☆');
}

/* ---------- Cart math ---------- */
export const DELIVERY_CHARGE = 30;
export const GST_RATE = 0.05; // 5% GST

export function calcTotals(subtotal: number) {
  const deliveryCharge = subtotal > 0 ? DELIVERY_CHARGE : 0;
  const gst = +(subtotal * GST_RATE).toFixed(2);
  const grandTotal = +(subtotal + deliveryCharge + gst).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), deliveryCharge, gst, grandTotal };
}

/* ---------- Date formatting ---------- */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ---------- Validation helpers ---------- */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

export function isValidPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}
