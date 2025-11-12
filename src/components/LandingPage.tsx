import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Users, FileText, Building2, Shield, Zap, BarChart3, MapPin, LogIn, UserPlus, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import { reportsAPI, entitiesAPI, adminAPI } from '../utils/api';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const [stats, setStats] = useState({
    totalReports: 0,
    activeReports: 0,
    totalUsers: 0,
    totalEntities: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [reportsRes, entitiesRes] = await Promise.all([
        reportsAPI.getAll(),
        entitiesAPI.getAll(),
      ]);

      const activeReports = reportsRes.reports.filter((r: any) => r.status === 'pendiente' || r.status === 'en-proceso').length;

      setStats({
        totalReports: reportsRes.reports.length,
        activeReports,
        totalUsers: 0, // No podemos obtener usuarios sin autenticación
        totalEntities: entitiesRes.entities.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Usar valores por defecto si falla
      setStats({
        totalReports: 0,
        activeReports: 0,
        totalUsers: 0,
        totalEntities: 0,
      });
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-yellow-400 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="text-3xl">
                <span className="text-yellow-500">ZP</span>
                <span className="text-green-600">REPORTE</span>
              </div>
            </div>

            {/* Menu */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => scrollToSection('inicio')}
                className="text-gray-700 hover:text-green-600 hover:bg-yellow-50 border-2 border-transparent hover:border-yellow-400"
              >
                Inicio
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('como-funciona')}
                className="text-gray-700 hover:text-green-600 hover:bg-yellow-50 border-2 border-transparent hover:border-yellow-400"
              >
                ¿Cómo funciona?
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('entidades')}
                className="text-gray-700 hover:text-green-600 hover:bg-yellow-50 border-2 border-transparent hover:border-yellow-400"
              >
                Entidades
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('contacto')}
                className="text-gray-700 hover:text-green-600 hover:bg-yellow-50 border-2 border-transparent hover:border-yellow-400"
              >
                Contacto
              </Button>
              <Button
                onClick={onLogin}
                variant="outline"
                className="border-3 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
              <Button
                onClick={onRegister}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Registrarse
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="flex md:hidden gap-2">
              <Button onClick={onLogin} size="sm" variant="outline" className="border-green-600 text-green-600">
                <LogIn className="w-4 h-4" />
              </Button>
              <Button onClick={onRegister} size="sm" className="bg-yellow-400 text-gray-900">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-br from-gray-100 via-white to-green-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, #10b981 0px, #10b981 2px, transparent 2px, transparent 10px)`,
          }} />
        </div>

        {/* Graffiti Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="text-[20rem] text-green-100 opacity-20">
            BVA
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main Title */}
            <div className="mb-6">
              <h1 className="text-6xl md:text-8xl mb-4">
                <span className="text-yellow-500 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transform -rotate-2 inline-block">
                  REPORTE
                </span>
                <br />
                <span className="text-green-600 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transform rotate-1 inline-block">
                  BUENAVENTURA
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl text-gray-800">
                Tu voz importa. Mejoremos juntos nuestra ciudad.
              </h2>
            </div>

            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plataforma ciudadana para reportar problemas, hacer seguimiento a soluciones y conectar directamente con las entidades responsables de Buenaventura, Valle del Cauca.
            </p>

            {/* CTA Button */}
            <div className="mb-16">
              <Button
                onClick={onRegister}
                size="lg"
                className="text-2xl md:text-3xl px-12 py-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 border-4 border-gray-900"
              >
                COMENZAR
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="border-4 border-yellow-400 bg-white">
                <CardContent className="pt-8 pb-6">
                  <div className="flex flex-col items-center">
                    <FileText className="w-12 h-12 text-yellow-500 mb-3" />
                    <div className="text-5xl text-yellow-500 mb-2">
                      {stats.totalReports.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-700 uppercase">
                      Reportes Activos
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-green-500 bg-white">
                <CardContent className="pt-8 pb-6">
                  <div className="flex flex-col items-center">
                    <Users className="w-12 h-12 text-green-600 mb-3" />
                    <div className="text-5xl text-green-600 mb-2">
                      {stats.totalUsers.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-700 uppercase">
                      Ciudadanos Activos
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-green-500 bg-white">
                <CardContent className="pt-8 pb-6">
                  <div className="flex flex-col items-center">
                    <Building2 className="w-12 h-12 text-green-600 mb-3" />
                    <div className="text-5xl text-green-600 mb-2">
                      {stats.totalEntities}
                    </div>
                    <div className="text-sm text-gray-700 uppercase">
                      Entidades Conectadas
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona Section */}
      <section id="como-funciona" className="py-20 bg-gradient-to-br from-white to-yellow-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl mb-4">
              <span className="text-yellow-500">¿CÓMO </span>
              <span className="text-green-600">FUNCIONA?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Reportar problemas en tu ciudad nunca fue tan fácil. Sigue estos simples pasos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                number: 1,
                title: 'REGÍSTRATE',
                description: 'Crea tu cuenta con Google o manualmente. Es rápido y gratis.',
                icon: UserPlus,
                color: 'yellow',
              },
              {
                number: 2,
                title: 'CREA TU REPORTE',
                description: 'Describe el problema, añade fotos y selecciona la entidad responsable.',
                icon: FileText,
                color: 'green',
              },
              {
                number: 3,
                title: 'HAZ SEGUIMIENTO',
                description: 'Recibe actualizaciones en tiempo real sobre el estado de tu reporte.',
                icon: BarChart3,
                color: 'green',
              },
              {
                number: 4,
                title: 'CALIFICA',
                description: 'Una vez resuelto, califica el servicio y ayuda a mejorar la ciudad.',
                icon: Zap,
                color: 'yellow',
              },
            ].map((step, index) => (
              <div key={step.number}>
                <Card className={`border-4 ${step.color === 'yellow' ? 'border-yellow-400' : 'border-green-500'} bg-white h-full`}>
                  <CardContent className="pt-8 pb-6">
                    <div className={`w-16 h-16 rounded-full ${step.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-600'} flex items-center justify-center mb-4`}>
                      <span className="text-3xl text-white">{step.number}</span>
                    </div>
                    <div className={`w-16 h-16 rounded-xl ${step.color === 'yellow' ? 'bg-yellow-100' : 'bg-green-100'} flex items-center justify-center mb-4`}>
                      <step.icon className={`w-8 h-8 ${step.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}`} />
                    </div>
                    <h3 className="text-xl text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Características Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl mb-4">
              <span className="text-green-600">CARACTERÍSTICAS </span>
              <span className="text-yellow-500">PRINCIPALES</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas poderosas para que tu voz sea escuchada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'SEGURO Y CONFIABLE',
                description: 'Tus datos están protegidos. Sistema de moderación para prevenir abusos.',
                icon: Shield,
                color: 'yellow',
              },
              {
                title: 'CLASIFICACIÓN IA',
                description: 'Nuestra IA clasifica automáticamente tu reporte a la entidad correcta.',
                icon: Zap,
                color: 'green',
              },
              {
                title: 'MÉTRICAS EN TIEMPO REAL',
                description: 'Visualiza estadísticas de reportes resueltos y rendimiento de entidades.',
                icon: BarChart3,
                color: 'yellow',
              },
              {
                title: 'UBICACIÓN PRECISA',
                description: 'Marca la ubicación exacta del problema con nuestro sistema de mapas.',
                icon: MapPin,
                color: 'green',
              },
            ].map((feature, index) => (
              <div key={feature.title}>
                <Card className={`border-4 ${feature.color === 'yellow' ? 'border-yellow-400' : 'border-green-500'} bg-white h-full`}>
                  <CardContent className="pt-8 pb-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-xl ${feature.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-600'} flex items-center justify-center flex-shrink-0`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, #fff 0px, #fff 2px, transparent 2px, transparent 10px)`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl text-white mb-6">
              ¿LISTO PARA HACER LA DIFERENCIA?
            </h2>
            <p className="text-xl md:text-2xl text-green-100 mb-8">
              Únete a miles de ciudadanos que ya están mejorando Buenaventura
            </p>
            <Button
              onClick={onRegister}
              size="lg"
              className="text-2xl md:text-3xl px-12 py-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 border-4 border-gray-900"
            >
              ¡EMPIEZA AHORA!
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-gray-900 text-white py-12 border-t-4 border-yellow-400">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Logo y Descripción */}
            <div>
              <div className="text-3xl mb-4">
                <span className="text-yellow-500">ZP</span>
                <span className="text-green-500">REPORTE</span>
              </div>
              <p className="text-gray-400 mb-4">
                Plataforma ciudadana para mejorar Buenaventura, Valle del Cauca.
              </p>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-xl text-yellow-400 mb-4">CONTACTO</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300">+57 310 650 7940</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300">soporte@zpreporte.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300">Buenaventura, Valle del Cauca</span>
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div>
              <h3 className="text-xl text-yellow-400 mb-4">SÍGUENOS</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-12 h-12 rounded-lg bg-green-600 hover:bg-green-500 flex items-center justify-center"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-lg bg-green-600 hover:bg-green-500 flex items-center justify-center"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-lg bg-green-600 hover:bg-green-500 flex items-center justify-center"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} <span className="text-yellow-500">ZPservicioTecnico</span>. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Desarrollado con ❤️ para la comunidad de Buenaventura
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}