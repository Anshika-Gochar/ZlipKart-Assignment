/**
 * src/utils/email.service.ts
 *
 * Nodemailer email utility. Returns true/false so callers can
 * decide whether to tell the user the email was sent.
 *
 * SAFETY CONTRACT:
 *   - Never throws. Any error is caught, logged, and returns false.
 *   - Order placement is independent of this return value.
 */

import nodemailer from "nodemailer";

// ── Reusable transporter (created lazily) ─────────────────────
let _transporter: nodemailer.Transporter | null | undefined = undefined;

function getTransporter(): nodemailer.Transporter | null {
  // Already resolved
  if (_transporter !== undefined) return _transporter;

  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const port = parseInt(process.env.SMTP_PORT || "587", 10);

  if (!host || !user || !pass) {
    console.info(
      "[Email] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable emails."
    );
    _transporter = null;
    return null;
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    // Gmail requires this
    tls: { rejectUnauthorized: false },
  });

  return _transporter;
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

// ── Send order confirmation (returns true if sent, false if not) ──
export const sendOrderConfirmationEmail = async (
  payload: OrderEmailPayload
): Promise<boolean> => {
  try {
    const transporter = getTransporter();

    if (!transporter) return false; // SMTP not configured

    const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim();
    const { to, customerName, orderId, totalAmount, items, address } = payload;

    const orderIdShort = orderId.substring(0, 8).toUpperCase();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // ── Items rows ──────────────────────────────────────────────
    const itemRows = items
      .map(
        (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#212121;">
            ${item.name}
          </td>
          <td align="center" style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#878787;">
            × ${item.quantity}
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#212121;font-weight:600;">
            ₹${(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
          </td>
        </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f1f3f6;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f3f6;padding:28px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#fff;max-width:600px;width:100%;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#2874f0;padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.7);font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                      Order Confirmed
                    </p>
                    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                      ✓ Thank you, ${customerName}!
                    </h1>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;background:rgba(255,255,255,0.15);color:#fff;font-size:13px;font-weight:600;padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.3);">
                      #${orderIdShort}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
                Your order has been placed successfully. We'll process it shortly and keep you updated.
              </p>
            </td>
          </tr>

          <!-- Ordered Items -->
          <tr>
            <td style="padding:24px 32px 0;">
              <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#212121;text-transform:uppercase;letter-spacing:0.5px;">
                Items Ordered
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th align="left" style="font-size:11px;color:#878787;font-weight:600;padding:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #f0f0f0;">
                      Product
                    </th>
                    <th align="center" style="font-size:11px;color:#878787;font-weight:600;padding:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #f0f0f0;">
                      Qty
                    </th>
                    <th align="right" style="font-size:11px;color:#878787;font-weight:600;padding:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #f0f0f0;">
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

          <!-- Total -->
          <tr>
            <td style="padding:16px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:15px;font-weight:700;color:#212121;">Total Amount</td>
                  <td align="right" style="font-size:20px;font-weight:700;color:#2874f0;">
                    ₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="height:1px;background:#f0f0f0;"></td></tr>

          <!-- Delivery Address -->
          <tr>
            <td style="padding:20px 32px;">
              <h2 style="margin:0 0 10px;font-size:14px;font-weight:700;color:#212121;text-transform:uppercase;letter-spacing:0.5px;">
                Delivery Address
              </h2>
              <div style="background:#f7f8fa;border-left:3px solid #2874f0;padding:14px 16px;border-radius:0 4px 4px 0;">
                <p style="margin:0;font-size:13px;color:#212121;line-height:1.7;">
                  <strong>${address.fullName}</strong><br />
                  ${address.street}<br />
                  ${address.city}, ${address.state} – ${address.pincode}
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:0 32px 28px;">
              <a
                href="${frontendUrl}/orders"
                style="display:inline-block;background:#fb641b;color:#fff;text-decoration:none;padding:13px 36px;border-radius:2px;font-size:14px;font-weight:700;letter-spacing:0.3px;"
              >
                Track Your Order
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7f8fa;border-top:1px solid #e8e8e8;padding:16px 32px;" align="center">
              <p style="margin:0;font-size:11px;color:#878787;line-height:1.6;">
                This is an automated message — please do not reply directly.<br />
                © ${new Date().getFullYear()} Flipkart Clone · Prices are illustrative only.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Flipkart Clone" <${from}>`,
      to,
      subject: `Order Confirmed #${orderIdShort} — ₹${totalAmount.toLocaleString("en-IN")}`,
      html,
    });

    console.log(`[Email] ✓ Confirmation sent → ${to} (order #${orderIdShort})`);
    return true;
  } catch (err) {
    // NEVER re-throw — email failure must not break order flow
    console.error("[Email] ✗ Failed to send confirmation:", (err as Error).message);
    return false;
  }
};
