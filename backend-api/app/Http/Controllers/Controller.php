<?php
 
namespace App\Http\Controllers;
 
abstract class Controller
{
    protected function checkNotPatient()
    {
        $user = request()->user();
        if ($user && $user->role === 'patient') {
            abort(403, 'Forbidden');
        }
    }

    protected function checkAdmin()
    {
        $user = request()->user();
        if (!$user || $user->role !== 'admin') {
            abort(403, 'Forbidden');
        }
    }
}
