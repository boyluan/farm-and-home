// import Image from 'next/image' // See: <https://nextjs.org/docs/basic-features/image-optimization>

export default function Footer() {
  // constants
  const TWITTER_HANDLE = 'boyluan';
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

  // const imagePath = `/assets/twitter-logo.svg`;

  return (
    <div>
    <footer className="footer-container">
      {/*<svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24"
      >
        <path 
          d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
        />
      </svg>
      */}
      {/*}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
          <path
            d="M10 20.5c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5zm3.5-1.5c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5c0-.828-.672-1.5-1.5-1.5zm6.304-17l-3.431 14h-2.102l2.541-11h-16.812l4.615 13h13.239l3.474-14h2.178l.494-2h-4.196z"
        />
      </svg>
      */}
      {/*
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24"
      >
          <path 
            d="M11.476 8.853c-.469-.288-.616-.903-.328-1.372l3.004-5.004c.191-.312.517-.477.849-.477.776 0 1.259.855.851 1.519l-3.005 5.005c-.294.479-.91.611-1.371.329zm3.426.147l-.351.569c-.548.896-1.503 1.431-2.553 1.431-1.202 0-2.359-.72-2.812-2h-9.186v2h.643c.535 0 1.021.304 1.256.784l4.101 10.216h12l4.102-10.214c.234-.481.722-.786 1.256-.786h.642v-2h-9.098zm-5.902 9c0 .552-.447 1-1 1s-1-.448-1-1v-4c0-.552.447-1 1-1s1 .448 1 1v4zm4 0c0 .552-.447 1-1 1s-1-.448-1-1v-4c0-.552.447-1 1-1s1 .448 1 1v4zm4 0c0 .552-.447 1-1 1s-1-.448-1-1v-4c0-.552.447-1 1-1s1 .448 1 1v4z"
        />
        </svg>
        */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          /* class="h-5 w-5" */
          viewBox="0 0 24 24" /* Defunct: viewBox="0 0 20 20" */
          stroke="currentColor"
          stroke-width="2"
        >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"
          />
          </svg>
      <a className="footer-text"
        href={TWITTER_LINK}
        target='_blank'
        rel='noreferrer'
      >
        <strong className="font-loader">{`made by: @${TWITTER_HANDLE}`}</strong>
        
      </a>
    </footer>
    </div>
  )
}
