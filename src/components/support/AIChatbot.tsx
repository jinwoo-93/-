'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User as UserIcon, Minimize2, Maximize2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'admin';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface FAQ {
  question: string;
  keywords: string[];
  answer: string;
}

const FAQ_DATA_KO: FAQ[] = [
  {
    question: '배송 기간이 얼마나 걸리나요?',
    keywords: ['배송', '시간', '기간', '언제', '며칠'],
    answer: '항공 배송은 3-7일, 해상 배송은 14-21일 소요됩니다. 통관 상황에 따라 지연될 수 있습니다.',
  },
  {
    question: '환불은 어떻게 하나요?',
    keywords: ['환불', '취소', '돌려받', '반품'],
    answer: '마이페이지 > 구매내역에서 환불 신청이 가능합니다. 구매 확정 전에만 환불이 가능하며, 7일 이내에 처리됩니다.',
  },
  {
    question: '에스크로 결제가 무엇인가요?',
    keywords: ['에스크로', '결제', '안전', '보관'],
    answer: '에스크로 결제는 구매자가 상품을 확인하기 전까지 결제금을 안전하게 보관하는 시스템입니다. 구매 확정 후에 판매자에게 입금됩니다.',
  },
  {
    question: '분쟁 조정은 어떻게 진행되나요?',
    keywords: ['분쟁', '문제', '사기', '조정', '투표'],
    answer: '문제 발생 시 분쟁을 신청하면, 커뮤니티 배심원 10명이 투표로 공정하게 판단합니다. 투표 결과에 따라 환불 또는 거래 완료가 결정됩니다.',
  },
  {
    question: '회원가입은 어떻게 하나요?',
    keywords: ['회원가입', '가입', '계정', '등록'],
    answer: '상단 로그인 버튼을 클릭하면 구글, 카카오, 네이버 계정으로 간편하게 가입할 수 있습니다.',
  },
  {
    question: '수수료는 얼마인가요?',
    keywords: ['수수료', '비용', '요금', '얼마'],
    answer: '개인 판매자는 5%, 사업자는 3%의 수수료가 부과됩니다. 추가 숨은 비용은 없습니다.',
  },
  {
    question: '통관은 어떻게 하나요?',
    keywords: ['통관', '세관', '관세'],
    answer: '개인 통관은 자동으로 진행됩니다. 메인 페이지 하단의 \"세관 통관 안내\"를 참고하시면 국가별 통관 규정을 확인할 수 있습니다.',
  },
];

const FAQ_DATA_ZH: FAQ[] = [
  {
    question: '配送需要多长时间？',
    keywords: ['配送', '时间', '期间', '多久', '几天'],
    answer: '空运需要3-7天，海运需要14-21天。根据海关情况可能会有延迟。',
  },
  {
    question: '如何退款？',
    keywords: ['退款', '取消', '退货', '返还'],
    answer: '可在"我的页面 > 购买记录"中申请退款。只有在确认收货之前才能退款，7天内处理完成。',
  },
  {
    question: '什么是托管支付？',
    keywords: ['托管', '支付', '安全', '保管'],
    answer: '托管支付是在买家确认商品之前，安全保管货款的系统。确认收货后，货款将转给卖家。',
  },
  {
    question: '纠纷调解如何进行？',
    keywords: ['纠纷', '问题', '欺诈', '调解', '投票'],
    answer: '发生问题时申请纠纷，由社区陪审团10人投票公正判断。根据投票结果决定退款或完成交易。',
  },
  {
    question: '如何注册会员？',
    keywords: ['会员注册', '注册', '账户', '登记'],
    answer: '点击顶部登录按钮，可以使用Google、Kakao、Naver账户轻松注册。',
  },
  {
    question: '手续费是多少？',
    keywords: ['手续费', '费用', '价格', '多少'],
    answer: '个人卖家收取5%，企业卖家收取3%的手续费。没有其他隐藏费用。',
  },
  {
    question: '如何通关？',
    keywords: ['通关', '海关', '关税'],
    answer: '个人通关会自动进行。请参考主页底部的"海关通关须知"了解各国通关规定。',
  },
];

export function AIChatbot() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnectedToAdmin, setIsConnectedToAdmin] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const FAQ_DATA = language === 'ko' ? FAQ_DATA_KO : FAQ_DATA_ZH;

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      // 초기 인사 메시지
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: language === 'ko'
          ? '안녕하세요! 직구역구 AI 상담사입니다. 궁금하신 점을 자유롭게 물어보세요. 😊\n\n예: "배송 기간이 얼마나 걸리나요?", "환불은 어떻게 하나요?"'
          : '您好！我是直购易购AI客服。请随时提问。😊\n\n例如："配送需要多长时间？"、"如何退款？"',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, language, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findBestMatch = (userInput: string): FAQ | null => {
    const normalizedInput = userInput.toLowerCase();
    let bestMatch: FAQ | null = null;
    let highestScore = 0;

    FAQ_DATA.forEach((faq) => {
      let score = 0;
      faq.keywords.forEach((keyword) => {
        if (normalizedInput.includes(keyword)) {
          score += 1;
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    });

    // 최소 1개 이상의 키워드가 매칭되어야 함
    return highestScore > 0 ? bestMatch : null;
  };

  const simulateTyping = async (text: string) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsTyping(false);

    const botMessage: Message = {
      id: Date.now().toString(),
      type: isConnectedToAdmin ? 'admin' : 'bot',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    // AI 응답 생성
    if (!isConnectedToAdmin) {
      const match = findBestMatch(userInput);

      if (match) {
        // FAQ 답변
        await simulateTyping(match.answer);

        // 추가 안내
        await new Promise((resolve) => setTimeout(resolve, 500));
        await simulateTyping(
          language === 'ko'
            ? '추가로 궁금하신 점이 있으신가요? 더 자세한 상담이 필요하시면 "상담원 연결"이라고 말씀해 주세요.'
            : '还有其他问题吗？如需更详细的咨询，请说"人工客服"。'
        );
      } else {
        // 일치하는 FAQ 없음
        await simulateTyping(
          language === 'ko'
            ? '죄송합니다. 정확한 답변을 찾지 못했습니다.\n\n자주 묻는 질문:\n• 배송 기간\n• 환불 방법\n• 에스크로 결제\n• 분쟁 조정\n\n상담원과 직접 상담하시려면 "상담원 연결"이라고 말씀해 주세요.'
            : '抱歉，未找到准确答案。\n\n常见问题：\n• 配送时间\n• 退款方法\n• 托管支付\n• 纠纷调解\n\n如需人工客服，请说"人工客服"。'
        );
      }
    } else {
      // 관리자 연결 모드 (실제로는 백엔드 구현 필요)
      await simulateTyping(
        language === 'ko'
          ? '상담원에게 문의가 전달되었습니다. 평일 09:00-18:00 사이에 응답드립니다.'
          : '您的咨询已转给客服人员。工作日09:00-18:00会回复您。'
      );
    }

    // "상담원 연결" 감지
    if (
      (language === 'ko' && (userInput.includes('상담원') || userInput.includes('직접'))) ||
      (language === 'zh' && (userInput.includes('人工') || userInput.includes('客服')))
    ) {
      setIsConnectedToAdmin(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await simulateTyping(
        language === 'ko'
          ? '상담원 연결 모드로 전환되었습니다. 평일 09:00-18:00 사이에 상담원이 응답드립니다.'
          : '已切换到人工客服模式。工作日09:00-18:00客服人员会回复您。'
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-40 w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center group"
      >
        <Bot className="w-6 h-6" />
        <span className="absolute right-16 bg-black text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {language === 'ko' ? 'AI 상담' : 'AI咨询'}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}
    >
      {/* 헤더 */}
      <div className="bg-black text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="font-bold text-sm">
              {isConnectedToAdmin
                ? language === 'ko'
                  ? '상담원 연결됨'
                  : '人工客服'
                : language === 'ko'
                ? 'AI 상담사'
                : 'AI客服'}
            </h3>
            <p className="text-xs text-white/70">
              {language === 'ko' ? '평일 09:00-18:00' : '工作日 09:00-18:00'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* 메시지 영역 */}
          <div className="h-[calc(100%-8rem)] overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    msg.type === 'user'
                      ? 'bg-black text-white'
                      : msg.type === 'admin'
                      ? 'bg-blue-50 text-black border border-blue-200'
                      : 'bg-gray-100 text-black'
                  } rounded-lg p-3`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    {msg.type !== 'user' && (
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center mt-0.5">
                        <Bot className="w-3 h-3 text-black" />
                      </div>
                    )}
                    <span className="text-xs font-semibold">
                      {msg.type === 'user'
                        ? language === 'ko'
                          ? '나'
                          : '我'
                        : msg.type === 'admin'
                        ? language === 'ko'
                          ? '상담원'
                          : '客服'
                        : 'AI'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  language === 'ko' ? '메시지를 입력하세요...' : '请输入消息...'
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
