import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary/5 to-primary-light/5 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <h3 className="font-bold text-lg mb-4">Audire</h3>
            <p className="text-text-light text-sm mb-4">
              Centre auditif indépendant en province de Liège. Accompagnement humain et solutions de qualité.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/solutions-auditives" className="text-text-light hover:text-primary transition-colors">Solutions auditives</Link></li>
              <li><Link href="/remboursements" className="text-text-light hover:text-primary transition-colors">Remboursements</Link></li>
              <li><Link href="/notre-accompagnement" className="text-text-light hover:text-primary transition-colors">Notre accompagnement</Link></li>
              <li><Link href="/faq" className="text-text-light hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-text-light">
              <li>📍 Rue de l'Yser 106-108</li>
              <li>4101 Jemeppe-sur-Meuse</li>
              <li>📞 <a href="tel:+3242750666" className="hover:text-primary transition-colors">042 75 06 66</a></li>
              <li>✉️ <a href="mailto:centre.audire@gmail.com" className="hover:text-primary transition-colors">centre.audire@gmail.com</a></li>
            </ul>
          </div>

          {/* Horaires */}
          <div>
            <h3 className="font-bold text-lg mb-4">Horaires</h3>
            <ul className="space-y-2 text-sm text-text-light">
              <li><strong>Lun - Ven:</strong> 9h-12h, 13h-17h</li>
              <li><strong>Sam:</strong> Sur rendez-vous</li>
              <li><strong>Dim:</strong> Fermé</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-wrap justify-between items-center gap-4 text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} Audire. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
