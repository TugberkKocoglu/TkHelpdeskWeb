import { Construction } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description?: string;
}

export default function ComingSoonPage({
  title,
  description,
}: ComingSoonPageProps) {
  return (
    <div className="coming-soon-page">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">
          <Construction size={30} />
        </div>

        <h1>{title}</h1>

        <p>
          {description ??
            "Bu modülün arayüzü sonraki geliştirme aşamasında hazırlanacak."}
        </p>
      </div>
    </div>
  );
}
