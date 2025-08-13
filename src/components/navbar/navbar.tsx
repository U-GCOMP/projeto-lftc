import { AppRoutes } from "@/routes";
import Link from "next/link";

function NavbarLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li className="hover:underline hover:text-accent-default hover:decoration-accent-default">
            <Link href={href}>{children}</Link>
        </li>
    )
}

export default function Navbar() {
    return (
        <nav className="bg-brand-1000 text-white py-4 shadow-md">
        <ul className="flex space-x-6 justify-center">
          <NavbarLink href={AppRoutes.HOME}>Home</NavbarLink>
          <NavbarLink href={AppRoutes.TESTE_REGEX}>Teste Regex</NavbarLink>
        </ul>
      </nav>
    )
}