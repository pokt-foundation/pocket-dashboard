import mailgun from "mailgun-js";
import env from "environment";

const FROM_EMAIL = "Pocket Dashboard <dashboard@pokt.network>";

const DOMAIN = "pokt.network";
const WHITELISTED_TEMPLATES = new Map([
  [
    "NotificationChange",
    [
      "pocket-dashboard-notifications-changed",
      "Pocket Dashboard: Notification settings",
    ],
  ],
  [
    "NotificationSignup",
    [
      "pocket-dashboard-notifications-signup",
      "Pocket Dashboard: You've signed up for notifications",
    ],
  ],
  [
    "NotificationThresholdHit",
    [
      "pocket-dashboard-notifications-threshold-hit",
      "Pocket Dashboard: App notification",
    ],
  ],
  [
    "PasswordReset",
    [
      "pocket-dashboard-password-reset",
      "Pocket Dashboard: Reset your password",
    ],
  ],
  ["SignUp", ["pocket-dashboard-signup", "Pocket Dashboard: Sign up"]],
]);

export default class MailgunService {
  constructor() {
    this.mailService = mailgun({
      apiKey: env("EMAIL_API_KEY"),
      domain: DOMAIN,
    });
  }

  send({ templateData = null, templateName = "", toEmail = "" }) {
    const [template, subject] = WHITELISTED_TEMPLATES.get(templateName);
    const message = {
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      template,
    };

    if (templateData) {
      message["h:X-Mailgun-Variables"] = JSON.stringify(templateData);
    }

    return this.mailService.messages().send(message);
  }
}
