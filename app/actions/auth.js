'use server';

import { SignupFormSchema, LoginFormSchema } from '@/lib/definitions'
import prisma from '@/lib/prisma';
import { createSession } from '@/lib/session';
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signup(state, formData) {

  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const validatedFields = SignupFormSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validatedFields.data
  const hashedPassword = await bcrypt.hash(password, 12)

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    await createSession(user.id)
    redirect("/")
  } catch (error) {
    if (error.code === 'P2002') {
      return {
        errors: {
          email: ['Bu e-posta adresi zaten kullanılıyor.'],
        },
      }
    }
    return {
      errors: {
        general: ['Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.'],
      },
    }
  }
}

export async function login(state, formData) {
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const validatedFields = LoginFormSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user) {
    return {
      errors: {
        global: ['E-posta adresi veya şifre hatalı.'],
      },
    }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return {
      errors: {
        global: ['E-posta adresi veya şifre hatalı.'],
      },
    }
  }

  await createSession(user.id, user.role)
  redirect("/")

}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')

  redirect('/')
}
