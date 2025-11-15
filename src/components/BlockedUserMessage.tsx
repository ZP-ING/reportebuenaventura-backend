import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Ban, Mail, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BlockedUserMessageProps {
  suspendedUntil?: string;
}

export function BlockedUserMessage({ suspendedUntil }: BlockedUserMessageProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isTemporary, setIsTemporary] = useState(false);

  useEffect(() => {
    if (suspendedUntil) {
      const suspendDate = new Date(suspendedUntil);
      const now = new Date();
      
      if (suspendDate > now) {
        setIsTemporary(true);
        
        // Actualizar contador cada segundo
        const interval = setInterval(() => {
          const now = new Date();
          const diff = suspendDate.getTime() - now.getTime();
          
          if (diff <= 0) {
            setTimeRemaining('Suspensión expirada. Recarga la página.');
            clearInterval(interval);
            return;
          }
          
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          let timeStr = '';
          if (days > 0) timeStr += `${days} día${days > 1 ? 's' : ''}, `;
          timeStr += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          setTimeRemaining(timeStr);
        }, 1000);
        
        return () => clearInterval(interval);
      }
    }
  }, [suspendedUntil]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className={`max-w-2xl w-full border-2 shadow-xl ${
        isTemporary 
          ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50' 
          : 'border-red-300 bg-gradient-to-br from-red-50 to-orange-50'
      }`}>
        <CardHeader className="text-center">
          <div className={`mx-auto p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 ${
            isTemporary
              ? 'bg-gradient-to-br from-orange-500 to-yellow-500'
              : 'bg-gradient-to-br from-red-500 to-orange-500'
          }`}>
            {isTemporary ? <Clock className="w-10 h-10 text-white" /> : <Ban className="w-10 h-10 text-white" />}
          </div>
          <CardTitle className={`text-3xl ${isTemporary ? 'text-orange-800' : 'text-red-800'}`}>
            {isTemporary ? 'USUARIO SUSPENDIDO TEMPORALMENTE' : 'USUARIO BLOQUEADO'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-3">
            <p className="text-lg text-gray-700">
              {isTemporary 
                ? 'Tu cuenta ha sido suspendida temporalmente debido a tu comportamiento en la plataforma.'
                : 'Tu cuenta ha sido bloqueada permanentemente.'
              }
            </p>
            <p className="text-gray-600">
              No puedes realizar reportes, ver tu historial ni acceder a las entidades mientras tu cuenta esté {isTemporary ? 'suspendida' : 'bloqueada'}.
            </p>
          </div>

          {isTemporary && timeRemaining && (
            <div className="bg-white rounded-lg p-6 border-2 border-orange-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
                <p className="text-lg text-gray-800">
                  <strong>Tiempo restante de suspensión:</strong>
                </p>
              </div>
              <div className="text-4xl text-orange-600 font-mono bg-orange-50 py-4 px-6 rounded-lg border border-orange-200">
                {timeRemaining}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Deberás esperar hasta que termine la suspensión para volver a ingresar
              </p>
            </div>
          )}

          <div className={`bg-white rounded-lg p-6 border-2 ${isTemporary ? 'border-orange-200' : 'border-red-200'}`}>
            <div className="flex items-start gap-3 text-left">
              <Mail className={`w-5 h-5 flex-shrink-0 mt-1 ${isTemporary ? 'text-orange-600' : 'text-red-600'}`} />
              <div>
                <p className="text-gray-800 mb-2">
                  <strong>Póngase en contacto con un administrador para mayor información:</strong>
                </p>
                <div className="space-y-1 text-sm">
                  <a 
                    href="mailto:johnvalenciazp@gmail.com" 
                    className={`block hover:underline transition-colors ${
                      isTemporary ? 'text-orange-600 hover:text-orange-800' : 'text-red-600 hover:text-red-800'
                    }`}
                  >
                    johnvalenciazp@gmail.com
                  </a>
                  <a 
                    href="mailto:jhon.william.angulo@correounivalle.edu.co" 
                    className={`block hover:underline transition-colors ${
                      isTemporary ? 'text-orange-600 hover:text-orange-800' : 'text-red-600 hover:text-red-800'
                    }`}
                  >
                    jhon.william.angulo@correounivalle.edu.co
                  </a>
                  <a 
                    href="https://wa.me/573106507940" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block hover:underline transition-colors ${
                      isTemporary ? 'text-orange-600 hover:text-orange-800' : 'text-red-600 hover:text-red-800'
                    }`}
                  >
                    WhatsApp: +57 310 650 7940
                  </a>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            {isTemporary 
              ? 'Una vez finalizada la suspensión, podrás acceder nuevamente a todas las funcionalidades de la plataforma.'
              : 'Una vez resuelto el problema, podrás acceder nuevamente a todas las funcionalidades de la plataforma.'
            }
          </p>

          <div className={`mt-6 pt-6 border-t-2 text-center ${isTemporary ? 'border-orange-200' : 'border-red-200'}`}>
            <p className="text-sm text-gray-600">
              © 2025 ZPservicioTecnico - Todos los derechos reservados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
