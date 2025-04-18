import '../app/globals.css'
import React from 'react'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import '../lib/reactPatch' // Import React 19 compatibility patches

// PrimeReact styles
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

// Import CartProvider dynamically with ssr disabled to prevent server-rendering issues
const CartProvider = dynamic(
  () => import('../components/CartProvider'),
  { ssr: false }
)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  )
}
