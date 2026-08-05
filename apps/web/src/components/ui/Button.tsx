import styles from './Button.module.css';

type Variant = 'accent' | 'ghost' | 'white';

interface ButtonProps {
  variant?: Variant;
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler;
}

export function Button({ variant = 'accent', href, children, className, onClick }: ButtonProps) {
  const cls = [styles.btn, styles[variant], className].filter(Boolean).join(' ');
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button className={cls} onClick={onClick}>{children}</button>;
}
