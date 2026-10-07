import { expect, type Locator, type Page } from '@playwright/test';
import type { PaymentMethod } from '../test-data/packages';

/** Page Object สำหรับหน้า /order ทั้ง Desktop และ Mobile */
export class OrderPage {
  readonly usernameInput: Locator;
  readonly cookieAgreeButton: Locator;

  constructor(readonly page: Page) {
    // เว็บไม่ได้กำหนด accessible name ให้ช่องนี้ และใช้คนละช่องตามหน้าจอ
    this.usernameInput = page.locator('#email:visible, #emailMobile:visible');
    this.cookieAgreeButton = page.locator('.acceptcookies');
  }

  async goto(): Promise<void> {
    const origin = new URL(process.env.BASE_URL ?? 'https://www.bullvpn.com').origin;
    // ใช้ cookie ของเว็บปิด banner รวมถึง popup ที่อาจโหลดหลังหน้า Order
    await this.page.context().addCookies([
      { name: 'acceptCookies', value: 'true', url: origin },
      { name: 'promoalertcontainer', value: 'true', url: origin },
    ]);
    await this.page.goto('/order');
    await expect(this.page).toHaveURL(/\/order(?:[?#]|$)/);
    await expect(this.usernameInput).toBeVisible();
    // รอให้ JavaScript ของหน้าเริ่มทำงานก่อนกรอกข้อมูล
    await expect(this.summaryPanel().locator('.summary-total')).toContainText('THB');
    await this.acceptCookiesIfShown();
  }

  async acceptCookiesIfShown(): Promise<void> {
    if (await this.cookieAgreeButton.isVisible()) {
      await this.cookieAgreeButton.click();
    }
    const closePromotion = this.page.locator('#close-promo');
    if (await closePromotion.isVisible()) await closePromotion.click();
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.usernameInput.blur();
    await this.expectSummaryToShow(username);
  }

  private packageCard(name: string): Locator {
    return this.page.locator('#frm-order label.price-item').filter({
      has: this.page.locator('.package-name').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) }),
    });
  }

  private async showPackage(name: string): Promise<Locator> {
    const card = this.packageCard(name);
    await expect(card).toHaveCount(1);
    if (!(await card.isVisible())) await this.page.locator('#collapse-button').click();
    await expect(card).toBeVisible();
    return card;
  }

  async selectPackage(name: string): Promise<void> {
    const card = await this.showPackage(name);
    await card.click();
    await expect(card.locator('input[name="package"]')).toBeChecked();
    await expect(this.summaryPanel().locator('.summary-plan')).toContainText(name);
  }

  async selectPaymentMethod(method: PaymentMethod): Promise<void> {
    const targets: Record<PaymentMethod, string> = {
      'QR Code': '#collapseQr',
      'Credit/Debit': '#collapseCard',
      Paypal: '#collapsePaypal',
      'True Wallet': '#collapseTw',
    };
    const target = targets[method];
    const tab = this.page.locator('#payment-method-list [role="tab"]')
      .filter({ has: this.page.getByText(method, { exact: true }) });
    await tab.click();
    await expect(tab.locator('input[name="payment_method"]')).toBeChecked();
    await expect(this.page.locator(target)).toBeVisible();
    await expect(this.summaryPanel()).toHaveAttribute('id', target.slice(1));
  }

  private parsePrice(text: string): number {
    const match = text.match(/([\d,]+(?:\.\d+)?)\s*THB/);
    if (!match) throw new Error(`ไม่พบราคา THB ในข้อความ: ${text}`);
    return Number(match[1].replace(/,/g, ''));
  }

  async getPackageCardPrice(name: string): Promise<number> {
    const card = await this.showPackage(name);
    const price = card.locator('.package-price');
    await expect(price).toHaveText(/[\d,]+\s*THB/);
    // textContent อ่านค่าได้แม้ animation ของ collapse ยังไม่จบใน WebKit
    return this.parsePrice((await price.textContent()) ?? '');
  }

  private summaryPanel(): Locator {
    return this.page.locator('#payment-method-container > .tab-pane.active:visible');
  }

  async getSummaryText(): Promise<string> {
    return (await this.summaryPanel().innerText()).replace(/\s+/g, ' ');
  }

  async getDisplayedTotal(): Promise<number> {
    return this.parsePrice(await this.summaryPanel().locator('.summary-total').innerText());
  }

  async expectSummaryToShow(username: string): Promise<void> {
    await expect(this.summaryPanel().locator('.summary-username')).toHaveText(username);
  }

  async expectTotalToBe(expected: number): Promise<void> {
    await expect.poll(() => this.getDisplayedTotal(), {
      message: `ยอดเงินต้องเท่ากับ ${expected} THB`,
    }).toBe(expected);
  }
}
