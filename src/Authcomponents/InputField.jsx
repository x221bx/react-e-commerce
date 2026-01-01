// src/components/FieldRow.jsx
import { Field, ErrorMessage } from "formik";

export default function InputField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  as,
  children,
  size = "xl", // 'md' | 'lg' | 'xl'
}) {
  const sizeMap = {
    md: "px-3 py-2.5 text-[15px] rounded-[var(--radius-sm)]",
    lg: "px-3.5 py-3 text-base rounded-[var(--radius-md)]",
    xl: "px-4 py-3.5 text-[17px] rounded-[var(--radius-lg)]",
  };
  const S = sizeMap[size] || sizeMap.xl;
  const Comp = as || Field;

  return (
    <div>
      {label ? (
        <label
          htmlFor={id || name}
          className="block text-[0.95rem] font-semibold text-[var(--color-text)]"
        >
          {label}
        </label>
      ) : null}

      <Comp
        id={id || name}
        name={name}
        type={as ? undefined : type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`mt-1 w-full border border-[var(--color-border)] ${S} bg-[var(--color-surface-muted)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] placeholder:opacity-70 shadow-[var(--shadow-sm)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-4 focus:ring-[rgba(15,118,110,0.2)]`}
      >
        {children}
      </Comp>

      <div className="mt-1 h-5">
        <ErrorMessage
          name={name}
          component="p"
          className="text-xs font-medium text-[var(--color-danger)]"
        />
      </div>
    </div>
  );
}
