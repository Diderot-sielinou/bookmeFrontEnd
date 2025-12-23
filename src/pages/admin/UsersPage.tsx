/**
 * Page Utilisateurs (Admin)
 * 
 * Gestion des utilisateurs de la plateforme :
 * - Liste avec filtres et recherche
 * - Détails utilisateur
 * - Actions (activer, désactiver, supprimer)
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Search,
  Filter,
  MoreHorizontal,
  User,
  Building,
  Shield,
  Check,
  X,
  Ban,
  Trash2,
  Eye,
  Mail,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { User as UserType } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Avatar,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared';

// ==========================================
// TYPES
// ==========================================

interface AdminUser extends UserType {
  client?: {
    firstName: string;
    lastName: string;
    phone: string | null;
    avatar: string | null;
  };
  prestataire?: {
    businessName: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatar: string | null;
    isVerified: boolean;
  };
  _count?: {
    appointments?: number;
    reviews?: number;
  };
}

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
  const profile = user.client || user.prestataire;
  const getName = (): string => {
    if (!profile) return user.email;
    if (user.prestataire) return user.prestataire.businessName;
    if (user.client) return `${user.client.firstName} ${user.client.lastName}`;
    return user.email;
  };
  const name = getName();

  return (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-accent/50 transition-colors">
      <Avatar
        src={profile?.avatar}
        firstName={profile && 'firstName' in profile ? profile.firstName : undefined}
        lastName={profile && 'lastName' in profile ? profile.lastName : undefined}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{name}</p>
          {!user.isActive && (
            <Badge variant="destructive" className="text-xs">Inactif</Badge>
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
    if (!profile) return user.email;
    if (user.prestataire) return user.prestataire.businessName;
    if (user.client) return `${user.client.firstName} ${user.client.lastName}`;
    return user.email;
  };
  const name = getName();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Détails de l'utilisateur</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Avatar
              src={profile?.avatar}
              firstName={profile && 'firstName' in profile ? profile.firstName : undefined}
              lastName={profile && 'lastName' in profile ? profile.lastName : undefined}
              size="xl"
            />
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
            {profile?.phone && (
              <div>
                <p className="text-muted-foreground">Téléphone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
            )}
            {user._count?.appointments !== undefined && (
              <div>
                <p className="text-muted-foreground">Rendez-vous</p>
                <p className="font-medium">{user._count.appointments}</p>
              </div>
            )}
          </div>

          {/* Prestataire specific */}
          {user.prestataire && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Informations prestataire</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Vérifié:</span>
                {user.prestataire.isVerified ? (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Oui
                  </Badge>
                ) : (
                  <Badge variant="secondary">En attente</Badge>
                )}
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
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        setUsers(response.data.data || response.data);
      } catch (error) {
        showError('Impossible de charger les utilisateurs');
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const getName = (): string => {
      if (user.prestataire) return user.prestataire.businessName;
      if (user.client) return `${user.client.firstName} ${user.client.lastName}`;
      return '';
    };
    const name = getName();
    
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handlers
  const handleView = (user: AdminUser) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      await api.patch(`/admin/users/${user.id}`, { isActive: !user.isActive });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      );
      showSuccess(user.isActive ? 'Utilisateur désactivé' : 'Utilisateur activé');
    } catch (error) {
      showError('Impossible de modifier le statut');
    }
  };

  const handleDelete = (user: AdminUser) => {
    setDeleteDialog({ open: true, user });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.user) return;

    setIsDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteDialog.user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteDialog.user!.id));
      showSuccess('Utilisateur supprimé');
      setDeleteDialog({ open: false, user: null });
    } catch (error) {
      showError('Impossible de supprimer l\'utilisateur');
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats
  const stats = {
    total: users.length,
    clients: users.filter((u) => u.role === 'CLIENT').length,
    prestataires: users.filter((u) => u.role === 'PRESTATAIRE').length,
    inactive: users.filter((u) => !u.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les utilisateurs de la plateforme
        </p>
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
            <p className="text-sm text-muted-foreground">Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{stats.prestataires}</p>
            <p className="text-sm text-muted-foreground">Prestataires</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            <p className="text-sm text-muted-foreground">Inactifs</p>
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
                  placeholder="Rechercher par nom ou email..."
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users list */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={User}
                title="Aucun utilisateur"
                description={searchQuery ? 'Aucun résultat pour cette recherche' : 'Aucun utilisateur inscrit'}
              />
            </div>
          ) : (
            <div>
              {filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onView={handleView}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
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
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
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
              isLoading={isDeleting}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminUsersPage;
