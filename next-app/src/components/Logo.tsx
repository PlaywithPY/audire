import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" className="block">
      <div className="group cursor-pointer hover:scale-105 transition-transform">
        <Image
          src="/images/logo.png"
          alt="Audire - Centre auditif indépendant"
          width={360}
          height={120}
          className="h-24 w-auto group-hover:opacity-90 transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12))'
          }}
          priority
        />
      </div>
    </Link>
  );
}
