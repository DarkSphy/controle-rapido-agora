import { useState } from 'react';
import { actions } from '@/lib/store';

export default function SupplierForm({ initial }: { initial?: { name: string; phone?: string } }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await actions.addSupplier({ name, phone: phone || undefined });
    setName('');
    setPhone('');
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 mb-4 p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-semibold">{initial ? 'Editar' : 'Adicionar'} Fornecedor</h2>
      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded px-2 py-1"
        required
      />
      <input
        type="tel"
        placeholder="Telefone / WhatsApp"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border rounded px-2 py-1"
      />
      <button type="submit" className="bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition">
        {initial ? 'Salvar' : 'Adicionar'}
      </button>
    </form>
  );
}
