<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: application/json');

if (($_GET['key'] ?? '') !== 'sigigi123') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

try {
    $users = \App\Models\User::all(['id_users', 'username', 'email', 'role'])->toArray();
    echo json_encode([
        'status' => 'success',
        'database' => env('DB_DATABASE'),
        'users_count' => count($users),
        'users' => $users
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
