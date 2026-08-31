export function Card({ children, className = "", ...props }) {
  return (
    <div className={`tp-card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`tp-card-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export default Card;
