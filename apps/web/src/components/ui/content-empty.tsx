type ContentEmptyProps = {
  title: string;
  description: string;
};

export function ContentEmpty({ title, description }: ContentEmptyProps) {
  return (
    <div className="border-y border-line py-16 sm:py-24">
      <p className="font-display text-3xl tracking-[-0.03em] text-foreground sm:text-4xl">{title}</p>
      <p className="mt-4 max-w-xl leading-7 text-muted">{description}</p>
    </div>
  );
}
