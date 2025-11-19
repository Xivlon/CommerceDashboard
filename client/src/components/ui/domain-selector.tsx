/**
 * Domain Selector Component
 * Allows users to switch between different domain configurations
 */

import { Database, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useDomain } from '@/contexts/domain-context';

const DOMAIN_COLORS: Record<string, string> = {
  commerce: 'bg-blue-500',
  research: 'bg-purple-500',
  sales: 'bg-green-500',
  marketing: 'bg-pink-500',
  product: 'bg-orange-500',
  finance: 'bg-yellow-500',
  education: 'bg-indigo-500',
  healthcare: 'bg-red-500',
  custom: 'bg-gray-500',
};

export function DomainSelector() {
  const { currentDomain, domainConfig, allDomains, changeDomain } = useDomain();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Database className="h-4 w-4" />
          <div
            className={`w-3 h-3 rounded-full ${DOMAIN_COLORS[currentDomain]}`}
          />
          <span className="hidden sm:inline">{domainConfig.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Select Domain
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-96 overflow-y-auto">
          {allDomains.map((domain) => (
            <DropdownMenuItem
              key={domain.id}
              onClick={() => changeDomain(domain.id)}
              className={`flex items-start gap-3 p-3 cursor-pointer ${
                domain.id === currentDomain ? 'bg-accent' : ''
              }`}
            >
              <div className={`w-3 h-3 rounded-full mt-1 ${DOMAIN_COLORS[domain.id]}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{domain.name}</span>
                  {domain.id === currentDomain && (
                    <Check className="h-4 w-4 text-theme-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {domain.description}
                </p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {domain.entities.primary.plural}
                  </Badge>
                  {domain.entities.secondary && (
                    <Badge variant="secondary" className="text-xs">
                      {domain.entities.secondary.plural}
                    </Badge>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />
        <div className="p-2">
          <p className="text-xs text-muted-foreground text-center">
            Domain changes are saved automatically
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
