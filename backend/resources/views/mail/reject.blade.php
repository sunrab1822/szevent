<!DOCTYPE html>
<html lang="hu">

<head>
    <meta charset="UTF-8">
    <title>Rendezvény elutasítva</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="background-color:#f4f4f4; padding:30px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                    style="background-color:#ffffff; border-radius:6px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">

                    {{-- Fejléc --}}
                    <tr>
                        <td style="background-color:#50ADC9; padding:3px 30px;">
                            <img src="{{ $message->embed(storage_path('app/public/logo/sze_logo_fekvo_RGB_negativ.png')) }}"
                                alt="Széchenyi István Egyetem" style="height:60px; display:block;">
                        </td>
                    </tr>

                    {{-- Tartalom --}}
                    <tr>
                        <td style="padding:30px;">
                            <p style="font-size:15px; color:#333333; margin-top:0;">
                                Tisztelt {{ $organizerName }}!
                            </p>

                            <p style="font-size:15px; color:#333333; line-height:1.6;">
                                {{ $customMessage }}
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color:#f8f9fa; border-left:4px solid #50ADC9; margin:20px 0;">
                                <tr>
                                    <td style="padding:15px 20px;">
                                        <p
                                            style="margin:0 0 5px 0; font-size:13px; color:#666666; text-transform:uppercase; letter-spacing:0.5px;">
                                            Rendezvény
                                        </p>
                                        <p style="margin:0 0 15px 0; font-size:15px; color:#222222; font-weight:bold;">
                                            {{ $eventName }}
                                        </p>

                                        <p
                                            style="margin:0 0 5px 0; font-size:13px; color:#666666; text-transform:uppercase; letter-spacing:0.5px;">
                                            Megjegyzés
                                        </p>
                                        <p style="margin:0; font-size:15px; color:#222222;">
                                            {{ $reason }}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size:14px; color:#555555; line-height:1.6;">
                                Amennyiben kérdése merülne fel a döntéssel kapcsolatban, keresse elérhetőségeinken
                                munkatársainkat.
                            </p>
                        </td>
                    </tr>

                    {{-- Lábléc --}}
                    <tr>
                        <td style="background-color:#f0f0f0; padding:15px 30px; text-align:center;">
                            <p style="font-size:11px; color:#999999; margin:0;">
                                Ez egy automatikusan generált üzenet, kérjük ne válaszoljon közvetlenül erre az
                                e-mailre.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>
