<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Dashboard extends Model
{
    /**
     * Mendapatkan ringkasan data untuk dashboard
     */
    public static function getSummary()
    {
        $currentMonth = (int)date('n');
        $currentYear = (int)date('Y');

        // Total Pasien (From master pasien table)
        $totalPatients = DB::table('pasien')->count();
        $newPatientsThisMonth = DB::table('pasien')
            ->whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->count();

        // Total Dokter & Klinik (From existing tables)
        $totalDoctors = DB::table('dokter')->count();
        $totalClinics = DB::table('klinik')->count();

        // Tindakan Bulan Ini (Completed Appointments)
        $treatmentsThisMonth = DB::table('appointments')
            ->where('status', 'completed')
            ->whereMonth('appointment_date', $currentMonth)
            ->whereYear('appointment_date', $currentYear)
            ->count();

        $lastMonthDate = strtotime('-1 month');
        $lastMonth = (int)date('n', $lastMonthDate);
        $lastMonthYear = (int)date('Y', $lastMonthDate);

        $treatmentsLastMonth = DB::table('appointments')
            ->where('status', 'completed')
            ->whereMonth('appointment_date', $lastMonth)
            ->whereYear('appointment_date', $lastMonthYear)
            ->count();

        $treatmentPercentChange = $treatmentsLastMonth > 0 
            ? round((($treatmentsThisMonth - $treatmentsLastMonth) / $treatmentsLastMonth) * 100) 
            : 0;

        // Pendapatan Bulan Ini (Estimate from completed appointments * fixed rate or lookup)
        // For now, let's assume average 200k per treatment as a placeholder if no price table linked
        $revenueThisMonth = $treatmentsThisMonth * 200000;
        $revenueLastMonth = $treatmentsLastMonth * 200000;

        $revenuePercentChange = $revenueLastMonth > 0 
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100) 
            : 0;

        return [
            'total_patients' => $totalPatients,
            'new_patients_this_month' => $newPatientsThisMonth,
            'total_doctors' => $totalDoctors,
            'total_clinics' => $totalClinics,
            'treatments_this_month' => $treatmentsThisMonth,
            'treatment_percent_change' => $treatmentPercentChange,
            'revenue_this_month' => $revenueThisMonth,
            'revenue_percent_change' => $revenuePercentChange
        ];
    }

    /**
     * Mendapatkan jadwal dokter hari ini
     */
    public static function getTodaySchedule()
    {
        $today = date('Y-m-d');

        return DB::table('dokter_klinik')
            ->join('dokter', 'dokter_klinik.id_dokter', '=', 'dokter.id_dokter')
            ->join('klinik', 'dokter_klinik.id_klinik', '=', 'klinik.id_klinik')
            ->select(
                'dokter.nama_dokter',
                'dokter_klinik.jadwal_praktek',
                'klinik.nama_klinik',
                DB::raw('(SELECT COUNT(*) FROM rekam_medis_pasien 
                          WHERE rekam_medis_pasien.id_dokter_klinik = dokter_klinik.id_dokter_klinik 
                          AND DATE(rekam_medis_pasien.tanggal_kunjungan) = "' . $today . '") as jumlah_pasien')
            )
            ->where(DB::raw('FIND_IN_SET(DAYNAME("' . $today . '"), REPLACE(REPLACE(dokter_klinik.jadwal_praktek, " ", ""), ",", ","))'), '>', 0)
            ->orderBy('jumlah_pasien', 'desc')
            ->get();
    }

    /**
     * Mendapatkan tindakan terpopuler bulan ini
     */
    public static function getPopularTreatments()
    {
        $currentMonth = (int)date('n');
        $currentYear = (int)date('Y');

        return DB::table('appointments')
            ->select(
                'action_type as nama_tindakan',
                DB::raw('COUNT(*) as jumlah_tindakan')
            )
            ->where('status', 'completed')
            ->whereMonth('appointment_date', $currentMonth)
            ->whereYear('appointment_date', $currentYear)
            ->groupBy('action_type')
            ->orderBy('jumlah_tindakan', 'desc')
            ->limit(5)
            ->get();
    }

    /**
     * Mendapatkan data kunjungan per bulan (untuk grafik)
     */
    public static function getMonthlyVisits()
    {
        $currentYear = date('Y');
        
        $months = [];
        for ($i = 1; $i <= 12; $i++) {
            $months[] = [
                'month' => date('M', mktime(0, 0, 0, $i, 1)),
                'month_num' => $i
            ];
        }

        $result = [];
        foreach ($months as $month) {
            $count = DB::table('appointments')
                ->where('status', 'completed')
                ->whereMonth('appointment_date', $month['month_num'])
                ->whereYear('appointment_date', $currentYear)
                ->count();

            $result[] = [
                'name' => $month['month'],
                'total' => $count
            ];
        }

        return $result;
    }

    /**
     * Mendapatkan data pendapatan per bulan (untuk grafik)
     */
    public static function getMonthlyRevenue()
    {
        $currentYear = date('Y');
        
        $months = [];
        for ($i = 1; $i <= 12; $i++) {
            $months[] = [
                'month' => date('M', mktime(0, 0, 0, $i, 1)),
                'month_num' => $i
            ];
        }

        $result = [];
        foreach ($months as $month) {
            $count = DB::table('appointments')
                ->where('status', 'completed')
                ->whereMonth('appointment_date', $month['month_num'])
                ->whereYear('appointment_date', $currentYear)
                ->count();
            
            // Assume 200k per treatment
            $revenue = $count * 200000;

            $result[] = [
                'name' => $month['month'],
                'total' => $revenue
            ];
        }

        return $result;
    }
}