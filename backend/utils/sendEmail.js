const SibApiV3Sdk = require('sib-api-v3-sdk');

const sendEmail = async (options) => {
    // 1. Setup Brevo Client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY; // Make sure this is in Render Env

    // 2. Create Email Instance
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // 3. Configure Email Content
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.html; // Using HTML content
    sendSmtpEmail.sender = { 
        name: "CampusConnect", 
        email: process.env.EMAIL_FROM // Must be verified in Brevo
    };
    sendSmtpEmail.to = [{ email: options.to }];

    // 4. Send
    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Brevo Email sent to: ${options.to}`);
    } catch (error) {
        console.error('❌ Brevo Email Error:', error);
        // We log it but do not throw, so the controller flow continues
    }
};

module.exports = sendEmail;