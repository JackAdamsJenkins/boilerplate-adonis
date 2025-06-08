import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import ally from '@adonisjs/ally/services/main'

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
}
