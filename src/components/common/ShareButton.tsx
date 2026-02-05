'use client';

import { useState } from 'react';
import {
  Share2,
  Link2,
  MessageCircle,
  Twitter,
  Facebook,
  X,
  Check,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/hooks/useLanguage';

interface ShareButtonProps {
  url?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

interface ShareOption {
  id: string;
  name: string;
  nameZh: string;
  icon: React.ReactNode;
  color: string;
  action: (shareData: ShareData) => void;
}

interface ShareData {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export default function ShareButton({
  url,
  title,
  description = '',
  imageUrl,
  variant = 'outline',
  size = 'default',
  className,
}: ShareButtonProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const shareOptions: ShareOption[] = [
    {
      id: 'kakao',
      name: '카카오톡',
      nameZh: 'KakaoTalk',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-yellow-400 hover:bg-yellow-500 text-black',
      action: (data) => {
        // KakaoTalk 공유 (Kakao SDK 필요)
        if (typeof window !== 'undefined' && (window as any).Kakao) {
          (window as any).Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: data.title,
              description: data.description,
              imageUrl: data.imageUrl,
              link: {
                mobileWebUrl: data.url,
                webUrl: data.url,
              },
            },
            buttons: [
              {
                title: language === 'ko' ? '보러가기' : '查看详情',
                link: {
                  mobileWebUrl: data.url,
                  webUrl: data.url,
                },
              },
            ],
          });
        } else {
          // SDK 없으면 카카오톡 공유 URL로 이동
          window.open(
            `https://story.kakao.com/share?url=${encodeURIComponent(data.url)}`,
            '_blank'
          );
        }
      },
    },
    {
      id: 'wechat',
      name: '微信',
      nameZh: '微信',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.08l1.588.926a.272.272 0 0 0 .139.045c.133 0 .24-.11.24-.245 0-.06-.024-.12-.04-.177l-.326-1.233a.49.49 0 0 1 .178-.554C23.027 18.447 24 16.769 24 14.921c0-3.109-2.935-5.902-7.062-6.063zm-2.745 3.254c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.842 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z"/>
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600 text-white',
      action: (data) => {
        // 微信 QR 코드 페이지로 이동 (실제 구현시 QR 코드 생성 필요)
        alert(language === 'ko'
          ? '링크를 복사해서 微信에서 공유하세요.'
          : '请复制链接后在微信中分享'
        );
        navigator.clipboard.writeText(data.url);
      },
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      nameZh: 'X (Twitter)',
      icon: <Twitter className="w-5 h-5" />,
      color: 'bg-black hover:bg-gray-800 text-white',
      action: (data) => {
        const text = `${data.title}\n${data.description}`;
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.url)}`,
          '_blank'
        );
      },
    },
    {
      id: 'facebook',
      name: 'Facebook',
      nameZh: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      action: (data) => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`,
          '_blank'
        );
      },
    },
    {
      id: 'copy',
      name: '링크 복사',
      nameZh: '复制链接',
      icon: <Link2 className="w-5 h-5" />,
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
      action: async (data) => {
        try {
          await navigator.clipboard.writeText(data.url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      },
    },
  ];

  const handleShare = async () => {
    const shareData = {
      url: shareUrl,
      title,
      description,
      imageUrl,
    };

    // 네이티브 공유 API 지원 시 사용
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // 사용자가 취소했거나 실패한 경우 모달 표시
        if ((err as Error).name !== 'AbortError') {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const handleOptionClick = (option: ShareOption) => {
    const shareData: ShareData = {
      url: shareUrl,
      title,
      description,
      imageUrl,
    };
    option.action(shareData);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        className={className}
      >
        <Share2 className="w-4 h-4 mr-2" />
        {language === 'ko' ? '공유' : '分享'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'ko' ? '공유하기' : '分享'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* 공유할 컨텐츠 미리보기 */}
            <div className="p-3 bg-muted rounded-lg mb-4">
              <p className="font-medium text-sm line-clamp-2">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>

            {/* 공유 옵션 */}
            <div className="grid grid-cols-4 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg transition-colors hover:bg-muted"
                >
                  <div className={`p-3 rounded-full ${option.color}`}>
                    {option.id === 'copy' && copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      option.icon
                    )}
                  </div>
                  <span className="text-xs text-center">
                    {option.id === 'copy' && copied
                      ? language === 'ko' ? '복사됨' : '已复制'
                      : language === 'ko' ? option.name : option.nameZh}
                  </span>
                </button>
              ))}
            </div>

            {/* URL 직접 복사 */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border-0 focus:outline-none"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
