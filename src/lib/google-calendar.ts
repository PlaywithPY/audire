import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

class GoogleCalendarService {
  private calendar;
  private auth;

  constructor() {
    if (!process.env.GOOGLE_CALENDAR_CLIENT_ID ||
        !process.env.GOOGLE_CALENDAR_CLIENT_SECRET ||
        !process.env.GOOGLE_CALENDAR_REFRESH_TOKEN) {
      console.warn('Google Calendar credentials not configured');
      this.calendar = null;
      this.auth = null;
      return;
    }

    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      'urn:ietf:wg:oauth:2.0:oob'
    );

    this.auth.setCredentials({
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  async createEvent(event: CalendarEvent): Promise<string | null> {
    if (!this.calendar) {
      console.error('Google Calendar not configured');
      return null;
    }

    try {
      const response = await this.calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        requestBody: event,
      });

      return response.data.id || null;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<boolean> {
    if (!this.calendar) {
      console.error('Google Calendar not configured');
      return false;
    }

    try {
      await this.calendar.events.patch({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId,
        requestBody: event,
      });

      return true;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return false;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    if (!this.calendar) {
      console.error('Google Calendar not configured');
      return false;
    }

    try {
      await this.calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId,
      });

      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
  }

  /**
   * Crée un événement de rendez-vous avec les rappels configurés
   * @param patientName - Nom du patient (M/Mme [nom])
   * @param appointmentType - Type de rendez-vous
   * @param startDateTime - Date et heure de début (ISO string)
   * @param endDateTime - Date et heure de fin (ISO string)
   * @returns L'ID de l'événement créé ou null en cas d'erreur
   */
  async createAppointmentEvent(
    patientName: string,
    appointmentType: string,
    startDateTime: string,
    endDateTime: string
  ): Promise<string | null> {
    const typeLabels: Record<string, string> = {
      'premier-contact': 'Premier contact / Prise d\'informations générales',
      'premier-rdv': 'Premier RDV (avec prescription ORL)',
      'reglage': 'Réglage',
    };

    const appointmentTypeLabel = typeLabels[appointmentType] || appointmentType;

    // Calculer les rappels
    const startDate = new Date(startDateTime);
    const now = new Date();
    const daysUntilAppointment = Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const reminders: Array<{ method: 'email' | 'popup'; minutes: number }> = [];

    // Rappel la veille (1 jour = 1440 minutes)
    reminders.push({ method: 'email', minutes: 1440 });

    // Rappel 2 jours avant (2880 minutes)
    if (daysUntilAppointment >= 2) {
      reminders.push({ method: 'email', minutes: 2880 });
    }

    // Rappel 3 jours avant (4320 minutes)
    if (daysUntilAppointment >= 3) {
      reminders.push({ method: 'email', minutes: 4320 });
    }

    // Rappel 1 semaine avant (10080 minutes)
    if (daysUntilAppointment >= 7) {
      reminders.push({ method: 'email', minutes: 10080 });
    }

    const event: CalendarEvent = {
      summary: `${patientName} : ${appointmentTypeLabel}`,
      description: 'Rendez-vous pris par le site',
      start: {
        dateTime: startDateTime,
        timeZone: 'Europe/Brussels',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Europe/Brussels',
      },
      reminders: {
        useDefault: false,
        overrides: reminders,
      },
    };

    return this.createEvent(event);
  }
}

export const googleCalendar = new GoogleCalendarService();
