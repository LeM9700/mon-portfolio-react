import { motion } from 'framer-motion';

const CTAButton = ({ 
  variant = 'primary', 
  onClick, 
  href, 
  target, 
  rel, 
  children, 
  className = '',
  size = 'lg',
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-lg transition-all duration-300
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    transform hover:scale-105 active:scale-95
  `;
  
  const variants = {
    primary: `
      bg-blue-600 text-white shadow-lg
      hover:bg-blue-700 hover:shadow-xl
      focus:ring-blue-500
      border-2 border-transparent
    `,
    secondary: `
      bg-transparent text-blue-600 border-2 border-blue-600
      hover:bg-blue-600 hover:text-white hover:shadow-lg
      focus:ring-blue-500
    `,
    outline: `
      bg-transparent text-gray-800 border-2 border-gray-300
      hover:bg-gray-800 hover:text-white hover:border-gray-800
      focus:ring-gray-500
    `
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  const MotionComponent = motion.a;

  if (href) {
    return (
      <MotionComponent
        href={href}
        target={target}
        rel={rel}
        className={classes}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      className={classes}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default CTAButton;