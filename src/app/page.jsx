// app/page.jsx - VERSIÓN DE PRUEBA
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
        <h1 className="text-4xl font-bold text-[#2d5a27] mb-4">
          🌿 Ferme Al Manssouri
        </h1>
        <p className="text-gray-600 mb-6">
          ¡La página está funcionando correctamente!
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="/admin/dashboard"
            className="bg-[#2d5a27] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition text-center"
          >
            Panel Admin
          </a>
          <a
            href="/actividades"
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition text-center"
          >
            Ver Actividades
          </a>
        </div>
      </div>
    </div>
  );
}
