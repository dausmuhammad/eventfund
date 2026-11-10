import { Label } from "./label";
export function Field({ name, label, error, description, optional, children }) {
  return (
    <div className="min-w-0 space-y-2" data-invalid={!!error}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Label htmlFor={name} className="mb-0 text-sm font-semibold">
          {label}
        </Label>
        {!optional && (
          <span className="font-semibold text-danger" aria-hidden="true">
            *
          </span>
        )}
        {optional && (
          <span
            className="ml-1 text-xs font-normal text-muted-foreground"
            aria-hidden="true"
          >
            Opsional
          </span>
        )}
      </div>
      {children}
      {description && (
        <p
          id={`${name}-help`}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          {description}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm font-medium text-danger">
          {error[0]}
        </p>
      )}
    </div>
  );
}
