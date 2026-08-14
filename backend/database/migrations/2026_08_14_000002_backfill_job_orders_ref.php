<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Backfill `ref` values for any job_orders rows that were inserted before
     * the ref column existed (old seeded / test data).
     */
    public function up(): void
    {
        $rows = DB::table('job_orders')
            ->whereNull('ref')
            ->orderBy('id')
            ->get(['id']);

        // Find the highest existing ref number so we don't collide
        $max = DB::table('job_orders')
            ->whereNotNull('ref')
            ->selectRaw("MAX(CAST(REPLACE(ref, 'JO-', '') AS INTEGER)) as max_num")
            ->value('max_num') ?? 0;

        $counter = $max + 1;
        foreach ($rows as $row) {
            DB::table('job_orders')
                ->where('id', $row->id)
                ->update(['ref' => 'JO-' . str_pad($counter, 3, '0', STR_PAD_LEFT)]);
            $counter++;
        }
    }

    public function down(): void
    {
        // No reverse needed; ref values added are harmless
    }
};
