'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency } from '@/hooks/useCurrency';

const currencies = [
  { code: 'KRW' as const, symbol: '₩', name: '원화 (KRW)' },
  { code: 'CNY' as const, symbol: '¥', name: '人民币 (CNY)' },
];

export function CurrencySwitch() {
  const { currency, setCurrency } = useCurrency();

  const currentCurrency = currencies.find((c) => c.code === currency);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2">
          {currentCurrency?.symbol}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className={currency === c.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{c.symbol}</span>
            {c.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default CurrencySwitch;
