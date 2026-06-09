// src/pages/dashboard/DashboardPage.tsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { dashboardService, type DashboardData } from "@/services/dashboard"
import { DashboardCharts } from "./components/DashboardCharts"
import { Skeleton } from "@/components/ui/skeleton"

const DashboardPage = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await dashboardService.getAll()
        setData(response)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data dashboard. Silakan coba lagi.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const role = user?.role || 'admin'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang, {user?.nama_lengkap || 'Admin'}!
        </p>
      </div>

      {role === 'doctor' && (
        <Card className="bg-blue-600 text-white border-none shadow-xl shadow-blue-200 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 transform group-hover:scale-110 transition-transform duration-700"></div>
          <CardHeader>
            <CardTitle className="text-2xl font-black italic uppercase tracking-widest relative z-10">Pemeriksaan Pasien</CardTitle>
            <CardDescription className="text-blue-100 font-bold relative z-10">Anda memiliki antrian pasien yang perlu dilayani hari ini.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
             <button 
               onClick={() => navigate('/doctor/pemeriksaan')}
               className="bg-white text-blue-600 font-black px-8 py-3 rounded-2xl shadow-lg hover:bg-blue-50 transition-all transform active:scale-95 uppercase tracking-widest text-sm"
             >
               Lihat Antrian Saya
             </button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pasien
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.summary.total_patients || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{data?.summary.new_patients_this_month || 0} pasien baru bulan ini
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Dokter
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.summary.total_doctors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Dari {data?.summary.total_clinics || 0} klinik
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tindakan Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.summary.treatments_this_month || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {data?.summary.treatment_percent_change || 0 >= 0 ? '+' : ''}
                  {data?.summary.treatment_percent_change || 0}% dari bulan lalu
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendapatan Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(data?.summary.revenue_this_month || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data?.summary.revenue_percent_change || 0 >= 0 ? '+' : ''}
                  {data?.summary.revenue_percent_change || 0}% dari bulan lalu
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Jadwal Hari Ini</CardTitle>
            <CardDescription>
              Daftar jadwal praktek dokter hari ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {data?.today_schedule && data.today_schedule.length > 0 ? (
                    data.today_schedule.map((schedule, index) => (
                      <div key={index} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">Dr. {schedule.nama_dokter}</p>
                          <p className="text-sm text-muted-foreground">
                            {schedule.jadwal_praktek} • {schedule.nama_klinik}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">{schedule.jumlah_pasien} Pasien</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Tidak ada jadwal dokter hari ini</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tindakan Terpopuler</CardTitle>
            <CardDescription>
              5 Tindakan paling sering dilakukan bulan ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2">
                  {data?.popular_treatments && data.popular_treatments.length > 0 ? (
                    data.popular_treatments.map((treatment, index) => (
                      <div key={index} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{treatment.nama_tindakan}</p>
                          <p className="text-sm text-muted-foreground">
                            {treatment.jumlah_tindakan} tindakan
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Tidak ada data tindakan bulan ini</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid gap-4 md:grid-cols-7">
        <DashboardCharts 
          visitsData={data?.charts.visits || []}
          revenueData={data?.charts.revenue || []}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default DashboardPage