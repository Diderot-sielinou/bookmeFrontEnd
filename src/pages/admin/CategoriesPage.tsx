/**
 * CategoriesPage (Admin)
 * 
 * Page de gestion des catégories de services.
 * Permet de créer, modifier et supprimer des catégories.
 * 
 * ⚠️ STATUT BACKEND: NON IMPLÉMENTÉ
 * Les endpoints suivants doivent être créés:
 * - GET /admin/categories
 * - POST /admin/categories
 * - PATCH /admin/categories/:id
 * - DELETE /admin/categories/:id
 * - PATCH /admin/categories/reorder
 * 
 * Pour l'instant, cette page affiche un message d'attente.
 */

import { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Search,
  MoreVertical,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertTriangle,
  Construction,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { showSuccess, showError } from '@/components/ui/toast';

// ==========================================
// TYPES - À aligner avec le backend quand implémenté
// ==========================================

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  order: number;
  prestatairesCount: number;
  children?: Category[];
}

// ==========================================
// BACKEND NOT IMPLEMENTED BANNER
// ==========================================

// function BackendNotImplementedBanner() {
//   return (
//     <Alert variant="destructive" className="mb-6">
//       <Construction className="h-4 w-4" />
//       <AlertTitle>Fonctionnalité en développement</AlertTitle>
//       <AlertDescription>
//         L'API backend pour la gestion des catégories n'est pas encore implémentée.
//         Les données affichées sont des données de démonstration.
//         <br />
//         <span className="text-xs mt-2 block">
//           Endpoints requis: GET/POST/PATCH/DELETE /admin/categories
//         </span>
//       </AlertDescription>
//     </Alert>
//   );
// }

// ==========================================
// MOCK DATA - À remplacer par l'API quand disponible
// ==========================================

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Coiffure',
    slug: 'coiffure',
    description: 'Services de coiffure et soins capillaires',
    icon: '💇',
    isActive: true,
    order: 1,
    prestatairesCount: 450,
    children: [
      { id: '1-1', name: 'Coupe', slug: 'coupe', parentId: '1', isActive: true, order: 1, prestatairesCount: 400 },
      { id: '1-2', name: 'Coloration', slug: 'coloration', parentId: '1', isActive: true, order: 2, prestatairesCount: 320 },
      { id: '1-3', name: 'Coiffure mariage', slug: 'coiffure-mariage', parentId: '1', isActive: true, order: 3, prestatairesCount: 150 },
    ],
  },
  {
    id: '2',
    name: 'Beauté',
    slug: 'beaute',
    description: 'Soins esthétiques et maquillage',
    icon: '💄',
    isActive: true,
    order: 2,
    prestatairesCount: 380,
    children: [
      { id: '2-1', name: 'Maquillage', slug: 'maquillage', parentId: '2', isActive: true, order: 1, prestatairesCount: 200 },
      { id: '2-2', name: 'Onglerie', slug: 'onglerie', parentId: '2', isActive: true, order: 2, prestatairesCount: 280 },
      { id: '2-3', name: 'Épilation', slug: 'epilation', parentId: '2', isActive: true, order: 3, prestatairesCount: 250 },
    ],
  },
  {
    id: '3',
    name: 'Bien-être',
    slug: 'bien-etre',
    description: 'Massage, spa et relaxation',
    icon: '🧘',
    isActive: true,
    order: 3,
    prestatairesCount: 290,
    children: [
      { id: '3-1', name: 'Massage', slug: 'massage', parentId: '3', isActive: true, order: 1, prestatairesCount: 200 },
      { id: '3-2', name: 'Spa', slug: 'spa', parentId: '3', isActive: true, order: 2, prestatairesCount: 90 },
    ],
  },
  {
    id: '4',
    name: 'Fitness',
    slug: 'fitness',
    description: 'Sport et coaching personnel',
    icon: '💪',
    isActive: false,
    order: 4,
    prestatairesCount: 120,
  },
];

// ==========================================
// CATEGORY ROW COMPONENT
// ==========================================

interface CategoryRowProps {
  category: Category;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleActive: (category: Category) => void;
  disabled?: boolean;
}

function CategoryRow({
  category,
  level,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onToggleActive,
  disabled = false,
}: CategoryRowProps) {
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div
      className={`flex items-center gap-3 p-3 hover:bg-muted/50 border-b ${
        level > 0 ? 'pl-10 bg-muted/20' : ''
      } ${disabled ? 'opacity-60' : ''}`}
    >
      {/* Drag Handle */}
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

      {/* Expand/Collapse */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onToggle}
        disabled={!hasChildren || disabled}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )
        ) : (
          <span className="w-4" />
        )}
      </Button>

      {/* Icon */}
      <span className="text-xl">{category.icon || '📁'}</span>

      {/* Name & Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{category.name}</span>
          {!category.isActive && (
            <Badge variant="secondary" className="text-xs">Inactif</Badge>
          )}
        </div>
        {category.description && (
          <p className="text-sm text-muted-foreground truncate">{category.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="text-sm text-muted-foreground">
        {category.prestatairesCount} prestataires
      </div>

      {/* Active Toggle */}
      <Switch
        checked={category.isActive}
        onCheckedChange={() => onToggleActive(category)}
        disabled={disabled}
      />

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={disabled}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(category)} disabled={disabled}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem disabled={disabled}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter sous-catégorie
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(category)}
            className="text-destructive"
            disabled={category.prestatairesCount > 0 || disabled}
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
// MAIN COMPONENT
// ==========================================

export default function CategoriesPage() {
  // État local avec mock data (en attendant le backend)
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['1', '2']));

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    parentId: '',
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Flag pour indiquer que le backend n'est pas prêt
  const isBackendReady = false;

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const childrenMatch = cat.children?.some((child) =>
      child.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesSearch || childrenMatch;
  });

  // Handlers
  const handleEdit = (category: Category) => {
    if (!isBackendReady) {
      showError('Fonctionnalité non disponible', 'L\'API backend n\'est pas encore implémentée.');
      return;
    }
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      parentId: category.parentId || '',
      isActive: category.isActive,
    });
    setIsCreating(false);
    setEditDialogOpen(true);
  };

  const handleCreate = () => {
    if (!isBackendReady) {
      showError('Fonctionnalité non disponible', 'L\'API backend n\'est pas encore implémentée.');
      return;
    }
    setSelectedCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      parentId: '',
      isActive: true,
    });
    setIsCreating(true);
    setEditDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    if (!isBackendReady) {
      showError('Fonctionnalité non disponible', 'L\'API backend n\'est pas encore implémentée.');
      return;
    }
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleToggleActive = async (category: Category) => {
    if (!isBackendReady) {
      showError('Fonctionnalité non disponible', 'L\'API backend n\'est pas encore implémentée.');
      return;
    }
    // TODO: Appeler l'API backend
    console.log('Toggle active:', category.id);
  };

  const handleSave = async () => {
    if (!isBackendReady) {
      showError('Fonctionnalité non disponible', 'L\'API backend n\'est pas encore implémentée.');
      return;
    }
    setFormLoading(true);
    // TODO: Appeler l'API backend
    await new Promise((r) => setTimeout(r, 1000));
    setFormLoading(false);
    setEditDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedCategory || !isBackendReady) return;
    // TODO: Appeler l'API backend
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Stats
  const totalCategories = categories.reduce(
    (sum, cat) => sum + 1 + (cat.children?.length || 0),
    0
  );
  const activeCategories = categories.filter((c) => c.isActive).length;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Backend Not Implemented Banner */}
      {/* <BackendNotImplementedBanner /> */}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Catégories</h1>
          <p className="text-muted-foreground">
            {totalCategories} catégories • {activeCategories} actives
            <span className="text-xs ml-2">(données de démonstration)</span>
          </p>
        </div>
        <Button onClick={handleCreate} disabled={!isBackendReady}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Arborescence des catégories
          </CardTitle>
          <CardDescription>
            Glissez-déposez pour réorganiser les catégories
            {!isBackendReady && (
              <span className="text-amber-600 ml-2">(lecture seule)</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCategories.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<FolderTree className="h-12 w-12" />}
                title="Aucune catégorie"
                description="Créez votre première catégorie pour commencer."
                action={
                  <Button onClick={handleCreate} disabled={!isBackendReady}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une catégorie
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="divide-y">
              {filteredCategories.map((category) => (
                <div key={category.id}>
                  <CategoryRow
                    category={category}
                    level={0}
                    isExpanded={expandedCategories.has(category.id)}
                    onToggle={() => toggleExpand(category.id)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    disabled={!isBackendReady}
                  />
                  {expandedCategories.has(category.id) &&
                    category.children?.map((child) => (
                      <CategoryRow
                        key={child.id}
                        category={child}
                        level={1}
                        isExpanded={false}
                        onToggle={() => {}}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                        disabled={!isBackendReady}
                      />
                    ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? 'Créez une nouvelle catégorie de services.'
                : 'Modifiez les informations de la catégorie.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <Label>Icône</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="💇"
                  className="text-center text-xl"
                />
              </div>
              <div className="col-span-3">
                <Label>Nom</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="Nom de la catégorie"
                />
              </div>
            </div>

            <div>
              <Label>Slug (URL)</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="nom-categorie"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la catégorie..."
                rows={3}
              />
            </div>

            <div>
              <Label>Catégorie parente (optionnel)</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => setFormData({ ...formData, parentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucune (catégorie principale)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune (catégorie principale)</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Catégorie active</Label>
                <p className="text-sm text-muted-foreground">
                  Visible sur le site
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || formLoading || !isBackendReady}>
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : isCreating ? (
                'Créer'
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCategory?.prestatairesCount && selectedCategory.prestatairesCount > 0 ? (
                <div className="flex items-start gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>
                    Cette catégorie contient {selectedCategory.prestatairesCount} prestataires.
                    Vous devez d'abord les déplacer vers une autre catégorie.
                  </span>
                </div>
              ) : (
                'Cette action est irréversible. La catégorie sera définitivement supprimée.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={
                (selectedCategory?.prestatairesCount !== undefined &&
                selectedCategory.prestatairesCount > 0) ||
                !isBackendReady
              }
              className="bg-destructive text-destructive-foreground"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
