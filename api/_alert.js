const BYTES_IN_MB = 1024 * 1024;
const BYTES_IN_GB = 1024 * 1024 * 1024;

function fmt(bytes) {
  if (bytes >= BYTES_IN_GB) return `${(bytes / BYTES_IN_GB).toFixed(2)} GB`;
  return `${(bytes / BYTES_IN_MB).toFixed(0)} MB`;
}

/**
 * Sends one email listing every threshold currently breached.
 * Uses Resend (https://resend.com) — free tier, no SMTP setup needed.
 * Requires RESEND_API_KEY and ALERT_EMAIL_TO env vars; silently skips
 * (logs only) if they aren't set, so the cron never crashes over this.
 */
export async function sendAlertEmail(alerts) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO;

  if (!apiKey || !to) {
    console.warn("[storage-alert] RESEND_API_KEY or ALERT_EMAIL_TO not set — skipping email.", {
      alerts: alerts.map((a) => a.key),
    });
    return;
  }

  const rows = alerts
    .map(
      (a) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;">${a.label}</td>` +
        `<td style="padding:8px 12px;border-bottom:1px solid #eee;">${fmt(a.used)} / ${fmt(a.limit)}</td></tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:520px;">
      <h2 style="color:#B91C1C;">Storage quota warning - Kushal Enterprises site</h2>
      <p>The following free-tier storage limits are close to being reached:</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr style="background:#f5f5f5;"><th style="text-align:left;padding:8px 12px;">Service</th><th style="text-align:left;padding:8px 12px;">Used / Limit</th></tr>
        ${rows}
      </table>
      <p style="margin-top:16px;color:#555;">
        Please free up space (delete old property photos/videos, or upgrade the relevant plan)
        before the limit is reached — the site may stop accepting uploads or the database may
        reject writes once a hard limit is hit.
      </p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Storage Alerts <onboarding@resend.dev>",
      to: [to],
      subject: `Storage warning: ${alerts.map((a) => a.label).join(", ")}`,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[storage-alert] Resend send failed:", res.status, body);
  }
}