'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { ChevronDown } from 'lucide-react';

interface Category {
  id: string;
  nameKo: string;
  nameZh: string;
  slug: string;
  icon: string | null;
  children: Category[];
}

export default function CategoryNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // 카테고리 불러오기
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories/nav');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 현재 경로에서 활성 카테고리 추출
  useEffect(() => {
    const pathSegments = pathname.split('/');
    if (pathSegments[1] === 'category' && pathSegments[2]) {
      setActiveCategory(pathSegments[2]);
    }
  }, [pathname]);

  return (
    <div
      className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
        isScrolled ? 'shadow-md' : 'border-b border-gray-200'
      }`}
    >
      <div className="container-app">
        {/* 메인 카테고리 메뉴 */}
        <nav className="flex items-center gap-6 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((category) => {
            const isActive = pathname.startsWith(`/category/${category.slug}`);

            return (
              <div
                key={category.id}
                className="relative group"
                onMouseEnter={() => setActiveCategory(category.slug)}
                onMouseLeave={() => !pathname.startsWith(`/category/${category.slug}`) && setActiveCategory(null)}
              >
                <Link
                  href={`/category/${category.slug}`}
                  className={`
                    flex items-center gap-1.5 whitespace-nowrap text-[14px] font-medium
                    transition-colors duration-200 py-2 px-1
                    ${
                      isActive
                        ? 'text-black border-b-2 border-black'
                        : 'text-gray-600 hover:text-black'
                    }
                  `}
                >
                  {category.icon && <span className="text-[16px]">{category.icon}</span>}
                  <span>{language === 'ko' ? category.nameKo : category.nameZh}</span>
                  {category.children && category.children.length > 0 && (
                    <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                  )}
                </Link>

                {/* 서브 카테고리 드롭다운 */}
                {category.children && category.children.length > 0 && (
                  <div
                    className={`
                      absolute top-full left-0 mt-0 bg-white border border-gray-200 rounded-lg shadow-lg
                      min-w-[180px] p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-200 transform translate-y-2 group-hover:translate-y-0
                    `}
                  >
                    {category.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${category.slug}/${sub.slug}`}
                        className="
                          block px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50
                          rounded-md transition-colors duration-150
                        "
                      >
                        {language === 'ko' ? sub.nameKo : sub.nameZh}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* 활성 카테고리의 서브 카테고리 (모바일용) */}
        {activeCategory && (
          <div className="md:hidden border-t border-gray-100 py-2">
            <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {categories
                .find((cat) => cat.slug === activeCategory)
                ?.children?.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/category/${activeCategory}/${sub.slug}`}
                    className="
                      whitespace-nowrap text-[12px] px-3 py-1.5 rounded-full
                      bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors
                    "
                  >
                    {language === 'ko' ? sub.nameKo : sub.nameZh}
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
