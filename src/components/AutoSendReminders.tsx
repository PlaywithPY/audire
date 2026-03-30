'use client';

import { useEffect } from 'react';

/**
 * Composant qui envoie automatiquement les rappels SMS en attente
 * Vérifie toutes les heures si des rappels doivent être envoyés
 */
export default function AutoSendReminders() {
  useEffect(() => {
    // Fonction pour vérifier et envoyer les rappels
    async function checkAndSendReminders() {
      try {
        // Vérifier si on a déjà vérifié récemment (dans la dernière heure)
        const lastCheck = localStorage.getItem('lastReminderCheck');
        const now = Date.now();

        if (lastCheck) {
          const timeSinceLastCheck = now - parseInt(lastCheck);
          const oneHour = 60 * 60 * 1000; // 1 heure en millisecondes

          // Si la dernière vérification date de moins d'1 heure, ne rien faire
          if (timeSinceLastCheck < oneHour) {
            return;
          }
        }

        // Appeler l'API pour envoyer les rappels
        const response = await fetch('/api/auto-send-reminders');
        if (response.ok) {
          const data = await response.json();
          console.log('Auto-send reminders:', data);
        }

        // Enregistrer la date de la dernière vérification
        localStorage.setItem('lastReminderCheck', now.toString());
      } catch (error) {
        console.error('Error in auto-send reminders:', error);
      }
    }

    // Vérifier au chargement de la page
    checkAndSendReminders();

    // Vérifier toutes les heures
    const interval = setInterval(checkAndSendReminders, 60 * 60 * 1000); // 1 heure

    return () => clearInterval(interval);
  }, []);

  // Ce composant n'affiche rien
  return null;
}
