/**
 * Page Utilisateurs (Admin)
 * 
 * Gestion des utilisateurs de la plateforme :
 * - Liste avec filtres et recherche
 * - Détails utilisateur
 * - Actions (activer, désactiver, supprimer)
 * 
 * ALIGNÉ AVEC BACKEND: /admin/users/*
 * @see backend/src/admin/admin.controller.ts
 * @see backend/src/admin/admin.service.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Search,
  MoreHorizontal,
  User,
  Building,
  Shield,
  Check,
  Ban,
  Trash2,
  Eye,
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { adminService, type AdminUser } from '@/services';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showSuccess, showError } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared';
import { Avatar } from '@/components/ui/avatar';

// ==========================================
// ROLE BADGE
// ==========================================

const roleConfig = {
  CLIENT: { label: 'Client', icon: User, color: 'bg-blue-100 text-blue-700' },
  PRESTATAIRE: { label: 'Prestataire', icon: Building, color: 'bg-green-100 text-green-700' },
  ADMIN: { label: 'Admin', icon: Shield, color: 'bg-purple-100 text-purple-700' },
};

function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.CLIENT;
  const Icon = config.icon;
  
  return (
    <Badge className={cn('gap-1', config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// ==========================================
// USER ROW
// ==========================================

interface UserRowProps {
  user: AdminUser;
  onView: (user: AdminUser) => void;
  onToggleActive: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

function UserRow({ user, onView, onToggleActive, onDelete }: UserRowProps) {
  // Récupérer le profil selon le rôle
  const profile = user.client || user.prestataire;
  
  // Construire le nom d'affichage
  const getName = (): string => {
    if (user.prestataire?.businessName) return user.prestataire.businessName;
    if (user.client) return `${user.client.firstName} ${user.client.lastName}`;
    if (user.prestataire) return `${user.prestataire.firstName} ${user.prestataire.lastName}`;
    return user.email.split('@')[0]; // Fallback sur le début de l'email
  };
  
  const name = getName();
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-accent/50 transition-colors">
      {/* <Avatar className="h-10 w-10">
        {profile?.avatar ? (
          <img src={profile.avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground text-sm font-medium">
            {initials}
          </div>
        )}
      </Avatar> */}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{name}</p>
          {!user.isActive && (
            <Badge variant="destructive" className="text-xs">Inactif</Badge>
          )}
          {!user.emailVerified && (
            <Badge variant="outline" className="text-xs">Non vérifié</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
      </div>

      <div className="hidden sm:block">
        <RoleBadge role={user.role} />
      </div>

      <div className="hidden md:block text-sm text-muted-foreground">
        {format(new Date(user.createdAt), 'd MMM yyyy', { locale: fr })}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(user)}>
            <Eye className="h-4 w-4 mr-2" />
            Voir les détails
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Mail className="h-4 w-4 mr-2" />
            Envoyer un email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onToggleActive(user)}>
            {user.isActive ? (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Désactiver
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Activer
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete(user)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ==========================================
// USER DETAIL DIALOG
// ==========================================

interface UserDetailDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UserDetailDialog({ user, open, onOpenChange }: UserDetailDialogProps) {
  if (!user) return null;

  const profile = user.client || user.prestataire;
  
  const getName = (): string => {
    if (user.prestataire?.businessName) return user.prestataire.businessName;
    if (user.client) return `${user.client.firstName} ${user.client.lastName}`;
    if (user.prestataire) return `${user.prestataire.firstName} ${user.prestataire.lastName}`;
    return user.email;
  };
  
  const name = getName();
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Détails de l'utilisateur</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            {/* <Avatar className="h-16 w-16">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground text-lg font-medium">
                  {initials}
                </div>
              )}
            </Avatar> */}
            <div>
              <h3 className="text-lg font-semibold">{name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={user.role} />
                {user.emailVerified && (
                  <Badge variant="outline" className="gap-1">
                    <Check className="h-3 w-3" />
                    Email vérifié
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Inscrit le</p>
              <p className="font-medium">
                {format(new Date(user.createdAt), 'PPP', { locale: fr })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Statut</p>
              <p className="font-medium">
                {user.isActive ? (
                  <span className="text-green-600">Actif</span>
                ) : (
                  <span className="text-red-600">Inactif</span>
                )}
              </p>
            </div>
            {user.lastLoginAt && (
              <div>
                <p className="text-muted-foreground">Dernière connexion</p>
                <p className="font-medium">
                  {format(new Date(user.lastLoginAt), 'PPP à HH:mm', { locale: fr })}
                </p>
              </div>
            )}
            {profile?.phone && (
              <div>
                <p className="text-muted-foreground">Téléphone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
            )}
          </div>

          {/* Client specific */}
          {user.client && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Informations client</p>
              <p className="text-sm">
                {user.client.firstName} {user.client.lastName}
              </p>
            </div>
          )}

          {/* Prestataire specific */}
          {user.prestataire && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Informations prestataire</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Entreprise:</span> {user.prestataire.businessName}</p>
                <p><span className="text-muted-foreground">Nom:</span> {user.prestataire.firstName} {user.prestataire.lastName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Statut:</span>
                  <Badge variant={user.prestataire.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {user.prestataire.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 20;

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Load users from API
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.getUsers({
        role: roleFilter !== 'all' ? (roleFilter as 'CLIENT' | 'PRESTATAIRE' | 'ADMIN') : undefined,
        search: searchQuery || undefined,
        page: currentPage,
        limit: usersPerPage,
      });
      setUsers(result.data || []);
      setTotalUsers(result.meta?.total || 0);
    } catch (error) {
      showError('Impossible de charger les utilisateurs');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, searchQuery, currentPage]);

  // Load on mount and when filters change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, searchQuery]);

  // Handlers
  const handleView = (user: AdminUser) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const handleToggleActive = async (user: AdminUser) => {
    setIsProcessing(true);
    try {
      if (user.isActive) {
        await adminService.suspendUser(user.id);
        showSuccess('Utilisateur désactivé');
      } else {
        await adminService.reactivateUser(user.id);
        showSuccess('Utilisateur activé');
      }
      // Mettre à jour localement
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (error) {
      showError('Impossible de modifier le statut');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = (user: AdminUser) => {
    setDeleteDialog({ open: true, user });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.user) return;

    setIsProcessing(true);
    try {
      await adminService.deleteUser(deleteDialog.user.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteDialog.user!.id));
      showSuccess('Utilisateur supprimé');
      setDeleteDialog({ open: false, user: null });
    } catch (error) {
      showError('Impossible de supprimer l\'utilisateur');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = () => {
    loadUsers();
  };

  // Pagination
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  // Stats (calculées localement sur les données chargées)
  const stats = {
    total: totalUsers,
    clients: users.filter((u) => u.role === 'CLIENT').length,
    prestataires: users.filter((u) => u.role === 'PRESTATAIRE').length,
    inactive: users.filter((u) => !u.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les utilisateurs de la plateforme
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.clients}</p>
            <p className="text-sm text-muted-foreground">Clients (page)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{stats.prestataires}</p>
            <p className="text-sm text-muted-foreground">Prestataires (page)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            <p className="text-sm text-muted-foreground">Inactifs (page)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="CLIENT">Clients</SelectItem>
                <SelectItem value="PRESTATAIRE">Prestataires</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users list */}
      <Card>
        <CardHeader>
          <CardTitle>
            {totalUsers} utilisateur{totalUsers > 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={User}
                title="Aucun utilisateur"
                description={searchQuery ? 'Aucun résultat pour cette recherche' : 'Aucun utilisateur inscrit'}
              />
            </div>
          ) : (
            <>
              <div>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onView={handleView}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({totalUsers} résultats)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User detail dialog */}
      <UserDetailDialog
        user={selectedUser}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Delete confirmation */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action désactivera le compte de manière permanente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, user: null })}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminUsersPage;
