export function Card({ children, className }) {
  return (
    <div className={`bg-white shadow rounded-lg p-4 ${className || ""}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={`border-b pb-2 mb-2 ${className || ""}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h2 className={`text-lg font-semibold ${className || ""}`}>
      {children}
    </h2>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p className={`text-sm text-gray-500 ${className || ""}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={`mt-2 ${className || ""}`}>
      {children}
    </div>
  );
}
