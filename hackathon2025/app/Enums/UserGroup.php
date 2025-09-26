<?php

namespace App\Enums;

enum UserGroup: string
{
    case ADMIN = 'admin';
    case OPERATOR = 'operator';
    case USER = 'user';
}
