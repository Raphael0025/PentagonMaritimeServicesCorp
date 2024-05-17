'use client'

import { usePathname  } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react';

export default function Navbar() {
    const pathname = usePathname()
    const [customToken, setCustomToken] = useState<string | null>(null);
    const router = useRouter()

    const shouldHideNavbar = pathname?.startsWith('/admissions') || pathname?.startsWith('/login') || pathname?.startsWith('/enterprise-portal') ;

    if (shouldHideNavbar) {
        return null; // Don't render anything if conditions are met
    }
    
    return (
        <nav>Navbar</nav>
    )
}
