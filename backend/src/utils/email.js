import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const emailTemplates = {
  emailVerification: (data) => ({
    subject: 'Verify Your Email - Revision Assistant',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">Revision Assistant</h1>
          <p style="color: #666; margin: 5px 0 0 0;">AI-Powered Learning Platform</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Welcome, ${data.firstName}!</h2>
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for joining Revision Assistant! To complete your registration and start your 
            personalized learning journey, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: 600; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            If you didn't create this account, you can safely ignore this email.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
            This link will expire in 24 hours for security reasons.
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>© 2024 Revision Assistant. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: 'Password Reset Request - Revision Assistant',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">Revision Assistant</h1>
          <p style="color: #666; margin: 5px 0 0 0;">AI-Powered Learning Platform</p>
        </div>
        
        <div style="background: #fef2f2; padding: 30px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
          <h2 style="color: #dc2626; margin: 0 0 20px 0;">Password Reset Request</h2>
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${data.firstName},
          </p>
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            We received a request to reset your password. If you made this request, click the button below to set a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
            This link will expire in 10 minutes for security reasons.
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>© 2024 Revision Assistant. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  welcomeEmail: (data) => ({
    subject: 'Welcome to Revision Assistant - Your Learning Journey Begins!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">Revision Assistant</h1>
          <p style="color: #666; margin: 5px 0 0 0;">AI-Powered Learning Platform</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 30px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
          <h2 style="color: #0369a1; margin: 0 0 20px 0;">Welcome aboard, ${data.firstName}!</h2>
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Congratulations! Your email has been verified and you're now part of the Revision Assistant community. 
            Get ready to revolutionize your learning experience with AI-powered personalization.
          </p>
          
          <div style="margin: 30px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">What's next?</h3>
            <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Complete your learning profile for personalized recommendations</li>
              <li>Join study groups or create your own</li>
              <li>Take adaptive quizzes tailored to your learning style</li>
              <li>Track your progress with detailed analytics</li>
              <li>Connect with fellow learners and teachers</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: 600; display: inline-block;">
              Get Started
            </a>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0;">Need Help?</h3>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
            Our support team is here to help you succeed. Reach out anytime:
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            📧 support@revisionassistant.com<br>
            📚 <a href="${process.env.FRONTEND_URL}/help" style="color: #4f46e5;">Help Center</a>
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>© 2024 Revision Assistant. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  studyReminder: (data) => ({
    subject: `Study Reminder - ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">Revision Assistant</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Study Reminder</p>
        </div>
        
        <div style="background: #fefce8; padding: 30px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #eab308;">
          <h2 style="color: #a16207; margin: 0 0 20px 0;">Time to Study! 📚</h2>
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${data.firstName}, it's time for your scheduled study session:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">${data.subject}</h3>
            ${data.topic ? `<p style="color: #6b7280; margin: 0 0 10px 0;"><strong>Topic:</strong> ${data.topic}</p>` : ''}
            <p style="color: #6b7280; margin: 0 0 10px 0;"><strong>Duration:</strong> ${data.duration} minutes</p>
            ${data.studyGroup ? `<p style="color: #6b7280; margin: 0;"><strong>Study Group:</strong> ${data.studyGroup}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/study" 
               style="background: #eab308; color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: 600; display: inline-block;">
              Start Studying
            </a>
          </div>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>© 2024 Revision Assistant. All rights reserved.</p>
        </div>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    let emailContent;
    if (options.template && emailTemplates[options.template]) {
      emailContent = emailTemplates[options.template](options.data || {});
    } else {
      emailContent = {
        subject: options.subject,
        html: options.html || options.text
      };
    }
    
    const mailOptions = {
      from: `Revision Assistant <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.to,
      subject: emailContent.subject,
      html: emailContent.html,
      ...(options.attachments && { attachments: options.attachments })
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Send bulk emails
export const sendBulkEmail = async (recipients, emailOptions) => {
  try {
    const results = [];
    const transporter = createTransporter();
    
    for (const recipient of recipients) {
      try {
        let emailContent;
        if (emailOptions.template && emailTemplates[emailOptions.template]) {
          emailContent = emailTemplates[emailOptions.template]({
            ...emailOptions.data,
            ...recipient.data
          });
        } else {
          emailContent = {
            subject: emailOptions.subject,
            html: emailOptions.html || emailOptions.text
          };
        }
        
        const mailOptions = {
          from: `Revision Assistant <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
          to: recipient.email,
          subject: emailContent.subject,
          html: emailContent.html
        };
        
        const result = await transporter.sendMail(mailOptions);
        results.push({
          email: recipient.email,
          success: true,
          messageId: result.messageId
        });
        
      } catch (error) {
        results.push({
          email: recipient.email,
          success: false,
          error: error.message
        });
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
    
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    throw new Error(`Bulk email sending failed: ${error.message}`);
  }
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

export default {
  sendEmail,
  sendBulkEmail,
  verifyEmailConfig
};
