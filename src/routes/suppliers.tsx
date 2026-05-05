import { useStore, actions } from '@/lib/store';
import { useEffect } from 'react';
import SupplierForm from '@/components/SupplierForm';
import SupplierList from '@/components/SupplierList';

export default function SuppliersPage() {
  const { suppliers, loaded } = useStore((s) => ({
    suppliers: s.suppliers,
    loaded: s.loaded,
  }));

  useEffect(() => {
    if (!loaded) actions.loadAll();
  }, [loaded]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Fornecedores</h1>
      <SupplierForm />
      <SupplierList suppliers={suppliers} />
    </div>
  );
}
