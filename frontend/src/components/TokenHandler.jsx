import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Component tự động nhận token từ URL parameter
 * Sử dụng: http://localhost:3000/?token=xxx
 * Hoặc: http://localhost:3000/collection?token=xxx
 * 
 * Uses HiWeb_id pattern: stores token as 'userToken' in localStorage
 */
const TokenHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      console.log('🔐 Token detected in URL, saving to localStorage...')
      
      // Lưu token vào localStorage (HiWeb_id pattern)
      localStorage.setItem('userToken', token)
      
      // Xóa token khỏi URL để bảo mật
      searchParams.delete('token')
      setSearchParams(searchParams, { replace: true })
      
      console.log('✅ Token saved successfully as userToken!')
      
      // Reload page to trigger auth check
      window.location.reload()
    }
  }, [searchParams, setSearchParams])

  return null // Component này không render gì
}

export default TokenHandler
