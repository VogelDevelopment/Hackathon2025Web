<?php

namespace App\Enums;

enum CertificateStatus: string
{
    case REQUESTED = 'requested';
    case APPROVED = 'approved';
}
