import type { ReactNode } from "react";

type MilitarySectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function MilitarySection({
  title,
  description,
  children,
  className = "",
}: MilitarySectionProps) {
  return (
    <section className={`space-y-3 ${className}`}>
      {(title || description) && (
        <header className="space-y-1">
          {title && (
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
