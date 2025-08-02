import React from 'react';

const StripeLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        width={props.width || 80}
        height={props.height || 32}
        viewBox="0 0 80 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <rect width="80" height="32" rx="6" fill="#635BFF" />
        <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="bold"
            fontSize="18"
            fill="#fff"
        >
            stripe
        </text>
    </svg>
);

export default StripeLogo;