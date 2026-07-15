type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-4xl">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-accent-soft">
        {eyebrow}
      </p>
      <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.04em] text-foreground sm:text-7xl lg:text-8xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-7 max-w-2xl text-base leading-7 text-muted sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
