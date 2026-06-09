import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pengguna } from "@/services/pengguna"

const baseSchema = z.object({
  email: z.string().email("Format email tidak valid").min(1, "Email harus diisi"),
  nama_lengkap: z.string().min(1, "Nama lengkap harus diisi"),
  role: z.enum(["admin", "doctor", "patient"], {
    errorMap: () => ({ message: "Role harus diisi" })
  }),
})

const createSchema = baseSchema.extend({
  passwords: z.string().min(6, "Password minimal 6 karakter"),
})

const updateSchema = baseSchema.extend({
  passwords: z.string().optional().or(z.literal("")),
})

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: Pengguna | null
  onSubmit: (values: any) => Promise<void>
  loading?: boolean
}

export function FormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  loading = false,
}: FormDialogProps) {
  
  const formSchema = initialData ? updateSchema : createSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      nama_lengkap: "",
      role: "patient" as const,
      passwords: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        email: initialData.email,
        nama_lengkap: initialData.nama_lengkap,
        role: initialData.role,
        passwords: "",
      })
    } else {
      form.reset({
        email: "",
        nama_lengkap: "",
        role: "patient",
        passwords: "",
      })
    }
  }, [initialData, open, form])

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Pengguna" : "Tambah Pengguna"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nama_lengkap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{initialData ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Dokter</SelectItem>
                      <SelectItem value="patient">Pasien</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
