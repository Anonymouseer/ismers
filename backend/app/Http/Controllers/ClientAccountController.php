<?php

namespace App\Http\Controllers;

use App\Models\ClientAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ClientAccountController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $client = ClientAccount::where('email', $request->email)->first();

        if (! $client || ! Hash::check($request->password, $client->password)) {
            throw ValidationException::withMessages([
                'email' => ['Incorrect email or password. Please try again.'],
            ]);
        }

        return response()->json([
            'id' => $client->id,
            'company' => $client->company,
            'industry' => $client->industry,
            'contactPerson' => $client->contact_person,
            'designation' => $client->designation,
            'email' => $client->email,
            'mobile' => $client->mobile,
            'loggedIn' => true,
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'company' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'contactPerson' => 'required|string|max:255',
            'designation' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:client_accounts,email',
            'mobile' => 'required|string|max:50',
            'password' => 'required|string|min:8',
            'agreed' => 'required|boolean',
        ]);

        $client = ClientAccount::create([
            'company' => $request->company,
            'industry' => $request->industry,
            'contact_person' => $request->contactPerson,
            'designation' => $request->designation,
            'email' => $request->email,
            'mobile' => $request->mobile,
            'password' => Hash::make($request->password),
            'agreed' => $request->boolean('agreed'),
        ]);

        return response()->json([
            'id' => $client->id,
            'company' => $client->company,
            'industry' => $client->industry,
            'contactPerson' => $client->contact_person,
            'designation' => $client->designation,
            'email' => $client->email,
            'mobile' => $client->mobile,
            'loggedIn' => true,
        ], 201);
    }
}
