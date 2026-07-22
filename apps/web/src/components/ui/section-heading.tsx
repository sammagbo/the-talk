type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-5xl border-l-2 border-accent pl-6 sm:pl-9">
      <p className="mb-5 flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-accent-soft">
        <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" /> {eyebrow}
      </p>
      <h1 className="font-display text-5xl font-black leading-[0.94] tracking-[-0.045em] text-foreground sm:text-7xl lg:text-8xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-7 max-w-2xl text-base leading-7 text-muted sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
