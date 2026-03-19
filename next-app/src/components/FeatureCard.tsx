interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-bg p-6 rounded-2xl shadow-md">
      <div className="mb-4 flex justify-center">
        <span className="text-5xl animate-float">{icon}</span>
      </div>
      <h3 className="text-xl font-bold mb-2">
        {title}
      </h3>
      <p className="text-text-light">
        {description}
      </p>
    </div>
  );
}
