<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PortalAuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'full_name' => 'required|string',
            'phone' => 'required|string',
            'nik' => 'nullable|string',
            'tempat_lahir' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|string',
            'alamat' => 'nullable|string',
            'golongan_darah' => 'nullable|string',
            'kontak_darurat_nama' => 'nullable|string',
            'kontak_darurat_telepon' => 'nullable|string',
            'kontak_darurat_relasi' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'email' => $request->email,
                'passwords' => Hash::make($request->password),
                'nama_lengkap' => $request->full_name,
                'role' => 'patient',
                'phone_number' => $request->phone,
            ]);

            // Create Master Pasien record
            $count = \App\Models\MasterPasien::count() + 1;
            $noRekamMedis = 'CIB' . str_pad($count, 5, '0', STR_PAD_LEFT);

            $pasien = \App\Models\MasterPasien::create([
                'id_klinik' => 1, // Default clinic ID
                'no_rekam_medis' => $noRekamMedis,
                'nama_lengkap' => $request->full_name,
                'nik' => $request->nik,
                'tempat_lahir' => $request->tempat_lahir,
                'tanggal_lahir' => $request->tanggal_lahir,
                'jenis_kelamin' => $request->jenis_kelamin,
                'alamat' => $request->alamat,
                'telepon' => $request->phone,
                'email' => $request->email,
                'golongan_darah' => $request->golongan_darah,
                'kontak_darurat_nama' => $request->kontak_darurat_nama,
                'kontak_darurat_telepon' => $request->kontak_darurat_telepon,
                'kontak_darurat_relasi' => $request->kontak_darurat_relasi,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal registrasi: ' . $e->getMessage()], 500);
        }

        $token = $user->createToken('portal-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id_users,
                'email' => $user->email,
                'role' => $user->role,
                'full_name' => $user->nama_lengkap,
                'phone_number' => $user->phone_number,
                'biodata' => [
                    'nik' => $pasien->nik,
                    'tempat_lahir' => $pasien->tempat_lahir,
                    'tanggal_lahir' => $pasien->tanggal_lahir ? $pasien->tanggal_lahir->toDateString() : null,
                    'jenis_kelamin' => $pasien->jenis_kelamin,
                    'alamat' => $pasien->alamat,
                    'golongan_darah' => $pasien->golongan_darah,
                    'kontak_darurat_nama' => $pasien->kontak_darurat_nama,
                    'kontak_darurat_telepon' => $pasien->kontak_darurat_telepon,
                    'kontak_darurat_relasi' => $pasien->kontak_darurat_relasi,
                ]
            ]
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required', // can be email or username
            'password' => 'required',
        ]);

        $user = User::where('email', $request->login)
                    ->orWhere('username', $request->login)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->passwords)) {
            return response()->json(['success' => false, 'message' => 'Invalid login credentials'], 401);
        }

        $pasien = \App\Models\MasterPasien::where('email', $user->email)
                    ->orWhere('telepon', $user->phone_number)
                    ->first();

        $token = $user->createToken('portal-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id_users,
                'email' => $user->email,
                'role' => $user->role,
                'full_name' => $user->nama_lengkap,
                'phone_number' => $user->phone_number,
                'biodata' => $pasien ? [
                    'nik' => $pasien->nik,
                    'tempat_lahir' => $pasien->tempat_lahir,
                    'tanggal_lahir' => $pasien->tanggal_lahir ? $pasien->tanggal_lahir->toDateString() : null,
                    'jenis_kelamin' => $pasien->jenis_kelamin,
                    'alamat' => $pasien->alamat,
                    'golongan_darah' => $pasien->golongan_darah,
                    'kontak_darurat_nama' => $pasien->kontak_darurat_nama,
                    'kontak_darurat_telepon' => $pasien->kontak_darurat_telepon,
                    'kontak_darurat_relasi' => $pasien->kontak_darurat_relasi,
                ] : null
            ]
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Email tidak ditemukan.'], 404);
        }

        $token = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        // TODO: Configure mailer. For now returning the token for testing.
        // \Illuminate\Support\Facades\Mail::raw("Token reset password Anda: $token\nSilakan gunakan token ini untuk mereset password Anda.", function($msg) use ($request) {
        //     $msg->to($request->email)->subject('Reset Password');
        // });

        $response = [
            'success' => true,
            'message' => 'Instruksi reset password telah dikirim.'
        ];

        if (app()->environment('local', 'testing')) {
            $response['dev_token'] = $token;
        }

        return response()->json($response);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:6'
        ]);

        $reset = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$reset || !Hash::check($request->token, $reset->token)) {
            return response()->json(['success' => false, 'message' => 'Token tidak valid.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->passwords = Hash::make($request->password);
            $user->save();
            
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['success' => true, 'message' => 'Password berhasil diubah.']);
        }

        return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
    }

    public function googleLogin(Request $request)
    {
        $request->validate([
            'credential' => 'required|string',
        ]);

        $credential = $request->input('credential');

        try {
            // Verifikasi ID Token dengan Google API
            $response = \Illuminate\Support\Facades\Http::get("https://oauth2.googleapis.com/tokeninfo?id_token=" . $credential);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token Google tidak valid atau kedaluwarsa.'
                ], 401);
            }

            $googleData = $response->json();

            // Verifikasi Audience Claim (Client ID)
            $allowedClientId = env('GOOGLE_CLIENT_ID', '589393665351-6qbq6d2gfins5bsvid1qjb7vm4khg5o3.apps.googleusercontent.com');
            if (empty($googleData['aud']) || $googleData['aud'] !== $allowedClientId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token Google tidak valid (Client ID tidak cocok).'
                ], 401);
            }

            if (empty($googleData['email']) || empty($googleData['sub'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mendapatkan profil pengguna Google.'
                ], 400);
            }

            $googleId = $googleData['sub'];
            $email = $googleData['email'];
            $name = $googleData['name'] ?? 'Google User';

            // Cari user di database berdasarkan google_id atau email
            $user = User::where('google_id', $googleId)
                        ->orWhere('email', $email)
                        ->first();

            if ($user) {
                // Sinkronisasi google_id jika belum terisi
                if (empty($user->google_id)) {
                    $user->google_id = $googleId;
                    $user->save();
                }

                $pasien = \App\Models\MasterPasien::where('email', $user->email)
                            ->orWhere('telepon', $user->phone_number)
                            ->first();

                $token = $user->createToken('portal-token')->plainTextToken;

                return response()->json([
                    'success' => true,
                    'registered' => true,
                    'token' => $token,
                    'user' => [
                        'id' => $user->id_users,
                        'email' => $user->email,
                        'role' => $user->role,
                        'full_name' => $user->nama_lengkap,
                        'phone_number' => $user->phone_number,
                        'biodata' => $pasien ? [
                            'nik' => $pasien->nik,
                            'tempat_lahir' => $pasien->tempat_lahir,
                            'tanggal_lahir' => $pasien->tanggal_lahir ? $pasien->tanggal_lahir->toDateString() : null,
                            'jenis_kelamin' => $pasien->jenis_kelamin,
                            'alamat' => $pasien->alamat,
                            'golongan_darah' => $pasien->golongan_darah,
                            'kontak_darurat_nama' => $pasien->kontak_darurat_nama,
                            'kontak_darurat_telepon' => $pasien->kontak_darurat_telepon,
                            'kontak_darurat_relasi' => $pasien->kontak_darurat_relasi,
                        ] : null
                    ]
                ]);
            }

            // User belum terdaftar
            return response()->json([
                'success' => true,
                'registered' => false,
                'google_data' => [
                    'email' => $email,
                    'name' => $name,
                    'google_id' => $googleId
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memverifikasi token: ' . $e->getMessage()
            ], 500);
        }
    }

    public function googleRegister(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'full_name' => 'required|string',
            'google_id' => 'required|string|unique:users,google_id',
            'phone' => 'required|string',
            'nik' => 'nullable|string',
            'tempat_lahir' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|string',
            'alamat' => 'nullable|string',
            'golongan_darah' => 'nullable|string',
            'kontak_darurat_nama' => 'nullable|string',
            'kontak_darurat_telepon' => 'nullable|string',
            'kontak_darurat_relasi' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'email' => $request->email,
                'passwords' => Hash::make(Str::random(32)),
                'nama_lengkap' => $request->full_name,
                'google_id' => $request->google_id,
                'role' => 'patient',
                'phone_number' => $request->phone,
            ]);

            // Create Master Pasien record
            $count = \App\Models\MasterPasien::count() + 1;
            $noRekamMedis = 'CIB' . str_pad($count, 5, '0', STR_PAD_LEFT);

            $pasien = \App\Models\MasterPasien::create([
                'id_klinik' => 1,
                'no_rekam_medis' => $noRekamMedis,
                'nama_lengkap' => $request->full_name,
                'nik' => $request->nik,
                'tempat_lahir' => $request->tempat_lahir,
                'tanggal_lahir' => $request->tanggal_lahir,
                'jenis_kelamin' => $request->jenis_kelamin,
                'alamat' => $request->alamat,
                'telepon' => $request->phone,
                'email' => $request->email,
                'golongan_darah' => $request->golongan_darah,
                'kontak_darurat_nama' => $request->kontak_darurat_nama,
                'kontak_darurat_telepon' => $request->kontak_darurat_telepon,
                'kontak_darurat_relasi' => $request->kontak_darurat_relasi,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal registrasi via Google: ' . $e->getMessage()], 500);
        }

        $token = $user->createToken('portal-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id_users,
                'email' => $user->email,
                'role' => $user->role,
                'full_name' => $user->nama_lengkap,
                'phone_number' => $user->phone_number,
                'biodata' => [
                    'nik' => $pasien->nik,
                    'tempat_lahir' => $pasien->tempat_lahir,
                    'tanggal_lahir' => $pasien->tanggal_lahir ? $pasien->tanggal_lahir->toDateString() : null,
                    'jenis_kelamin' => $pasien->jenis_kelamin,
                    'alamat' => $pasien->alamat,
                    'golongan_darah' => $pasien->golongan_darah,
                    'kontak_darurat_nama' => $pasien->kontak_darurat_nama,
                    'kontak_darurat_telepon' => $pasien->kontak_darurat_telepon,
                    'kontak_darurat_relasi' => $pasien->kontak_darurat_relasi,
                ]
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'nik' => 'required|string|max:16',
            'tempat_lahir' => 'required|string|max:50',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:L,P',
            'alamat' => 'required|string',
            'golongan_darah' => 'nullable|in:A,B,AB,O',
            'kontak_darurat_nama' => 'nullable|string|max:100',
            'kontak_darurat_telepon' => 'nullable|string|max:20',
            'kontak_darurat_relasi' => 'nullable|string|max:50',
            'current_password' => 'nullable|string|min:6',
            'new_password' => 'nullable|string|min:6|required_with:current_password',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()], 422);
        }

        if ($request->filled('new_password')) {
            if (!Hash::check($request->current_password, $user->passwords)) {
                return response()->json(['success' => false, 'message' => 'Password saat ini salah.'], 400);
            }
            $user->passwords = Hash::make($request->new_password);
        }

        DB::beginTransaction();
        try {
            // Update User details
            $user->nama_lengkap = $request->nama_lengkap;
            $user->phone_number = $request->phone;
            $user->save();

            // Find or create Master Pasien record
            $pasien = \App\Models\MasterPasien::where('email', $user->email)->first();

            if (!$pasien) {
                $count = \App\Models\MasterPasien::count() + 1;
                $noRekamMedis = 'CIB' . str_pad($count, 5, '0', STR_PAD_LEFT);
                
                $pasien = \App\Models\MasterPasien::create([
                    'id_klinik' => 1, // Default clinic ID
                    'no_rekam_medis' => $noRekamMedis,
                    'email' => $user->email,
                    'nama_lengkap' => $request->nama_lengkap,
                    'nik' => $request->nik,
                    'tempat_lahir' => $request->tempat_lahir,
                    'tanggal_lahir' => $request->tanggal_lahir,
                    'jenis_kelamin' => $request->jenis_kelamin,
                    'alamat' => $request->alamat,
                    'telepon' => $request->phone,
                    'golongan_darah' => $request->golongan_darah,
                    'kontak_darurat_nama' => $request->kontak_darurat_nama,
                    'kontak_darurat_telepon' => $request->kontak_darurat_telepon,
                    'kontak_darurat_relasi' => $request->kontak_darurat_relasi,
                ]);
            } else {
                $pasien->update([
                    'nama_lengkap' => $request->nama_lengkap,
                    'nik' => $request->nik,
                    'tempat_lahir' => $request->tempat_lahir,
                    'tanggal_lahir' => $request->tanggal_lahir,
                    'jenis_kelamin' => $request->jenis_kelamin,
                    'alamat' => $request->alamat,
                    'telepon' => $request->phone,
                    'golongan_darah' => $request->golongan_darah,
                    'kontak_darurat_nama' => $request->kontak_darurat_nama,
                    'kontak_darurat_telepon' => $request->kontak_darurat_telepon,
                    'kontak_darurat_relasi' => $request->kontak_darurat_relasi,
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal memperbarui profil: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'user' => [
                'id' => $user->id_users,
                'email' => $user->email,
                'role' => $user->role,
                'full_name' => $user->nama_lengkap,
                'phone_number' => $user->phone_number,
                'biodata' => [
                    'nik' => $pasien->nik,
                    'tempat_lahir' => $pasien->tempat_lahir,
                    'tanggal_lahir' => $pasien->tanggal_lahir ? (\Carbon\Carbon::parse($pasien->tanggal_lahir)->toDateString()) : null,
                    'jenis_kelamin' => $pasien->jenis_kelamin,
                    'alamat' => $pasien->alamat,
                    'golongan_darah' => $pasien->golongan_darah,
                    'kontak_darurat_nama' => $pasien->kontak_darurat_nama,
                    'kontak_darurat_telepon' => $pasien->kontak_darurat_telepon,
                    'kontak_darurat_relasi' => $pasien->kontak_darurat_relasi,
                ]
            ]
        ]);
    }
}
