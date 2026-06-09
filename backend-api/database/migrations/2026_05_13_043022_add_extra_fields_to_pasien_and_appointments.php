<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update pasien table
        Schema::table('pasien', function (Blueprint $table) {
            $table->string('pekerjaan')->nullable()->after('alamat');
            $table->string('agama')->nullable()->after('pekerjaan');
        });

        // Update appointments table
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('patient_gender')->nullable()->after('patient_phone');
            $table->date('patient_birth_date')->nullable()->after('patient_gender');
            $table->text('patient_address')->nullable()->after('patient_birth_date');
            $table->string('patient_job')->nullable()->after('patient_address');
            $table->string('patient_religion')->nullable()->after('patient_job');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pasien', function (Blueprint $table) {
            $table->dropColumn(['pekerjaan', 'agama']);
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'patient_gender', 
                'patient_birth_date', 
                'patient_address', 
                'patient_job', 
                'patient_religion'
            ]);
        });
    }
};
