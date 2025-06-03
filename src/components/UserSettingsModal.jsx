import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import { Dialog } from "@headlessui/react";

export default function UserSettingsModal({ isOpen, onClose, user }) {
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    biografia: "",
    foto_perfil: ""
  });

  useEffect(() => {
    if (user) {
      setForm({
        nombre: user.nombre || "",
        apellidos: user.apellidos || "",
        biografia: user.biografia || "",
        foto_perfil: user.foto_perfil || ""
      });
    }
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await userService.updateProfile(user._id, form);
      onClose(); // cerrar modal
      window.location.reload(); // opcional: recargar para ver cambios
    } catch (err) {
      console.error("Error actualizando usuario:", err);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Ajustes de perfil
          </Dialog.Title>
          <div className="space-y-3">
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="text"
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              placeholder="Apellidos"
              className="w-full border px-3 py-2 rounded"
            />
            <textarea
              name="biografia"
              value={form.biografia}
              onChange={handleChange}
              placeholder="Biografía"
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="text"
              name="foto_perfil"
              value={form.foto_perfil}
              onChange={handleChange}
              placeholder="URL de foto de perfil"
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-harmony-accent text-white"
            >
              Guardar cambios
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
