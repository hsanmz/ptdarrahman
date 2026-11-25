import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2, UserCheck, UserX, UserRound, Users } from 'lucide-react'
import PageHero from '../components/PageHero'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/client'
import type { User } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { ConfirmDialog } from '../components/ui/confirmdialog'
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Card } from "@/components/ui"
import { Badge } from "@/components/ui"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui"
import { Skeleton } from "@/components/ui"
import { EmptyState } from "@/components/ui"
import { ErrorState } from "@/components/ui"

export default function UsersPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user: currentUser, loading: authLoading } = useAuth()

  const canCrud = currentUser?.user_type === 'superadmin' || !!currentUser?.is_superadmin
  const canView = currentUser?.user_type === 'superadmin' || !!currentUser?.is_superadmin

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const perPage = 20

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      toast('success', 'User berhasil dihapus')
      setDeleteTarget(null)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (e: unknown) => {
      toast('error', api.getErrorMessage(e, 'Gagal menghapus user'))
    },
  })

  useEffect(() => {
    if (!authLoading && currentUser && !canView) {
      navigate('/dashboard')
    }
  }, [currentUser, authLoading, canView, navigate])

  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    error: usersErr,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['users', search, page],
    queryFn: async () => {
      const res = await api.getUsers({ search: search || undefined, page, per_page: perPage })
      if (Array.isArray(res)) return { users: res, total: res.length }
      const userList = ((res as any).data || []) as User[]
      return {
        users: userList.filter((u: User) => u.user_type !== 'superadmin'),
        // total dari server TIDAK termasuk superadmin — nilainya dipakai apa
        // adanya (menghitung halaman); tidak perlu diubah lebih lanjut.
        total: (res as any).total ?? userList.length,
      }
    },
    enabled: !!canView && !authLoading,
  })
  const users = usersData?.users ?? []
  const totalUsers = usersData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalUsers / perPage))

  // Setelah hapus item terakhir di halaman terakhir, clamp page ke totalPages
  // agar tidak tampil EmptyState palsu.
  useEffect(() => {
    if (totalPages >= 1 && page > totalPages) {
       
      setPage(totalPages)
    }
  }, [page, totalPages])

  const { data: roles = [], isError: rolesError } = useQuery({
    queryKey: ['roles'],
    queryFn: api.getRoles,
    enabled: !!canView && !authLoading,
  })

  // Debounce search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1) }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  function getRoleName(roleId: string) {
    const role = roles.find(r => r.id === roleId)
    return role?.name || '—'
  }

  if (authLoading || (!authLoading && !canView)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => { if (!deleteMutation.isPending) setDeleteTarget(null) }}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id) }}
        title="Hapus User"
        message={`Yakin ingin menghapus user "${deleteTarget?.username || ''}" secara permanen?`}
        variant="danger"
        confirmLabel="Ya, Hapus"
        loading={deleteMutation.isPending}
      />
      <div className="space-y-6 animate-fadeIn">
      <PageHero
        eyebrow="Manajemen Akses"
        title="Users"
        description="Kelola admin dan pengguna sistem"
        docKey="superadmin-users"
        chips={[
          { icon: Users, label: `${totalUsers} Pengguna Terdaftar` },
          { icon: UserRound, label: `Halaman ${page} dari ${totalPages}` },
        ]}
        actions={canCrud ? (
          <button
            onClick={() => navigate('/users/new')}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A853] px-4 py-2 text-xs font-bold text-[#0E3B26] transition-colors hover:bg-[#E2BC6B]"
          >
            <Plus className="h-3.5 w-3.5" /> Buat User
          </button>
        ) : undefined}
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari username, email, atau nama..."
          className="pl-10"
        />
      </div>

      {/* Query gagal: tampil sebagai error, BUKAN EmptyState "Belum Ada User" */}
      {rolesError && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Nama role tidak dapat dimuat — kolom Role akan tampil "—" sampai reload berhasil.
        </p>
      )}

      {/* Table */}
      {usersLoading ? (
        <Card className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>
      ) : usersError ? (
        <ErrorState
          status={api.isApiError(usersErr) ? usersErr.status : 500}
          retry={() => refetchUsers()}
          fullscreen={false}
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="Belum Ada User"
          description="Belum ada pengguna yang terdaftar. Buat user pertama untuk mulai mengelola akses sistem."
          action={canCrud ? (
            <Button onClick={() => navigate('/users/new')}>
              <Plus /> Buat User
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <Card className="hidden md:block overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    {canCrud && <TableHead className="text-right">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow
                      key={user.id}
                      onClick={() => navigate(`/users/${user.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {user.username}
                          {user.user_type === 'superadmin' && (
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">SA</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{user.phone || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{user.full_name || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{getRoleName(user.role_id)}</TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success">
                            <UserCheck className="h-3 w-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 border-destructive/30 bg-destructive/10 text-destructive">
                            <UserX className="h-3 w-3" /> Inactive
                          </Badge>
                        )}
                      </TableCell>
                      {canCrud && (
                        <TableCell className="text-right">
                          <div className="inline-flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`Edit ${user.username}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/users/${user.id}`)
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {user.user_type !== 'superadmin' && user.id !== currentUser?.id && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                aria-label={`Hapus ${user.username}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteTarget(user)
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {users.map((user: any) => (
              <Card
                key={user.id}
                onClick={() => navigate(`/users/${user.id}`)}
                className="cursor-pointer space-y-3 p-5 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                      {user.username}
                      {user.user_type === 'superadmin' && (
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">SA</Badge>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{user.email || '—'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-2.5 text-xs">
                  <div>
                    <span className="text-muted-foreground">Full Name</span>
                    <div className="mt-0.5 font-medium text-foreground">{user.full_name || '—'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone</span>
                    <div className="mt-0.5 font-medium text-foreground">{user.phone || '—'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Role</span>
                    <div className="mt-0.5 font-medium text-foreground">{getRoleName(user.role_id)}</div>
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-muted-foreground">Status</span>
                      <div className="mt-1">
                        {user.is_active ? (
                          <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success">
                            <UserCheck className="h-3 w-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 border-destructive/30 bg-destructive/10 text-destructive">
                            <UserX className="h-3 w-3" /> Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    {canCrud && user.user_type !== 'superadmin' && user.id !== currentUser?.id && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        aria-label={`Hapus ${user.username}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(user)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1 text-sm text-muted-foreground">
              <span>Halaman {page} dari {totalPages} ({totalUsers} user)</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  Sebelumnya
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  )
}
