// Next Imports
import { NextResponse } from 'next/server'

interface LoginRequest {
  email: string
  password: string
}

interface BackendLoginRequest {
  username: string
  password: string
}

interface BackendLoginResponse {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  isAdmin: boolean
  isDepartmentAdmin: boolean
  isTeamMember: boolean
  departmentId?: number
  teamId?: number
  hasDepartmentRights: boolean
  managedEquipmentTypes: any[]
  accessToken: string
}

interface NextAuthUser {
  id: number
  name: string
  email: string
  image?: string
  role?: string
  accessToken: string
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { email, password }: LoginRequest = await req.json()

    // Prepare the request for the backend API
    const backendRequest: BackendLoginRequest = {
      username: email, // Backend uses username field for email
      password
    }

    // Call the backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'

    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRequest)
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          {
            message: ['Email or Password is invalid']
          },
          {
            status: 401,
            statusText: 'Unauthorized Access'
          }
        )
      }

      // Handle other errors
      const errorData = await response.json().catch(() => ({ message: 'Server error' }))

      
return NextResponse.json(
        {
          message: [errorData.message || 'Login failed']
        },
        {
          status: response.status,
          statusText: response.statusText || 'Error'
        }
      )
    }

    // Parse the successful response from backend
    const backendUser: BackendLoginResponse = await response.json()

    // Transform the backend response to match NextAuth expected format
    const nextAuthUser: NextAuthUser = {
      id: backendUser.id,
      name: `${backendUser.firstName} ${backendUser.lastName}`.trim() || backendUser.username,
      email: backendUser.email,
      image: '/images/avatars/1.png', // Default avatar - could be enhanced later
      role: backendUser.isAdmin ? 'admin' : 
            backendUser.isDepartmentAdmin ? 'department_admin' : 
            backendUser.isTeamMember ? 'team_member' : 'user',
      accessToken: backendUser.accessToken
    }

    return NextResponse.json(nextAuthUser)

  } catch (error) {
    console.error('Login API error:', error)
    
return NextResponse.json(
      {
        message: ['Internal server error']
      },
      {
        status: 500,
        statusText: 'Internal Server Error'
      }
    )
  }
}
