import { Head, Link, useForm, usePage } from '@inertiajs/react' // Added usePage
import React from 'react'

// Define User and PageProps interfaces (can be moved to a shared types file)
interface User {
  id: number;
  fullName: string;
  email: string;
  avatar_url?: string;
}

interface PageProps {
  auth: {
    user: User | null;
  };
}

export default function Login() {
  const { props } = usePage<PageProps>()
  const { user } = props.auth || { user: null }

  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
  })

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // For a real app, you'd likely call:
    // post('/login', { onSuccess: () => { /* redirect or update UI */ } })
    console.log(data)
  }

  return (
    <>
      <Head title="Login" />

      {/* Navigation Bar */}
      <nav className="bg-sand-2 p-4 shadow-md absolute top-0 left-0 right-0">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-primary">MyApp</Link>
          <div className="space-x-4">
            <Link href="/" className="text-sand-11 hover:text-primary">Home</Link>
            {user ? (
              <>
                <Link href="/profile" className="text-sand-11 hover:text-primary">Profile</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sand-11 hover:text-primary">Login</Link>
                <Link href="/register" className="text-sand-11 hover:text-primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-16"> {/* Added pt-16 for spacing below nav */}
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center">Login</h1>
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
            <div>
              <button
                type="submit"
                disabled={processing}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Login
              </button>
            </div>
          </form>
          <p className="text-sm text-center">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register
            </Link>
          </p>
           <p className="text-sm text-center">
            Or sign in with Google: <Link href="/auth/google" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in with Google</Link>
          </p>
        </div>
      </div>
    </>
  )
}
