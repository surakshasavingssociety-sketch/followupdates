import "dotenv/config";
import nodemailer from "nodemailer";
import { getDb, toIso } from "./firebase-admin.mjs";
import { sleep } from "./lib.mjs";

const SITE_URL = (process.env.SITE_URL || "https://followupdates.web.app").replace(/\/$/, "");
const DELAY_MS = Number(process.env.EMAIL_DELAY_MS || 1200);
const MAX_EMAILS = Number(process.env.MAX_EMAILS_PER_RUN || 400);
const TELEGRAM_DELAY_MS = Number(process.env.TELEGRAM_DELAY_MS || 600);
const LOOKBACK_DAYS = Number(process.env.NOTIFY_LOOKBACK_DAYS || 7);

// Cutoff capture: jobs approved after this moment belong to the next run.
const RUN_STARTED_AT = new Date().toISOString();

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jobUrl(job) {
  return `${SITE_URL}/jobs/${encodeURIComponent(job.slug || job.id)}/`;
}

function jobTime(job) {
  return toIso(job.approvedAt) || toIso(job.createdAt) || toIso(job.postDate) || "";
}

function subscriberCutoff(subscriber) {
  const explicit = toIso(subscriber.lastNotifiedAt);
  if (explicit) return explicit;

  // New or migrated subscriber: never send anything older than their signup,
  // and never send more than the lookback window on the very first digest.
  const created = toIso(subscriber.createdAt);
  if (created) return created;

  return new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

function emailHtml(subscriber, jobs) {
  const rows = jobs
    .map(
      (job) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #e5e7eb">
          <a href="${jobUrl(job)}" style="color:#0b4f9c;text-decoration:none;font-weight:700;font-size:16px">
            ${escapeHtml(job.title)}
          </a>
          <div style="color:#556070;font-size:13px;margin-top:4px">
            ${escapeHtml(job.organization)} · ${escapeHtml(job.category)} · ${escapeHtml(job.state || "All India")}
          </div>
        </td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#14243b">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px">
    <div style="background:#0b4f9c;color:#fff;padding:22px 24px;border-radius:14px 14px 0 0">
      <div style="font-size:13px;opacity:.85;letter-spacing:.08em;text-transform:uppercase">FollowExam Daily Alert</div>
      <h1 style="margin:8px 0 0;font-size:23px">Today's exam updates</h1>
    </div>
    <div style="background:#fff;padding:8px 24px 24px;border-radius:0 0 14px 14px">
      <p style="color:#556070">Hello ${escapeHtml(subscriber.name || "Student")},</p>
      <p style="color:#556070">You have ${jobs.length} new update${jobs.length > 1 ? "s" : ""}:</p>
      <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      <p style="margin:24px 0 8px">
        <a href="${SITE_URL}/jobs/" style="display:inline-block;background:#f59e0b;color:#14243b;padding:11px 18px;border-radius:9px;text-decoration:none;font-weight:700">
          View all jobs
        </a>
      </p>
      <p style="font-size:12px;color:#7a8798;line-height:1.6;margin-top:26px">
        FollowExam is not affiliated with any government department. Always verify the official notification before applying.
        To stop alerts, reply to this email.
      </p>
    </div>
  </div>
</body></html>`;
}

function emailText(subscriber, jobs) {
  return [
    `Hello ${subscriber.name || "Student"},`,
    "",
    `${jobs.length} new exam updates:`,
    ...jobs.map((job) => `- ${job.title}\n  ${jobUrl(job)}`),
    "",
    "Always verify the official notification before applying.",
    "To stop alerts, reply to this email.",
  ].join("\n");
}

function telegramText(job) {
  return [
    `<b>${escapeHtml(job.title)}</b>`,
    "",
    `🏛 ${escapeHtml(job.organization)}`,
    `📌 ${escapeHtml(job.category)} · ${escapeHtml(job.state || "All India")}`,
    job.applyEnd ? `🗓 Last date: ${escapeHtml(job.applyEnd)}` : "",
    "",
    `<a href="${jobUrl(job)}">View details</a>`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendTelegram(jobs) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.log("Telegram skipped (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set).");
    return [];
  }

  const delivered = [];
  for (const job of jobs) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramText(job),
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      });
      if (!response.ok) throw new Error(`Telegram HTTP ${response.status}: ${await response.text()}`);
      delivered.push(job.id);
      await sleep(TELEGRAM_DELAY_MS);
    } catch (error) {
      console.error(`Telegram failed for "${job.title}": ${error.message}`);
    }
  }
  console.log(`Telegram: ${delivered.length}/${jobs.length} sent.`);
  return delivered;
}

async function sendEmails(db, subscribers, allJobs) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Email skipped (SMTP_USER / SMTP_PASS not set).");
    return 0;
  }
  if (!subscribers.length) {
    console.log("Email skipped (no active subscribers).");
    return 0;
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  let sent = 0;
  let skipped = 0;
  let capped = false;

  for (const subscriber of subscribers) {
    if (sent >= MAX_EMAILS) {
      capped = true;
      console.log(`Email cap reached (${MAX_EMAILS}); remaining subscribers will be processed next run.`);
      break;
    }
    if (!subscriber.email) continue;

    const cutoff = subscriberCutoff(subscriber);
    const jobs = allJobs.filter((job) => jobTime(job) > cutoff);
    if (!jobs.length) {
      skipped += 1;
      continue;
    }

    const subject =
      jobs.length === 1
        ? `FollowExam: ${jobs[0].title.slice(0, 90)}`
        : `FollowExam: ${jobs.length} new exam updates`;

    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || `FollowExam <${process.env.SMTP_USER}>`,
        to: subscriber.email,
        subject,
        html: emailHtml(subscriber, jobs),
        text: emailText(subscriber, jobs),
      });
      sent += 1;
      console.log(`  → ${subscriber.email} (${jobs.length} update${jobs.length > 1 ? "s" : ""})`);

      // Progress is saved per subscriber, so a cap or crash never skips anyone.
      await db
        .collection("subscribers")
        .doc(subscriber.id)
        .set({ lastNotifiedAt: RUN_STARTED_AT, lastEmailAt: new Date().toISOString() }, { merge: true });

      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`  × ${subscriber.email}: ${error.message}`);
    }
  }

  console.log(
    `Email: ${sent} sent, ${skipped} already up to date${capped ? ", cap reached" : ""} (out of ${subscribers.length}).`,
  );
  return sent;
}

async function main() {
  const db = getDb();
  const [jobSnapshot, subSnapshot] = await Promise.all([
    db.collection("jobs").where("status", "==", "published").get(),
    db.collection("subscribers").where("active", "==", true).get(),
  ]);

  const jobs = jobSnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((job) => job.demo !== true)
    .sort((a, b) => jobTime(a).localeCompare(jobTime(b)));

  if (!jobs.length) {
    console.log("No published jobs to notify.");
    return;
  }

  const subscribers = subSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const telegramJobs = jobs.filter((job) => job.telegramNotified !== true);
  const telegramDelivered = await sendTelegram(telegramJobs);
  const emailSent = await sendEmails(db, subscribers, jobs);

  if (telegramDelivered.length) {
    const batch = db.batch();
    const now = new Date().toISOString();
    for (const id of telegramDelivered) {
      batch.set(
        db.collection("jobs").doc(id),
        { telegramNotified: true, telegramNotifiedAt: now, updatedAt: now },
        { merge: true },
      );
    }
    await batch.commit();
    console.log(`Marked ${telegramDelivered.length} job(s) as Telegram-notified.`);
  }

  if (!telegramDelivered.length && !emailSent) {
    console.log("No notification channel delivered anything this run.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
