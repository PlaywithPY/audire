import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="block">
      <div className="flex items-center gap-3 group cursor-pointer">
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        {/* Text */}
        <div>
          <h1 className="text-3xl font-bold text-primary group-hover:text-primary-dark transition-colors">
            AUDIRE
          </h1>
          <p className="text-xs text-text-muted -mt-1">Centre auditif indépendant</p>
        </div>
      </div>
    </Link>
  );
}
