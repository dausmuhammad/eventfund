import { Label } from "./label";
export function Field({ name, label, error, description, optional, children }) {
  return (
    <div className="min-w-0 space-y-2" data-invalid={!!error}>
      <Label htmlFor={name}>
        {label}
        {optional && (
          <span
            className="ml-2 font-normal text-muted-foreground"
            aria-hidden="true"
          >
            Opsional
          </span>
        )}
      </Label>
      {children}
      {description && (
        <p
          id={`${name}-help`}
          className="text-sm leading-relaxed text-muted-foreground"
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
