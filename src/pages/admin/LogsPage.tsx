/**
 * LogsPage (Admin)
 * 
 * Page de consultation des logs d'audit.
 * Permet de suivre toutes les actions importantes sur la plateforme.
 */

import { useState } from 'react';
import { format, subDays, subHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  User,
  UserCheck,
  Calendar,
  Star,
  Shield,
  Settings,
  LogIn,
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// ==========================================
// TYPES
// ==========================================

type LogLevel = 'info' | 'warning' | 'error' | 'success';
type LogCategory = 'auth' | 'user' | 'prestataire' | 'appointment' | 'review' | 'admin' | 'system';

interface AuditLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  description: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

// ==========================================
// MOCK DATA
// ==========================================

const mockLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    level: 'success',
    category: 'auth',
    action: 'USER_LOGIN',
    description: 'Connexion réussie',
    user: { id: '1', name: 'Sophie Martin', email: 'sophie@email.com', role: 'CLIENT' },
    ip: '192.168.1.100',
    userAgent: 'Chrome/120.0.0.0',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    level: 'info',
    category: 'admin',
    action: 'PRESTATAIRE_VALIDATED',
    description: 'Prestataire validé: Pierre Coiffure',
    user: { id: 'admin1', name: 'Admin System', email: 'admin@bookme.com', role: 'ADMIN' },
    metadata: { prestataireId: 'p123', prestataireName: 'Pierre Coiffure' },
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    level: 'warning',
    category: 'review',
    action: 'REVIEW_FLAGGED',
    description: 'Avis signalé pour contenu inapproprié',
    user: { id: '2', name: 'Marc Bernard', email: 'marc@email.com', role: 'CLIENT' },
    metadata: { reviewId: 'r456', reason: 'Contenu inapproprié' },
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    level: 'success',
    category: 'appointment',
    action: 'APPOINTMENT_CREATED',
    description: 'Nouveau rendez-vous créé',
    user: { id: '3', name: 'Julie Petit', email: 'julie@email.com', role: 'CLIENT' },
    metadata: { appointmentId: 'a789', service: 'Coupe femme', prestataire: 'Marie Coiffure' },
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    level: 'error',
    category: 'auth',
    action: 'LOGIN_FAILED',
    description: 'Échec de connexion - mot de passe incorrect',
    metadata: { email: 'unknown@email.com', attempts: 3 },
    ip: '192.168.1.50',
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    level: 'info',
    category: 'user',
    action: 'USER_REGISTERED',
    description: 'Nouvel utilisateur inscrit',
    user: { id: '4', name: 'Emma Leroy', email: 'emma@email.com', role: 'CLIENT' },
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    level: 'info',
    category: 'prestataire',
    action: 'SERVICE_CREATED',
    description: 'Nouveau service créé: Massage relaxant',
    user: { id: 'p1', name: 'Spa Zen', email: 'spa@email.com', role: 'PRESTATAIRE' },
    metadata: { serviceId: 's123', serviceName: 'Massage relaxant', price: 60 },
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    level: 'warning',
    category: 'system',
    action: 'RATE_LIMIT_EXCEEDED',
    description: 'Limite de requêtes dépassée',
    ip: '10.0.0.50',
    metadata: { endpoint: '/api/search', limit: 100, current: 150 },
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    level: 'success',
    category: 'admin',
    action: 'REVIEW_MODERATED',
    description: 'Avis supprimé suite à modération',
    user: { id: 'admin1', name: 'Admin System', email: 'admin@bookme.com', role: 'ADMIN' },
    metadata: { reviewId: 'r789', action: 'deleted', reason: 'Spam' },
  },
  {
    id: '10',
    timestamp: subDays(new Date(), 1).toISOString(),
    level: 'info',
    category: 'appointment',
    action: 'APPOINTMENT_CANCELLED',
    description: 'Rendez-vous annulé par le client',
    user: { id: '5', name: 'Lucas Martin', email: 'lucas@email.com', role: 'CLIENT' },
    metadata: { appointmentId: 'a456', reason: 'Empêchement personnel' },
  },
];

// ==========================================
// HELPERS
// ==========================================

const getLevelConfig = (level: LogLevel) => {
  switch (level) {
    case 'success':
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
    case 'warning':
      return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' };
    case 'error':
      return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
    case 'info':
    default:
      return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' };
  }
};

const getCategoryConfig = (category: LogCategory) => {
  switch (category) {
    case 'auth':
      return { icon: LogIn, label: 'Authentification' };
    case 'user':
      return { icon: User, label: 'Utilisateur' };
    case 'prestataire':
      return { icon: UserCheck, label: 'Prestataire' };
    case 'appointment':
      return { icon: Calendar, label: 'Rendez-vous' };
    case 'review':
      return { icon: Star, label: 'Avis' };
    case 'admin':
      return { icon: Shield, label: 'Admin' };
    case 'system':
      return { icon: Settings, label: 'Système' };
    default:
      return { icon: FileText, label: category };
  }
};

// ==========================================
// LOG ROW COMPONENT
// ==========================================

interface LogRowProps {
  log: AuditLog;
  onViewDetails: (log: AuditLog) => void;
}

function LogRow({ log, onViewDetails }: LogRowProps) {
  const levelConfig = getLevelConfig(log.level);
  const categoryConfig = getCategoryConfig(log.category);
  const LevelIcon = levelConfig.icon;
  const CategoryIcon = categoryConfig.icon;

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => onViewDetails(log)}>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${levelConfig.bg}`}>
            <LevelIcon className={`h-3 w-3 ${levelConfig.color}`} />
          </div>
          <span className="text-sm text-muted-foreground">
            {format(new Date(log.timestamp), 'dd/MM HH:mm:ss')}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="gap-1">
          <CategoryIcon className="h-3 w-3" />
          {categoryConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-sm">{log.action}</p>
          <p className="text-sm text-muted-foreground truncate max-w-xs">
            {log.description}
          </p>
        </div>
      </TableCell>
      <TableCell>
        {log.user ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {log.user.name.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{log.user.name}</p>
              <p className="text-muted-foreground text-xs">{log.user.role}</p>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Système</span>
        )}
      </TableCell>
      <TableCell>
        {log.ip && (
          <span className="text-sm text-muted-foreground font-mono">{log.ip}</span>
        )}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" onClick={() => onViewDetails(log)}>
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function LogsPage() {
  const [logs] = useState<AuditLog[]>(mockLogs);
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const logsPerPage = 20;

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        log.action.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query) ||
        log.user?.name.toLowerCase().includes(query) ||
        log.user?.email.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Level filter
    if (levelFilter !== 'all' && log.level !== levelFilter) return false;

    // Category filter
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;

    // Date filter
    if (dateRange.from) {
      const logDate = new Date(log.timestamp);
      if (logDate < dateRange.from) return false;
    }
    if (dateRange.to) {
      const logDate = new Date(log.timestamp);
      if (logDate > dateRange.to) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  // Handlers
  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  const handleRefresh = () => {
    // Reload logs
    console.log('Refreshing logs...');
  };

  const handleExport = () => {
    // Export logs as CSV
    console.log('Exporting logs...');
  };

  // Stats
  const errorCount = logs.filter((l) => l.level === 'error').length;
  const warningCount = logs.filter((l) => l.level === 'warning').length;
  const todayCount = logs.filter((l) => {
    const logDate = new Date(l.timestamp);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Logs d'audit</h1>
          <p className="text-muted-foreground">
            {todayCount} événements aujourd'hui • {errorCount} erreurs • {warningCount} avertissements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous niveaux</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Succès</SelectItem>
                <SelectItem value="warning">Avertissement</SelectItem>
                <SelectItem value="error">Erreur</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="auth">Authentification</SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="prestataire">Prestataire</SelectItem>
                <SelectItem value="appointment">Rendez-vous</SelectItem>
                <SelectItem value="review">Avis</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateRange.from
                    ? dateRange.to
                      ? `${format(dateRange.from, 'dd/MM')} - ${format(dateRange.to, 'dd/MM')}`
                      : format(dateRange.from, 'dd/MM/yyyy')
                    : 'Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  locale={fr}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<FileText className="h-12 w-12" />}
                title="Aucun log trouvé"
                description="Modifiez vos filtres pour voir plus de résultats."
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Date/Heure</TableHead>
                    <TableHead className="w-36">Catégorie</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="w-48">Utilisateur</TableHead>
                    <TableHead className="w-32">IP</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log) => (
                    <LogRow key={log.id} log={log} onViewDetails={handleViewDetails} />
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({filteredLogs.length} résultats)
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

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails du log</DialogTitle>
            <DialogDescription>
              Informations complètes sur cet événement
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date/Heure</p>
                  <p className="font-medium">
                    {format(new Date(selectedLog.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Niveau</p>
                  <Badge
                    variant={
                      selectedLog.level === 'error'
                        ? 'destructive'
                        : selectedLog.level === 'warning'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {selectedLog.level.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Action</p>
                <p className="font-medium font-mono">{selectedLog.action}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{selectedLog.description}</p>
              </div>

              {selectedLog.user && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Utilisateur</p>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Avatar>
                      <AvatarFallback>
                        {selectedLog.user.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedLog.user.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedLog.user.email}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {selectedLog.user.role}
                    </Badge>
                  </div>
                </div>
              )}

              {selectedLog.ip && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Adresse IP</p>
                    <p className="font-mono">{selectedLog.ip}</p>
                  </div>
                  {selectedLog.userAgent && (
                    <div>
                      <p className="text-sm text-muted-foreground">Navigateur</p>
                      <p className="font-mono text-sm">{selectedLog.userAgent}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Métadonnées</p>
                  <ScrollArea className="h-32">
                    <pre className="p-3 bg-muted rounded-lg text-xs font-mono overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
