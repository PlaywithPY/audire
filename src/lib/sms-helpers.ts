import { prisma } from '@/lib/prisma';

type SMSVariables = {
  firstName?: string;
  lastName?: string;
  centre?: string;
  date?: string;
  time?: string;
  address?: string;
  daysBefore?: number;
};

/**
 * Remplace les variables dans le contenu d'un modèle SMS
 */
export function replaceSMSVariables(content: string, variables: SMSVariables): string {
  let result = content;

  // Remplacer les variables entre accolades
  if (variables.firstName) {
    result = result.replace(/{firstName}/g, variables.firstName);
  }
  if (variables.lastName) {
    result = result.replace(/{lastName}/g, variables.lastName);
  }
  if (variables.centre) {
    result = result.replace(/{centre}/g, variables.centre);
  }
  if (variables.date) {
    result = result.replace(/{date}/g, variables.date);
  }
  if (variables.time) {
    result = result.replace(/{time}/g, variables.time);
  }
  if (variables.address) {
    result = result.replace(/{address}/g, variables.address);
    result = result.replace(/{adresse}/g, variables.address);
  }
  if (variables.daysBefore !== undefined) {
    result = result.replace(/{daysBefore}/g, variables.daysBefore.toString());
  }

  return result;
}

/**
 * Normalise un numéro de téléphone belge au format international +32xxxxxxxxx
 * Accepte les formats suivants :
 * - 0470123456
 * - 04 70 12 34 56
 * - 04.70.12.34.56
 * - 04-70-12-34-56
 * - +32470123456
 * - 0032470123456
 * - +32 470 12 34 56
 *
 * @param phone - Le numéro de téléphone à normaliser
 * @returns Le numéro au format +32xxxxxxxxx
 * @throws Error si le numéro n'est pas valide
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) {
    throw new Error('Phone number is required');
  }

  // Retirer tous les espaces, points, tirets et parenthèses
  let normalized = phone.replace(/[\s.\-()]/g, '');

  // Si le numéro commence par 0032, le remplacer par +32
  if (normalized.startsWith('0032')) {
    normalized = '+32' + normalized.substring(4);
  }
  // Si le numéro commence par 0 (format national belge)
  else if (normalized.startsWith('0') && !normalized.startsWith('00')) {
    // Retirer le 0 initial et ajouter +32
    normalized = '+32' + normalized.substring(1);
  }
  // Si le numéro commence par 32 (sans le +)
  else if (normalized.startsWith('32') && !normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  // Si le numéro ne commence pas par +32, c'est probablement invalide
  else if (!normalized.startsWith('+32')) {
    throw new Error('Invalid Belgian phone number format');
  }

  // Vérifier que le numéro final a le bon format : +32 suivi de 9 chiffres
  // Format attendu : +32XXXXXXXXX (où X est un chiffre)
  const phoneRegex = /^\+32[1-9]\d{8}$/;
  if (!phoneRegex.test(normalized)) {
    throw new Error('Invalid Belgian phone number: must be +32 followed by 9 digits (first digit cannot be 0)');
  }

  return normalized;
}

/**
 * Formate une date pour les SMS (ex: "15 janvier 2024")
 */
export function formatDateForSMS(date: Date): string {
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Formate une heure pour les SMS (ex: "14h30")
 */
export function formatTimeForSMS(time: string): string {
  // time est au format "HH:MM"
  return time.replace(':', 'h');
}

/**
 * Récupère un modèle SMS par sa clé
 */
export async function getSMSTemplate(templateKey: string) {
  try {
    const template = await prisma.sMSTemplate.findFirst({
      where: {
        templateKey,
        isActive: true,
      },
    });
    return template;
  } catch (error) {
    console.error('Error fetching SMS template:', error);
    return null;
  }
}

/**
 * Envoie un SMS en utilisant un modèle
 */
export async function sendSMSFromTemplate(
  templateKey: string,
  recipient: string,
  variables: SMSVariables
): Promise<{ success: boolean; error?: string }> {
  try {
    // Récupérer le modèle
    const template = await getSMSTemplate(templateKey);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Remplacer les variables
    const message = replaceSMSVariables(template.content, variables);

    // Normaliser le numéro de téléphone
    const normalizedPhone = normalizePhoneNumber(recipient);

    // Récupérer la configuration SMS
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['sms_gateway_url', 'sms_gateway_username', 'sms_gateway_password'],
        },
      },
    });

    const gatewayUrl = settings.find((s) => s.key === 'sms_gateway_url')?.value;
    const username = settings.find((s) => s.key === 'sms_gateway_username')?.value;
    const password = settings.find((s) => s.key === 'sms_gateway_password')?.value;

    if (!gatewayUrl) {
      return { success: false, error: 'SMS Gateway not configured' };
    }

    // Envoyer le SMS via SMS Gateway
    const smsPayload = {
      textMessage: {
        text: message,
      },
      phoneNumbers: [normalizedPhone],
    };

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (username && password) {
      const authString = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${authString}`;
    }

    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(smsPayload),
    });

    let status: 'sent' | 'failed' = 'sent';
    let errorMessage: string | undefined = undefined;

    if (!response.ok) {
      status = 'failed';
      errorMessage = `SMS Gateway error: ${response.status} ${response.statusText}`;
    }

    // Enregistrer dans les logs
    await prisma.sMSLog.create({
      data: {
        recipient: normalizedPhone,
        message,
        status,
        error: errorMessage,
      },
    });

    if (status === 'failed') {
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending SMS from template:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Envoie un SMS de confirmation de demande de rendez-vous
 */
export async function sendAppointmentRequestConfirmation(
  appointmentId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        centre: true,
        timeSlot: true,
      },
    });

    if (!appointment || !appointment.smsConsent) {
      return { success: false, error: 'Appointment not found or SMS consent not given' };
    }

    const variables: SMSVariables = {
      firstName: appointment.firstName,
      lastName: appointment.lastName,
      centre: appointment.centre.name,
    };

    // Si un créneau est déjà défini
    if (appointment.timeSlot) {
      variables.date = formatDateForSMS(new Date(appointment.timeSlot.date));
      variables.time = formatTimeForSMS(appointment.timeSlot.startTime);
    }

    return await sendSMSFromTemplate('confirmation_demande', appointment.phone, variables);
  } catch (error) {
    console.error('Error sending appointment request confirmation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Envoie un SMS de confirmation de rendez-vous
 */
export async function sendAppointmentConfirmation(
  appointmentId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        centre: true,
        timeSlot: true,
      },
    });

    if (!appointment || !appointment.smsConsent || !appointment.timeSlot) {
      return { success: false, error: 'Appointment not found, SMS consent not given, or no time slot' };
    }

    const variables: SMSVariables = {
      firstName: appointment.firstName,
      lastName: appointment.lastName,
      centre: appointment.centre.name,
      date: formatDateForSMS(new Date(appointment.timeSlot.date)),
      time: formatTimeForSMS(appointment.timeSlot.startTime),
      address: `${appointment.centre.address}, ${appointment.centre.postalCode} ${appointment.centre.city}`,
    };

    return await sendSMSFromTemplate('confirmation_rdv', appointment.phone, variables);
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Envoie un SMS de rappel de rendez-vous
 */
export async function sendAppointmentReminder(
  appointmentId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        centre: true,
        timeSlot: true,
      },
    });

    if (!appointment || !appointment.smsConsent || !appointment.timeSlot) {
      return { success: false, error: 'Appointment not found, SMS consent not given, or no time slot' };
    }

    const variables: SMSVariables = {
      firstName: appointment.firstName,
      lastName: appointment.lastName,
      centre: appointment.centre.name,
      date: formatDateForSMS(new Date(appointment.timeSlot.date)),
      time: formatTimeForSMS(appointment.timeSlot.startTime),
      address: `${appointment.centre.address}, ${appointment.centre.postalCode} ${appointment.centre.city}`,
      daysBefore: appointment.reminderDaysBefore,
    };

    const result = await sendSMSFromTemplate('rappel_rdv', appointment.phone, variables);

    // Marquer le rappel comme envoyé
    if (result.success) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { reminderSent: true },
      });
    }

    return result;
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Envoie un SMS d'annulation de rendez-vous
 */
export async function sendAppointmentCancellation(
  appointmentId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        centre: true,
        timeSlot: true,
      },
    });

    if (!appointment || !appointment.smsConsent || !appointment.timeSlot) {
      return { success: false, error: 'Appointment not found, SMS consent not given, or no time slot' };
    }

    const variables: SMSVariables = {
      firstName: appointment.firstName,
      lastName: appointment.lastName,
      centre: appointment.centre.name,
      date: formatDateForSMS(new Date(appointment.timeSlot.date)),
      time: formatTimeForSMS(appointment.timeSlot.startTime),
    };

    return await sendSMSFromTemplate('annulation_rdv', appointment.phone, variables);
  } catch (error) {
    console.error('Error sending appointment cancellation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
