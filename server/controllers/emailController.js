const nodemailer = require('nodemailer');

// EmailController class
class emailController {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                 user: 'sigurd.jaskolski@ethereal.email',
                 pass: 'QTM1XBZ4zc4TBKF5Sa'
            }
        });
    }

    // Method to send email
    async sendEmail(req, res) {
        console.log('Request body:', req.body); // Log the incoming request body
        const { to } = req.body;

        // Basic validation for email address
        if (!to || !this.validateEmail(to)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        const mailOptions = {
            from: 'sigurd.jaskolski@ethereal.email',
            to: to,
            subject: 'Reset Password',
            text: 'hello world'
        };

        try {
            let info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Email sent successfully', response: info.response });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ message: 'Error sending email', error: error.message });
        }
    }

    // Simple email validation function
    validateEmail(email) {
        // Basic regex for validating email address
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

module.exports = new emailController(); // Exporting an instance of the class
