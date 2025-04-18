import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useShoppingBag } from '../../context/ShoppingBagContext'

export default function SuccessPage() {
  const router = useRouter()
  const { clearBag } = useShoppingBag()
  const { session_id } = router.query

  useEffect(() => {
    if (session_id) {
      // Clear the cart on successful checkout
      clearBag()
    }
  }, [session_id, clearBag])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 space-y-6">
        <div className="flex items-center justify-center">
          <div className="bg-green-100 rounded-full p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">
            Thank you for your purchase. We&apos;ve sent a confirmation email with details of your order.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/" className="block text-center w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded">
            Return to Shop
          </Link>
        </div>
      </div>
    </div>
  )
}
