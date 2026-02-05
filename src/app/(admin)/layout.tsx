import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Settings,
} from 'lucide-react';

const adminNavItems = [
  { href: '/admin', icon: LayoutDashboard, label: '대시보드' },
  { href: '/admin/users', icon: Users, label: '회원 관리' },
  { href: '/admin/posts', icon: Package, label: '게시글 관리' },
  { href: '/admin/orders', icon: ShoppingCart, label: '주문 관리' },
  { href: '/admin/disputes', icon: AlertTriangle, label: '분쟁 관리' },
  { href: '/admin/settlements', icon: DollarSign, label: '정산 관리' },
  { href: '/admin/settings', icon: Settings, label: '설정' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* 사이드바 */}
      <aside className="w-64 border-r bg-muted/40 p-4 hidden md:block">
        <div className="mb-8">
          <Link href="/admin" className="text-xl font-bold">
            직구역구 Admin
          </Link>
        </div>
        <nav className="space-y-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
