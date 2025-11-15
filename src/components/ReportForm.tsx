import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapSelector } from './MapSelector';
import { AlertCircle, CheckCircle2, Upload, Sparkles, Loader2, X, FileImage, FileText } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { classifyReportWithAI } from '../utils/aiClassifier';
import { toast } from 'sonner@2.0.3';
import { entitiesAPI, reportsAPI } from '../utils/api';

interface ReportFormProps {
  currentUser: { id: string; email: string; name: string; role: 'admin' | 'ciudadano' };
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB en bytes

export function ReportForm({ currentUser }: ReportFormProps) {
  const [entities, setEntities] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: { lat: 3.8801, lng: -77.0312 },
    address: '',
    mapAddress: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageName, setImageName] = useState<string>('');
  const [imageSize, setImageSize] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [manualEntity, setManualEntity] = useState<string>('');
  const [suggestedEntity, setSuggestedEntity] = useState<{
    entity: string;
    confidence: number;
    reasoning: string;
  } | null>(null);

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const response = await entitiesAPI.getAll();
      const entityNames = response.entities.map((e: any) => e.name);
      setEntities(entityNames);
    } catch (error) {
      console.error('Error loading entities:', error);
      toast.error('Error al cargar entidades');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar tamaño del archivo
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error('La imagen excede el límite permitido de 10MB. Por favor selecciona una imagen más pequeña.');
        e.target.value = ''; // Limpiar el input
        return;
      }

      setImageName(file.name);
      setImageSize(file.size);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setImageName('');
    setImageSize(0);
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleLocationChange = useCallback((location: { lat: number; lng: number }) => {
    setFormData(prev => ({ ...prev, location }));
  }, []);

  const handleAddressChange = useCallback((address: string) => {
    setFormData(prev => ({ ...prev, mapAddress: address }));
  }, []);

  const handleAutoClassify = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Por favor completa el título y descripción primero');
      return;
    }

    setClassifying(true);
    try {
      const result = await classifyReportWithAI(formData.title, formData.description);
      setSuggestedEntity(result);
      toast.success(`IA sugiere: ${result.entity} (${result.confidence}% confianza)`);
    } catch (error) {
      toast.error('Error al clasificar el reporte');
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setClassifying(true);
    
    try {
      let finalEntity = manualEntity;
      let classification = null;
      const isAutoClassification = !manualEntity || manualEntity === 'auto';
      
      // Si no se seleccionó entidad manualmente o seleccionó "auto", usar IA
      if (isAutoClassification) {
        classification = await classifyReportWithAI(formData.title, formData.description);
        finalEntity = classification.entity;
      }
      
      // Usar dirección escrita o dirección del mapa
      const finalAddress = formData.address.trim() !== '' ? formData.address : formData.mapAddress;
      
      // Buscar el entityId si se seleccionó una entidad
      let entityId = null;
      if (finalEntity && finalEntity !== 'auto') {
        const entityMatch = entities.find(e => e === finalEntity);
        if (entityMatch) {
          try {
            const entitiesResponse = await entitiesAPI.getAll();
            const foundEntity = entitiesResponse.entities.find((e: any) => e.name === finalEntity);
            if (foundEntity) {
              entityId = foundEntity.id;
            }
          } catch (err) {
            console.error('Error finding entity ID:', err);
          }
        }
      }
      
      const category = classification?.entity 
        ? 'infraestructura'
        : 'general';
      
      const reportData = {
        title: formData.title,
        description: formData.description,
        category: category,
        entityId: entityId,
        entityName: finalEntity || 'Sin asignar',
        location: finalAddress,
        locationLat: formData.location.lat,
        locationLng: formData.location.lng,
        images: imagePreview ? [imagePreview] : [],
        aiClassification: classification ? {
          confidence: classification.confidence,
          reasoning: classification.reasoning
        } : undefined,
        manuallyAssigned: !isAutoClassification,
      };
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('No estás autenticado');
        setClassifying(false);
        return;
      }
      
      await reportsAPI.create(reportData, token);
      
      window.dispatchEvent(new Event('reportUpdated'));
      
      if (classification) {
        setSuggestedEntity(classification);
      }
      
      toast.success('Reporte enviado exitosamente!');
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setSuggestedEntity(null);
        setManualEntity('');
        setFormData({
          title: '',
          description: '',
          location: { lat: 3.8801, lng: -77.0312 },
          address: '',
          mapAddress: '',
        });
        setImagePreview('');
        setImageName('');
        setImageSize(0);
        setClassifying(false);
      }, 4000);
    } catch (error) {
      toast.error('Error al crear el reporte');
    } finally {
      setClassifying(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="border-2 border-green-200 shadow-2xl bg-white">
        <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50 border-b-2 border-green-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-yellow-400 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-green-800 text-2xl">Crear Nuevo Reporte</CardTitle>
              <CardDescription className="text-base">
                Reporta un problema urbano para que sea atendido por la entidad correspondiente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {submitted ? (
            <div className="space-y-6">
              <Alert className="bg-gradient-to-r from-green-50 to-lime-50 border-2 border-green-300">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-900 text-base ml-2">
                  <strong>Reporte enviado exitosamente</strong>
                  <br />
                  Tu reporte ha sido registrado y será atendido pronto.
                </AlertDescription>
              </Alert>
              {suggestedEntity ? (
                <div className="bg-gradient-to-r from-yellow-50 to-green-50 border-2 border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-6 h-6 text-yellow-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-green-900 mb-3 text-lg">Clasificación Automática por IA</h4>
                      <p className="text-base text-gray-700 mb-2">
                        <strong>Entidad asignada:</strong> {suggestedEntity.entity}
                      </p>
                      <p className="text-base text-gray-700 mb-3">
                        <strong>Confianza:</strong> {suggestedEntity.confidence}%
                      </p>
                      <p className="text-sm text-gray-600">
                        {suggestedEntity.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              ) : manualEntity && manualEntity !== 'auto' && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-green-900 mb-2 text-lg">Entidad Seleccionada Manualmente</h4>
                      <p className="text-base text-gray-700">
                        Tu reporte ha sido enviado a: <strong>{manualEntity}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Sección 1: Información Básica */}
              <div className="space-y-6 p-8 bg-gradient-to-r from-green-50/50 to-yellow-50/50 rounded-xl border-2 border-green-100">
                <h3 className="text-2xl pb-3 border-b-2 border-green-200 bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 bg-clip-text text-transparent">
                  Información Básica
                </h3>
                
                {/* Title */}
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-base text-green-900">
                    Título del Reporte <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Hueco grande en la Calle 5ta"
                    className="border-2 border-green-200 h-12 text-base"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base text-green-900">
                    Descripción Detallada <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe el problema con el mayor detalle posible. Incluye información como: ¿Qué pasó?, ¿cuándo ocurrió?, ¿hay algún riesgo?, etc."
                    rows={6}
                    className="border-2 border-green-200 text-base"
                    required
                  />
                  <p className="text-sm text-gray-500 pl-1">
                    Cuanta más información proporciones, mejor podrá ser atendido tu reporte
                  </p>
                </div>
              </div>

              {/* Sección 2: Clasificación y Entidad */}
              <div className="space-y-6 p-8 bg-gradient-to-r from-yellow-50/50 to-green-50/50 rounded-xl border-2 border-yellow-100">
                <h3 className="text-2xl pb-3 border-b-2 border-yellow-200 bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 bg-clip-text text-transparent">
                  Clasificación y Entidad Responsable
                </h3>

                {/* Entity Selection */}
                <div className="space-y-3">
                  <Label htmlFor="entity" className="text-base text-green-900">
                    Seleccionar Entidad (Opcional)
                  </Label>
                  <Select 
                    value={manualEntity || undefined} 
                    onValueChange={(value) => {
                      setManualEntity(value);
                      if (value !== 'auto' && value !== '') {
                        setSuggestedEntity(null);
                      }
                    }}
                  >
                    <SelectTrigger className="border-2 border-green-200 h-12 text-base">
                      <SelectValue placeholder="Dejar que la IA seleccione automáticamente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          <span>Clasificación automática con IA</span>
                        </div>
                      </SelectItem>
                      {entities.map((entity) => (
                        <SelectItem key={entity} value={entity}>
                          {entity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {manualEntity && manualEntity !== 'auto' && (
                    <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                      <p className="text-base text-green-700">
                        Has seleccionado: <strong>{manualEntity}</strong>
                      </p>
                    </div>
                  )}
                  {(!manualEntity || manualEntity === 'auto') && (
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                      <p className="text-base text-gray-600">
                        La IA analizará tu reporte y asignará la entidad automáticamente
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Classification Preview */}
                {formData.title && formData.description && (!manualEntity || manualEntity === 'auto') && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAutoClassify}
                      disabled={classifying}
                      className="border-2 border-yellow-300 hover:bg-yellow-50 h-11 text-base bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 bg-clip-text text-transparent hover:from-green-700 hover:via-yellow-600 hover:to-green-700"
                    >
                      {classifying ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin text-gray-600" />
                          <span className="text-gray-600">Clasificando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                          <span>Previsualizar Clasificación IA</span>
                        </>
                      )}
                    </Button>
                    {suggestedEntity && (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg px-4 py-3 text-base flex-1">
                        <span className="text-gray-700">Sugerencia IA:</span>{' '}
                        <strong className="text-green-700">{suggestedEntity.entity}</strong>{' '}
                        <span className="text-gray-500">({suggestedEntity.confidence}% confianza)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sección 3: Evidencia Visual */}
              <div className="space-y-6 p-8 bg-gradient-to-r from-blue-50/50 to-green-50/50 rounded-xl border-2 border-blue-100">
                <h3 className="text-2xl pb-3 border-b-2 border-blue-200 bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 bg-clip-text text-transparent">
                  Evidencia Visual (Opcional)
                </h3>

                {/* Image Upload */}
                <div className="space-y-3">
                  <Label htmlFor="image" className="text-base text-green-900">
                    Adjuntar Imagen (Máximo 10MB)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1 border-2 border-green-200 h-12 cursor-pointer text-base"
                    />
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 pl-1">
                    Una imagen ayuda a entender mejor el problema. Tamaño máximo: 10MB
                  </p>
                  
                  {imagePreview && (
                    <div className="mt-6 space-y-4">
                      {/* Image info */}
                      <div className="bg-white p-4 rounded-lg border-2 border-green-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileImage className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-900">{imageName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(imageSize)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeImage}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Image preview */}
                      <div className="p-2 bg-white rounded-lg border-2 border-green-200">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full max-w-2xl mx-auto h-64 object-cover rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección 4: Ubicación */}
              <div className="space-y-6 p-8 bg-gradient-to-r from-purple-50/50 to-green-50/50 rounded-xl border-2 border-purple-100">
                <h3 className="text-2xl pb-3 border-b-2 border-purple-200 bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 bg-clip-text text-transparent">
                  Ubicación del Problema
                </h3>

                {/* Location */}
                <div className="space-y-3">
                  <Label htmlFor="address" className="text-base text-green-900">
                    Dirección o Ubicación (Opcional)
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ej: Calle 5ta con Carrera 10, Barrio San José"
                    className="border-2 border-green-200 h-12 text-base"
                  />
                  <p className="text-sm text-gray-500 pl-1">
                    Si no escribes nada, se usará automáticamente la dirección del mapa
                  </p>
                </div>

                {/* Map Selector */}
                <div className="mt-4">
                  <MapSelector
                    location={formData.location}
                    onLocationChange={handleLocationChange}
                    onAddressChange={handleAddressChange}
                  />
                </div>
              </div>

              {/* Info Alert */}
              {(!manualEntity || manualEntity === 'auto') ? (
                <Alert className="border-2 border-blue-200 bg-blue-50">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <AlertDescription className="text-blue-900 text-base ml-2">
                    <strong>Clasificación Automática:</strong> Nuestra IA analizará tu reporte y lo asignará automáticamente a la entidad correspondiente.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-2 border-green-200 bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-900 text-base ml-2">
                    <strong>Entidad seleccionada manualmente:</strong> Tu reporte será enviado directamente a {manualEntity}.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      title: '',
                      description: '',
                      location: { lat: 3.8801, lng: -77.0312 },
                      address: '',
                      mapAddress: '',
                    });
                    removeImage();
                    setManualEntity('');
                    setSuggestedEntity(null);
                    toast.info('Formulario cancelado');
                  }}
                  className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-14 text-base"
                  disabled={classifying}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-500 text-white shadow-md h-14 text-base" 
                  disabled={classifying}
                >
                  {classifying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Clasificando y enviando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Enviar Reporte
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}