import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" className="block">
      <div className="group cursor-pointer hover:scale-105 transition-transform">
        <Image
          src="/images/logo.png"
          alt="Audire - Centre auditif indépendant"
          width={400}
          height={133}
          className="h-32 w-auto group-hover:opacity-90 transition-all drop-shadow-[0_3px_8px_rgba(0,0,0,0.18)]"
          style={{
            filter: 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.18))'
          }}
          priority
        />
      </div>
    </Link>
  );
}
