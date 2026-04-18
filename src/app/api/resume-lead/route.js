import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const workEmail = String(body?.workEmail || "").trim();
    const feedback = String(body?.feedback || "").trim();

    if (!workEmail || !feedback) {
      return Response.json({ error: "Missing work email or feedback." }, { status: 400 });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const recipient = process.env.RESUME_LEAD_TO || gmailUser;

    if (!gmailUser || !gmailAppPassword || !recipient) {
      return Response.json(
        { error: "Missing Gmail SMTP credentials or recipient email in .env.local." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    await transporter.sendMail({
      from: `Krishna Kumar Portfolio <${gmailUser}>`,
      to: recipient,
      replyTo: workEmail,
      subject: `Resume download interest from ${workEmail}`,
      text: [
        "A visitor downloaded the resume and submitted feedback.",
        "",
        `Work/Company Email: ${workEmail}`,
        "",
        "Feedback / Improvements:",
        feedback,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <h2 style="margin: 0 0 12px;">Resume download interest</h2>
          <p style="margin: 0 0 8px;"><strong>Work/Company Email:</strong> ${escapeHtml(workEmail)}</p>
          <p style="margin: 0 0 8px;"><strong>Feedback / Improvements:</strong></p>
          <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(feedback)}</p>
        </div>
      `,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to send email." },
      { status: 500 }
    );
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}