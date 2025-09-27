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
        Schema::table('user_certificates', function (Blueprint $table) {
            $table->string('url')->nullable(); // Add this field for user-uploaded cert file/link
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_certificates', function (Blueprint $table) {
            $table->dropColumn('url');
        });
    }
};
