'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/features/auth/actions/logout.action'
import {
  LayoutDashboard,
  Users,
  Users2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sun,
  Moon,
  BarChart2,
  CreditCard,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useState } from 'react'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'

const navItems = [
  { href: '/dashboard', label: 'Painel', icon: LayoutDashboard, exact: true },
  { href: '/leads', label: 'Clientes', icon: Users },
  { href: '/operacional/cartoes', label: 'Comandas', icon: CreditCard },
  { href: '/operacional', label: 'Análise', icon: BarChart2, exact: true },
]

const adminNavItems = [
  { href: '/settings/users', label: 'Colaboradores', icon: Users2 },
]

function NavLinks({
  collapsed,
  isAdmin,
  pathname,
  onNavigate,
}: {
  collapsed: boolean
  isAdmin: boolean
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex-1 space-y-1 p-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            (item.exact ? pathname === item.href : pathname.startsWith(item.href))
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground'
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </Link>
      ))}

      {isAdmin && (
        <>
          <Separator className="my-2" />
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                pathname.startsWith(item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </>
      )}
    </nav>
  )
}

function UserFooter({
  collapsed,
  user,
}: {
  collapsed: boolean
  user: { full_name: string; role: string } | null
}) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="border-t p-2 space-y-1">
      {!collapsed && user && (
        <div className="flex items-center gap-2 px-3 py-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">
              {user.full_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.full_name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={cn(
          'w-full text-muted-foreground',
          collapsed ? 'px-0 justify-center' : 'justify-start gap-3'
        )}
      >
        {theme === 'dark'
          ? <Sun className="h-4 w-4 shrink-0" />
          : <Moon className="h-4 w-4 shrink-0" />
        }
        {!collapsed && (theme === 'dark' ? 'Modo Claro' : 'Modo Escuro')}
      </Button>
      <form action={logoutAction}>
        <Button
          variant="ghost"
          size="sm"
          type="submit"
          className={cn(
            'w-full text-muted-foreground',
            collapsed ? 'px-0 justify-center' : 'justify-start gap-3'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && 'Sair'}
        </Button>
      </form>
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: user } = useCurrentUser()
  const isAdmin = user?.role === 'admin'
  const isDesktop = useMediaQuery('(min-width: 768px)')

  // Mobile: drawer via Sheet
  if (!isDesktop) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-40 flex h-9 w-9 items-center justify-center rounded-md border bg-card shadow-sm md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 p-0 flex flex-col">
            <div className="flex h-16 items-center px-4 border-b">
              <span className="text-lg font-bold">Diamond CRM</span>
            </div>
            <NavLinks
              collapsed={false}
              isAdmin={isAdmin}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
            <UserFooter collapsed={false} user={user} />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop: sidebar estática colapsável
  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center px-4 border-b overflow-hidden">
        {!collapsed && <span className="text-lg font-bold">Diamond CRM</span>}
      </div>

      <NavLinks
        collapsed={collapsed}
        isAdmin={isAdmin}
        pathname={pathname}
      />

      <UserFooter collapsed={collapsed} user={user} />

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm"
        aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  )
}
