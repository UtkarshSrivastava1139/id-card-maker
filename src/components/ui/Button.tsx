import React from 'react';
import { clsx } from 'clsx';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  icon,
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={clsx('btn', `btn-${variant}`, `btn-${size}`, className)} 
      style={{ display: 'flex', alignItems: 'center', gap: '8px', ...props.style }}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
