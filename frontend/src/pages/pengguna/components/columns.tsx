import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pengguna } from "@/services/pengguna"

interface CellActionProps {
  original: Pengguna
  onEdit: (data: Pengguna) => void
  onDelete: (data: Pengguna) => void
}

type Column = {
  id: string
  header: string
  accessorKey?: keyof Pengguna
  cell?: (props: { 
    row: { 
      original: Pengguna; 
      index: number 
    }; 
    meta: { 
      onEdit: (data: Pengguna) => void; 
      onDelete: (data: Pengguna) => void;
      currentPage: number;
      itemsPerPage: number;
    } 
  }) => React.ReactNode
}

const CellAction = ({ original, onEdit, onDelete }: CellActionProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(original)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(original)}
          className="text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: Column[] = [
  {
    id: "number",
    header: "No",
    cell: ({ row, meta }) => {
      const { currentPage, itemsPerPage } = meta;
      return (currentPage - 1) * itemsPerPage + row.index + 1;
    }
  },
  {
    id: "nama_lengkap",
    header: "Nama Lengkap",
    accessorKey: "nama_lengkap"
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email"
  },
  {
    id: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return role === "admin" ? "Admin" : role === "doctor" ? "Dokter" : "Pasien";
    }
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row, meta }) => (
      <CellAction 
        original={row.original}
        onEdit={meta.onEdit}
        onDelete={meta.onDelete}
      />
    ),
  },
]
