import Link from 'next/link';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-sm px-6 py-3',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  shape = 'md',
  fullWidth = false,
  href,
  className = '',
  children,
  ...props
}) {
  const shapeClass = shape === 'full' ? 'rounded-full' : 'rounded-md';
  const classes = `btn ${VARIANTS[variant]} ${SIZES[size]} ${shapeClass} ${fullWidth ? 'w-full' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
