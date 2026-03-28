import nodemailer from 'nodemailer';

export interface PrescriptionEmailOptions {
  patientName: string;
  appointmentDate: string;
  appointmentType: string;
  prescriptionUrl: string;
  prescriptionFileName: string;
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
