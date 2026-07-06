<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth as FacadesAuth;
use OneLogin\Saml2\Auth;

class SamlController extends Controller
{
    protected function samlAuth(): Auth
    {
        $settings = config('saml.settings');

        return new Auth($settings);
    }

    public function login()
    {
        $auth = $this->samlAuth();

        return redirect($auth->login(null, [], false, false, true));
    }

    public function acs(Request $request)
    {
        $auth = $this->samlAuth();
        $auth->processResponse();

        if (! $auth->isAuthenticated()) {
            abort(401, 'SAML authentication failed.');
        }

        $attributes = $this->attributeNormalizer($auth->getAttributes());

        $email = $attributes['email'] ?? null;
        $username = $attributes['username'] ?? null;
        $role_with_domain = $attributes['role_with_domain'] ?? null;
        $displayName = $attributes['displayName'] ?? null;

        if (! $email) {
            abort(403, 'No email attribute returned from IdP.');
        }

        $user = User::updateOrCreate([
            'name' => $username,
        ], [
            'email' => $email,
            'name' => $username,
            'role_with_domain' => $role_with_domain,
            'displayName' => $displayName,
        ]);
        FacadesAuth::login($user);
        $token = $user->createToken('szeREndezoToken')->plainTextToken;
        $user->save();

        // $cookieDomain = parse_url(env('FRONT_URL'), PHP_URL_HOST);
        // $isSecure = str_starts_with(env('FRONT_URL'), 'https://');

        return response()
            ->redirectTo(env('FRONT_URL'))
            ->withCookie(cookie('auth_token', $token, 60, '/', null, false, false));
    }

    public function metadata()
    {
        $auth = $this->samlAuth();
        $metadata = $auth->getSettings()->getSPMetadata();

        return response($metadata, 200)->header('Content-Type', 'application/xml');
    }

    public function logout()
    {

        $auth = $this->samlAuth();
        cookie()->queue(cookie()->forget('auth_token', '/', null));
        return redirect($auth->logout());
    }

    public function sls(Request $request)
    {
        $cookieDomain = parse_url(env('FRONT_URL'), PHP_URL_HOST);

        FacadesAuth::user()->tokens()->delete();
        FacadesAuth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        cookie()->queue(cookie()->forget('auth_token', '/', null));

        $auth = $this->samlAuth();
        $auth->processSLO();

        return response()
            ->redirectTo(env('FRONT_URL'))
            ->withoutCookie('auth_token', '/', null);
    }

    public function attributeNormalizer($attributes)
    {
        $map = [
            'urn:oid:1.3.6.1.4.1.5923.1.1.1.6' => 'username',
            'urn:oid:1.3.6.1.4.1.5923.1.1.1.9' => 'role_with_domain',
            'urn:oid:0.9.2342.19200300.100.1.3' => 'email',
            'urn:oid:2.16.840.1.113730.3.1.241' => 'displayName',
            'urn:oid:2.16.840.1.113730.3.1.39' => 'location',
        ];

        $normalized = [];

        foreach ($map as $oid => $key) {
            if (isset($attributes[$oid])) {
                $normalized[$key] = $attributes[$oid][0];
            }
        }

        return $normalized;
    }
}
