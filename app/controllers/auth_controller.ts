import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import ally from '@adonisjs/ally/services/main'
import vine, { errors as vineErrors } from '@vinejs/vine'

const registerSchema = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2),
    email: vine.string().trim().email(),
    password: vine.string().minLength(8).confirmed(),
  })
)

const loginSchema = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string(),
  })
)

export default class AuthController {
  async redirectToGoogle({ response }: HttpContext) {
    await ally.use('google').redirect((redirectUrlRequest) => {
      redirectUrlRequest.scopes(['userinfo.email', 'userinfo.profile'])
    })
  }

  async handleGoogleCallback({ response }: HttpContext) {
    const google = ally.use('google')

    /**
     * Know if the user denied the consent during the code flow
     */
    if (google.accessDenied()) {
      return 'Access was denied'
    }

    /**
     * Know if there was an error during the code flow
     */
    if (google.hasError()) {
      return google.getError()
    }

    /**
     * Access user info
     */
    const googleUser = await google.user()

    /**
     * Find or create user in the database
     */
    const user = await User.firstOrCreate(
      {
        email: googleUser.email!,
      },
      {
        fullName: googleUser.name,
        googleId: googleUser.id,
        avatarUrl: googleUser.avatarUrl,
        // Note: You might want to handle password creation differently,
        // perhaps by generating a random password or leaving it null
        // if the user is only authenticating via Google.
        password: Math.random().toString(36).slice(-8),
      }
    )

    /**
     * Generate access token
     */
    const token = await User.accessTokens.create(user)

    return response.ok({
      token: token.value!.release(),
      user,
    })
  }

  async register({ request, response }: HttpContext) {
    try {
      const payload = await request.validate({ schema: registerSchema })

      const user = await User.create({
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password, // Password will be hashed by the model hook
      })

      const token = await User.accessTokens.create(user)

      // Depending on your frontend setup, you might want to return the token
      // and let the frontend handle the redirect, or redirect from the backend.
      // For Inertia, redirecting from the backend is common.
      // return response.redirect('/profile') // Or '/home' or wherever appropriate

      // For API-style response:
      return response.created({
        token: token.value!.release(),
        user,
      })
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        return response.status(422).send(error.messages)
      }
      // Handle other errors (e.g., database errors)
      return response.status(500).send({ error: 'Registration failed' })
    }
  }

  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = await request.validate({ schema: loginSchema })

      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)

      return response.ok({
        token: token.value!.release(),
        user,
      })
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        return response.status(422).send(error.messages)
      } else if (error.code === 'E_INVALID_CREDENTIALS') {
        return response.status(401).send({ error: 'Invalid email or password' })
      }
      // Handle other errors
      return response.status(500).send({ error: 'Login failed' })
    }
  }
}
