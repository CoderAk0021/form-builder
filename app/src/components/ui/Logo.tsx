const Logo = ({ size = 37 }) => (
  <svg 
    width={size} 
    height={(size * 41) / 37} 
    viewBox="0 0 37 41" 
    fill="none" 
    xmlns="http://www.w3.org"
  >
    <g style={{ opacity: 1 }} id="logogram">
      <path 
        d="M0.301758 30.08L0.301761 10.08L10.3018 15.6355V24.5799L18.3018 29.08L26.3018 24.5799V15.6355L36.3019 10.08V30.08L18.3018 40.08L0.301758 30.08Z" 
        fill="#E4E4E7" 
      />
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M5.30177 12.8578L0.301758 10.08L18.3018 0.0799561L36.3019 10.08L31.3018 12.8578V27.58L18.3018 35.08L5.30176 27.58L5.30177 12.8578ZM30.7602 13.1587L26.3018 15.6355V15.58L18.3018 11.0799L10.3018 15.58V15.6355L5.84343 13.1587V27.2723L18.3018 34.4598L30.7602 27.2723V13.1587Z" 
        fill="url(#paint0_linear_vercel)" 
      />
    </g>
    <defs>
      <linearGradient 
        id="paint0_linear_vercel" 
        x1="5.30176" 
        y1="7.85773" 
        x2="32.3018" 
        y2="7.85774" 
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFFFFF" />
        <stop offset="0.307292" stopColor="#E4E4E7" />
        <stop offset="0.604167" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#FFFFFF" />
      </linearGradient>
    </defs>
  </svg>
);

export default Logo;
