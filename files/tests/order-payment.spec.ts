import { expect, test } from '@playwright/test';
import { OrderPage } from '../pages/OrderPage';
import {
  PACKAGES,
  PAYMENT_METHODS,
  TEST_USER,
} from '../test-data/packages';

/**
 * Flow: เข้าหน้า Order -> ใส่ User -> เลือก Package -> เลือกช่องทางชำระเงิน
 *       -> ตรวจสอบว่ายอดเงินถูกต้องตาม Package
 *
 * หมายเหตุ: Test หยุดที่หน้าสรุปยอด ไม่กดจ่ายเงินจริง
 * Cross-browser: กำหนดไว้ใน playwright.config.ts (projects)
 */
test.describe(`Order (user: ${TEST_USER}): ยอดเงินต้องตรงกับ Package`, () => {
  for (const pkg of PACKAGES) {
    for (const method of PAYMENT_METHODS) {
      test(`${pkg.name} + ${method} -> ${pkg.price} THB`, async ({ page }) => {
        const orderPage = new OrderPage(page);

        await test.step('เข้าหน้า Order', () => orderPage.goto());

        await test.step(`กรอก Username: ${TEST_USER}`, () =>
          orderPage.enterUsername(TEST_USER));

        await test.step(`เลือก Package: ${pkg.name}`, async () => {
          // ราคาบนการ์ดต้องตรงกับ test data (กันราคาเปลี่ยนโดยไม่รู้ตัว)
          expect(await orderPage.getPackageCardPrice(pkg.name)).toBe(pkg.price);
          await orderPage.selectPackage(pkg.name);
        });

        await test.step(`เลือกช่องทางชำระเงิน: ${method}`, () =>
          orderPage.selectPaymentMethod(method));

        await test.step('ตรวจสอบสรุปรายการและยอดเงิน', async () => {
          await orderPage.expectSummaryToShow(TEST_USER);
          await orderPage.expectTotalToBe(pkg.price);
        });
      });
    }
  }
});
