/**
 * LogsPage (Admin)
 * 
 * Page de consultation des logs d'audit.
 * Permet de suivre toutes les actions importantes sur la plateforme.
 * 
 * ALIGNÉ AVEC BACKEND: /admin/audit-logs
 */

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileText,
  Search,
  Download,
  RefreshCw,
  User,
  UserCheck,
  Calendar,
  Star,
  Shield,
  Settings,
  LogIn,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { adminService, type AuditLog } from '@/services';
import { showError } from '@/components/ui/toast';

// ==========================================
// TYPES - Extended for UI
// ==========================================

type LogLevel = 'info' | 'warning' | 'error' | 'success';

// Helper to determine log level from action
const getLogLevel = (action: string): LogLevel => {
  if (action.includes('FAILED') || action.includes('ERROR')) return 'error';
  if (action.includes('FLAGGED') || action.includes('WARNING') || action.includes('SUSPENDED')) return 'warning';
  if (action.includes('APPROVED') || action.includes('COMPLETED') || action.includes('LOGIN')) return 'success';
  return 'info';
};

// Helper to determine category from entityType
const getCategory = (entityType: string): string => {
  const map: Record<string, string> = {
    'User': 'user',
    'Prestataire': 'prestataire',
    'Appointment': 'appointment',
    'Review': 'review',
    'Auth': 'auth',
  };
  return map[entityType] || 'admin';
};

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

const getCategoryConfig = (category: string) => {
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
      return { icon: FileText, label: category || 'Autre' };
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
  const level = getLogLevel(log.action);
  const category = getCategory(log.entityType);
  const levelConfig = getLevelConfig(level);
  const categoryConfig = getCategoryConfig(category);
  const LevelIcon = levelConfig.icon;
  const CategoryIcon = categoryConfig.icon;

  const userName = log.user?.email?.split('@')[0] || 'Système';
  const userInitials = userName.slice(0, 2).toUpperCase();

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => onViewDetails(log)}>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${levelConfig.bg}`}>
            <LevelIcon className={`h-3 w-3 ${levelConfig.color}`} />
          </div>
          <span className="text-sm text-muted-foreground">
            {format(new Date(log.createdAt), 'dd/MM HH:mm:ss')}
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
            {log.entityType}{log.entityId ? `: ${log.entityId.slice(0, 8)}...` : ''}
          </p>
        </div>
      </TableCell>
      <TableCell>
        {log.user ? (
          <div className="flex items-center gap-2">
            <div className="text-sm">
              <p className="font-medium">{log.user.email}</p>
              <p className="text-muted-foreground text-xs">{log.user.role}</p>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Système</span>
        )}
      </TableCell>
      <TableCell>
        {log.ipAddress && (
          <span className="text-sm text-muted-foreground font-mono">{log.ipAddress}</span>
        )}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onViewDetails(log); }}>
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
  // ✅ Initialiser avec un tableau vide pour éviter undefined
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const logsPerPage = 20;

  // Load logs from API
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.getAuditLogs({
        page: currentPage,
        limit: logsPerPage,
        action: searchQuery || undefined,
        entityType: categoryFilter !== 'all' ? categoryFilter : undefined,
      });
      // ✅ Gestion défensive - s'assurer que data est un tableau
      setLogs(result?.data || []);
      setTotalLogs(result?.meta?.total || 0);
    } catch (error) {
      showError('Impossible de charger les logs');
      setLogs([]); // ✅ Reset à un tableau vide en cas d'erreur
      setTotalLogs(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, categoryFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // ✅ Utiliser une variable sécurisée pour les filtres
  const safeLogs = logs || [];

  // Filter logs (client-side for level since backend doesn't have it)
  const filteredLogs = safeLogs.filter((log) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        log.action.toLowerCase().includes(query) ||
        log.entityType.toLowerCase().includes(query) ||
        log.user?.email?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Level filter (client-side)
    if (levelFilter !== 'all') {
      const logLevel = getLogLevel(log.action);
      if (logLevel !== levelFilter) return false;
    }

    // Category filter
    if (categoryFilter !== 'all') {
      const logCategory = getCategory(log.entityType);
      if (logCategory !== categoryFilter) return false;
    }

    // Date filter
    if (dateRange.from) {
      const logDate = new Date(log.createdAt);
      if (logDate < dateRange.from) return false;
    }
    if (dateRange.to) {
      const logDate = new Date(log.createdAt);
      if (logDate > dateRange.to) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(totalLogs / logsPerPage);

  // Handlers
  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  const handleRefresh = () => {
    loadLogs();
  };

  const handleExport = () => {
    // Export logs as CSV
    const csvContent = safeLogs.map(log => 
      `${log.createdAt},${log.action},${log.entityType},${log.user?.email || 'System'},${log.ipAddress || ''}`
    ).join('\n');
    const blob = new Blob([`Date,Action,Type,User,IP\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  // ✅ Stats calculées avec safeLogs
  const errorCount = safeLogs.filter((l) => getLogLevel(l.action) === 'error').length;
  const warningCount = safeLogs.filter((l) => getLogLevel(l.action) === 'warning').length;
  const todayCount = safeLogs.filter((l) => {
    const logDate = new Date(l.createdAt);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;

  if (isLoading && safeLogs.length === 0) {
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
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
                  {filteredLogs.map((log) => (
                    <LogRow key={log.id} log={log} onViewDetails={handleViewDetails} />
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({totalLogs} résultats)
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

          {selectedLog && (() => {
            const level = getLogLevel(selectedLog.action);
            const userName = selectedLog.user?.email?.split('@')[0] || 'Système';
            const userInitials = userName.slice(0, 2).toUpperCase();
            
            return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date/Heure</p>
                  <p className="font-medium">
                    {format(new Date(selectedLog.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Niveau</p>
                  <Badge
                    variant={
                      level === 'error'
                        ? 'destructive'
                        : level === 'warning'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {level.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Action</p>
                <p className="font-medium font-mono">{selectedLog.action}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Type d'entité</p>
                <p>{selectedLog.entityType}{selectedLog.entityId ? ` (${selectedLog.entityId})` : ''}</p>
              </div>

              {selectedLog.user && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Utilisateur</p>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {/* <Avatar>
                      <AvatarFallback>
                        {userInitials}
                      </AvatarFallback>
                    </Avatar> */}
                    <div>
                      <p className="font-medium">{selectedLog.user.email}</p>
                      <p className="text-sm text-muted-foreground">ID: {selectedLog.userId}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {selectedLog.user.role}
                    </Badge>
                  </div>
                </div>
              )}

              {selectedLog.ipAddress && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Adresse IP</p>
                    <p className="font-mono">{selectedLog.ipAddress}</p>
                  </div>
                  {selectedLog.userAgent && (
                    <div>
                      <p className="text-sm text-muted-foreground">Navigateur</p>
                      <p className="font-mono text-sm truncate">{selectedLog.userAgent}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Détails</p>
                  <ScrollArea className="h-32">
                    <pre className="p-3 bg-muted rounded-lg text-xs font-mono overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}