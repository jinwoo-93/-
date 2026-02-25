'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Trash2,
  Package,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  SortAsc,
  FolderPlus,
  Folder,
  Bell,
  BellOff,
  Grid3x3,
  List,
  CheckSquare,
  Square,
  Trash,
  FolderOpen,
  X,
  Plus,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/useToast';
import { useLanguage } from '@/hooks/useLanguage';
import WishlistButton from '@/components/product/WishlistButton';

interface WishlistItem {
  id: string;
  wishlistId: string;
  title: string;
  titleZh?: string;
  priceKRW: number;
  priceCNY: number;
  images: string[];
  status: string;
  addedAt: string;
  seller: {
    id: string;
    nickname: string;
    averageRating: number;
  };
  folder: {
    id: string;
    name: string;
  } | null;
  priceAlertEnabled: boolean;
  targetPrice: number | null;
  lastKnownPrice: number | null;
  note: string | null;
}

interface WishlistFolder {
  id: string;
  name: string;
  nameZh?: string;
  description?: string;
  count: number;
}

type SortBy = 'recent' | 'price-low' | 'price-high' | 'name';
type ViewMode = 'grid' | 'list';

export default function EnhancedWishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [folders, setFolders] = useState<WishlistFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // 폴더 관리 다이얼로그
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // 가격 알림 다이얼로그
  const [isPriceAlertDialogOpen, setIsPriceAlertDialogOpen] = useState(false);
  const [selectedItemForAlert, setSelectedItemForAlert] = useState<WishlistItem | null>(null);
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchWishlist();
      fetchFolders();
    }
  }, [status]);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wishlist/enhanced');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/wishlist/folders');
      const data = await res.json();
      if (data.success) {
        setFolders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast({
        title: language === 'ko' ? '폴더 이름을 입력하세요' : '请输入文件夹名称',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingFolder(true);
    try {
      const res = await fetch('/api/wishlist/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderName,
          description: folderDescription,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: language === 'ko' ? '폴더가 생성되었습니다' : '文件夹已创建',
        });
        fetchFolders();
        setIsFolderDialogOpen(false);
        setFolderName('');
        setFolderDescription('');
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleSetPriceAlert = async () => {
    if (!selectedItemForAlert || !targetPrice) return;

    try {
      const res = await fetch(`/api/wishlist/${selectedItemForAlert.wishlistId}/price-alert`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceAlertEnabled: true,
          targetPrice: parseFloat(targetPrice),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: language === 'ko' ? '가격 알림이 설정되었습니다' : '价格提醒已设置',
        });
        fetchWishlist();
        setIsPriceAlertDialogOpen(false);
        setTargetPrice('');
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    if (!confirm(language === 'ko' ? '선택한 항목을 삭제하시겠습니까?' : '确定删除选中的项目吗？'))
      return;

    try {
      const promises = Array.from(selectedItems).map((id) =>
        fetch(`/api/wishlist/${id}`, { method: 'DELETE' })
      );
      await Promise.all(promises);

      toast({
        title: language === 'ko' ? '삭제되었습니다' : '已删除',
      });
      fetchWishlist();
      setSelectedItems(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    }
  };

  const toggleItemSelection = (wishlistId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(wishlistId)) {
      newSelection.delete(wishlistId);
    } else {
      newSelection.add(wishlistId);
    }
    setSelectedItems(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.wishlistId)));
    }
  };

  // 필터링 및 정렬
  const filteredItems = items
    .filter((item) => {
      if (selectedFolder === 'all') return true;
      if (selectedFolder === 'no-folder') return !item.folder;
      return item.folder?.id === selectedFolder;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'price-low':
          return a.priceKRW - b.priceKRW;
        case 'price-high':
          return b.priceKRW - a.priceKRW;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container-app py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-current" />
            {language === 'ko' ? '찜 목록' : '收藏夹'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ko' ? `총 ${items.length}개의 상품` : `共 ${items.length}件商品`}
          </p>
        </div>
        <Button onClick={() => setIsFolderDialogOpen(true)}>
          <FolderPlus className="h-4 w-4 mr-2" />
          {language === 'ko' ? '폴더 생성' : '创建文件夹'}
        </Button>
      </div>

      {/* 폴더 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <Button
          variant={selectedFolder === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFolder('all')}
        >
          <FolderOpen className="h-4 w-4 mr-1" />
          {language === 'ko' ? '전체' : '全部'} ({items.length})
        </Button>
        <Button
          variant={selectedFolder === 'no-folder' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFolder('no-folder')}
        >
          {language === 'ko' ? '미분류' : '未分类'} (
          {items.filter((item) => !item.folder).length})
        </Button>
        {folders.map((folder) => (
          <Button
            key={folder.id}
            variant={selectedFolder === folder.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFolder(folder.id)}
          >
            <Folder className="h-4 w-4 mr-1" />
            {language === 'zh' && folder.nameZh ? folder.nameZh : folder.name} ({folder.count})
          </Button>
        ))}
      </div>

      {/* 툴바 */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          {/* 정렬 */}
          <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                {language === 'ko' ? '최근 추가순' : '最近添加'}
              </SelectItem>
              <SelectItem value="price-low">
                {language === 'ko' ? '낮은 가격순' : '价格从低到高'}
              </SelectItem>
              <SelectItem value="price-high">
                {language === 'ko' ? '높은 가격순' : '价格从高到低'}
              </SelectItem>
              <SelectItem value="name">{language === 'ko' ? '이름순' : '按名称'}</SelectItem>
            </SelectContent>
          </Select>

          {/* 뷰 모드 */}
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 선택 모드 */}
          {!isSelectionMode ? (
            <Button variant="outline" onClick={() => setIsSelectionMode(true)}>
              <CheckSquare className="h-4 w-4 mr-2" />
              {language === 'ko' ? '선택' : '选择'}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={toggleSelectAll}>
                {selectedItems.size === filteredItems.length ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '전체 해제' : '取消全选'}
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '전체 선택' : '全选'}
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={selectedItems.size === 0}
              >
                <Trash className="h-4 w-4 mr-2" />
                {language === 'ko' ? '삭제' : '删除'} ({selectedItems.size})
              </Button>
              <Button variant="outline" onClick={() => setIsSelectionMode(false)}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 상품 목록 */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {language === 'ko' ? '찜한 상품이 없습니다' : '暂无收藏商品'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <WishlistGridItem
              key={item.id}
              item={item}
              language={language}
              isSelectionMode={isSelectionMode}
              isSelected={selectedItems.has(item.wishlistId)}
              onToggleSelect={() => toggleItemSelection(item.wishlistId)}
              onSetPriceAlert={(item) => {
                setSelectedItemForAlert(item);
                setTargetPrice(item.targetPrice?.toString() || '');
                setIsPriceAlertDialogOpen(true);
              }}
              onRefresh={fetchWishlist}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <WishlistListItem
              key={item.id}
              item={item}
              language={language}
              isSelectionMode={isSelectionMode}
              isSelected={selectedItems.has(item.wishlistId)}
              onToggleSelect={() => toggleItemSelection(item.wishlistId)}
              onSetPriceAlert={(item) => {
                setSelectedItemForAlert(item);
                setTargetPrice(item.targetPrice?.toString() || '');
                setIsPriceAlertDialogOpen(true);
              }}
              onRefresh={fetchWishlist}
            />
          ))}
        </div>
      )}

      {/* 폴더 생성 다이얼로그 */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'ko' ? '폴더 생성' : '创建文件夹'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ko'
                ? '찜한 상품을 폴더로 분류하여 관리하세요'
                : '将收藏商品分类管理'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folderName">
                {language === 'ko' ? '폴더 이름' : '文件夹名称'}
              </Label>
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder={language === 'ko' ? '예: 의류' : '例：服装'}
              />
            </div>
            <div>
              <Label htmlFor="folderDescription">
                {language === 'ko' ? '설명 (선택)' : '描述（可选）'}
              </Label>
              <Input
                id="folderDescription"
                value={folderDescription}
                onChange={(e) => setFolderDescription(e.target.value)}
                placeholder={language === 'ko' ? '폴더 설명' : '文件夹描述'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
              {language === 'ko' ? '취소' : '取消'}
            </Button>
            <Button onClick={handleCreateFolder} disabled={isCreatingFolder}>
              {isCreatingFolder ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                language === 'ko' ? '생성' : '创建'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 가격 알림 다이얼로그 */}
      <Dialog open={isPriceAlertDialogOpen} onOpenChange={setIsPriceAlertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ko' ? '가격 알림 설정' : '设置价格提醒'}</DialogTitle>
            <DialogDescription>
              {language === 'ko'
                ? '목표 가격에 도달하면 알림을 받습니다'
                : '达到目标价格时将通知您'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>
                {language === 'ko' ? '현재 가격' : '当前价格'}
              </Label>
              <p className="text-2xl font-bold text-primary">
                ₩{selectedItemForAlert?.priceKRW.toLocaleString()}
              </p>
            </div>
            <div>
              <Label htmlFor="targetPrice">
                {language === 'ko' ? '목표 가격 (₩)' : '目标价格 (₩)'}
              </Label>
              <Input
                id="targetPrice"
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={language === 'ko' ? '목표 가격 입력' : '输入目标价格'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPriceAlertDialogOpen(false)}>
              {language === 'ko' ? '취소' : '取消'}
            </Button>
            <Button onClick={handleSetPriceAlert}>
              {language === 'ko' ? '설정' : '设置'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 그리드 뷰 아이템 컴포넌트
function WishlistGridItem({
  item,
  language,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  onSetPriceAlert,
  onRefresh,
}: {
  item: WishlistItem;
  language: 'ko' | 'zh';
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onSetPriceAlert: (item: WishlistItem) => void;
  onRefresh: () => void;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-square">
        {isSelectionMode ? (
          <button
            onClick={onToggleSelect}
            className="absolute inset-0 z-10 bg-black/5 flex items-center justify-center"
          >
            {isSelected ? (
              <CheckSquare className="h-8 w-8 text-primary" />
            ) : (
              <Square className="h-8 w-8 text-muted-foreground" />
            )}
          </button>
        ) : (
          <Link href={`/posts/${item.id}`}>
            <Image
              src={item.images[0] || '/images/placeholder.png'}
              alt={item.title}
              fill
              className="object-cover hover:scale-105 transition-transform"
            />
          </Link>
        )}

        {item.priceAlertEnabled && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {language === 'ko' ? '알림' : '提醒'}
          </div>
        )}

        {!isSelectionMode && (
          <WishlistButton
            postId={item.id}
            initialWishlisted={true}
            size="sm"
            variant="card"
            onToggle={onRefresh}
          />
        )}
      </div>

      <CardContent className="p-3">
        <Link href={`/posts/${item.id}`}>
          <h3 className="font-medium line-clamp-2 mb-1 hover:text-primary">
            {language === 'zh' && item.titleZh ? item.titleZh : item.title}
          </h3>
        </Link>
        <p className="text-lg font-bold text-primary">₩{item.priceKRW.toLocaleString()}</p>
        {item.folder && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Folder className="h-3 w-3" />
            {item.folder.name}
          </p>
        )}
        {!isSelectionMode && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => onSetPriceAlert(item)}
          >
            <Bell className="h-3 w-3 mr-1" />
            {item.priceAlertEnabled
              ? language === 'ko'
                ? '알림 수정'
                : '修改提醒'
              : language === 'ko'
              ? '가격 알림'
              : '价格提醒'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// 리스트 뷰 아이템 컴포넌트
function WishlistListItem({
  item,
  language,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  onSetPriceAlert,
  onRefresh,
}: {
  item: WishlistItem;
  language: 'ko' | 'zh';
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onSetPriceAlert: (item: WishlistItem) => void;
  onRefresh: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        {isSelectionMode && (
          <button onClick={onToggleSelect}>
            {isSelected ? (
              <CheckSquare className="h-5 w-5 text-primary" />
            ) : (
              <Square className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        )}

        <Link href={`/posts/${item.id}`} className="relative w-20 h-20 flex-shrink-0">
          <Image
            src={item.images[0] || '/images/placeholder.png'}
            alt={item.title}
            fill
            className="object-cover rounded"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/posts/${item.id}`}>
            <h3 className="font-medium line-clamp-1 hover:text-primary">
              {language === 'zh' && item.titleZh ? item.titleZh : item.title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">{item.seller.nickname}</p>
          {item.folder && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Folder className="h-3 w-3" />
              {item.folder.name}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-primary">₩{item.priceKRW.toLocaleString()}</p>
          {item.priceAlertEnabled && item.targetPrice && (
            <p className="text-xs text-yellow-600 flex items-center gap-1">
              <Bell className="h-3 w-3" />
              ₩{item.targetPrice.toLocaleString()}
            </p>
          )}
        </div>

        {!isSelectionMode && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onSetPriceAlert(item)}>
              <Bell className="h-3 w-3" />
            </Button>
            <WishlistButton
              postId={item.id}
              initialWishlisted={true}
              size="sm"
              onToggle={onRefresh}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
