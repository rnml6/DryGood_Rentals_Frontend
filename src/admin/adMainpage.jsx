import AdminHeader from './adComponents/adHeader'
import { Outlet } from 'react-router-dom'

function adMainpage () {
  return (
    <div>
      <AdminHeader />
      <Outlet />
    </div>
  )
}

export default adMainpage