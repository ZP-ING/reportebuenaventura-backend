import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { LoginPage } from './components/LoginPage';
import { ReportForm } from './components/ReportForm';
import { MyReports } from './components/MyReports';
import { PublicReportsTracking } from './components/PublicReportsTracking';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminUsersManagement } from './components/AdminUsersManagement';
import { AdminAnalytics } from './components/AdminAnalytics';
import { EntityList } from './components/EntityList';
import { AppRatingDialog } from './components/AppRatingDialog';
import { NotificationBell } from './components/NotificationBell';
import { MapPin, PlusCircle, FileText, User, LogOut, Users, BarChart3, Search, Building2, Settings, Shield, UserCircle, Mail } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { LandingPage } from './components/LandingPage';
import { ResetPassword } from './components/ResetPassword';
import { BlockedUserMessage } from './components/BlockedUserMessage';
import { AdminReportsManagement } from './components/AdminReportsManagement';
import { AdminEntitiesManagement } from './components/AdminEntitiesManagement';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'ciudadano';
  blocked?: boolean;
  suspendedUntil?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('mis-reportes');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLanding, setShowLanding] = useState(true);

  // Check if we're on the reset password page
  const isResetPasswordPage = window.location.hash === '#access_token' || window.location.pathname === '/reset-password';

  useEffect(() => {
    // Check if user is logged in (still using localStorage for session)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setShowLanding(false);
      // Set default tab based on role
      if (user.role === 'admin') {
        setActiveTab('analytics');
      } else {
        setActiveTab('mis-reportes');
      }
      
      // Check user block status periodically (every 30 seconds) for non-admin users
      if (user.role !== 'admin') {
        const checkBlockStatus = async () => {
          try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            
            const response = await fetch('https://evmgkfifpeyimrjijzou.supabase.co/functions/v1/make-server-e2de53ff/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.user && data.user.blocked !== user.blocked) {
                // Update local user state if block status changed
                const updatedUser = { ...user, blocked: data.user.blocked };
                setCurrentUser(updatedUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              }
            }
          } catch (error) {
            // Silently fail - this is expected when offline or server unavailable
            // console.error('Error checking block status:', error);
          }
        };
        
        // Check immediately
        checkBlockStatus();
        
        // Then check every 30 seconds
        const interval = setInterval(checkBlockStatus, 30000);
        
        return () => clearInterval(interval);
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowLanding(false);
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Set initial tab based on role
    if (user.role === 'admin') {
      setActiveTab('analytics');
    } else {
      setActiveTab('mis-reportes');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setActiveTab('mis-reportes');
  };

  // 
  if (isResetPasswordPage) {
    return <ResetPassword />;
  }

  // If showing landing page
  if (showLanding && !currentUser) {
    return (
      <>
        <LandingPage 
          onLogin={() => setShowLanding(false)} 
          onRegister={() => setShowLanding(false)} 
        />
        <Toaster position="top-right" />
      </>
    );
  }

  // If not logged in (after landing), show login
  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const isBlocked = currentUser.blocked === true;
  
  // Check if user is suspended
  const isSuspended = () => {
    if (!currentUser.suspendedUntil) return false;
    return new Date(currentUser.suspendedUntil) > new Date();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-yellow-50 to-lime-50">
      {/* Header - Sin Logo */}
      <header className="bg-white shadow-xl border-b-4 sticky top-0 z-50 backdrop-blur-md bg-white/95" style={{
        borderImage: 'linear-gradient(90deg, #10b981, #fbbf24, #84cc16) 1'
      }}>
        <div className="container mx-auto px-4 py-5 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-green-600 via-yellow-500 to-lime-600 bg-clip-text text-transparent text-2xl md:text-4xl drop-shadow-sm">
                ReporteBuenaventura
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Plataforma Ciudadana de Reportes</p>
            </div>

            {/* User Menu and Logout */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Notification Bell - Only for citizens */}
              {!isAdmin && (
                <NotificationBell userId={currentUser.id} />
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 md:gap-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50 px-3 py-2 rounded-xl transition-all duration-300 outline-none focus:ring-2 focus:ring-green-400 group">
                  <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-green-400 ring-2 ring-green-200/50 group-hover:ring-green-300/70 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-yellow-400 text-white text-lg">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-base md:text-lg text-green-900">{currentUser.name}</p>
                    <p className="text-xs md:text-sm text-yellow-600">
                      {isAdmin ? 'Administrador' : 'Ciudadano'}
                    </p>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 backdrop-blur-lg bg-white/98 border-2 border-green-100 shadow-xl">
                  <DropdownMenuLabel className="text-green-800">Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-green-100" />
                  <DropdownMenuItem disabled className="cursor-default">
                    <User className="w-4 h-4 mr-2" />
                    <span className="truncate">{currentUser.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-green-100" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Logout Button - Visible on larger screens */}
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="hidden md:flex items-center gap-2 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-300 hover:scale-105 h-11"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-6 py-6 md:py-8 flex flex-col min-h-0">
        <div className="w-full flex-1 flex flex-col min-h-0">
        {/* Show blocked/suspended message for non-admin users */}
        {!isAdmin && (isBlocked || isSuspended()) ? (
          <BlockedUserMessage suspendedUntil={currentUser.suspendedUntil} />
        ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          {/* Tabs for Citizens - Mejoradas */}
          {!isAdmin && (
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/95 backdrop-blur-sm border-2 border-green-200 p-1.5 rounded-2xl shadow-lg">
              <TabsTrigger 
                value="mis-reportes" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:scale-105"
              >
                <UserCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Mis Reportes</span>
                <span className="sm:hidden">Míos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reportar" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:scale-105"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Crear Reporte</span>
                <span className="sm:hidden">Crear</span>
              </TabsTrigger>
              <TabsTrigger 
                value="seguimiento" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:scale-105"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Seguir Reporte</span>
                <span className="sm:hidden">Seguir</span>
              </TabsTrigger>
              <TabsTrigger 
                value="entidades" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:scale-105"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Entidades</span>
                <span className="sm:hidden">Entidades</span>
              </TabsTrigger>
            </TabsList>
          )}

          {/* Tabs for Admin - Mejoradas */}
          {isAdmin && (
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-8 bg-white/95 backdrop-blur-sm border-2 border-green-200 p-1.5 rounded-2xl shadow-lg gap-1">
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:scale-105"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Análisis</span>
                <span className="sm:hidden">Análisis</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reports-management" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:scale-105"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Reportes</span>
                <span className="sm:hidden">Reportes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users-management" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:scale-105"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Usuarios</span>
                <span className="sm:hidden">Usuarios</span>
              </TabsTrigger>
              <TabsTrigger 
                value="entities" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:scale-105"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Entidades</span>
                <span className="sm:hidden">Entidades</span>
              </TabsTrigger>
              <TabsTrigger 
                value="entities-management" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-yellow-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:scale-105"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Gestión</span>
                <span className="sm:hidden">Gestión</span>
              </TabsTrigger>
            </TabsList>
          )}

          {/* Citizen Tabs Content */}
          {!isAdmin && (
            <>
              <TabsContent value="mis-reportes" className="flex-1 min-h-0">
                <MyReports currentUser={currentUser} />
              </TabsContent>

              <TabsContent value="reportar" className="flex-1 min-h-0">
                <ReportForm currentUser={currentUser} />
              </TabsContent>

              <TabsContent value="seguimiento" className="flex-1 min-h-0">
                <PublicReportsTracking currentUser={currentUser} />
              </TabsContent>

              <TabsContent value="entidades" className="flex-1 min-h-0">
                <EntityList />
              </TabsContent>
            </>
          )}

          {/* Admin Tabs Content */}
          {isAdmin && (
            <>
              <TabsContent value="analytics" className="flex-1 min-h-0">
                <AdminAnalytics />
              </TabsContent>

              <TabsContent value="reports-management" className="flex-1 min-h-0">
                <AdminReportsManagement />
              </TabsContent>

              <TabsContent value="users-management" className="flex-1 min-h-0">
                <AdminUsersManagement />
              </TabsContent>

              <TabsContent value="entities" className="flex-1 min-h-0">
                <EntityList />
              </TabsContent>

              <TabsContent value="entities-management" className="flex-1 min-h-0">
                <AdminEntitiesManagement />
              </TabsContent>
            </>
          )}
        </Tabs>
        )}
        </div>
      </main>

      {/* Footer - Mejorado */}
      <footer className="bg-white border-t-4 mt-auto shadow-2xl relative" style={{
        borderImage: 'linear-gradient(90deg, #10b981, #fbbf24, #84cc16) 1'
      }}>
        {/* Gradiente decorativo */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-400 to-lime-500"></div>
        
        <div className="container mx-auto px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Derechos de Autor */}
            <div className="text-center md:text-left">
              <h4 className="text-green-800 mb-4 flex items-center justify-center md:justify-start gap-2">
                <span className="inline-block w-8 h-0.5 bg-gradient-to-r from-green-500 to-yellow-400"></span>
                Derechos de Autor
              </h4>
              <p className="text-sm md:text-base text-gray-600 mb-2">
                © 2025 ZPservicioTecnico
              </p>
              <p className="text-sm text-gray-600">
                Todos los derechos reservados
              </p>
            </div>

            {/* Información */}
            <div className="text-center md:text-left">
              <h4 className="text-green-800 mb-4 flex items-center justify-center md:justify-start gap-2">
                <span className="inline-block w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-green-500"></span>
                Información
              </h4>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                ReporteBuenaventura es una plataforma ciudadana para reportar y dar seguimiento a problemas urbanos en Buenaventura.
              </p>
            </div>

            {/* Contacto */}
            <div className="text-center md:text-left">
              <h4 className="text-green-800 mb-4 flex items-center justify-center md:justify-start gap-2">
                <span className="inline-block w-8 h-0.5 bg-gradient-to-r from-green-500 to-lime-500"></span>
                Contacto
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Email</p>
                  <a 
                    href="mailto:johnvalenciazp@gmail.com" 
                    className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-600 hover:text-green-600 transition-all duration-300 group"
                  >
                    <div className="bg-green-100 p-1.5 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Mail className="w-4 h-4 flex-shrink-0 text-green-600" />
                    </div>
                    <span className="break-all">johnvalenciazp@gmail.com</span>
                  </a>
                  <a 
                    href="mailto:jhon.william.angulo@correounivalle.edu.co" 
                    className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-600 hover:text-green-600 transition-all duration-300 mt-2 group"
                  >
                    <div className="bg-green-100 p-1.5 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Mail className="w-4 h-4 flex-shrink-0 text-green-600" />
                    </div>
                    <span className="break-all">jhon.william.angulo@correounivalle.edu.co</span>
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">WhatsApp / Teléfono</p>
                  <a 
                    href="https://wa.me/573106507940" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-600 hover:text-green-600 transition-all duration-300 group"
                  >
                    <div className="bg-green-100 p-1.5 rounded-lg group-hover:bg-green-200 transition-colors">
                      <svg className="w-4 h-4 flex-shrink-0 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                    +57 3106507940
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-gradient-to-r from-green-200 via-yellow-200 to-lime-200 text-center">
            <p className="text-sm md:text-base text-gray-500 bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Desarrollado con ❤️ para Buenaventura
            </p>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}