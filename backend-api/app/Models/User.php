<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $table = 'users'; // Nama tabel di database
    protected $primaryKey = 'id_users'; // Primary Key

    public $timestamps = true; // Gunakan created_at & updated_at

    protected $fillable = [
        'username',
        'passwords',
        'nama_lengkap',
        'email',
        'google_id',
        'role',
        'phone_number'
    ];

    protected $hidden = [
        'passwords',
        'remember_token',
    ];

    public function getAuthPassword()
    {
        return $this->passwords;
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'user_id', 'id_users');
    }
}