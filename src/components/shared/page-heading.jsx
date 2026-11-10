export function PageHeading({ eyebrow, title, description, children }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight sm:text-[1.875rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex shrink-0 flex-wrap gap-3">{children}</div>
      )}
    </div>
  );
}
