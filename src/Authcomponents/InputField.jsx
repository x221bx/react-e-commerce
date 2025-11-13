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
    md: "px-3 py-2.5 text-[15px] rounded-lg",
    lg: "px-3 py-3 text-base rounded-xl",
    xl: "px-3.5 py-3.5 text-[17px] rounded-2xl",
  };
  const S = sizeMap[size] || sizeMap.xl;
  const Comp = as || Field;

  return (
    <div>
      {label ? (
        <label
          htmlFor={id || name}
          className="block text-[0.95rem] font-medium text-gray-800"
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
        className={`mt-1 w-full border border-gray-300 ${S} bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
      >
        {children}
      </Comp>

      {/* Fixed error row to prevent layout jump */}
      <div className="mt-1 h-5">
        <ErrorMessage
          name={name}
          component="p"
          className="text-xs text-red-600"
        />
      </div>
    </div>
  );
}
