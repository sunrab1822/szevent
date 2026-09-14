<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth as FacadesAuth;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\PersonalAccessToken;
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

        Cache::put($this->samlCacheKey($token), [
            'nameId' => $auth->getNameId(),
            'sessionIndex' => $auth->getSessionIndex(),
            'nameIdFormat' => $auth->getNameIdFormat(),
            'nameIdNameQualifier' => $auth->getNameIdNameQualifier(),
            'nameIdSPNameQualifier' => $auth->getNameIdSPNameQualifier(),
        ], now()->addDay());

        // $cookieDomain = parse_url(env('FRONT_URL'), PHP_URL_HOST);
        // $isSecure = str_starts_with(env('FRONT_URL'), 'https://');

        return response()
            ->redirectTo($this->frontUrl())
            ->withCookie(cookie('auth_token', $token, 60, '/', null, false, false));
    }

    public function metadata()
    {
        $auth = $this->samlAuth();
        $metadata = $auth->getSettings()->getSPMetadata();

        return response($metadata, 200)->header('Content-Type', 'application/xml');
    }

    public function logout(Request $request)
    {
        $token = $request->cookie('auth_token') ?? $request->query('token');
        $redirectUrl = $this->frontUrl();

        if ($token) {
            $saml = Cache::pull($this->samlCacheKey($token));
            PersonalAccessToken::findToken($token)?->delete();

            if (! empty($saml['nameId'])) {
                $auth = $this->samlAuth();
                $redirectUrl = $auth->logout(
                    null,
                    [],
                    $saml['nameId'],
                    $saml['sessionIndex'] ?? null,
                    true,
                    $saml['nameIdFormat'] ?? null,
                    $saml['nameIdNameQualifier'] ?? null,
                    $saml['nameIdSPNameQualifier'] ?? null
                );
            }
        }

        return redirect($redirectUrl)->withCookie(cookie()->forget('auth_token', '/', null));
    }

    public function sls(Request $request)
    {
        if ($token = $request->cookie('auth_token')) {
            PersonalAccessToken::findToken($token)?->delete();
            Cache::forget($this->samlCacheKey($token));
        }

        $redirectUrl = $this->frontUrl();

        try {
            $auth = $this->samlAuth();
            $sloResponseUrl = $auth->processSLO(true, null, false, null, true);
            if (is_string($sloResponseUrl) && $sloResponseUrl !== '') {
                $redirectUrl = $sloResponseUrl;
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return redirect($redirectUrl)->withCookie(cookie()->forget('auth_token', '/', null));
    }

    protected function samlCacheKey(string $token): string
    {
        return 'saml_slo:' . hash('sha256', $token);
    }

    protected function frontUrl(): string
    {
        return rtrim(env('FRONT_URL') ?: config('app.url') ?: '/', '/');
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
