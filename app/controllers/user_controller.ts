import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import vine, { errors as vineErrors } from '@vinejs/vine'

const profileUpdateSchema = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).optional(),
    email: vine.string().trim().email().optional(),
    // Add other fields that can be updated, e.g., password
    // password: vine.string().minLength(8).confirmed().optional(),
  })
)

export default class UserController {
  async updateProfile({ request, response, auth }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized({ error: 'You must be logged in to update your profile.' })
    }

    try {
      const payload = await request.validate({ schema: profileUpdateSchema })
      const user = auth.user!

      // Update user fields if they are provided in the payload
      if (payload.fullName) {
        user.fullName = payload.fullName
      }
      if (payload.email) {
        // Check if email is changing and if it's already taken
        if (payload.email !== user.email) {
          const existingUser = await User.findBy('email', payload.email)
          if (existingUser && existingUser.id !== user.id) {
            return response.status(409).send({
              errors: [{ field: 'email', message: 'Email address is already in use.' }],
            })
          }
          user.email = payload.email
        }
      }
      // if (payload.password) {
      //   user.password = payload.password // Hashing will be handled by the model hook
      // }

      await user.save()

      return response.ok(user)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        return response.status(422).send(error.messages)
      }
      // Handle other errors (e.g., database errors)
      return response.status(500).send({ error: 'Profile update failed' })
    }
  }
}
