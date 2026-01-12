
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase";
  
  const variants = {
    // Coral background with White text (High contrast CTA)
    primary: "bg-highlight text-white hover:bg-[#ff8a7d] shadow-[0_0_15px_rgba(255,111,97,0.2)] hover:shadow-[0_0_20px_rgba(255,111,97,0.4)] border border-transparent hover:-translate-y-0.5 active:translate-y-0",
    // Surface background with Primary border (Green)
    secondary: "bg-transparent text-primary border border-primary hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(29,185,84,0.15)]",
    // Ghost
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="mr-2 opacity-80">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
