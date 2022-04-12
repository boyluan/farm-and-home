import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head />
      <body className='bg-gradient-to-r from-gray-200 via-orange-50 via-orange-100 via-green-50 to-gray-200'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
