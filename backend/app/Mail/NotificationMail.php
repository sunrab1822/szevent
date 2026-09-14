<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        private string $userName,
        private ?string $eventName,
        private string $notificationMessage,
    ) {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Értesítés - ' . ($this->eventName ?? 'rendezvény') . ' - Széchenyi István Egyetem',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.notification',
            with: [
                'userName' => $this->userName,
                'eventName' => $this->eventName,
                'notificationMessage' => $this->notificationMessage,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
