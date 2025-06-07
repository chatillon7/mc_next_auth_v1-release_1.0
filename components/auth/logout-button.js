'use client'

import { logout } from '@/app/actions/auth'
import { useActionState } from 'react'

export default function LogoutButton() {
  const [state, action, pending] = useActionState(logout, undefined)

  return (
    <form action={action}>
      <button disabled={pending} className="btn btn-outline-light mt-2 w-100" type="submit">
        <i className="bi bi-box-arrow-right"></i>
      </button>
    </form>
  )
}
