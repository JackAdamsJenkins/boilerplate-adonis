import { test } from '@japa/runner'
import { apiClient } from '@japa/api-client'
import User from '#models/user'
import { AceFactory } from '@adonisjs/core/factories'
import app from '@adonisjs/core/services/app'
import ally from '@adonisjs/ally/services/main'
import { HttpContext } from '@adonisjs/core/http'

// Placeholder for Google API mock
const mockGoogle = (httpContext: HttpContext) => {
  const googleAlly = ally.use(httpContext, 'google')

  // @ts-ignore
  googleAlly.redirect = async (callback) => {
    const urlRequest = {
      scopes: (_scopes: string[]) => {},
      getRedirectUrl: () => 'https://accounts.google.com/mock-redirect',
    }
    // @ts-ignore
    await callback(urlRequest)
    return 'https://accounts.google.com/mock-redirect'
  }

  // @ts-ignore
  googleAlly.user = async () => {
    return {
      id: 'mock-google-id',
      name: 'Mock User',
      email: 'mock.user@example.com',
      avatarUrl: 'https://mock.avatar.url/mock.jpg',
      token: {
        token: 'mock-access-token',
        expiresAt: null,
      },
      original: {},
    }
  }
  // @ts-ignore
  googleAlly.accessDenied = () => false
  // @ts-ignore
  googleAlly.hasError = () => false

  return googleAlly
}


test.group('Auth', (group) => {
  // Setup database
  group.setup(async () => {
    const ace = await new AceFactory().make(app.baseUrl, { importer: (filePath) => import(filePath) })
    await ace.app.init()
    await ace.app.boot()
    await ace.command('db:wipe')
    await ace.command('db:migrate')
  })

  test('should redirect to Google authentication page', async ({ client }) => {
    const response = await client.get('/auth/google')
    response.assertStatus(302) // Or the appropriate redirect status
    response.assertRedirectsTo('https://accounts.google.com/mock-redirect')
  }).setup(async () => {
    // @ts-ignore
    HttpContext.getter('google', mockGoogle, true)
  })

  test('should create a new user and return token on successful Google callback', async ({ client, assert }) => {
    const response = await client.get('/auth/google/callback')

    response.assertStatus(200)
    response.assertBodyContains({ token: assert.exists(), user: { email: 'mock.user@example.com' } })

    const user = await User.findBy('email', 'mock.user@example.com')
    assert.isNotNull(user)
    assert.equal(user?.googleId, 'mock-google-id')
    assert.equal(user?.fullName, 'Mock User')
  }).setup(async () => {
    // @ts-ignore
    HttpContext.getter('google', mockGoogle, true)
  })

  test('should login existing user and return token on successful Google callback', async ({ client, assert }) => {
    // Create an existing user
    await User.create({
      email: 'mock.user@example.com',
      fullName: 'Existing User',
      password: 'password', // Or handle null passwords if using only Google auth
      googleId: 'mock-google-id',
    })

    const response = await client.get('/auth/google/callback')

    response.assertStatus(200)
    response.assertBodyContains({ token: assert.exists(), user: { email: 'mock.user@example.com' } })

    const user = await User.findBy('email', 'mock.user@example.com')
    assert.isNotNull(user)
    assert.equal(user?.fullName, 'Existing User') // Ensure existing user details are not overwritten
  }).setup(async () => {
    // @ts-ignore
    HttpContext.getter('google', mockGoogle, true)
  })


  test('should return error if Google access denied', async ({ client }) => {
    const mockGoogleDenied = (httpContext: HttpContext) => {
      const googleAlly = mockGoogle(httpContext)
      // @ts-ignore
      googleAlly.accessDenied = () => true
      return googleAlly
    }
    // @ts-ignore
    HttpContext.getter('google', mockGoogleDenied, true)


    const response = await client.get('/auth/google/callback')
    response.assertStatus(200) // Or the appropriate error status
    response.assertBodyContains('Access was denied')
  })

  test('should return error if Google authentication fails', async ({ client }) => {
    const mockGoogleError = (httpContext: HttpContext) => {
      const googleAlly = mockGoogle(httpContext)
      // @ts-ignore
      googleAlly.hasError = () => true
      // @ts-ignore
      googleAlly.getError = () => 'Google auth error'
      return googleAlly
    }

    // @ts-ignore
    HttpContext.getter('google', mockGoogleError, true)

    const response = await client.get('/auth/google/callback')
    response.assertStatus(200) // Or the appropriate error status
    response.assertBodyContains('Google auth error')
  })
})
