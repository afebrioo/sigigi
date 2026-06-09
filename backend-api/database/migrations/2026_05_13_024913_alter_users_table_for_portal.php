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
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->unique()->after('nama_lengkap');
            $table->enum('role', ['admin', 'patient', 'doctor'])->default('patient')->after('email');
            $table->string('phone_number')->nullable()->after('role');
            $table->string('username')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['email', 'role', 'phone_number']);
            $table->string('username')->nullable(false)->change();
        });
    }
};
