import { Head, useForm, usePage, Link } from '@inertiajs/react' // Added Link
import React, { useEffect } from 'react'

// Define a type for the user object if you have one, e.g., from props
// (This User interface is duplicated across files, consider moving to a shared types definition)
interface User {
  id: number;
  fullName: string;
  email: string;
  avatar_url?: string; // Make avatar_url optional
  // Add other user properties if needed
}

interface PageProps {
  auth: {
    user: User | null; // Allow user to be null if not authenticated
  };
  // Add other page props if needed
}


export default function Profile() {
  // Assuming the authenticated user object is passed as a prop named 'auth.user'
  const { props } = usePage<PageProps>()
  const user = props.auth?.user

  const { data, setData, patch, processing, errors } = useForm({
    name: '',
    email: '',
  })

  useEffect(() => {
    if (user) {
      setData({
        name: user.fullName || '',
        email: user.email || '',
      })
    }
  }, [user])

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Handle form submission logic here
    // For now, we'll just log the data
    console.log(data)
    // Example: patch('/profile')
  }

  if (!user) {
    // It's good practice to also include the nav bar on the "Please log in" page
    // or redirect to login from the route middleware itself.
    return (
        <>
            <Head title="Profile" />
            {/* Navigation Bar (even for non-logged-in state for consistency) */}
            <nav className="bg-sand-2 p-4 shadow-md absolute top-0 left-0 right-0">
              <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-semibold text-primary">MyApp</Link>
                <div className="space-x-4">
                  <Link href="/" className="text-sand-11 hover:text-primary">Home</Link>
                  {/* Since user is null here, show Login/Register */}
                  <Link href="/login" className="text-sand-11 hover:text-primary">Login</Link>
                  <Link href="/register" className="text-sand-11 hover:text-primary">Register</Link>
                </div>
              </div>
            </nav>
            <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-16">
                <p>Please log in to view your profile. <Link href="/login" className="text-indigo-600 hover:text-indigo-500">Login</Link></p>
            </div>
        </>
    )
  }

  return (
    <>
      <Head title="Profile" />

      {/* Navigation Bar */}
      <nav className="bg-sand-2 p-4 shadow-md absolute top-0 left-0 right-0">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-primary">MyApp</Link>
          <div className="space-x-4">
            <Link href="/" className="text-sand-11 hover:text-primary">Home</Link>
            {/* User is definitely logged in here */}
            <Link href="/profile" className="text-sand-11 hover:text-primary">Profile</Link>
            {/* Add a logout link/button here if needed */}
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-16"> {/* Added pt-16 */}
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center">User Profile</h1>

          <div className="flex justify-center">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={`${user.fullName || 'User'}'s avatar`}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
                No Avatar
              </div>
            )}
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
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
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <button
                type="submit"
                disabled={processing}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
