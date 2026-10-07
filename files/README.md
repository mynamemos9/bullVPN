# Playwright Automation Test – Order & Payment

ทดสอบ Flow: เข้าหน้า Order → เลือก Package → เลือกช่องทางชำระเงิน (QR Code / Credit Card) → ตรวจสอบยอดเงินให้ตรงกับ Package

## โครงสร้างโปรเจกต์

```
playwright-order-tests/
├── playwright.config.ts        # ตั้งค่า Cross-browser (Chromium / Firefox / WebKit / Mobile)
├── pages/
│   └── OrderPage.ts            # Page Object Model
├── test-data/
│   └── packages.ts             # ข้อมูล Package, ราคา, ช่องทางชำระเงิน
└── tests/
    └── order-payment.spec.ts   # Test Case (data-driven)
```

## วิธีติดตั้งและรัน

```bash
npm install
npx playwright install        # ดาวน์โหลด browser ทั้งหมด

# รันทุก browser
npm test

# รันเฉพาะ browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# ดู report
npm run report
```

## การทดสอบกับเว็บจริง

1. ค่าเริ่มต้น `BASE_URL` คือ https://www.bullvpn.com (เปลี่ยนได้ผ่าน env)
2. เปิด `/order` และใช้ช่อง `#email` บน Desktop หรือ `#emailMobile` บน Mobile ที่มองเห็นอยู่
3. เปิดแพ็กเกจที่ซ่อนบน Mobile ก่อนเลือก และตรวจยอดจาก `.summary-total` ในช่องทางชำระเงินที่กำลังใช้งาน
4. ราคาที่คาดหวังอยู่ใน `test-data/packages.ts` หากเว็บเปลี่ยนราคา เทสจะล้มเหลวเพื่อให้ตรวจสอบ
5. Username เริ่มต้นคือ `TESTT1` เปลี่ยนได้ผ่าน `TEST_USER`

เทสหยุดที่สรุปรายการ ไม่กด Buy Now ไม่สร้างรายการสั่งซื้อ และไม่ตรวจว่าบัญชีมีอยู่จริง (เว็บตรวจบัญชีเมื่อส่งรายการ)

สำหรับ PowerShell:

```powershell
$env:TEST_USER = 'TESTT1'
npm run test:chromium
```

ใช้ 2 workers เพื่อลดการเปิด browser พร้อมกัน และเก็บ trace เมื่อเทสล้มเหลวแม้ไม่ได้ retry

## จุดเด่นที่ตรงกับโจทย์

- **Cross-browser**: ใช้ `projects` ใน config รันได้ทั้ง Chromium, Firefox, WebKit และ Mobile
- **POM**: Locator และ Action อยู่ใน `OrderPage` แยกจาก Test จึงอ่านง่ายและแก้ไขง่าย
- **Data-driven**: วน Package × ช่องทางชำระเงิน โดยไม่ต้องเขียน Test ซ้ำ
- **Auto-retry assertion**: ใช้ `expect.poll` รอยอดเงินอัปเดต ไม่ใช้ `sleep`
- **Debug ง่าย**: เก็บ trace, screenshot และ video เมื่อ Test ล้มเหลว
