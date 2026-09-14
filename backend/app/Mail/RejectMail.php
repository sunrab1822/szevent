<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RejectMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        private string $organizerName,
        private string $eventName,
        private string $reason,
        private string $customMessage,
    ) {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Rendezvény elutasítva - Széchenyi István Egyetem',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.reject',
            with: [
                'organizerName' => $this->organizerName,
                'eventName' => $this->eventName,
                'reason' => $this->reason,
                'customMessage' => $this->customMessage,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
