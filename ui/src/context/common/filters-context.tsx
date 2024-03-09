'use client';

import { useSearchParams } from 'next/navigation';
import { ReactNode, createContext, useContext, useState } from 'react';

interface ContextShape {
  filters: string[];
  selectedFilters: string[];
  unselectedFilters: string[];
  selectFilter: (target: string) => void;
  unselectFilter: (target: string) => void;
  changeFilter: (from: string, to: string) => void;
  getFilterValue: (target: string) => string;
  setFilterValue: (filter: string, value: string) => void;
}

const FiltersContext = createContext<ContextShape | null>(null);

export function FiltersProvider({ children, filters }: { children: ReactNode; filters: string[] }) {
  const searchParams = useSearchParams();
  const filtersFromURL = filters.filter((filter) => searchParams.has(filter));

  // Should be array because order is important here !
  const initialParams: [string, string][] = [];

  if (filtersFromURL.length > 0) {
    for (const filter of filtersFromURL) {
      initialParams.push([filter, searchParams.get(filter) ?? '']);
    }
  } else {
    initialParams.push([filters[0], '']);
  }
  const [params, setParams] = useState(initialParams);

  const selectedFilters = params.map((v) => v[0]);
  const unselectedFilters = filters.filter((filter) => !selectedFilters.includes(filter));

  const selectFilter = (target: string) => setParams((prev) => [...prev, [target, '']]);

  const unselectFilter = (target: string) =>
    setParams((prev) => prev.filter((v) => v[0] !== target));

  const changeFilter = (from: string, to: string) =>
    setParams((prev) => {
      const index = prev.findIndex((v) => v[0] === from);
      return [...prev.slice(0, index), [to, prev[index][1]], ...prev.slice(index + 1)];
    });

  const getFilterValue = (target: string) => {
    const index = params.findIndex((v) => v[0] === target);
    return params[index][1];
  };

  const setFilterValue = (filter: string, value: string) =>
    setParams((prev) => {
      const index = prev.findIndex((v) => v[0] === filter);
      return [...prev.slice(0, index), [filter, value], ...prev.slice(index + 1)];
    });

  return (
    <FiltersContext.Provider
      value={{
        filters,
        selectedFilters,
        unselectedFilters,
        selectFilter,
        unselectFilter,
        changeFilter,
        getFilterValue,
        setFilterValue,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);

  if (!context) {
    throw new Error('useFilter must be used within an FilterProvider');
  }

  return context;
}
