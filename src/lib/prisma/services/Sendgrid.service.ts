import sgMail from '@sendgrid/mail';

enum TemplateIdsEnum {
  emailVerificationTemplateId = 'd-e11d343ac0ee4ba3bfbe3f4e4f1d0e82',
  forgotPasswordTemplateId = 'd-a3cf5ceaaaa8440abb7ddb87921a44db',
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

class Email {
  static formatEmails(emails: string[]): { email: string }[] {
    return emails?.map(email => ({ email }));
  }

  async sendConfirmationCodeEmail(
    email: string,
    confirmationCode: number,
    firstName: string,
  ): Promise<any> {
    return this.sendEmail(email, {
      template_id: TemplateIdsEnum.emailVerificationTemplateId,
      personalizations: [
        {
          to: email,
          dynamic_template_data: {
            firstName,
            link: `${process.env.NEXTAUTH_URL}/signin?code=${confirmationCode}`,
          },
        },
      ],
    });
  }

  async sendForgotPasswordEmail(
    email: string,
    confirmationCode: number,
    firstName: string,
  ): Promise<any> {
    return this.sendEmail(email, {
      template_id: TemplateIdsEnum.forgotPasswordTemplateId,
      personalizations: [
        {
          to: email,
          dynamic_template_data: {
            confirmationCode,
            firstName,
          },
        },
      ],
    });
  }

  async sendEmail(
    to: string,
    data: any = {},
    from: string = `erebuniacademyfoundation@gmail.com`,
  ): Promise<any> {
    try {
      const message = {
        to,
        from,
        ...data,
      };
      return sgMail.send(message);
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }
}

const instance = new Email();

export { instance as Email };
