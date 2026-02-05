'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/common/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="container-app py-6">
      <h1 className="text-2xl font-bold mb-6">{t('nav.categories')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/posts?category=${category.slug}`}>
            <Card className="text-center card-hover cursor-pointer h-full">
              <CardContent className="py-8">
                <span className="text-4xl mb-3 block">{category.icon || '📦'}</span>
                <h3 className="font-medium">
                  {language === 'ko' ? category.nameKo : category.nameZh}
                </h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
