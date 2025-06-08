/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')
const UserController = () => import('#controllers/user_controller')
const AuthMiddleware = () => import('#middleware/auth_middleware')


router.on('/').renderInertia('home')
router.on('/about').renderInertia('about')

router.on('/login').renderInertia('auth/login')
router.on('/register').renderInertia('auth/register')
router.on('/profile').renderInertia('users/profile').use(AuthMiddleware) // GET profile page

router.post('/register', [AuthController, 'register'])
router.post('/login', [AuthController, 'login'])
router.put('/profile', [UserController, 'updateProfile']).use(AuthMiddleware) // PUT update profile data
router.get('/auth/google', [AuthController, 'redirectToGoogle'])
router.get('/auth/google/callback', [AuthController, 'handleGoogleCallback'])
