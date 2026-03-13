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
          className="h-32 w-auto group-hover:opacity-80 transition-opacity"
          priority
        />
      </div>
    </Link>
  );
}
