'use client'

import { signup } from '@/app/actions/auth'
import { useActionState } from 'react'

export default function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <form action={action}>
      <div className="mb-3">
        <input id="signup-name" className="form-control border-0" name="name" placeholder="Kullanıcı Adı" aria-describedby="basic-addon1" />
      </div>

      <div className="mb-3">
        <input id="signup-email" className="form-control border-0" name="email" placeholder="E-Posta" aria-describedby="basic-addon2" autoComplete="username" />
      </div>

      <div className="mb-3">
        <input id="signup-password" className="form-control border-0" name="password" type="password" placeholder='Parola' aria-describedby="basic-addon3" autoComplete="new-password" />
      </div>
      <button className="btn btn-dark mb-3" disabled={pending} type="submit">
        Kaydol
      </button>
      {state?.errors?.name && <div className='alert alert-danger'>{state.errors.name}</div>}
      {state?.errors?.email && <div className='alert alert-danger'>{state.errors.email}</div>}
      {state?.errors?.password && (
        <div className='alert alert-danger'>
          <p>Parola gereksinimleri:</p>
          <ul>
            {state.errors.password.map((error) => (
              <li key={error}> {error}.</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  )
}
