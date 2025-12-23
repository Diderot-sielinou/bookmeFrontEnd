/**
 * CategoriesPage (Admin)
 * 
 * Page de gestion des catégories de services.
 * Permet de créer, modifier et supprimer des catégories.
 */

import { useState } from 'react';
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
  Image,
  Eye,
  EyeOff,
  AlertTriangle,
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
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// ==========================================
// TYPES
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
// MOCK DATA
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
}

function CategoryRow({
  category,
  level,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onToggleActive,
}: CategoryRowProps) {
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div
      className={`flex items-center gap-3 p-3 hover:bg-muted/50 border-b ${
        level > 0 ? 'pl-10 bg-muted/20' : ''
      }`}
    >
      {/* Drag Handle */}
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

      {/* Expand/Collapse */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onToggle}
        disabled={!hasChildren}
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
      />

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(category)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter sous-catégorie
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(category)}
            className="text-destructive"
            disabled={category.prestatairesCount > 0}
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
  const [categories] = useState<Category[]>(mockCategories);
  const [isLoading] = useState(false);
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
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleToggleActive = async (category: Category) => {
    // API call would go here
    console.log('Toggle active:', category.id);
  };

  const handleSave = async () => {
    setFormLoading(true);
    // API call would go here
    await new Promise((r) => setTimeout(r, 1000));
    setFormLoading(false);
    setEditDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;
    // API call would go here
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Catégories</h1>
          <p className="text-muted-foreground">
            {totalCategories} catégories • {activeCategories} actives
          </p>
        </div>
        <Button onClick={handleCreate}>
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
                  <Button onClick={handleCreate}>
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
            <Button onClick={handleSave} disabled={!formData.name || formLoading}>
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
                selectedCategory?.prestatairesCount !== undefined &&
                selectedCategory.prestatairesCount > 0
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
