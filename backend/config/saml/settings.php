<?php

return [
    'strict' => true,
    'debug' => true,


    'sp' => [
        'entityId' => env('APP_URL') . '/api/saml/metadata',
        'NameIDFormat' => "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
        'assertionConsumerService' => [
            'url' => env('APP_URL') . '/api/saml/acs',
            'binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
        ],
        'singleLogoutService' => [
            'url' => env('APP_URL') . '/api/saml/sls',
            'binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        ],
        'x509cert' => '',  // Optional SP cert
        'privateKey' => '', // Optional SP private key
    ],

    'idp' => [
        'entityId' => env('SAML_IDP_ENTITYID'),
        'NameIDFormat' => "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
        'singleSignOnService' => [
            'url' => env('SAML_IDP_SSO'),
            'binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        ],
        'singleLogoutService' => [
            'url' => env('SAML_IDP_SLO'),
            'binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        ],
        'x509cert' => env('SAML_IDP_CERT'),
    ],
];
