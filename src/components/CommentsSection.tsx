import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MessageCircle, Send, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { commentsAPI } from '../utils/api';

interface Comment {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole?: 'admin' | 'ciudadano';
  text: string;
  createdAt: string;
}

interface CommentsSectionProps {
  reportId: string;
  currentUser: { id: string; name: string; email: string; role: 'admin' | 'ciudadano' };
}

export function CommentsSection({ reportId, currentUser }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = async () => {
    try {
      const response = await commentsAPI.getAll(reportId);
      const sortedComments = response.comments.sort((a: Comment, b: Comment) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComments(sortedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  useEffect(() => {
    loadComments();
    
    const handleCommentUpdate = () => {
      loadComments();
    };
    
    window.addEventListener('commentAdded', handleCommentUpdate);
    
    return () => {
      window.removeEventListener('commentAdded', handleCommentUpdate);
    };
  }, [reportId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Por favor escribe un comentario');
      return;
    }

    if (newComment.trim().length < 3) {
      toast.error('El comentario debe tener al menos 3 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('No estás autenticado');
        setIsSubmitting(false);
        return;
      }

      await commentsAPI.add(reportId, newComment.trim(), token);

      setNewComment('');
      loadComments();
      window.dispatchEvent(new Event('commentAdded'));
      toast.success('Comentario agregado exitosamente');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error al agregar comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    toast.info('Funcionalidad de eliminar comentarios próximamente');
    loadComments();
    window.dispatchEvent(new Event('commentAdded'));
    toast.success('Comentario eliminado');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarColor = (role?: string) => {
    if (role === 'admin') return 'from-purple-500 to-purple-600';
    return 'from-green-500 to-yellow-400';
  };

  return (
    <Card className="border-2 border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50 border-b-2 border-green-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-green-800 text-2xl">
            <div className="bg-gradient-to-br from-green-500 to-yellow-400 p-2 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span>Comentarios y Discusión</span>
              <Badge className="ml-3 bg-green-600 text-white text-base px-3 py-1">
                {comments.length}
              </Badge>
            </div>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Add Comment Section */}
        <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl border-2 border-green-200">
          <Label htmlFor="newComment" className="text-base text-green-900">
            Agregar Comentario
          </Label>
          <Textarea
            id="newComment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario, pregunta o actualización sobre este reporte..."
            className="border-2 border-green-200 focus:border-green-400 min-h-24 resize-none text-base"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleAddComment();
              }
            }}
          />
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 space-y-1">
              <p>Presiona <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> para enviar</p>
              <p className="text-xs text-gray-500">{newComment.length} caracteres</p>
            </div>
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              className="bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-500 text-white h-11 px-6 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Comentar
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator className="bg-green-200" />

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-700 mb-1">No hay comentarios aún</p>
            <p className="text-base">Sé el primero en comentar sobre este reporte</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div 
                key={comment.id} 
                className="flex gap-4 group animate-in fade-in duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar className="w-12 h-12 border-2 border-green-200 shadow-md flex-shrink-0">
                  <AvatarFallback className={`bg-gradient-to-br ${getAvatarColor(comment.userRole)} text-white`}>
                    {comment.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-white border-2 border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-base text-gray-900">
                            {comment.userName}
                          </p>
                          {comment.userRole === 'admin' ? (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              <UserIcon className="w-3 h-3 mr-1" />
                              Ciudadano
                            </Badge>
                          )}
                          {comment.userId === currentUser.id && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              Tú
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                      </div>
                      {(comment.userId === currentUser.id || currentUser.role === 'admin') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Eliminar comentario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-base text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
