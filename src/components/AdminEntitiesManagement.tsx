import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Building2, Plus, Search, Trash2, Edit, X, Save, Phone as PhoneIcon, Mail as MailIcon, Globe, MapPin, MessageCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { entitiesAPI, reportsAPI } from '../utils/api';

interface Entity {
  id: string;
  name: string;
  description: string;
  category: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  whatsapp?: string;
  createdAt: string;
}

const CATEGORIES = [
  'Infraestructura',
  'Servicios Públicos',
  'Aseo y Limpieza',
  'Salud',
  'Seguridad',
  'Emergencias',
  'Gobierno',
  'Otros',
];

export function AdminEntitiesManagement() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [deleteEntityId, setDeleteEntityId] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Infraestructura',
    email: '',
    phone: '',
    website: '',
    address: '',
    whatsapp: '',
  });

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      setLoading(true);
      const response = await entitiesAPI.getAll();
      const sortedEntities = response.entities.sort((a: Entity, b: Entity) => 
        a.name.localeCompare(b.name)
      );
      setEntities(sortedEntities);
      
      // Load report counts
      const allReports = await reportsAPI.getAll();
      const counts: Record<string, number> = {};
      sortedEntities.forEach((entity: Entity) => {
        counts[entity.id] = allReports.reports.filter((r: any) => r.entityId === entity.id).length;
      });
      setReportCounts(counts);
    } catch (error) {
      console.error('Error loading entities:', error);
      toast.error('Error al cargar entidades');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Infraestructura',
      email: '',
      phone: '',
      website: '',
      address: '',
      whatsapp: '',
    });
    setCustomCategory('');
    setShowCustomCategory(false);
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre de la entidad es obligatorio');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      // Usar categoría personalizada si está seleccionada
      const finalCategory = showCustomCategory && customCategory.trim() 
        ? customCategory.trim() 
        : formData.category;

      const entityPayload: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: finalCategory,
      };
      
      if (formData.email.trim()) entityPayload.email = formData.email.trim();
      if (formData.phone.trim()) entityPayload.phone = formData.phone.trim();
      if (formData.website.trim()) entityPayload.website = formData.website.trim();
      if (formData.address.trim()) entityPayload.address = formData.address.trim();
      if (formData.whatsapp.trim()) entityPayload.whatsapp = formData.whatsapp.trim();

      await entitiesAPI.create(entityPayload, token);

      setShowAddDialog(false);
      resetForm();
      toast.success('Entidad agregada exitosamente');
      loadEntities();
    } catch (error) {
      console.error('Error adding entity:', error);
      toast.error('Error al agregar entidad');
    }
  };

  const handleEdit = async () => {
    if (!editingEntity) return;
    
    if (!formData.name.trim()) {
      toast.error('El nombre de la entidad es obligatorio');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      // Usar categoría personalizada si está seleccionada
      const finalCategory = showCustomCategory && customCategory.trim() 
        ? customCategory.trim() 
        : formData.category;

      const updatePayload: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: finalCategory,
      };
      
      if (formData.email.trim()) updatePayload.email = formData.email.trim();
      if (formData.phone.trim()) updatePayload.phone = formData.phone.trim();
      if (formData.website.trim()) updatePayload.website = formData.website.trim();
      if (formData.address.trim()) updatePayload.address = formData.address.trim();
      if (formData.whatsapp.trim()) updatePayload.whatsapp = formData.whatsapp.trim();

      console.log('Updating entity with ID:', editingEntity.id);
      console.log('Update payload:', updatePayload);
      
      const result = await entitiesAPI.update(editingEntity.id, updatePayload, token);
      
      console.log('Update result:', result);

      setEditingEntity(null);
      resetForm();
      toast.success('Entidad actualizada exitosamente');
      loadEntities();
    } catch (error: any) {
      console.error('Error updating entity:', error);
      const errorMessage = error?.message || 'Error al actualizar entidad';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!deleteEntityId) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      await entitiesAPI.delete(deleteEntityId, token);
      
      setDeleteEntityId(null);
      toast.success('Entidad eliminada exitosamente');
      loadEntities();
    } catch (error: any) {
      console.error('Error deleting entity:', error);
      if (error.message?.includes('reportes asignados')) {
        toast.error('No se puede eliminar una entidad con reportes asignados');
      } else {
        toast.error('Error al eliminar entidad');
      }
      setDeleteEntityId(null);
    }
  };

  const openEditDialog = (entity: Entity) => {
    setEditingEntity(entity);
    const isCustomCategory = !CATEGORIES.includes(entity.category);
    setShowCustomCategory(isCustomCategory);
    if (isCustomCategory) {
      setCustomCategory(entity.category);
    }
    setFormData({
      name: entity.name,
      description: entity.description,
      category: isCustomCategory ? 'custom' : entity.category,
      email: entity.email || '',
      phone: entity.phone || '',
      website: entity.website || '',
      address: entity.address || '',
      whatsapp: entity.whatsapp || '',
    });
  };

  const closeEditDialog = () => {
    setEditingEntity(null);
    resetForm();
  };

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get reports count for each entity
  const getReportsCount = (entityId: string) => {
    return reportCounts[entityId] || 0;
  };

  const categoryColors: Record<string, string> = {
    'Infraestructura': 'bg-orange-100 text-orange-800',
    'Servicios Públicos': 'bg-blue-100 text-blue-800',
    'Aseo y Limpieza': 'bg-green-100 text-green-800',
    'Salud': 'bg-red-100 text-red-800',
    'Seguridad': 'bg-purple-100 text-purple-800',
    'Emergencias': 'bg-yellow-100 text-yellow-800',
    'Gobierno': 'bg-indigo-100 text-indigo-800',
    'Otros': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-r from-green-50 to-yellow-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-yellow-400 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-green-800">Gestión de Entidades</CardTitle>
                <CardDescription>
                  Administra las entidades responsables de atender reportes
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Entidad
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-green-200 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Entidades</p>
                <p className="text-3xl text-green-800 mt-1">{entities.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-yellow-400 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {CATEGORIES.slice(0, 3).map((category, index) => {
          const count = entities.filter(e => e.category === category).length;
          const colors = ['from-blue-500 to-blue-600', 'from-orange-500 to-orange-600', 'from-purple-500 to-purple-600'];
          return (
            <Card key={category} className="border-2 border-green-200 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{category}</p>
                    <p className="text-3xl text-green-800 mt-1">{count}</p>
                  </div>
                  <div className={`bg-gradient-to-br ${colors[index]} p-3 rounded-lg`}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <Card className="border-2 border-green-200">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar entidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-green-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Entities Grid */}
      {loading ? (
        <Card className="border-2 border-green-200">
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Cargando entidades...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.length === 0 ? (
            <Card className="col-span-full border-2 border-green-200">
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No se encontraron entidades</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredEntities.map((entity) => (
              <Card key={entity.id} className="border-2 border-green-200 hover:shadow-md transition-shadow rounded-[-49px]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-green-800">{entity.name}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={categoryColors[entity.category] || categoryColors['Otros']}>
                          {entity.category}
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {getReportsCount(entity.id)} reportes
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{entity.description}</p>
                  <div className="space-y-2 mb-4">
                    {entity.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MailIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <a href={`mailto:${entity.email}`} className="text-green-600 hover:underline truncate">
                          {entity.email}
                        </a>
                      </div>
                    )}
                    {entity.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <a href={`tel:${entity.phone}`} className="text-green-600 hover:underline">
                          {entity.phone}
                        </a>
                      </div>
                    )}
                    {entity.whatsapp && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MessageCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <a 
                          href={`https://wa.me/${entity.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-green-600 hover:underline"
                        >
                          {entity.whatsapp}
                        </a>
                      </div>
                    )}
                    {entity.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <a 
                          href={entity.website.startsWith('http') ? entity.website : `https://${entity.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-green-600 hover:underline truncate"
                        >
                          {entity.website}
                        </a>
                      </div>
                    )}
                    {entity.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{entity.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(entity)}
                      className="flex-1 border-green-200 hover:bg-green-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteEntityId(entity.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-[-3px]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add Entity Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="border-2 border-green-200 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-green-800">Agregar Nueva Entidad</DialogTitle>
                <DialogDescription>
                  Completa la información de la nueva entidad
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setShowAddDialog(false); resetForm(); }}
                className="hover:bg-green-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre de la Entidad *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Alcaldía - Infraestructura"
                className="border-green-200"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <select
                id="category"
                value={showCustomCategory ? 'custom' : formData.category}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setShowCustomCategory(true);
                  } else {
                    setShowCustomCategory(false);
                    setFormData({ ...formData, category: e.target.value });
                  }
                }}
                className="w-full border-2 border-green-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="custom">+ Nueva Categoría</option>
              </select>
            </div>
            {showCustomCategory && (
              <div>
                <Label htmlFor="customCategory">Nueva Categoría *</Label>
                <Input
                  id="customCategory"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Ingresa el nombre de la nueva categoría"
                  className="border-green-200"
                />
              </div>
            )}
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe las funciones de esta entidad..."
                className="border-green-200"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ejemplo@buenaventura.gov.co"
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(2) 242-3456"
                  className="border-green-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+57 310 650 7940"
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="website">Sitio Web (opcional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="www.ejemplo.gov.co"
                  className="border-green-200"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Dirección (opcional)</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle 1 # 1A-08, Centro, Buenaventura"
                className="border-green-200"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => { setShowAddDialog(false); resetForm(); }}
                className="border-green-200 hover:bg-green-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAdd}
                className="bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-500"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Entidad
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Entity Dialog */}
      <Dialog open={!!editingEntity} onOpenChange={closeEditDialog}>
        <DialogContent className="border-2 border-green-200 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-green-800">Editar Entidad</DialogTitle>
                <DialogDescription>
                  Actualiza la información de la entidad
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeEditDialog}
                className="hover:bg-green-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre de la Entidad *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Alcaldía - Infraestructura"
                className="border-green-200"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoría *</Label>
              <select
                id="edit-category"
                value={showCustomCategory ? 'custom' : formData.category}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setShowCustomCategory(true);
                  } else {
                    setShowCustomCategory(false);
                    setFormData({ ...formData, category: e.target.value });
                  }
                }}
                className="w-full border-2 border-green-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="custom">+ Nueva Categoría</option>
              </select>
            </div>
            {showCustomCategory && (
              <div>
                <Label htmlFor="edit-customCategory">Nueva Categoría *</Label>
                <Input
                  id="edit-customCategory"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Ingresa el nombre de la nueva categoría"
                  className="border-green-200"
                />
              </div>
            )}
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe las funciones de esta entidad..."
                className="border-green-200"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">Email (opcional)</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ejemplo@buenaventura.gov.co"
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Teléfono (opcional)</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(2) 242-3456"
                  className="border-green-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-whatsapp">WhatsApp (opcional)</Label>
                <Input
                  id="edit-whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+57 310 650 7940"
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="edit-website">Sitio Web (opcional)</Label>
                <Input
                  id="edit-website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="www.ejemplo.gov.co"
                  className="border-green-200"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-address">Dirección (opcional)</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle 1 # 1A-08, Centro, Buenaventura"
                className="border-green-200"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={closeEditDialog}
                className="border-green-200 hover:bg-green-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEdit}
                className="bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-500"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEntityId} onOpenChange={() => setDeleteEntityId(null)}>
        <AlertDialogContent className="border-2 border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-800">¿Eliminar entidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La entidad será eliminada permanentemente.
              {deleteEntityId && getReportsCount(deleteEntityId) > 0 && (
                <span className="block mt-2 text-orange-600">
                  Advertencia: Esta entidad tiene {getReportsCount(deleteEntityId)} reportes asignados.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-green-200 hover:bg-green-50">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}