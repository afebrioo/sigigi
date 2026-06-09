import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"
import { FormDialog } from "./components/form-dialog"
import { DeleteAlert } from "./components/delete-alert"
import { useDebounce } from "@/hooks/use-debounce"
import { penggunaService, type Pengguna } from "@/services/pengguna"

const PenggunaPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [data, setData] = useState<Pengguna[]>([])
  const [filteredData, setFilteredData] = useState<Pengguna[]>([])
  const [openForm, setOpenForm] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)
  const [selectedData, setSelectedData] = useState<Pengguna | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 500)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await penggunaService.getList()
      setData(response.data)
      setTotalPages(response.total_pages)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengambil data pengguna. Silakan coba lagi.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  // Filter data dynamically on search
  useEffect(() => {
    const filtered = data.filter((item) =>
      item.nama_lengkap.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.role.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    setFilteredData(filtered)
  }, [debouncedSearch, data])

  const handleSubmit = async (values: Omit<Pengguna, 'id_users'> & { passwords?: string }) => {
    try {
      setIsSubmitting(true)
      if (selectedData) {
        // Only include password if filled
        const payload = { ...values }
        if (!payload.passwords) delete payload.passwords
        await penggunaService.update(selectedData.id_users, payload)
        toast({ title: "Berhasil", description: "Data pengguna berhasil diperbarui" })
      } else {
        await penggunaService.create(values)
        toast({ title: "Berhasil", description: "Data pengguna berhasil ditambahkan" })
      }
      await fetchData()
      setOpenForm(false)
      setSelectedData(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal menyimpan data. Silakan coba lagi."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (data: Pengguna) => {
    setSelectedData(data)
    setOpenForm(true)
  }

  const handleDelete = (data: Pengguna) => {
    setSelectedData(data)
    setOpenDeleteAlert(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedData) return

    try {
      setIsDeleting(true)
      await penggunaService.delete(selectedData.id_users)
      toast({ title: "Berhasil", description: "Data pengguna berhasil dihapus" })
      await fetchData()
      setOpenDeleteAlert(false)
      setSelectedData(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus data. Silakan coba lagi."
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Data Pengguna</h2>
        <Button 
          onClick={() => {
            setSelectedData(null)
            setOpenForm(true)
          }}
          disabled={isLoading}
        >
          Tambah Pengguna
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Cari nama, email, atau role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
          disabled={isLoading}
        />
      </div>

      <DataTable 
        columns={columns} 
        data={filteredData}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={isLoading}
      />

      <FormDialog 
        open={openForm}
        onOpenChange={setOpenForm}
        initialData={selectedData}
        onSubmit={handleSubmit}
        loading={isSubmitting}
      />

      <DeleteAlert 
        open={openDeleteAlert}
        onOpenChange={setOpenDeleteAlert}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        itemToDelete={selectedData}
      />
    </div>
  )
}

export default PenggunaPage
