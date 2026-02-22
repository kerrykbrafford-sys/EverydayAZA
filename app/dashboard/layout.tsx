export const dynamic = 'force-dynamic'

import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen pt-[68px] bg-[#F4F2EE]">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                {children}
            </main>
        </div>
    )
}
