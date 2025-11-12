import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Star, ThumbsUp, Meh, ThumbsDown, X } from 'lucide-react';

interface RatingDialogProps {
  report: { id: string; title: string } | null;
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => void;
}

export function RatingDialog({ report, onClose, onSubmit }: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, comment);
      setRating(0);
      setComment('');
    }
  };

  const getRatingIcon = () => {
    if (rating >= 4) return <ThumbsUp className="w-12 h-12 text-green-600" />;
    if (rating === 3) return <Meh className="w-12 h-12 text-yellow-600" />;
    if (rating <= 2 && rating > 0) return <ThumbsDown className="w-12 h-12 text-red-600" />;
    return null;
  };

  const getRatingColor = () => {
    if (rating >= 4) return 'from-green-500 to-lime-500';
    if (rating === 3) return 'from-yellow-500 to-amber-500';
    if (rating <= 2 && rating > 0) return 'from-red-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const getRatingText = () => {
    if (rating === 1) return 'Muy Insatisfecho';
    if (rating === 2) return 'Insatisfecho';
    if (rating === 3) return 'Neutral';
    if (rating === 4) return 'Satisfecho';
    if (rating === 5) return 'Muy Satisfecho';
    return 'Sin calificación';
  };

  if (!report) return null;

  return (
    <Dialog open={!!report} onOpenChange={onClose}>
      <DialogContent className="max-w-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-yellow-50">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl text-green-800 mb-2">
                Califica la Atención Recibida
              </DialogTitle>
              <DialogDescription className="text-base">
                ¿Cómo fue la resolución de tu reporte "{report.title}"?
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-green-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Star Rating Section */}
          <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border-2 border-green-200 shadow-sm">
            <Label className="text-base text-gray-700">Selecciona tu calificación</Label>
            
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all duration-200 hover:scale-125 active:scale-110"
                  aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-14 h-14 transition-all duration-200 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {/* Rating Feedback */}
            {rating > 0 && (
              <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
                <div className={`p-4 rounded-full bg-gradient-to-br ${getRatingColor()} shadow-lg`}>
                  {getRatingIcon()}
                </div>
                <div className="text-center">
                  <p className="text-xl text-gray-800 mb-1">
                    {getRatingText()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {rating} de 5 estrellas
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Optional Comment Section */}
          <div className="space-y-3 p-6 bg-white rounded-xl border-2 border-green-200 shadow-sm">
            <Label htmlFor="comment" className="text-base text-gray-700">
              Comentarios adicionales (opcional)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia, qué salió bien o qué podría mejorar..."
              rows={4}
              className="border-2 border-green-200 resize-none text-base"
            />
            <p className="text-xs text-gray-500">
              Tu opinión nos ayuda a mejorar el servicio para todos los ciudadanos
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-2 border-green-200 hover:bg-green-50 h-12 text-base"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className={`flex-1 h-12 text-base shadow-lg transition-all duration-300 ${
                rating === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-500 hover:shadow-xl'
              }`}
            >
              {rating === 0 ? (
                'Selecciona una calificación'
              ) : (
                <>
                  <Star className="w-5 h-5 mr-2 fill-white" />
                  Enviar Calificación
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
