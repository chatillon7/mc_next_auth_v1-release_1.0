import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import prisma from './prisma'
import { cache } from 'react'
import { redirect } from 'next/navigation'

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    redirect('/auth/login')
  }

  return { isAuth: true, userId: session.userId }
})

export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null

  try {
    return await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
    })
  } catch (error) {
    return null
  }
})
