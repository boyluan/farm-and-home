import Link from "next/link";
import { PropsWithChildren } from "react";

interface Props {
  href: string;
}

export default function BackLink({ children, href }: PropsWithChildren<Props>) {
  return (
    <div>
        <div className="cancel-container">
        <div className="arrow-left">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          height={24}
          width={24}
          // class="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          stroke-width="4"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        
      <a className="cancel-right"
        href={href}
        target='_self'
        rel='noreferrer'
      >
        <span className='font-loader hover:underline'>{children}</span>
      </a>
      </div>
    </div>
    </div>
  )
}
