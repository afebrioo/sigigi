<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Remove any clinic entries containing 'Cibiru'
        DB::table('klinik')->where('nama_klinik', 'like', '%Cibiru%')->delete();
        
        // Update/Restore default clinics
        DB::table('klinik')->updateOrInsert(
            ['id_klinik' => 1],
            [
                'nama_klinik' => 'Klinik Lembang',
                'alamat_klinik' => 'Jl. Grand Hotel No. 70, Lembang',
                'jam_operasional' => '16.00 - 20.00',
            ]
        );

        DB::table('klinik')->updateOrInsert(
            ['id_klinik' => 2],
            [
                'nama_klinik' => 'Klinik Cibadak',
                'alamat_klinik' => 'Jl. Cibadak 194, Bandung',
                'jam_operasional' => '16.00 - 20.00',
            ]
        );

        // Delete other clinics to ensure clean state
        DB::table('klinik')->where('id_klinik', '>', 2)->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
