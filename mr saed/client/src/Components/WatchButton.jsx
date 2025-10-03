import React from 'react';
import { FaPlay, FaEye } from 'react-icons/fa';

const WatchButton = ({ 
  item, 
  purchaseType, 
  onWatch, 
  className = "",
  showIcon = true,
  variant = "primary", // primary, secondary, outline
  showButton = true, // New prop to control button visibility
  disabled = false
}) => {


  const getButtonStyles = () => {
    const baseStyles = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors";
    
    switch (variant) {
      case "primary":
        return `${baseStyles} bg-green-600 hover:bg-green-700 text-white`;
      case "secondary":
        return `${baseStyles} bg-orange-600 hover:bg-orange-700 text-white`;
      case "outline":
        return `${baseStyles} border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20`;
      default:
        return `${baseStyles} bg-green-600 hover:bg-green-700 text-white`;
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (variant) {
      case "outline":
        return <FaEye className="text-sm" />;
      default:
        return <FaPlay className="text-sm" />;
    }
  };

  const getText = () => {
    return 'مشاهدة المحتوى';
  };

  // Don't render anything if showButton is false
  if (!showButton) {
    return null;
  }

  return (
    <button
      onClick={() => {
        if (disabled) return;
        onWatch && onWatch(item, purchaseType);
      }}
      disabled={disabled}
      className={`${getButtonStyles()} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {getIcon()}
      <span>{getText()}</span>
    </button>
  );
};

export default WatchButton;
