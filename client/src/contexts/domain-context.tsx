/**
 * Domain Context Provider
 * Manages the active domain configuration throughout the application
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  type DomainType,
  type DomainConfiguration,
  getDomainConfig,
  getAllDomains,
} from '@shared/domain-config';

interface DomainContextValue {
  currentDomain: DomainType;
  domainConfig: DomainConfiguration;
  allDomains: DomainConfiguration[];
  changeDomain: (domain: DomainType) => void;

  // Helper functions
  getEntityLabel: (type: 'primary' | 'secondary' | 'interaction', plural?: boolean) => string;
  getMetricLabel: (metricId: string) => string;
  getTerminology: (key: keyof DomainConfiguration['terminology']) => string;
}

const DomainContext = createContext<DomainContextValue | undefined>(undefined);

const STORAGE_KEY = 'analytics-domain';

export function DomainProvider({ children }: { children: ReactNode }) {
  const [currentDomain, setCurrentDomain] = useState<DomainType>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as DomainType) || 'commerce';
  });

  const [domainConfig, setDomainConfig] = useState<DomainConfiguration>(
    () => getDomainConfig(currentDomain)
  );

  const allDomains = getAllDomains();

  useEffect(() => {
    const config = getDomainConfig(currentDomain);
    setDomainConfig(config);
    localStorage.setItem(STORAGE_KEY, currentDomain);

    // Update document title
    document.title = config.terminology.dashboardTitle;
  }, [currentDomain]);

  const changeDomain = (domain: DomainType) => {
    setCurrentDomain(domain);
  };

  const getEntityLabel = (
    type: 'primary' | 'secondary' | 'interaction',
    plural: boolean = false
  ): string => {
    const entity = domainConfig.entities[type];
    if (!entity) return type;
    return plural ? entity.plural : entity.singular;
  };

  const getMetricLabel = (metricId: string): string => {
    const metric = [...domainConfig.metrics.primary, ...domainConfig.metrics.derived]
      .find(m => m.id === metricId);
    return metric?.label || metricId;
  };

  const getTerminology = (key: keyof DomainConfiguration['terminology']): string => {
    return domainConfig.terminology[key];
  };

  const value: DomainContextValue = {
    currentDomain,
    domainConfig,
    allDomains,
    changeDomain,
    getEntityLabel,
    getMetricLabel,
    getTerminology,
  };

  return (
    <DomainContext.Provider value={value}>
      {children}
    </DomainContext.Provider>
  );
}

export function useDomain() {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error('useDomain must be used within a DomainProvider');
  }
  return context;
}
