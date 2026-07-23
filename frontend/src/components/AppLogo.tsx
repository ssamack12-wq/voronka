import React from 'react';
import appIcon from '../assets/app-icon.png';

type AppLogoProps = {
  className?: string;
};

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-9 h-9' }) => (
  <img src={appIcon} alt="" className={`object-contain shrink-0 ${className}`} />
);
