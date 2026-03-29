import nodemailer from 'nodemailer';

export interface PrescriptionEmailOptions {
  patientName: string;
  appointmentDate: string;
  appointmentType: string;
  prescriptionUrl: string;
  prescriptionFileName: string;
}

export interface AppointmentRequestEmailOptions {
  civilite: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  message: string | null;
  appointmentType: string;
  centreName: string;
}

class EmailService {
  private transporter;

  constructor() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured');
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Envoie un email avec la prescription uploadée par un patient
   * @param options - Options de l'email
   * @returns true si l'email a été envoyé avec succès, false sinon
   */
  async sendPrescriptionEmail(options: PrescriptionEmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email service not configured');
      return false;
    }

    const typeLabels: Record<string, string> = {
      'premier-contact': 'Premier contact / Prise d\'informations générales',
      'premier-rdv': 'Premier RDV (avec prescription ORL)',
      'reglage': 'Réglage',
    };

    const appointmentTypeLabel = typeLabels[options.appointmentType] || options.appointmentType;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || 'centre.audire@gmail.com',
        subject: `Nouvelle prescription - ${options.patientName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background-color: #42a4ff;
                  color: white;
                  padding: 20px;
                  text-align: center;
                  border-radius: 5px 5px 0 0;
                }
                .content {
                  background-color: #f9f9f9;
                  padding: 20px;
                  border-radius: 0 0 5px 5px;
                }
                .info-row {
                  margin: 10px 0;
                  padding: 10px;
                  background-color: white;
                  border-radius: 3px;
                }
                .label {
                  font-weight: bold;
                  color: #42a4ff;
                }
                .button {
                  display: inline-block;
                  padding: 12px 24px;
                  background-color: #42a4ff;
                  color: white;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #666;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>📋 Nouvelle Prescription Uploadée</h2>
                </div>
                <div class="content">
                  <p>Un patient a uploadé une prescription lors de sa prise de rendez-vous.</p>

                  <div class="info-row">
                    <span class="label">Patient :</span> ${options.patientName}
                  </div>

                  <div class="info-row">
                    <span class="label">Type de RDV :</span> ${appointmentTypeLabel}
                  </div>

                  <div class="info-row">
                    <span class="label">Date du RDV :</span> ${options.appointmentDate}
                  </div>

                  <div class="info-row">
                    <span class="label">Nom du fichier :</span> ${options.prescriptionFileName}
                  </div>

                  <div style="text-align: center;">
                    <a href="${options.prescriptionUrl}" class="button">
                      📥 Télécharger la prescription
                    </a>
                  </div>

                  <p style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 3px;">
                    ⚠️ <strong>Note :</strong> Cette prescription sera automatiquement supprimée 1 mois après la date du rendez-vous pour respecter les réglementations sur la protection des données.
                  </p>
                </div>
                <div class="footer">
                  <p>Cet email a été envoyé automatiquement depuis le site Audire.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log('Prescription email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending prescription email:', error);
      return false;
    }
  }

  /**
   * Envoie un email de notification pour une nouvelle demande de rendez-vous
   * @param options - Options de l'email
   * @returns true si l'email a été envoyé avec succès, false sinon
   */
  async sendAppointmentRequestEmail(options: AppointmentRequestEmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email service not configured');
      return false;
    }

    const typeLabels: Record<string, string> = {
      'premier-contact': 'Premier contact / Prise d\'informations générales',
      'premier-rdv': 'Premier RDV (avec prescription ORL)',
      'reglage': 'Réglage',
    };

    const appointmentTypeLabel = typeLabels[options.appointmentType] || options.appointmentType;

    const civiliteLabels: Record<string, string> = {
      'monsieur': 'Monsieur',
      'madame': 'Madame',
      'autre': '',
    };

    const civiliteDisplay = options.civilite ? civiliteLabels[options.civilite] || '' : '';
    const fullName = civiliteDisplay ? `${civiliteDisplay} ${options.lastName} ${options.firstName}` : `${options.lastName} ${options.firstName}`;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || 'centre.audire@gmail.com',
        subject: `Nouvelle demande de rendez-vous - ${fullName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background-color: #42a4ff;
                  color: white;
                  padding: 20px;
                  text-align: center;
                  border-radius: 5px 5px 0 0;
                }
                .content {
                  background-color: #f9f9f9;
                  padding: 20px;
                  border-radius: 0 0 5px 5px;
                }
                .info-row {
                  margin: 10px 0;
                  padding: 10px;
                  background-color: white;
                  border-radius: 3px;
                }
                .label {
                  font-weight: bold;
                  color: #42a4ff;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #666;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>📅 Nouvelle Demande de Rendez-vous</h2>
                </div>
                <div class="content">
                  <p>Une nouvelle demande de rendez-vous a été soumise depuis le site web.</p>

                  <div class="info-row">
                    <span class="label">Patient :</span> ${fullName}
                  </div>

                  <div class="info-row">
                    <span class="label">Type de demande :</span> ${appointmentTypeLabel}
                  </div>

                  <div class="info-row">
                    <span class="label">Téléphone :</span> <a href="tel:${options.phone}">${options.phone}</a>
                  </div>

                  ${options.email ? `
                  <div class="info-row">
                    <span class="label">Email :</span> <a href="mailto:${options.email}">${options.email}</a>
                  </div>
                  ` : ''}

                  <div class="info-row">
                    <span class="label">Centre :</span> ${options.centreName}
                  </div>

                  ${options.message ? `
                  <div class="info-row">
                    <span class="label">Message :</span><br>
                    <div style="margin-top: 10px; padding: 10px; background-color: #f0f0f0; border-left: 3px solid #42a4ff;">
                      ${options.message.replace(/\n/g, '<br>')}
                    </div>
                  </div>
                  ` : ''}

                  <p style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-left: 4px solid #0c5460; border-radius: 3px;">
                    💡 <strong>Action requise :</strong> Contactez ce patient pour confirmer et planifier son rendez-vous.
                  </p>
                </div>
                <div class="footer">
                  <p>Cet email a été envoyé automatiquement depuis le site Audire.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log('Appointment request email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending appointment request email:', error);
      return false;
    }
  }

  /**
   * Envoie un email de confirmation au client que son RDV est en attente
   * @param options - Options de l'email
   * @returns true si l'email a été envoyé avec succès, false sinon
   */
  async sendClientPendingConfirmation(options: {
    email: string;
    civilite: string | null;
    firstName: string;
    lastName: string;
    appointmentDate: string;
    appointmentTime: string;
    centreName: string;
    appointmentType: string;
  }): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email service not configured');
      return false;
    }

    const typeLabels: Record<string, string> = {
      'premier-contact': 'Premier contact / Prise d\'informations générales',
      'premier-rdv': 'Premier RDV (avec prescription ORL)',
      'reglage': 'Réglage',
    };

    const appointmentTypeLabel = typeLabels[options.appointmentType] || options.appointmentType;

    const civiliteLabels: Record<string, string> = {
      'monsieur': 'Monsieur',
      'madame': 'Madame',
      'autre': '',
    };

    const civiliteDisplay = options.civilite ? civiliteLabels[options.civilite] || '' : '';
    const greeting = civiliteDisplay ? `${civiliteDisplay} ${options.lastName}` : `${options.firstName} ${options.lastName}`;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.email,
        subject: `Votre demande de rendez-vous chez Audire`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background-color: #42a4ff;
                  color: white;
                  padding: 20px;
                  text-align: center;
                  border-radius: 5px 5px 0 0;
                }
                .content {
                  background-color: #f9f9f9;
                  padding: 20px;
                  border-radius: 0 0 5px 5px;
                }
                .info-row {
                  margin: 10px 0;
                  padding: 10px;
                  background-color: white;
                  border-radius: 3px;
                }
                .label {
                  font-weight: bold;
                  color: #42a4ff;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #666;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>📅 Demande de Rendez-vous Reçue</h2>
                </div>
                <div class="content">
                  <p>Bonjour ${greeting},</p>

                  <p>Nous avons bien reçu votre demande de rendez-vous. Votre demande est actuellement <strong>en attente de confirmation</strong> par notre équipe.</p>

                  <div class="info-row">
                    <span class="label">Type de rendez-vous :</span> ${appointmentTypeLabel}
                  </div>

                  <div class="info-row">
                    <span class="label">Date souhaitée :</span> ${options.appointmentDate}
                  </div>

                  <div class="info-row">
                    <span class="label">Heure :</span> ${options.appointmentTime}
                  </div>

                  <div class="info-row">
                    <span class="label">Centre :</span> ${options.centreName}
                  </div>

                  <p style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-left: 4px solid #0c5460; border-radius: 3px;">
                    ℹ️ <strong>Prochaines étapes :</strong> Notre équipe va examiner votre demande et vous enverra un email de confirmation dès que votre rendez-vous sera validé. Vous pouvez nous contacter si vous avez des questions.
                  </p>

                  <p style="margin-top: 20px;">
                    Merci de votre confiance,<br>
                    <strong>L'équipe Audire</strong>
                  </p>
                </div>
                <div class="footer">
                  <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log('Client pending confirmation email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending client pending confirmation email:', error);
      return false;
    }
  }

  /**
   * Envoie un email de confirmation finale au client que son RDV est confirmé
   * @param options - Options de l'email
   * @returns true si l'email a été envoyé avec succès, false sinon
   */
  async sendClientFinalConfirmation(options: {
    email: string;
    civilite: string | null;
    firstName: string;
    lastName: string;
    appointmentDate: string;
    appointmentTime: string;
    centreName: string;
    centreAddress: string;
    centrePhone: string;
    appointmentType: string;
  }): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email service not configured');
      return false;
    }

    const typeLabels: Record<string, string> = {
      'premier-contact': 'Premier contact / Prise d\'informations générales',
      'premier-rdv': 'Premier RDV (avec prescription ORL)',
      'reglage': 'Réglage',
    };

    const appointmentTypeLabel = typeLabels[options.appointmentType] || options.appointmentType;

    const civiliteLabels: Record<string, string> = {
      'monsieur': 'Monsieur',
      'madame': 'Madame',
      'autre': '',
    };

    const civiliteDisplay = options.civilite ? civiliteLabels[options.civilite] || '' : '';
    const greeting = civiliteDisplay ? `${civiliteDisplay} ${options.lastName}` : `${options.firstName} ${options.lastName}`;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.email,
        subject: `✅ Votre rendez-vous chez Audire est confirmé`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background-color: #42a4ff;
                  color: white;
                  padding: 20px;
                  text-align: center;
                  border-radius: 5px 5px 0 0;
                }
                .content {
                  background-color: #f9f9f9;
                  padding: 20px;
                  border-radius: 0 0 5px 5px;
                }
                .info-row {
                  margin: 10px 0;
                  padding: 10px;
                  background-color: white;
                  border-radius: 3px;
                }
                .label {
                  font-weight: bold;
                  color: #42a4ff;
                }
                .highlight-box {
                  margin: 20px 0;
                  padding: 20px;
                  background-color: #d4edda;
                  border-left: 4px solid #28a745;
                  border-radius: 3px;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #666;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>✅ Rendez-vous Confirmé</h2>
                </div>
                <div class="content">
                  <p>Bonjour ${greeting},</p>

                  <p>Nous avons le plaisir de vous confirmer votre rendez-vous chez Audire.</p>

                  <div class="highlight-box">
                    <h3 style="margin-top: 0; color: #28a745;">📅 Détails de votre rendez-vous</h3>

                    <div class="info-row">
                      <span class="label">Type :</span> ${appointmentTypeLabel}
                    </div>

                    <div class="info-row">
                      <span class="label">Date :</span> ${options.appointmentDate}
                    </div>

                    <div class="info-row">
                      <span class="label">Heure :</span> ${options.appointmentTime}
                    </div>

                    <div class="info-row">
                      <span class="label">Centre :</span> ${options.centreName}
                    </div>

                    <div class="info-row">
                      <span class="label">Adresse :</span> ${options.centreAddress}
                    </div>

                    <div class="info-row">
                      <span class="label">Téléphone :</span> <a href="tel:${options.centrePhone}">${options.centrePhone}</a>
                    </div>
                  </div>

                  <p style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 3px;">
                    ⏰ <strong>Rappel important :</strong> Merci de vous présenter 5 minutes avant l'heure de votre rendez-vous. En cas d'empêchement, veuillez nous contacter au plus vite.
                  </p>

                  <p style="margin-top: 20px;">
                    Nous avons hâte de vous accueillir,<br>
                    <strong>L'équipe Audire</strong>
                  </p>
                </div>
                <div class="footer">
                  <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
                  <p>Pour toute question, contactez-nous au ${options.centrePhone}</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log('Client final confirmation email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending client final confirmation email:', error);
      return false;
    }
  }

  /**
   * Teste la connexion au serveur email
   * @returns true si la connexion est réussie, false sinon
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
