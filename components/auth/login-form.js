'use client'

import { login } from '@/app/actions/auth'
import { useActionState } from 'react'

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <form action={action}>

      <div className='mb-3'>
        <input id="login-email" className="form-control" name="email" placeholder="E-Posta" autoComplete="username" />
      </div>
      <div className='mb-3'>
        <input id="login-password" className="form-control" name="password" type="password" placeholder='Parola' autoComplete="current-password" />
      </div>
      <button className="btn btn-dark mb-3" disabled={pending} type="submit">
        Giriş Yap
      </button>
      {state?.errors?.global && <div className="alert alert-danger">{state.errors.global}</div>}
      {state?.errors?.email && <div className="alert alert-danger">{state.errors.email}</div>}
      {state?.errors?.password && <div className="alert alert-danger">{state.errors.password}</div>}
    </form>
  )
}
