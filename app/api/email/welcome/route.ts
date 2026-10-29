import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Email HTML template (for future Resend integration)
    const emailHtml = `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; background: #08080F; color: #FAFAFA;">
        <h1 style="color: #06B6D4;">Welcome to OptiNova!</h1>
        <p>Thanks for signing up. Here's how to get started:</p>
        <ul>
          <li>Try AI Caption Generator (Instagram/TikTok)</li>
          <li>Generate hashtags automatically</li>
          <li>Save outputs to your history</li>
          <li>Upgrade to Pro for unlimited AI</li>
        </ul>
        <p>
          <a href="https://optinova-black.vercel.app/dashboard" 
             style="background: #06B6D4; color: #08080F; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold;">
            Open Dashboard
          </a>
        </p>
        <hr style="border-color: #272732;" />
        <p style="font-size: 12px; color: #A1A1AA;">
          Founded by Ram Dhingana · OptiNova
        </p>
      </div>
    `;

    // For now: just log (enable Resend later with API key)
    console.log("Welcome email queued for:", email);

    // TODO: Send via Resend when API key added:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: "hello@optinova.com",
    //   to: email,
    //   subject: "Welcome to OptiNova!",
    //   html: emailHtml,
    // });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
