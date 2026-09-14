<?php

namespace App\Enums;

enum ChatChannel: string
{
    case Rendezvenyes = 'rendezvenyes';
    case Unifamulus = 'unifamulus';
    case Jogi = 'jogi';

    /**
     * Roles allowed to read and write this channel.
     *
     * @return list<Role>
     */
    public function allowedRoles(): array
    {
        return match ($this) {
            self::Rendezvenyes => [Role::Admin, Role::RendezvenySzervezo],
            self::Unifamulus => [Role::Admin, Role::RendezvenySzervezo, Role::Unifamulus],
            self::Jogi => [Role::Admin, Role::RendezvenySzervezo, Role::JogiOsztaly],
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Rendezvenyes => 'Rendezvényesek',
            self::Unifamulus => 'Unifamulus',
            self::Jogi => 'Jogi',
        };
    }

    public function allows(int $role): bool
    {
        return in_array(Role::tryFrom($role), $this->allowedRoles(), true);
    }

    /**
     * Channels visible to the given role.
     *
     * @return list<ChatChannel>
     */
    public static function forRole(int $role): array
    {
        return array_values(array_filter(
            self::cases(),
            fn (ChatChannel $channel) => $channel->allows($role),
        ));
    }
}
