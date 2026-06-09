<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{

    public function index()
    {
        $this->checkAdmin();
        return response()->json(User::all());
    }

    public function store(Request $request)
    {
        $this->checkAdmin();
        $request->validate([
            'email' => 'required|email|unique:users',
            'passwords' => 'required|min:6',
            'nama_lengkap' => 'required|string',
            'role' => 'required|in:admin,doctor,patient'
        ]);

        $user = User::create([
            'email' => $request->email,
            'passwords' => Hash::make($request->passwords),
            'nama_lengkap' => $request->nama_lengkap,
            'role' => $request->role,
        ]);

        return response()->json($user, 201);
    }

    public function show($id)
    {
        $this->checkAdmin();
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $this->checkAdmin();
        $user = User::findOrFail($id);
        
        $request->validate([
            'email' => 'required|email|unique:users,email,'.$id.',id_users',
            'nama_lengkap' => 'required|string',
            'role' => 'required|in:admin,doctor,patient'
        ]);

        $data = $request->only(['email', 'nama_lengkap', 'role']);
        if ($request->filled('passwords')) {
            $data['passwords'] = Hash::make($request->passwords);
        }

        $user->update($data);

        return response()->json($user);
    }

    public function destroy($id)
    {
        $this->checkAdmin();
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
