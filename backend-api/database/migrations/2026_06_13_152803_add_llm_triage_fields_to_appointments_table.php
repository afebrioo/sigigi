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
        Schema::table('appointments', function (Blueprint $table) {
            $table->text('keluhan_utama')->nullable()->after('questionnaire');
            $table->text('anamnesis_draft')->nullable()->after('keluhan_utama');
            $table->json('ai_triage_analysis')->nullable()->after('anamnesis_draft');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['keluhan_utama', 'anamnesis_draft', 'ai_triage_analysis']);
        });
    }
};
