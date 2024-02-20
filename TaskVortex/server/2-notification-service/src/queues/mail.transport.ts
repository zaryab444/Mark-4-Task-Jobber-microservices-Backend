import { emailTemplates } from '@notifications/helpers';

//eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendEmail(template: string, receiverEmail: string, locals: any): Promise<void> {
  try {
    emailTemplates(template, receiverEmail, locals);
    console.log('Email sent successfully.');
  } catch (error) {
    console.log('error', 'NotificationService MailTransport sendEmail() method error:', error);
  }
}

export { sendEmail };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// async function sendEmail(template: string, receiverEmail: string, locals: any): Promise<void> {
//     try {
//       // Simplified email sending logic (replace this with your actual logic)
//       console.log(`Sending email to ${receiverEmail} with template: ${template}`);
//       console.log('Locals:', locals);
      
//       // Simulate sending email asynchronously
//       await new Promise(resolve => setTimeout(resolve, 1000));
  
//       console.log('Email sent successfully.');
//     } catch (error) {
//       console.log('error', 'NotificationService MailTransport sendEmail() method error:', error);
//     }
//   }
  
//   export { sendEmail };