import DashboardLayout from '../components/DashboardLayout'
import { ProfileContent } from './ProfilePage'

const DashboardProfilePage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full">
        <ProfileContent variant="dashboard" />
      </div>
    </DashboardLayout>
  )
}

export default DashboardProfilePage
