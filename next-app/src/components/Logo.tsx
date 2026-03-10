import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" className="block">
      <div className="group cursor-pointer">
        <Image
          src="/images/logo.png"
          alt="Audire - Centre auditif indépendant"
          width={300}
          height={100}
          className="h-20 w-auto group-hover:opacity-80 transition-opacity"
          priority
        />
      </div>
    </Link>
  );
}
