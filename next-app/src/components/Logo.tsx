import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" className="block">
      <div className="group cursor-pointer">
        <Image
          src="/images/logo.png"
          alt="Audire - Centre auditif indépendant"
          width={180}
          height={60}
          className="h-14 w-auto group-hover:opacity-80 transition-opacity"
          priority
        />
      </div>
    </Link>
  );
}
