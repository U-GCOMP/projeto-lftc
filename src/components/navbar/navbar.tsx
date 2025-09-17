'use client';

import { AppRoutes } from "@/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavbarLink({ href, children }: { href: string; children: React.ReactNode }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <li className={`
            relative transition-all duration-200 hover:text-accent-default
            after:content-[''] after:absolute after:w-0 after:h-[1px] after:bg-accent-default after:bottom-0 after:left-1/2 after:transition-all after:duration-200 hover:after:w-full hover:after:left-0
            ${isActive ? 'text-accent-default' : ''}
        `}>
            <Link href={href}>{children}</Link>
        </li>
    )
}

export default function Navbar() {
    return (
        <nav className="sticky top-0 left-0 right-0 bg-brand-1000 text-white py-4 shadow-md">
            <ul className="flex space-x-6 justify-center text-[clamp(1rem,calc(0.5rem+0.5vw),3rem)]">
                <NavbarLink href={AppRoutes.HOME}>Home</NavbarLink>
                <NavbarLink href={AppRoutes.TESTE_REGEX}>Teste Regex</NavbarLink>
                <NavbarLink href={AppRoutes.GRAMATICA_REGULAR}>Gramática Regular</NavbarLink>
            </ul>
        </nav>
    )
}