export type PaymentMethod = 'QR Code' | 'Credit/Debit' | 'Paypal' | 'True Wallet';

export interface PackageData {
  /** ข้อความบนการ์ด Package ในหน้า Order */
  name: string;
  /** ราคาที่คาดหวัง (THB) ตามที่แสดงบนหน้า /order ณ วันที่เขียน Test */
  price: number;
}

/** User สำหรับทำรายการทดสอบ */
export const TEST_USER = process.env.TEST_USER ?? 'TESTT1';

// ราคาจากหน้า https://www.bullvpn.com/order (สกุลเงิน THB)
// หมายเหตุ: ราคาอาจเปลี่ยนตามโปรโมชัน ให้แก้ตัวเลขตรงนี้ที่เดียว
export const PACKAGES: PackageData[] = [
  { name: '2 Years', price: 2618 },
  { name: '1 Year', price: 1493 },
  { name: '6 Months', price: 977 },
  { name: '3 Months', price: 552 },
  { name: '1 Month', price: 212 },
  { name: '7 days', price: 99 },
];

// ช่องทางที่ต้องทดสอบ (ตามโจทย์: QR Code หรือ Credit Card)
export const PAYMENT_METHODS: PaymentMethod[] = ['QR Code', 'Credit/Debit'];
