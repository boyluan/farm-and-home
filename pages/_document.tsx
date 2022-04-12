import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head />
      <body className='bg-gradient-to-r from-gray-200 via-orange-50 via-orange-100 via-green-50 to-gray-200'>
        <link
          as="font"
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Jua&display=swap"
        />

        <link
          as="font"
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@600&display=swap"
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
