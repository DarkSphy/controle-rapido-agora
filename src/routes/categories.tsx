import { useEffect } from 'react';
import { useStore, actions } from '@/lib/store';
import CategoryForm from '@/components/CategoryForm';
import CategoryList from '@/components/CategoryList';

export default function CategoriesPage() {
  const { categories, loaded } = useStore((s) => ({
    categories: s.categories,
    loaded: s.loaded,
  }));

  useEffect(() => {
    if (!loaded) actions.loadAll();
  }, [loaded]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Categorias</h1>
      <CategoryForm />
      <CategoryList categories={categories} />
    </div>
  );
}
