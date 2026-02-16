import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <div className="p-8 bg-white shadow-md rounded-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h1>
        <p className="mb-6 text-gray-600">
          There was an error during the authentication process. This could be due to an invalid or expired code, or a configuration issue.
        </p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
