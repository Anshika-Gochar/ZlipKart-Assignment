/**
 * src/services/email/resend.service.ts
 *
 * ZlipKart order confirmation email via Resend API.
 *
 * CONTRACT:
 *  - Never throws — all errors are caught and logged.
 *  - Returns true if email was sent, false otherwise.
 *  - Order placement is NEVER affected by email outcome.
 *  - If RESEND_API_KEY is not set, emails are silently skipped.
 */

import { Resend } from "resend";

// ── Singleton Resend client (created lazily) ──────────────────
let _client: Resend | null = null;

function getClient(): Resend | null {
  if (_client) return _client;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info(
      "[Email] RESEND_API_KEY not set — order confirmation emails are disabled. " +
      "Add RESEND_API_KEY to backend/.env to enable."
    );
    return null;
  }
  _client = new Resend(apiKey);
  return _client;
}

// ── Email payload ─────────────────────────────────────────────
export interface OrderEmailPayload {
  to: string;
  customerName: string;
  orderId: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  address: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

// ── Send order confirmation (returns true if sent) ────────────
export const sendOrderConfirmationEmail = async (
  payload: OrderEmailPayload
): Promise<boolean> => {
  try {
    const client = getClient();
    if (!client) return false;

    const from = process.env.EMAIL_FROM?.trim() || "orders@zlipkart.com";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const { to, customerName, orderId, totalAmount, items, address } = payload;
    const orderIdShort = orderId.substring(0, 8).toUpperCase();

    // ── Items rows HTML ───────────────────────────────────────
    const itemRows = items
      .map(
        (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#212121;line-height:1.4;">
            ${item.name}
          </td>
          <td align="center" style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#878787;white-space:nowrap;">
            × ${item.quantity}
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#212121;font-weight:600;white-space:nowrap;">
            ₹${(item.price * item.quantity).toLocaleString("en-IN")}
          </td>
        </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Confirmed — ZlipKart</title>
</head>
<body style="margin:0;padding:0;background:#f1f3f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f3f6;padding:32px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background:#fff;max-width:600px;width:100%;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- ── Header ── -->
        <tr>
          <td style="background:linear-gradient(135deg,#2874f0 0%,#0d47a1 100%);padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 2px;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
                    ZlipKart
                  </p>
                  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.7);font-weight:400;">
                    Your trusted online marketplace
                  </p>
                </td>
                <td align="right" valign="middle">
                  <span style="display:inline-block;background:rgba(255,255,255,0.15);color:#fff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.3);">
                    ✓ Order Confirmed
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Greeting ── -->
        <tr>
          <td style="padding:28px 32px 0;">
            <h1 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#212121;">
              Thank you, ${customerName}! 🎉
            </h1>
            <p style="margin:0;font-size:13px;color:#878787;line-height:1.6;">
              Your order <strong style="color:#212121;">#${orderIdShort}</strong> has been placed successfully.
              We'll process it right away and keep you updated.
            </p>
          </td>
        </tr>

        <!-- ── Items Table ── -->
        <tr>
          <td style="padding:24px 32px 0;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#878787;text-transform:uppercase;letter-spacing:0.8px;">
              Items Ordered
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead>
                <tr>
                  <th align="left" style="font-size:11px;color:#878787;font-weight:600;padding:0 0 8px;border-bottom:2px solid #f0f0f0;">
                    Product
                  </th>
                  <th align="center" style="font-size:11px;color:#878787;font-weight:600;padding:0 0 8px;border-bottom:2px solid #f0f0f0;">
                    Qty
                  </th>
                  <th align="right" style="font-size:11px;color:#878787;font-weight:600;padding:0 0 8px;border-bottom:2px solid #f0f0f0;">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- ── Total ── -->
        <tr>
          <td style="padding:16px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:15px;font-weight:700;color:#212121;">Order Total</td>
                <td align="right" style="font-size:22px;font-weight:800;color:#2874f0;">
                  ₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Divider ── -->
        <tr><td style="height:1px;background:#f0f0f0;margin:0 32px;"></td></tr>

        <!-- ── Delivery Address ── -->
        <tr>
          <td style="padding:20px 32px;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#878787;text-transform:uppercase;letter-spacing:0.8px;">
              Delivery Address
            </p>
            <div style="background:#f7f8fa;border-left:3px solid #2874f0;padding:14px 16px;border-radius:0 4px 4px 0;">
              <p style="margin:0;font-size:13px;color:#212121;line-height:1.7;">
                <strong>${address.fullName}</strong><br/>
                ${address.street}<br/>
                ${address.city}, ${address.state} – ${address.pincode}
              </p>
            </div>
          </td>
        </tr>

        <!-- ── Delivery Note ── -->
        <tr>
          <td style="padding:0 32px 24px;">
            <div style="background:#fff8e1;border-radius:4px;padding:12px 16px;border:1px solid #ffe082;">
              <p style="margin:0;font-size:12px;color:#e65100;font-weight:600;">
                📦 Estimated Delivery: <span style="font-weight:400;">3–5 business days</span>
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#878787;">
                You'll receive a tracking update once your order is shipped.
              </p>
            </div>
          </td>
        </tr>

        <!-- ── CTA ── -->
        <tr>
          <td align="center" style="padding:0 32px 28px;">
            <a
              href="${frontendUrl}/orders"
              style="display:inline-block;background:#fb641b;color:#fff;text-decoration:none;padding:13px 40px;border-radius:2px;font-size:14px;font-weight:700;letter-spacing:0.3px;"
            >
              Track Your Order →
            </a>
          </td>
        </tr>

        <!-- ── Footer ── -->
        <tr>
          <td style="background:#f7f8fa;border-top:1px solid #e8e8e8;padding:18px 32px;" align="center">
            <p style="margin:0 0 4px;font-size:12px;color:#212121;font-weight:600;">ZlipKart</p>
            <p style="margin:0;font-size:11px;color:#878787;line-height:1.6;">
              This is an automated message — please do not reply directly.<br/>
              © ${new Date().getFullYear()} ZlipKart · Prices are for demonstration purposes.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

    const { data, error } = await client.emails.send({
      from: `ZlipKart Orders <${from}>`,
      to: [to],
      subject: `Order Confirmed #${orderIdShort} — ₹${totalAmount.toLocaleString("en-IN")} | ZlipKart`,
      html,
    });

    if (error) {
      console.error("[Email] Resend API error:", error.message);
      return false;
    }

    console.log(`[Email] ✓ Confirmation sent → ${to} (id: ${data?.id}, order #${orderIdShort})`);
    return true;
  } catch (err) {
    // NEVER re-throw — email failure must never break the order flow
    console.error("[Email] ✗ Unexpected error:", (err as Error).message);
    return false;
  }
};
