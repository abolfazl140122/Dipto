import React from 'react';

interface GeminiLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const GeminiLogo: React.FC<GeminiLogoProps> = ({ width = 28, height = 28, className }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M11.25 18C11.25 14.2725 14.2725 11.25 18 11.25C21.7275 11.25 24.75 14.2725 24.75 18C24.75 21.7275 21.7275 24.75 18 24.75C16.9575 24.75 16 23.7975 16 22.755V22.755C16 21.7125 16.9575 20.76 18 20.76C19.515 20.76 20.76 19.515 20.76 18C20.76 16.485 19.515 15.24 18 15.24C16.485 15.24 15.24 16.485 15.24 18V28.245C15.24 30.63 13.23 32.64 10.845 32.64C8.46 32.64 6.45 30.63 6.45 28.245C6.45 23.67 10.845 20.43 11.25 18Z"
      fill="url(#paint0_linear_10_22)"
    />
    <path
      d="M18 3C10.74 3 4.8 8.94 4.8 16.2L4.8 16.2C7.395 12.06 12.285 9 18 9C24.75 9 30.345 14.1 30.345 20.595C30.345 27.09 24.75 32.19 18 32.19C15.93 32.19 14.01 31.695 12.33 30.855"
      stroke="url(#paint1_linear_10_22)"
      strokeWidth="2.5"
    />
    <defs>
      <linearGradient
        id="paint0_linear_10_22"
        x1="18"
        y1="11.25"
        x2="18"
        y2="32.64"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8E83EE" />
        <stop offset="1" stopColor="#5270EE" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_10_22"
        x1="17.5725"
        y1="3"
        x2="17.5725"
        y2="32.19"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#83A6EE" />
        <stop offset="1" stopColor="#5270EE" />
      </linearGradient>
    </defs>
  </svg>
);

export default GeminiLogo;
