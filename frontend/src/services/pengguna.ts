import { api, getDefaultHeaders } from '@/lib/api'

export interface Pengguna {
  id_users: number
  email: string
  nama_lengkap: string
  role: 'admin' | 'doctor' | 'patient'
  passwords?: string
}

export const penggunaService = {
  getList: async () => {
    const response = await fetch(api.master.users, { headers: getDefaultHeaders() })
    if (!response.ok) throw new Error('Failed to fetch pengguna')
    const data = await response.json()
    // For simplicity, we just return the array without pagination if the backend returns array
    return { data, total_pages: 1 }
  },

  create: async (data: Omit<Pengguna, 'id_users'>) => {
    const response = await fetch(api.master.users, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create pengguna')
    }
    return response.json()
  },

  update: async (id: number, data: Partial<Pengguna>) => {
    const response = await fetch(`${api.master.users}/${id}`, {
      method: 'PUT',
      headers: getDefaultHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update pengguna')
    }
    return response.json()
  },

  delete: async (id: number) => {
    const response = await fetch(`${api.master.users}/${id}`, {
      method: 'DELETE',
      headers: getDefaultHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete pengguna')
    return response.json()
  }
}
