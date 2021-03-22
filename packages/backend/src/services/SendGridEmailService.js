import mail from "@sendgrid/mail";
import client from "@sendgrid/client";
import env from "environment";

/**
 * For more information go to: https://github.com/sendgrid/sendgrid-nodejs
 */
export default class SendgridEmailService {
  /**
   * @param {string} apiKey API Key from SendGrid.
   */
  constructor() {
    mail.setApiKey(env("email").api_key);
    client.setApiKey(env("email").api_key);

    this.__apiVersion = "v3";
  }

  /**
   * Send email using a template.
   *
   * @param {string} templateID Template ID used __toEmail send email.
   * @param {string} toEmail Recipient __toEmail send email.
   * @param {string} fromEmail From where send email.
   * @param {object} templateData Template data.
   *
   * @returns {Promise<*>} Email response.
   * @async
   */
  async sendEmailWithTemplate(templateID, toEmail, fromEmail, templateData) {
    const message = {
      to: toEmail,
      from: fromEmail,
      templateId: templateID,
      dynamic_template_data: templateData,
    };

    return mail.send(message);
  }

  /**
   * Add email to global unsubscribe list.
   *
   * @param {string} email Email to unsubscribe.
   *
   * @returns {Promise<*>} Email response.
   * @async
   */
  async unsubscribeEmail(email) {
    const requestData = {
      method: "POST",
      url: `/${this.__apiVersion}/asm/suppressions/global`,
      body: {
        recipient_emails: [email],
      },
    };

    return client.request(requestData);
  }

  /**
   * Remove email from global unsubscribe list.
   *
   * @param {string} email Email to remove.
   *
   * @returns {Promise<*>} Email response.
   * @async
   */
  async subscribeEmail(email) {
    const requestData = {
      method: "DELETE",
      url: `/${this.__apiVersion}/asm/suppressions/global/${email}`,
    };

    return client.request(requestData);
  }
}
