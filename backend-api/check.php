<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach(\App\Models\User::all() as $u) {
    $isPwd = \Illuminate\Support\Facades\Hash::check('password', $u->passwords) ? 'password' : 'unknown';
    echo $u->id_users . " | " . $u->username . " | " . $u->email . " | " . $isPwd . "\n";
}
